/* Cardápio da Pastelanches Vitória.
   Lido do destaque "Cardápio" do Instagram: nomes e preços ainda precisam ser confirmados com a loja.
   Para editar o cardápio, mexa só neste arquivo. */
const MENU_DATA = (() => {
'use strict';
const ESP1 = ['Ouro branco','Três queijos','Quatro queijos','Misto','Mistão','Napolitano','Salame','Medalha','Medalhão','Hot dog','Frango','Frango com catupiry','Frango com milho','Frango com ervilha','Frango com ovos','Frango com purê','Frango com bacon','Frango com calabresa','Frango com queijo','Frango com azeitona','Frango com cheddar','Carne','Carne com milho','Carne com ervilha','Carne com catupiry','Carne com queijo','Carne com azeitona','Carne com ovos','Carne com purê','Carne com bacon','Carne com calabresa','Carne com cheddar','Romeu e Julieta','Doce de leite','Creme','Banana real','Banana delícia'];
const ESP2 = ['Camarão','Camarão com catupiry','Camarão com queijo','Camarão com purê','Bacalhau','Bacalhau com catupiry','Bacalhau com queijo','Bacalhau com purê','Atum','Palmito','À moda da casa','Presunto e queijo','Charque','Pizza','Doce de leite com banana','Brigadeiro','Sonho de valsa','Sertanejo','À sua escolha'];
const PIZZAS = ['Só queijo','Três queijos','Quatro queijos','Portuguesa','Calabresa','Frango com catupiry','Frango com cheddar','Bolonhesa','Sertaneja','Atum','Palmito','À moda da casa','Brigadeiro','Romeu e Julieta','Banana'];
const SUCOS = ['Abacaxi','Acerola','Cacau','Cajá','Caju','Graviola','Goiaba','Morango','Maracujá','Manga','Umbu'];

const CATS = [
  {id:'pasteis', name:'Pastéis'},
  {id:'especiais', name:'Pastéis especiais', hint:'Peça pelo número. Do 01 ao 37 por R$ 25, do 38 ao 56 por R$ 28.'},
  {id:'salgados', name:'Salgados'},
  {id:'sanduiches', name:'Sanduíches'},
  {id:'pizzas', name:'Pizzas'},
  {id:'lasanhas', name:'Lasanhas'},
  {id:'bebidas', name:'Bebidas'}
];

const MENU = [];
const add = (o) => MENU.push(o);
add({id:'trad', cat:'pasteis', name:'Pastel tradicional', desc:'Sequinho e crocante, frito na hora', price:14, flavor:{label:'Sabor', choices:['Carne','Queijo','Frango','Presunto com queijo']}, tag:'Mais pedido'});
add({id:'canudao', cat:'pasteis', name:'Canudão recheado', desc:'Crocante por fora, cremoso por dentro. Só às quartas', price:25, flavor:{label:'Recheio', choices:['Frango com catupiry','Carne com cheddar','Camarão','Doce de leite']}, tag:'Festival'});
ESP1.forEach((n,i) => add({id:'e'+(i+1), cat:'especiais', num:i+1, name:n, price:25}));
ESP2.forEach((n,i) => add({id:'e'+(i+38), cat:'especiais', num:i+38, name:n, price:28}));
[['Coxinha',14],['Enroladinho',14],['Bolinha de queijo',14],['Coxinha com catupiry',20],['Coxinha especial',25]].forEach(([n,p],i)=>add({id:'s'+i, cat:'salgados', name:n, price:p}));
[['Queijo',14,'Pão e queijo'],['Misto',16,'Presunto e queijo'],['Bauru',18,'Presunto, queijo e tomate'],['Americano',20,'Presunto, queijo, ovo e salada'],['Hambúrguer',20,'Carne, queijo e salada'],['Egg burguer',22,'Hambúrguer com ovo'],['X-frango',20,'Frango, queijo e salada'],['X-bacon',25,'Hambúrguer, bacon e queijo'],['X-calabresa',25,'Hambúrguer, calabresa e queijo'],['Big-burguer',25,'Dois hambúrgueres'],['Big-frango',25,'Frango em dobro'],['X-tudo',30,'Hambúrguer, frango, bacon, calabresa, ovo e queijo']].forEach(([n,p,d],i)=>add({id:'h'+i, cat:'sanduiches', name:n, desc:d, price:p}));
add({id:'panqueca', cat:'sanduiches', name:'Panqueca mista', desc:'Carne ou frango, molho e queijo', price:25});
add({id:'pizza', cat:'pizzas', name:'Pizza', desc:PIZZAS.length+' sabores', sizes:[['Pequena',42],['Média',60],['Grande',82]], flavor:{label:'Sabor', choices:PIZZAS}});
add({id:'lasanha', cat:'lasanhas', name:'Lasanha', desc:'Frango, carne ou quatro queijos', sizes:[['Pequena',50],['Média',70],['Grande',90]], flavor:{label:'Sabor', choices:['Frango','Carne','Quatro queijos']}});
add({id:'suco', cat:'bebidas', name:'Suco natural', desc:'Com água ou com leite', sizes:[['Com água',8],['Com leite',10]], flavor:{label:'Fruta', choices:SUCOS}});
add({id:'caldo', cat:'bebidas', name:'Caldo de cana 500 ml', price:10});
add({id:'laranja', cat:'bebidas', name:'Suco de laranja 500 ml', price:10});
add({id:'refri', cat:'bebidas', name:'Refrigerante', sizes:[['Lata',7],['1 litro',10],['2 litros',14]]});
add({id:'agua', cat:'bebidas', name:'Água mineral', price:4});
const BY_ID = Object.fromEntries(MENU.map(m => [m.id, m]));

const PROMOS = [
  {id:'estudante', on:true, title:'Combo Estudante R$ 16', text:'1 salgado tradicional + 1 refri lata. Mostre a carteirinha.', item:{id:'combo-est', name:'Combo Estudante', price:16, flavor:{label:'Salgado', choices:['Coxinha','Enroladinho','Bolinha de queijo']}}},
  {id:'pastel10', on:false, title:'Dia do Pastel: tradicional R$ 10', text:'Só hoje. Especial ganha caldo de cana 300 ml.', item:{id:'trad-promo', name:'Pastel tradicional (promo)', price:10, flavor:{label:'Sabor', choices:['Carne','Queijo','Frango','Presunto com queijo']}}},
  {id:'prepronto', on:true, title:'Pré-prontos R$ 17,50', text:'Reserve seu pacote para o freezer e retire hoje.', item:{id:'preprontos', name:'Pacote de salgados pré-prontos', price:17.5, flavor:{label:'Salgado', choices:['Coxinha','Enroladinho','Bolinha de queijo','Sortido']}}}
];

/* Taxas de entrega de exemplo: confirmar com a loja */
const BAIRROS = [['General Dutra',4],['Alves de Souza',4],['Centro',5],['BTN',6],['Jardim Bahia',6],['Prainha',6],['Tancredo Neves',7],['Panorama',7]];

return Object.freeze({ CATS, MENU, BY_ID, PROMOS, BAIRROS });
})();

