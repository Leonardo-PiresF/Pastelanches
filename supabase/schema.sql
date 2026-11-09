-- Pastelanches Vitória · banco de dados
-- Rodar no SQL Editor do Supabase. Depois rode seed.sql (gerado por `npm run seed`).

-- ---------------------------------------------------------------
-- Catálogo, editado pela equipe no painel
-- ---------------------------------------------------------------
create table if not exists produtos (
  id text primary key,
  catalogo text not null check (catalogo in ('cardapio', 'festa')),
  categoria text not null,
  numero int,
  nome text not null,
  descricao text,
  preco numeric(8,2),
  tamanhos jsonb,              -- [{ "nome": "Grande", "preco": 60 }]
  sabores jsonb,               -- { "rotulo": "Sabor", "opcoes": [...], "descricoes": {...} }
  unidade text,                -- "25 un"
  foto text,
  destaque boolean not null default false,
  disponivel boolean not null default true,
  ordem int not null default 0,
  check (preco is not null or tamanhos is not null)
);

create table if not exists promocoes (
  id text primary key,
  titulo text not null,
  texto text,
  preco numeric(8,2) not null,
  foto text,
  sabores jsonb,
  dias smallint[],             -- 0 domingo ... 6 sábado; nulo = todo dia
  data date,                   -- só nesse dia; nulo = sem data fixa
  ativa boolean not null default true,
  ordem int not null default 0
);

create table if not exists bairros (
  nome text primary key,
  taxa numeric(6,2) not null check (taxa >= 0)
);

-- Uma linha só: estado da loja e regras da agenda de encomendas
create table if not exists loja (
  id int primary key default 1 check (id = 1),
  cozinha_aberta boolean not null default true,
  agenda jsonb not null,       -- { semana: [{on, ini, fim} x7], intervalo, limite, antecedencia }
  banner jsonb                 -- { ativo, titulo, texto, preco }: banner das encomendas no cardápio
);
alter table loja add column if not exists banner jsonb;

create table if not exists datas_especiais (
  data date primary key,
  tipo text not null check (tipo in ('fechado', 'aberto')),
  ini time,
  fim time,
  check (tipo = 'fechado' or (ini is not null and fim is not null and fim > ini))
);

-- ---------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  senha int not null,
  tipo text not null check (tipo in ('mesa', 'delivery', 'retirada', 'encomenda')),
  status text not null default 'novo'
    check (status in ('novo', 'aceito', 'preparo', 'pronto', 'finalizado', 'recusado')),
  mesa int,
  cliente jsonb not null,
  entrega jsonb,
  itens jsonb not null,
  totais jsonb not null,
  retirada_em timestamptz,
  observacoes text,
  motivo_recusa text,
  criado_em timestamptz not null default now()
);

create index if not exists pedidos_criado_em_idx on pedidos (criado_em desc);
create index if not exists pedidos_retirada_idx on pedidos (retirada_em) where tipo = 'encomenda';

-- ---------------------------------------------------------------
-- Criação do pedido pelo site
-- O preço vem do banco, nunca do navegador: o cliente manda o que
-- escolheu e o servidor recalcula cada item e o total.
-- ---------------------------------------------------------------
create or replace function criar_pedido(p jsonb)
returns table (codigo text, senha int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tipo text := p->>'tipo';
  v_item jsonb;
  v_itens jsonb := '[]'::jsonb;
  v_preco numeric;
  v_qtd int;
  v_prod produtos;
  v_promo promocoes;
  v_subtotal numeric := 0;
  v_taxa numeric := 0;
  v_codigo text;
  v_senha int;
  v_retirada timestamptz;
begin
  if v_tipo not in ('mesa', 'delivery', 'retirada', 'encomenda') then
    raise exception 'tipo de pedido inválido';
  end if;
  if coalesce(char_length(p->'cliente'->>'nome'), 0) not between 1 and 60 then
    raise exception 'informe o nome';
  end if;
  if v_tipo <> 'mesa' and char_length(regexp_replace(coalesce(p->'cliente'->>'telefone', ''), '\D', '', 'g')) < 10 then
    raise exception 'informe um WhatsApp válido';
  end if;
  if jsonb_array_length(coalesce(p->'itens', '[]'::jsonb)) not between 1 and 60 then
    raise exception 'pedido sem itens';
  end if;
  if v_tipo <> 'encomenda' and not (select cozinha_aberta from loja where id = 1) then
    raise exception 'a cozinha está fechada agora';
  end if;

  for v_item in select * from jsonb_array_elements(p->'itens') loop
    v_qtd := greatest(1, least(99, coalesce((v_item->>'qtd')::int, 1)));

    if v_item ? 'promocao_id' then
      select * into v_promo from promocoes
        where id = v_item->>'promocao_id' and ativa
          and (dias is null or cardinality(dias) = 0
               or extract(dow from now() at time zone 'America/Bahia')::smallint = any(dias))
          and (data is null or data = (now() at time zone 'America/Bahia')::date);
      if not found then raise exception 'essa promoção não vale hoje'; end if;
      v_preco := v_promo.preco;
    else
      select * into v_prod from produtos where id = v_item->>'produto_id' and disponivel;
      if not found then raise exception 'item indisponível: %', v_item->>'nome'; end if;
      if (v_tipo = 'encomenda') <> (v_prod.catalogo = 'festa') then
        raise exception 'item fora do cardápio deste pedido';
      end if;
      if v_prod.tamanhos is not null then
        select (t->>'preco')::numeric into v_preco
          from jsonb_array_elements(v_prod.tamanhos) t
          where t->>'nome' = v_item->>'tamanho';
        if v_preco is null then raise exception 'tamanho inválido'; end if;
      else
        v_preco := v_prod.preco;
      end if;
    end if;

    v_subtotal := v_subtotal + v_preco * v_qtd;
    v_itens := v_itens || jsonb_build_object(
      'produto_id', v_item->>'produto_id',
      'promocao_id', v_item->>'promocao_id',
      'nome', left(v_item->>'nome', 80),
      'detalhe', left(v_item->>'detalhe', 120),
      'obs', left(v_item->>'obs', 200),
      'preco', v_preco,
      'qtd', v_qtd
    );
  end loop;

  if v_tipo = 'delivery' then
    select taxa into v_taxa from bairros where nome = p->'entrega'->>'bairro';
    if v_taxa is null then raise exception 'bairro fora da área de entrega'; end if;
  end if;

  if v_tipo = 'encomenda' then
    v_retirada := (p->>'retirada_em')::timestamptz;
    if v_retirada is null or v_retirada < now() then
      raise exception 'escolha um horário de retirada';
    end if;
    if (select count(*) from pedidos
        where tipo = 'encomenda' and status <> 'recusado' and retirada_em = v_retirada)
       >= ((select agenda->>'limite' from loja where id = 1))::int then
      raise exception 'esse horário acabou de lotar, escolha outro';
    end if;
  end if;

  select coalesce(max(pedidos.senha), 0) + 1 into v_senha
    from pedidos where criado_em >= date_trunc('day', now() at time zone 'America/Bahia') at time zone 'America/Bahia';

  v_codigo := 'PL' || upper(substr(md5(gen_random_uuid()::text), 1, 5));

  insert into pedidos (codigo, senha, tipo, mesa, cliente, entrega, itens, totais, retirada_em, observacoes)
  values (
    v_codigo, v_senha, v_tipo,
    case when v_tipo = 'mesa' then (p->>'mesa')::int end,
    jsonb_build_object('nome', left(p->'cliente'->>'nome', 60), 'telefone', left(p->'cliente'->>'telefone', 20)),
    case when v_tipo = 'delivery' then jsonb_build_object(
      'bairro', p->'entrega'->>'bairro',
      'endereco', left(p->'entrega'->>'endereco', 160),
      'pagamento', p->'entrega'->>'pagamento',
      'troco', left(p->'entrega'->>'troco', 10)) end,
    v_itens,
    jsonb_build_object('subtotal', v_subtotal, 'taxa', v_taxa, 'total', v_subtotal + v_taxa),
    v_retirada,
    left(p->>'observacoes', 300)
  );

  return query select v_codigo, v_senha;
end $$;

-- Acompanhamento pelo cliente: só quem tem o código vê o próprio pedido
create or replace function status_pedido(p_codigo text)
returns table (status text, senha int, tipo text, mesa int, itens jsonb, totais jsonb, retirada_em timestamptz, motivo_recusa text)
language sql
security definer
set search_path = public
as $$
  select status, senha, tipo, mesa, itens, totais, retirada_em, motivo_recusa
  from pedidos where codigo = upper(p_codigo)
$$;

-- Horários de encomenda ocupados, sem expor dado de cliente
create or replace function horarios_ocupados(p_de date, p_ate date)
returns table (retirada_em timestamptz, qtd int)
language sql
security definer
set search_path = public
as $$
  select retirada_em, count(*)::int
  from pedidos
  where tipo = 'encomenda' and status <> 'recusado'
    and retirada_em >= p_de and retirada_em < p_ate + 1
  group by retirada_em
$$;

grant execute on function criar_pedido(jsonb), status_pedido(text), horarios_ocupados(date, date) to anon, authenticated;

-- ---------------------------------------------------------------
-- Tempo real: o painel acende quando entra pedido, a vitrine
-- atualiza quando muda preço, promoção ou a cozinha fecha
-- ---------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['pedidos', 'produtos', 'promocoes', 'loja'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------
-- Segurança
-- Visitante: lê catálogo, promoções, bairros, loja e agenda. Pedido
-- só pelas funções acima. A equipe logada lê e altera tudo.
-- ---------------------------------------------------------------
alter table produtos enable row level security;
alter table promocoes enable row level security;
alter table bairros enable row level security;
alter table loja enable row level security;
alter table datas_especiais enable row level security;
alter table pedidos enable row level security;

do $$
declare t text;
begin
  foreach t in array array['produtos', 'promocoes', 'bairros', 'loja', 'datas_especiais'] loop
    execute format('drop policy if exists "publico le" on %I', t);
    execute format('create policy "publico le" on %I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "equipe altera" on %I', t);
    execute format('create policy "equipe altera" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

drop policy if exists "equipe le pedidos" on pedidos;
create policy "equipe le pedidos" on pedidos for select to authenticated using (true);
drop policy if exists "equipe atualiza pedidos" on pedidos;
create policy "equipe atualiza pedidos" on pedidos for update to authenticated using (true) with check (true);
