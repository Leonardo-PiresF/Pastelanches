// Gera supabase/seed.sql a partir de src/data/cardapio.js.
// Rodar uma vez na implantação. "on conflict do nothing" protege o que a loja já editou.
import { writeFileSync } from 'node:fs'
import { PRODUTOS, PROMOCOES, BAIRROS, AGENDA_PADRAO, BANNER_PADRAO } from '../src/data/cardapio.js'

const texto = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const json = (v) => (v === null || v === undefined ? 'null' : `${texto(JSON.stringify(v))}::jsonb`)
const numero = (v) => (v === null || v === undefined ? 'null' : String(v))
const dias = (v) => (v?.length ? `'{${v.join(',')}}'` : 'null')

const linhas = (lista, montar) => lista.map((item) => `  (${montar(item).join(', ')})`).join(',\n')

const sql = `-- Gerado por scripts/gerar-seed.mjs. Não editar à mão.

insert into produtos (id, catalogo, categoria, numero, nome, descricao, preco, tamanhos, sabores, unidade, foto, destaque, disponivel, ordem) values
${linhas(PRODUTOS, (p) => [texto(p.id), texto(p.catalogo), texto(p.categoria), numero(p.numero), texto(p.nome), texto(p.descricao), numero(p.preco), json(p.tamanhos), json(p.sabores), texto(p.unidade), texto(p.foto), p.destaque, p.disponivel, p.ordem])}
on conflict (id) do nothing;

insert into promocoes (id, titulo, texto, preco, foto, sabores, dias, data, ativa, ordem) values
${linhas(PROMOCOES, (p) => [texto(p.id), texto(p.titulo), texto(p.texto), numero(p.preco), texto(p.foto), json(p.sabores), dias(p.dias), texto(p.data), p.ativa, p.ordem])}
on conflict (id) do nothing;

insert into bairros (nome, taxa) values
${linhas(BAIRROS, (b) => [texto(b.nome), numero(b.taxa)])}
on conflict (nome) do nothing;

insert into loja (id, cozinha_aberta, agenda, banner) values (1, true, ${json(AGENDA_PADRAO)}, ${json(BANNER_PADRAO)})
on conflict (id) do nothing;
`

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
process.stdout.write(`seed.sql gerado: ${PRODUTOS.length} produtos, ${PROMOCOES.length} promoções, ${BAIRROS.length} bairros\n`)
