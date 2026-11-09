# Pastelanches Vitória · cardápio com pedidos

Cardápio digital com pedido na mesa (QR), delivery, retirada e encomenda de salgados para festa,
e painel da loja para receber, imprimir e acompanhar os pedidos.

- Vitrine: `/` (na mesa: `/?mesa=4`)
- Encomenda de festa: `/#/encomenda`
- Senha do cliente: `/#/pedido/CODIGO`
- Painel da loja: `/#/painel`

Direção visual e regras de design em `DESIGN.md`.

## Rodar no computador

```bash
npm install
npm run dev
```

Sem o arquivo `.env`, o site abre em **modo demonstração**: catálogo, pedidos e configurações
ficam no próprio navegador. Senha do painel na demonstração: `pastelanches`
(ou a definida em `VITE_PAINEL_SENHA_DEMO`).

Antes de publicar: `npm run lint` e `npm run build`.

## Colocar no ar

### 1. Supabase (banco, tempo real e login da equipe)

1. Crie o projeto em supabase.com (plano gratuito atende).
2. SQL Editor: rode `supabase/schema.sql` e depois `supabase/seed.sql`.
   O `seed.sql` é gerado de `src/data/cardapio.js` com `npm run seed`. Ele não sobrescreve
   nada que a loja já editou.
3. Authentication > Users: crie o usuário da loja (e-mail e senha). Não precisa liberar cadastro público.
4. Project Settings > API: copie a URL e a chave `anon`.

### 2. Vercel (site e função de feriados)

1. Importe o repositório na Vercel. Framework: Vite.
2. Environment Variables: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Deploy. A função `api/feriados.js` sobe junto, sem configuração.

## Como a segurança funciona

- O cliente nunca grava direto na tabela. O pedido passa pela função `criar_pedido`, que
  busca cada preço no banco, confere promoção do dia, bairro, cozinha aberta e lotação do
  horário da encomenda. Preço alterado no navegador não chega ao pedido.
- O cliente acompanha só o próprio pedido, pelo código (`status_pedido`).
- Ocupação da agenda sai por `horarios_ocupados`, sem dado de cliente.
- Ler e alterar pedidos, preços e agenda exige login da equipe (RLS).

## Impressão dos pedidos

Botão **Imprimir** em cada pedido: gera um cupom de 80mm e chama a impressão do navegador.
O Chrome lembra a última impressora usada; escolha a térmica uma vez.

**Imprimir ao chegar** (chave no topo do painel): todo pedido novo sai sozinho. Para não aparecer
a janela de confirmação, abra o Chrome do caixa com o atalho:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing https://SEU-SITE/#/painel
```

e deixe a térmica como impressora padrão do Windows.

Plano B: botão **WhatsApp da loja** manda o pedido em formato de nota para o WhatsApp da loja.
No WhatsApp Web, selecione o texto, botão direito, Imprimir.

## Rotina da loja no painel

- **Pedidos**: Novos, No fogo, Prontos. Toca um aviso quando entra pedido. Botão Motoboy manda
  endereço, valor e troco para o motoboy do dia.
- **Encomendas**: por dia de retirada, com a soma de produção do dia.
- **Cardápio e preços**: preço salva ao sair do campo; "Em falta" some com o item na hora.
- **Promoções**: liga, desliga e agenda por dia da semana ou data. O cliente vê "Promoções de hoje".
- **Agenda**: dias e horários de retirada das encomendas, limite por horário, antecedência,
  datas especiais e feriados nacionais (fechados por padrão, a dona decide abrir).
- **Entrega e QR**: bairros e taxas, QR das mesas para imprimir, QR de avaliação no Google.

## Pendências com a loja

- Link de avaliação do Google (`linkAvaliacao` em `src/lib/config.js`), depois de reivindicar a ficha.
- Bairros atendidos e taxas reais.
- Sinal e entrega nas encomendas (hoje: sem sinal, só retirada).
- Endereço oficial (folheto mostra outros endereços).
- Ensaio de fotos: 15 a 20 fotos em `public/fotos/` e na lista `FOTOS` de `src/lib/config.js`.

## Estrutura

```
api/feriados.js          feriados nacionais (BrasilAPI) com cache
supabase/                schema.sql e seed.sql
scripts/gerar-seed.mjs   gera o seed a partir do catálogo
src/data/cardapio.js     catálogo inicial
src/lib/                 dados (db.js), regras de pedido e agenda, formatação, fuso
src/features/vitrine/    cardápio, promoções, carrinho, checkout, senha, encomenda
src/features/painel/     painel da loja
src/features/cupom/      cupom de 80mm
```
