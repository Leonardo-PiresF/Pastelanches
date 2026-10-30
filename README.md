# Pastelanches Vitória · Pedidos (protótipo)

Protótipo do cardápio digital com pedidos da Pastelanches Vitória (Paulo Afonso, BA).
Mostra, na mesma tela, o que o cliente vê no celular e o painel que a loja usa.

- **Mesa (QR code):** o cliente monta o pedido e envia para a cozinha; paga no caixa.
- **Delivery:** bairro com taxa, endereço, pagamento na entrega (Pix, dinheiro com troco, cartão).
- **Retirada:** pedido pronto para buscar no balcão.
- **Painel:** fila de pedidos (novos, em preparo, prontos), status que atualiza na tela do cliente,
  mensagem pronta para o motoboy e para confirmar no WhatsApp, item em falta,
  cozinha fechada e promoção do dia.

É um protótipo de apresentação: os pedidos ficam só na memória do navegador e somem ao recarregar.

## Estrutura

```
index.html          página
css/styles.css      estilos (tokens de cor e fonte no topo)
js/menu.js          cardápio, promoções e taxas por bairro (edite aqui)
js/app.js           estado, telas do cliente e do painel
assets/             logo oficial, favicon e ícone
```

Sem build, sem dependências. HTML, CSS e JavaScript puros.

## Rodar local

Abrir o `index.html` direto no navegador já funciona. Se preferir um servidor:

```
npx serve .
```

## Deploy na Vercel

1. Suba a pasta para um repositório no GitHub.
2. Na Vercel: **Add New › Project**, importe o repositório.
3. Framework Preset: **Other**. Build Command e Output Directory em branco.
4. Deploy.

## Pendências antes de virar produto

- Confirmar cardápio, preços e taxas por bairro com a loja (`js/menu.js`).
- Pegar a logo em arquivo original (a atual foi recortada de um post do Instagram, 305 px).
- Backend para os pedidos (ex.: Supabase com tempo real) no lugar do estado em memória.
- QR code por mesa apontando para `?mesa=12` (hoje a mesa é simulada).
