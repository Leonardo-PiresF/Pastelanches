// Tudo que é da loja e muda pouco. Confirme com a Pastelanches antes de publicar.

export const LOJA = {
  nome: 'Pastelanches Vitória',
  endereco: 'Rua do Bom Conselho, 09, ao lado da UNEB, Paulo Afonso/BA',
  // Número que RECEBE os pedidos, formato internacional, só dígitos
  whatsapp: '5575988297066',
  whatsappExibicao: '(75) 98829-7066',
  telefone: '(75) 3281-2556',
  fechaAs: '22h',
  // Link "Obter mais avaliações" do Perfil da Empresa no Google.
  // PENDENTE: a loja precisa reivindicar a ficha no Google para gerar o link.
  linkAvaliacao: '',
  fuso: 'America/Bahia'
}

// Fotos já no site (pasta public/fotos), para a loja escolher no painel.
export const FOTOS = [
  ['/fotos/pastel.webp', 'Pastéis'],
  ['/fotos/hamburguer.webp', 'Hambúrguer'],
  ['/fotos/coxinha.webp', 'Coxinhas'],
  ['/fotos/panqueca.webp', 'Panqueca'],
  ['/fotos/banner-salgados.webp', 'Mini salgados'],
  ['/fotos/banner-congelados.webp', 'Congelados'],
  ['/fotos/banner-canudao.webp', 'Canudões']
]

// Fotos em formato de banner (3:1, assunto à direita). O tom é a cor do lado vazio da foto,
// usado atrás do texto. "claro" pede texto escuro. Cada uma tem o recorte de celular ao lado, com "-m" no nome.
export const BANNERS = {
  '/fotos/banner-salgados.webp': { nome: 'Banner mini salgados', tom: '#93121A' },
  '/fotos/banner-canudao.webp': { nome: 'Banner canudões', tom: '#F0A008', claro: true },
  '/fotos/banner-combo.webp': { nome: 'Banner combo estudante', tom: '#A8402A' },
  '/fotos/banner-congelados.webp': { nome: 'Banner congelados', tom: '#1C1B1B' }
}

// Arquivos da pasta public são gravados como "/fotos/x.webp". Na tela, viram relativos ao endereço
// do site, para funcionar também quando ele está numa subpasta (GitHub Pages).
export const arquivo = (caminho) =>
  caminho?.startsWith('/') ? `${import.meta.env.BASE_URL}${caminho.slice(1)}` : caminho

// Em miniatura e na capa do item, a foto de banner entra pelo recorte de celular, que centraliza o assunto.
export const recorteDe = (foto) => (BANNERS[foto] ? foto.replace('.webp', '-m.webp') : foto)

export const PAGAMENTOS = ['Pix', 'Dinheiro', 'Cartão']

export const CATEGORIAS = {
  cardapio: [
    { id: 'pasteis', nome: 'Pastéis' },
    { id: 'especiais', nome: 'Pastéis especiais', dica: 'Peça pelo número. Do 01 ao 37 por R$ 28, do 38 ao 54 por R$ 32.' },
    { id: 'salgados', nome: 'Salgados' },
    { id: 'sanduiches', nome: 'Lanches' },
    { id: 'pizzas', nome: 'Pizzas' },
    { id: 'lasanhas', nome: 'Lasanhas' },
    { id: 'bebidas', nome: 'Bebidas' },
    { id: 'congelados', nome: 'Congelados', dica: 'Para fritar ou assar em casa.' }
  ],
  festa: [
    { id: 'fritura', nome: 'Fritos' },
    { id: 'canudos', nome: 'Canudos' },
    { id: 'f-pasteis', nome: 'Pastéis' },
    { id: 'empadas', nome: 'Empadas' },
    { id: 'quiches', nome: 'Quiches' },
    { id: 'forno', nome: 'Assados' },
    { id: 'minipizza', nome: 'Mini pizza' }
  ]
}

export const ETAPAS = {
  mesa: [['novo', 'Recebido'], ['preparo', 'No fogo'], ['pronto', 'Retire no balcão'], ['finalizado', 'Retirado']],
  retirada: [['novo', 'Recebido'], ['preparo', 'No fogo'], ['pronto', 'Retire no balcão'], ['finalizado', 'Retirado']],
  delivery: [['novo', 'Recebido'], ['preparo', 'No fogo'], ['pronto', 'Saiu para entrega'], ['finalizado', 'Entregue']],
  encomenda: [['novo', 'Recebida'], ['aceito', 'Confirmada'], ['preparo', 'Em produção'], ['pronto', 'Pronta para retirar'], ['finalizado', 'Retirada']]
}

export const MOTIVOS_RECUSA = [
  'Item em falta',
  'Horário lotado',
  'Fora da área de entrega',
  'Loja fechando',
  'Outro motivo'
]
