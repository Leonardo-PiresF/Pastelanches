// Catálogo inicial, conforme o folheto da loja (out/2026). Depois da primeira carga
// no banco, preço, disponibilidade e promoção se mudam pelo painel, não aqui.

const comMolho = (s) => `${s}, tomate, cebola e orégano`

const ESPECIAIS = [
  ['Ouro branco', 'Queijo mussarela'],
  ['Três queijos', 'Catupiry, mussarela e coalho'],
  ['Quatro queijos', 'Catupiry, mussarela, coalho e prato'],
  ['Misto', 'Presunto e queijo'],
  ['Mistão', 'Presunto, queijo, milho e azeitona'],
  ['Napolitano', 'Presunto, queijo, azeitona e orégano'],
  ['Salame', 'Salame, queijo e orégano'],
  ['Medalha', 'Calabresa, queijo e orégano'],
  ['Medalhão', 'Calabresa, queijo, milho e orégano'],
  ['Hot dog', 'Carne, batata palha e salsicha'],
  ['Frango'], ['Frango com catupiry'], ['Frango com milho'], ['Frango com ervilha'],
  ['Frango com ovos'], ['Frango com purê'], ['Frango com bacon'], ['Frango com calabresa'],
  ['Frango com queijo'], ['Frango com azeitona'], ['Frango com cheddar'],
  ['Carne'], ['Carne com milho'], ['Carne com ervilha'], ['Carne com catupiry'],
  ['Carne com queijo'], ['Carne com azeitona'], ['Carne com ovos'], ['Carne com purê'],
  ['Carne com bacon'], ['Carne com calabresa'], ['Carne com cheddar'],
  ['Romeu e Julieta', 'Queijo e goiabada'],
  ['Doce de leite'],
  ['Creme', 'Creme de leite com goiabada'],
  ['Banana real', 'Banana, canela e açúcar'],
  ['Banana delícia', 'Banana, queijo e leite condensado'],
  ['Camarão'], ['Camarão com catupiry'], ['Camarão com queijo'], ['Camarão com purê'],
  ['Bacalhau'], ['Bacalhau com catupiry'], ['Bacalhau com queijo'], ['Bacalhau com purê'],
  ['Atum', 'Atum, queijo e orégano'],
  ['Palmito', 'Palmito, queijo e orégano'],
  ['À moda da casa', 'Presunto, queijo, calabresa, catupiry, milho, ervilha, azeitona e orégano'],
  ['Prestígio'],
  ['Charque', 'Charque, queijo e purê'],
  ['Pizza', 'Presunto, queijo, azeitona, orégano, tomate e cebola'],
  ['Doce de leite com banana'], ['Brigadeiro'], ['Sonho de valsa']
]

const PIZZAS = {
  'Só queijo': comMolho('Mussarela'),
  'Três queijos': comMolho('Mussarela, prato e catupiry'),
  'Quatro queijos': comMolho('Mussarela, prato, catupiry e cheddar'),
  Portuguesa: comMolho('Mussarela, presunto, ovos, milho, ervilha e azeitona'),
  Calabresa: comMolho('Mussarela e calabresa'),
  'Calabresa com catupiry': comMolho('Mussarela, calabresa e catupiry'),
  'Presunto com catupiry': comMolho('Mussarela, presunto e catupiry'),
  Americana: comMolho('Mussarela, bacon e milho'),
  Bolonhesa: comMolho('Mussarela, carne moída e ovos'),
  Crocante: comMolho('Mussarela, presunto, milho e batata palha'),
  Sertaneja: comMolho('Mussarela e charque'),
  Frango: comMolho('Mussarela e frango'),
  'Frango com catupiry': comMolho('Mussarela, frango e catupiry'),
  'Frango com cheddar': comMolho('Mussarela, frango e cheddar'),
  Caipira: comMolho('Mussarela, frango, milho e azeitona'),
  Palmito: comMolho('Mussarela, palmito e azeitona'),
  Atum: comMolho('Mussarela e atum'),
  'À moda da casa': comMolho('Mussarela, presunto, calabresa, milho, ervilha, azeitona e ovos'),
  Brigadeiro: 'Chocolate e chocolate granulado',
  'Romeu e Julieta': 'Goiabada e queijo',
  Banana: 'Mussarela, banana, açúcar e canela'
}

const SUCOS = ['Abacaxi', 'Acerola', 'Cacau', 'Caju', 'Cajá', 'Graviola', 'Goiaba', 'Morango', 'Maracujá', 'Manga', 'Umbu']
const SABORES_TRADICIONAL = ['Carne', 'Queijo', 'Frango', 'Presunto com queijo']

const tamanhos = (lista) => lista.map(([nome, preco]) => ({ nome, preco }))
const sabores = (rotulo, opcoes, descricoes) => ({ rotulo, opcoes, ...(descricoes && { descricoes }) })

const cardapio = []
const incluir = (categoria, itens) =>
  itens.forEach((item) => cardapio.push({ catalogo: 'cardapio', categoria, ...item }))

incluir('pasteis', [
  { id: 'pastel', nome: 'Pastel tradicional', descricao: 'Frito na hora', preco: 15, sabores: sabores('Sabor', SABORES_TRADICIONAL) }
])

incluir('especiais', [
  ...ESPECIAIS.map(([nome, descricao], i) => ({
    id: `especial-${i + 1}`,
    numero: i + 1,
    nome,
    descricao,
    preco: i < 37 ? 28 : 32
  })),
  { id: 'especial-55', numero: 55, nome: 'À sua escolha', descricao: 'Monte com 5 ingredientes. Escreva quais na observação.', preco: 35 }
])

incluir('salgados', [
  { id: 'coxinha', nome: 'Coxinha', preco: 15 },
  { id: 'enroladinho', nome: 'Enroladinho', preco: 15 },
  { id: 'bolinha', nome: 'Bolinha de queijo', preco: 15 },
  { id: 'coxinha-catupiry', nome: 'Coxinha com catupiry', preco: 23 },
  { id: 'coxinha-especial', nome: 'Coxinha especial', descricao: 'Frango, milho, queijo, catupiry e bacon', preco: 28 }
])

incluir('sanduiches', [
  ['queijo', 'Queijo', 15, 'Queijo'],
  ['misto', 'Misto', 18, 'Presunto e queijo'],
  ['bauru', 'Bauru', 20, 'Presunto, queijo e salada'],
  ['americano', 'Americano', 22, 'Presunto, queijo, ovo e salada'],
  ['hamburguer', 'Hambúrguer', 22, 'Carne, presunto, queijo e salada'],
  ['egg-burguer', 'Egg-burguer', 25, 'Carne, presunto, queijo, ovo e salada'],
  ['big-frango', 'Big-frango', 28, 'Carne, frango, presunto, queijo e salada'],
  ['big-frangao', 'Big-frangão', 30, 'Carne, frango, presunto, queijo, ovo e salada'],
  ['x-frango', 'X-frango', 25, 'Frango, presunto, queijo e salada'],
  ['x-frangao', 'X-frangão', 28, 'Frango, presunto, queijo, ovo e salada'],
  ['x-bacon', 'X-bacon', 30, 'Carne, presunto, queijo, bacon, ovo e salada'],
  ['x-calabresa', 'X-calabresa', 30, 'Carne, queijo, presunto, calabresa, ovo e salada'],
  ['x-tudo', 'X-tudo', 35, 'Carne, frango, queijo, presunto, ovo, salsicha, calabresa, bacon, milho, ervilha e salada']
].map(([id, nome, preco, descricao]) => ({ id: `lanche-${id}`, nome, preco, descricao })))

incluir('sanduiches', [
  { id: 'panqueca', nome: 'Panqueca', descricao: 'Com molho especial', preco: 30, sabores: sabores('Recheio', ['Carne', 'Frango']) }
])

incluir('pizzas', [
  {
    id: 'pizza',
    nome: 'Pizza',
    descricao: `${Object.keys(PIZZAS).length} sabores`,
    tamanhos: tamanhos([['Pequena', 48], ['Média', 52], ['Grande', 60]]),
    sabores: sabores('Sabor', Object.keys(PIZZAS), PIZZAS)
  }
])

incluir('lasanhas', [
  {
    id: 'lasanha',
    nome: 'Lasanha',
    descricao: 'Massa, presunto, queijo, parmesão, ervilha e molho',
    tamanhos: tamanhos([['Pequena', 70], ['Média', 80], ['Grande', 100]]),
    sabores: sabores('Sabor', ['Frango', 'Carne', 'Quatro queijos'])
  }
])

incluir('bebidas', [
  { id: 'suco', nome: 'Suco', tamanhos: tamanhos([['Sem leite', 10], ['Com leite', 12]]), sabores: sabores('Fruta', SUCOS) },
  { id: 'caldo-de-cana', nome: 'Caldo de cana', preco: 10 },
  { id: 'refrigerante', nome: 'Refrigerante', tamanhos: tamanhos([['290 ml', 7], ['Lata', 8], ['500 ml', 10], ['1 litro', 12], ['2 litros', 18]]) },
  { id: 'agua', nome: 'Água mineral', tamanhos: tamanhos([['Sem gás', 5], ['Com gás', 5]]) }
])

incluir('congelados', [
  ...[
    ['Almofadinha de pizza', 20], ['Churros', 20], ['Coxinha', 20], ['Croquete de presunto', 20],
    ['Medalhão', 20], ['Pérola de queijo', 20], ['Tijolinho', 20], ['Pastel de carne frito', 20],
    ['Pastel de frango frito', 20], ['Esfiha de carne aberta ou fechada', 20],
    ['Almofadinha de camarão', 22.5], ['Boliviano de carne', 22.5], ['Bolinho de bacalhau', 22.5],
    ['Enroladinho de salsicha', 22.5], ['Mineirinho', 22.5], ['Quibe', 22.5], ['Pastel de camarão frito', 25]
  ].map(([nome, preco], i) => ({ id: `congelado-${i + 1}`, nome, preco, unidade: '25 un' })),
  { id: 'congelado-pastel-forno', nome: 'Pastel de forno', preco: 22.5, unidade: '25 un', sabores: sabores('Sabor', ['Carne', 'Frango', 'Queijo']) },
  { id: 'congelado-paozinho', nome: 'Pãozinho de salsicha', preco: 20, unidade: '13 un' },
  { id: 'congelado-casquinha', nome: 'Casquinha de canudo', preco: 17.5, unidade: '25 un' },
  { id: 'congelado-minipizza', nome: 'Mini pizza', preco: 20, unidade: '13 un', sabores: sabores('Sabor', ['Calabresa', 'Frango', 'Presunto']) }
])

// A mesma foto vale para a família inteira: todo pastel, todo lanche, toda coxinha.
// Onde não há foto própria, entra o recorte de um banner.
const FOTO_PASTEL = '/fotos/pastel.webp'
const FOTO_SALGADOS = '/fotos/banner-salgados.webp'
const fotoDe = (p) => {
  if (p.id === 'panqueca') return '/fotos/panqueca.webp'
  if (p.id.startsWith('coxinha')) return '/fotos/coxinha.webp'
  return {
    pasteis: FOTO_PASTEL,
    especiais: FOTO_PASTEL,
    salgados: FOTO_SALGADOS,
    sanduiches: '/fotos/hamburguer.webp',
    congelados: '/fotos/banner-congelados.webp'
  }[p.categoria] ?? null
}
const MAIS_PEDIDOS = ['pastel', 'lanche-hamburguer', 'coxinha', 'panqueca']

const FESTA = {
  fritura: [['Almofadinha de pizza', 27.5], ['Almofadinha de camarão', 30], ['Almofadinha de frango', 27.5], ['Boliviano de carne', 30], ['Boliviano de frango', 30], ['Bolinho de bacalhau', 30], ['Camarão encapotado', 90], ['Charutinho misto', 27.5], ['Churros', 27.5], ['Coxinha especial', 27.5], ['Croquete de presunto com queijo', 27.5], ['Enroladinho de salsicha', 27.5], ['Medalhão de calabresa', 27.5], ['Mineirinho de carne seca', 30], ['Pérola de queijo', 27.5], ['Quibe com catupiry', 30], ['Tijolinho de carne com bacon', 27.5], ['Tubinho de cheddar com milho', 27.5]],
  canudos: [['Canudo de frango', 27.5], ['Canudo de carne', 27.5], ['Canudo de doce de leite', 30]],
  'f-pasteis': [['Pastel de carne', 27.5], ['Pastel de camarão', 32.5], ['Pastel de frango', 27.5], ['Pastel de Romeu e Julieta', 30], ['Pastel de queijo', 27.5]],
  empadas: [['Empada de Romeu e Julieta', 27.5], ['Empada de queijo', 27.5], ['Empada de doce de leite condensado', 27.5], ['Empada de frango com catupiry', 30], ['Empada de bacalhau', 32.5], ['Empada de camarão', 32.5], ['Empada de palmito com queijo', 32.5]],
  quiches: [['Quiche de frango com catupiry', 30], ['Quiche de atum', 32.5], ['Quiche de bacalhau', 32.5], ['Quiche de camarão', 32.5], ['Quiche de carne seca', 32.5], ['Quiche de tomate seco com queijo', 32.5], ['Quiche de brigadeiro', 32.5]],
  forno: [['Barquete de frango', 30], ['Barquete de ameixa', 32.5], ['Barquete de camarão', 32.5], ['Barquete de bacalhau', 32.5], ['Pastel de carne de forno', 30], ['Pastel de frango de forno', 30], ['Pastel de queijo de forno', 30], ['Surpresa de azeitona', 30], ['Tortinha nordestina', 32.5], ['Torta tropical', 32.5], ['Pãozinho de salsicha', 32.5], ['Esfiha de frango', 32.5], ['Esfiha de carne', 32.5]],
  minipizza: [['Mini pizza de calabresa', 42.5], ['Mini pizza de frango com catupiry', 42.5], ['Mini pizza de presunto', 42.5]]
}

const festa = Object.entries(FESTA).flatMap(([categoria, lista]) =>
  lista.map(([nome, preco], i) => ({ id: `festa-${categoria}-${i + 1}`, catalogo: 'festa', categoria, nome, preco, unidade: '25 un' }))
)

export const PRODUTOS = [...cardapio, ...festa].map((p, ordem) => ({
  numero: null,
  descricao: null,
  preco: null,
  tamanhos: null,
  sabores: null,
  unidade: null,
  foto: fotoDe(p),
  destaque: MAIS_PEDIDOS.includes(p.id),
  disponivel: true,
  ...p,
  ordem
}))

// dias: 0 domingo ... 6 sábado. Vazio vale todo dia.
export const PROMOCOES = [
  {
    // Festival em data marcada: a loja põe a data no painel e liga. Antes do dia, aparece como "Dia 14/10".
    id: 'festival-canudao',
    titulo: 'Festival do Canudão',
    texto: 'Crocante por fora, cremoso por dentro. A partir das 16h.',
    preco: 25,
    foto: '/fotos/banner-canudao.webp',
    sabores: null,
    dias: [],
    data: null,
    ativa: false,
    ordem: 1
  },
  {
    id: 'combo-estudante',
    titulo: 'Combo Estudante',
    texto: '1 salgado tradicional + 1 refri lata. Mostre a carteirinha no caixa.',
    preco: 16,
    foto: '/fotos/banner-combo.webp',
    sabores: sabores('Salgado', ['Coxinha', 'Enroladinho', 'Bolinha de queijo']),
    dias: [1, 2, 3, 4, 5],
    data: null,
    ativa: true,
    ordem: 2
  },
  {
    id: 'congelados-promo',
    titulo: 'Congelados',
    texto: 'Qualquer pacote de 25 mini salgados para fritar em casa.',
    preco: 17.5,
    foto: '/fotos/banner-congelados.webp',
    sabores: sabores('Salgado', ['Coxinha', 'Almofadinha de pizza', 'Pérola de queijo', 'Medalhão', 'Tijolinho']),
    dias: [],
    data: null,
    ativa: true,
    ordem: 3
  },
  {
    id: 'dia-do-pastel',
    titulo: 'Dia do Pastel',
    texto: 'Pastel tradicional por R$ 10.',
    preco: 10,
    foto: null,
    sabores: sabores('Sabor', SABORES_TRADICIONAL),
    dias: [],
    data: null,
    ativa: false,
    ordem: 4
  }
]

// Taxas de exemplo. PENDENTE: confirmar bairros e valores com a loja.
export const BAIRROS = [
  ['General Dutra', 4], ['Alves de Souza', 4], ['Centro', 5], ['BTN', 6],
  ['Jardim Bahia', 6], ['Prainha', 6], ['Tancredo Neves', 7], ['Panorama', 7]
].map(([nome, taxa]) => ({ nome, taxa }))

export const AGENDA_PADRAO = {
  semana: Array.from({ length: 7 }, () => ({ on: true, ini: '13:00', fim: '22:00' })),
  intervalo: 60,
  limite: 3,
  antecedencia: 24
}

// Banner das encomendas no cardápio. A loja troca título, texto e valor no painel.
export const BANNER_PADRAO = {
  ativo: true,
  titulo: 'Mini salgados',
  texto: 'Pacote com 25 unidades. Retire no dia e horário que escolher.',
  preco: 27.5
}
