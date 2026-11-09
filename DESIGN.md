# Ficha de direção · Pastelanches Vitória

Direção escolhida: **C · Bandeja**, com o carrossel de **Promoções de hoje** abrindo o cardápio.
Canvas de referência: "Pastelanches: direções do cardápio" (artboards C1 e C2).

Reler esta ficha a cada sessão. Mudar de direção a partir daqui significa recomeçar.

## Revisão v2 · cara de app (nov/2026)

Pedido do Leonardo: mais refinado e profissional, com aparência de app de delivery no celular.
Referências estudadas: telas de loja do Wolt, padrões de Uber Eats, iFood e DoorDash.
O que muda em relação à v1:

- **Capa da loja**: foto de capa, folha arredondada sobrepondo a foto, logo redondo no encaixe, nome,
  status "Aberto até 22h" com ponto verde e endereço curto. No computador, capa em mosaico de três fotos
  e logo à esquerda.
- **Modo do pedido**: seletor segmentado de largura cheia (Delivery, Retirar, Na mesa) com uma linha
  explicando o que vale naquele modo (taxa mínima, onde pagar, onde retirar).
- **Busca** no cardápio por nome, ingrediente ou número do pastel especial.
- **Abas de categoria** com sublinhado vermelho, fixas no topo ao rolar. No computador largo viram índice lateral.
- **Linhas no padrão app**: nome, descrição em até duas linhas, preço; miniatura de 100px à direita quando
  há foto e botão + redondo sempre no mesmo lugar. No computador, as linhas viram cartões em duas colunas.
- **Promoções**: cartão com mídia 16:9 e corpo branco. Sem foto, a mídia é amarela com o preço grande.
  No computador, quantidade ímpar põe a primeira promoção na linha inteira.
- **Mais pedidos**: trilho de fotos quadradas com + sobre a foto.
- **Folha do item**: foto de ponta a ponta, grupos com faixa de título e selo "Obrigatório/Pronto",
  opções em linha com rádio, botão "Adicionar" com o valor à direita.
- **Sacola**: barra única "Ver sacola" com contador amarelo e total. No computador, coluna fixa.
- **Superfície** #FFFDF9 para cartões e campos sobre o papel.
- **Sombra**: liberada só para o que flutua (barra da sacola, botões sobre foto, seletor ativo),
  sempre neutra em marrom com baixa opacidade. Nada de sombra em cartão parado.
- Ícones de traço próprios (24px, traço 1.8) em `components/Icone.jsx`.

## Skills de design

- Vitrine (cardápio do cliente, encomendas, senha): `design-taste-frontend`, sem sorteio de direção. Usar a biblioteca e a casa de estilo como regra de acabamento.
- Painel da loja (pedidos, encomendas, preços, agenda): `ui-ux-pro-max`, só as regras de UX, acessibilidade, toque e formulário. Estilo vem desta ficha.
- Passada final nas duas superfícies: `impeccable` com `audit` e `polish`.

## Tese

A comida é a estrela, a tela só serve o pedido. Foto real primeiro, cor tirada da massa e da fritura,
vermelho e amarelo do selo como detalhe de ação, preço e promoção.

## Cor

| Token | Hex | Uso |
|---|---|---|
| `--papel` | #FFF8EE | fundo da página |
| `--massa` | #F7E9D7 | card bandeja, chips, stepper, campo |
| `--fritura` | #3B2015 | texto principal, chip ativo, barra do carrinho, card da senha |
| `--texto-2` | #6F4E3D | descrição, rótulo, apoio |
| `--filete` | #EADAC4 | divisória de 1px, borda de chip e campo |
| `--selo` | #D2231A | ação principal (Pedir, Adicionar, Enviar), etiqueta "Só hoje" |
| `--selo-escuro` | #A8170F | hover e pressionado do botão principal |
| `--gema` | #FFC21A | só promoção: selo de preço, card de promo, botão do carrinho |
| `--ok` | #2E7D4F | status concluído |
| `--apagado` | #A88E7C | horário lotado, item em falta |

Contraste conferido: texto `--fritura` e `--texto-2` sobre `--papel` e `--massa` acima de 7:1;
`--papel` sobre `--selo` cerca de 4,9:1 (texto de botão em 15px bold); `--fritura` sobre `--gema` acima de 10:1.
Nada de #000 ou #fff puros.

## Tipografia

- Títulos: **Baloo 2** 700 e 800. Mesma família de letra redonda do selo.
- Texto e interface: **Figtree** 400, 500, 600 e 700.
- Escala com razão 1.25 a partir de 16px: 13 · 16 · 20 · 25 · 31 · 39 · 49.
  No celular o maior título usado é 31 (promoção) e 39 só na senha.
- Entrelinha: títulos 1.0 a 1.05; texto 1.6; descrição curta de card 1.45.
- Rótulo em caixa alta: 12px, 700, tracking +0.16em.
- Preço sempre com `font-variant-numeric: tabular-nums`.

## Forma

- Raio por função: 22 card de promoção e card bandeja grande; 16 foto; 12 botão, campo e chip; 50% selo de preço.
- Sombra: nenhuma. Separação por filete de 1px `--filete` ou por fundo `--massa`.
- Área de toque mínima 44px; botão principal 48 a 52px de altura.

## Fotografia

- Até o ensaio: fotos recortadas do Instagram da casa, marcadas como provisórias.
- Ensaio (15 a 20 fotos): um item por família, ângulo de três quartos, luz de janela, fundo liso de madeira ou papel,
  um pastel sempre aberto mostrando o recheio, mesmo tratamento de cor em todas.
- Proporções: 4:3 na grade, 16:10 no card de promoção, 1:1 em miniatura.
- WebP ou AVIF com `srcset` (400 e 800 px), `loading="lazy"` fora da primeira tela,
  `fetchpriority="high"` e preload na foto da primeira promoção.

## Estrutura da vitrine

1. Cabeçalho: logo + seletor Mesa · Delivery · Retirar (na mesa, vem travado pelo QR com o número).
2. **Promoções de hoje**: carrossel de cards bandeja com foto, etiqueta "Só hoje" e selo de preço;
   o próximo card aparece na borda; contador "1 de 3". Alimentado e agendado pelo painel.
3. **O que vai ser hoje?**: chips de categoria, fixos no topo ao rolar.
4. Grade de destaques com foto, 2 colunas no celular e 4 no computador, botão "Eu quero".
5. Listas por categoria sem foto; pastéis especiais com o número em `--selo` e busca pelo número.
6. Barra do carrinho flutuante em `--fritura` com botão `--gema`.
7. Encomendas: tela própria aberta pela foto da coxinha de 1 kg, pacotes de 25 com contador,
   dia e horário entre os liberados pela agenda da dona.
8. Senha: card `--fritura` com o número grande, barra de andamento, itens com miniatura, avaliar no Google.

Primitivo que se repete: **a bandeja**, card `--massa` com a foto dentro (respiro de 10px), título em Baloo e preço.

## Movimento

- Carrossel de promoções: `scroll-snap` nativo; Embla só se a dona quiser troca automática.
- Lista para página do produto: View Transitions API, degrada sozinha.
- **Efeito de assinatura, um só**: ao adicionar, a miniatura do item voa até a barra do carrinho
  (FLIP com Web Animations API, 420ms, `cubic-bezier(.2,.8,.2,1)`) e o contador dá um pulo de 180ms.
- Hover e pressionado: 150ms. Entrada de conteúdo: nenhuma animação de rolagem.
- `prefers-reduced-motion`: sem voo, só troca de número.
- Orçamento: menos de 15KB de JS de movimento. Sem GSAP, sem Lenis, sem AOS.

## Pilha

Base da Nebline: Vite + React 18 + Supabase (dados, tempo real, login da equipe) + Vercel (front e funções `/api`).

- `lib/db.js`, `lib/formato.js`, `lib/whatsapp.js`, `components/Foto.jsx` reaproveitados.
- Produtos, preços, promoções e agenda no banco (a dona troca preço todo dia).
- Toda chave de terceiro fica em função serverless; o front nunca chama API externa direto.

## APIs e funcionalidades aprovadas (Fase 03.5)

| Funcionalidade | Como | Tratamento |
|---|---|---|
| Impressão do pedido | Botão "Imprimir" em cada pedido do painel abre um cupom de 80mm (`@page { size: 80mm auto }`) e chama `window.print()`. O Chrome lembra a impressora térmica escolhida. Opcional: abrir o Chrome do caixa com `--kiosk-printing` para imprimir sem a janela de confirmação. | Sem plugin e sem mensalidade. Cupom em rota própria (`/imprimir/:codigo`), só texto, letra grande, código do pedido no topo. Plano B, definido com o Leonardo: botão "Mandar no WhatsApp da loja" em cada pedido, com o texto em formato de nota; no WhatsApp Web, seleciona o texto, botão direito, Imprimir. Plano C: QZ Tray (gratuito, impressão silenciosa paga). |
| Avaliação no Google | Link oficial "Obter mais avaliações" do Perfil da Empresa (gratuito). Botão na tela da senha quando o pedido for retirado ou entregue, e QR impresso no balcão. | Link em `config.js`. Depende de a loja reivindicar a ficha no Google. Proibido oferecer desconto em troca de avaliação. |
| Feriados automáticos | BrasilAPI, feriados nacionais por ano (rota `/api/feriados/v1/{ano}`, gratuita, sem chave; conferir a rota na documentação antes de usar). | Chamado pela função `/api/feriados` com cache de 30 dias (`s-maxage`). A agenda marca o feriado e a dona decide se abre. Se a API cair, a agenda segue só com as datas especiais da dona. Feriado municipal de Paulo Afonso entra como data especial manual. |

Fora desta fase: Pix no site (Mercado Pago, a partir de 0,99% por Pix online), totem e tela de senhas,
WhatsApp automático pela API da Meta. A arquitetura já deixa o lugar de cada um: `lib/whatsapp.js` troca o corpo
para a API sem mexer no resto, e o pagamento entra como novo status do pedido.

Pagamento nesta fase: mesa e retirada pagam no caixa mostrando a senha; delivery paga na entrega (Pix, dinheiro com troco, cartão).

## Não fazer neste projeto

- Desenho ou ilustração no lugar de comida; foto de banco.
- Tela inteira vermelha ou amarela; mais de dois usos de `--gema` na mesma tela fora do carrossel.
- Hero centralizado de tela cheia, badge em pílula acima do título, cards idênticos com ícone.
- Fade-up em tudo, `transition-all`, cascata de delays.
- Inter, Poppins, Space Grotesk ou Geist; uma família com dois pesos só.
- "Artesanal", "experiência", inglês desnecessário, preço escondido.
- Sombra colorida, gradiente decorativo, `rounded-2xl` em tudo.
- Chave de API no front, `fetch` de terceiro em componente, `console.log` esquecido.

## Revisão v3 · sistema de pedido

Direção dada pelo Leonardo a partir de uma referência visual: menos "lanchonete artesanal", mais sistema de pedido profissional.

- **Cor**: fundo branco, cinzas neutros e o vermelho da marca como única cor de ação. O amarelo fica para preço em destaque e contador. Os nomes dos tokens continuam os mesmos (`--papel`, `--massa`, `--fritura`, `--selo`, `--gema`), só os valores mudaram. Entrou `--selo-claro` para o estado selecionado.
- **Tipo**: uma família só, Figtree. Títulos em 800 com entrelinha curta, texto em 400 e 500.
- **Topo**: barra com a marca e três caminhos: Cardápio, Encomendas e Meus pedidos. Não existe cadastro; "Meus pedidos" lista os pedidos feitos naquele aparelho (`lib/meusPedidos.js`).
- **Loja**: capa com uma foto só (`capa-pastel.webp`), logo sobre a capa, nome, status e os modos de pedido como botões com ícone. O selecionado ganha borda e fundo vermelho claro.
- **Cardápio**: cada item é um cartão com borda, nome, descrição, preço e o + vermelho no canto. Duas colunas a partir de 720px.
- **Sacola**: cartão fixo à direita no computador ("Sua sacola", "Revisar pedido"); barra vermelha no rodapé no celular.
- **Banner das encomendas**: foto em 3:1 com o lado esquerdo livre para o texto (`banner-salgados.webp`). Título, texto e valor "a partir de" são editados no painel, aba Promoções, e ficam em `loja.banner`. A mesma foto abre a página de encomendas.
- **Fotos novas de banner**: proporção 3:1, assunto na metade direita, fundo liso vermelho ou amarelo da marca na metade esquerda.

### v3.1 · carrossel de banners

As promoções deixaram de ser cartões e viraram banners largos, no mesmo carrossel do banner de encomendas (`Destaques.jsx`). A ordem é: promoções de hoje, encomendas, promoções com data futura. As fotos de banner ficam em `BANNERS` (`lib/config.js`), cada uma com o tom do fundo e, se precisar, o foco no celular. Promoção com data marcada que ainda não chegou aparece como aviso ("Dia 14/10"), sem botão de pedir. É o caso do Festival do Canudão.
