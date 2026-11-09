import { useRef, useState } from 'react'
import Folha from '../../components/Folha.jsx'
import Foto from '../../components/Foto.jsx'
import Icone from '../../components/Icone.jsx'
import Stepper from '../../components/Stepper.jsx'
import { brl } from '../../lib/formato.js'
import { precoDe, precoInicial } from '../../lib/pedido.js'
import { itemDePromocao, itemDeProduto } from './item.js'

// Grupo de escolha no padrão dos apps de delivery: faixa com o título e a regra, opções em linha com rádio.
function Grupo({ titulo, nome, opcoes, valor, aoEscolher, obrigatorio, descricoes }) {
  return (
    <fieldset className="grupo-opcoes">
      <legend>
        <span>
          <b>{titulo}</b>
          <small>Escolha 1 opção</small>
        </span>
        {obrigatorio && <span className={`selo-regra ${valor ? 'ok' : ''}`}>{valor ? 'Pronto' : 'Obrigatório'}</span>}
      </legend>
      {opcoes.map((o) => (
        <label key={o.nome} className="opcao-linha">
          <span>
            {o.nome}
            {descricoes?.[o.nome] && <small>{descricoes[o.nome]}</small>}
          </span>
          {o.preco !== undefined && <span className="preco">{brl(o.preco)}</span>}
          <input type="radio" name={nome} checked={valor === o.nome} onChange={() => aoEscolher(o.nome)} />
        </label>
      ))}
    </fieldset>
  )
}

function Conteudo({ alvo, aoAdicionar, aoFechar }) {
  const { produto, promocao } = alvo
  const base = produto ?? promocao
  const nome = base.nome ?? base.titulo
  const [tamanho, setTamanho] = useState(produto?.tamanhos?.[0]?.nome ?? null)
  const [sabor, setSabor] = useState(null)
  const [obs, setObs] = useState('')
  const [qtd, setQtd] = useState(1)
  const [aviso, setAviso] = useState('')
  const botao = useRef(null)

  const preco = produto ? precoDe(produto, tamanho) : promocao.preco
  const opcoes = base.sabores

  function adicionar() {
    if (opcoes && !sabor) return setAviso(`Escolha ${opcoes.rotulo.toLowerCase()} para continuar.`)
    const item = produto
      ? itemDeProduto(produto, { tamanho, sabor, obs, qtd, preco })
      : itemDePromocao(promocao, { sabor, obs, qtd })
    aoAdicionar(item, botao.current.getBoundingClientRect())
  }

  return (
    <div className="item-folha">
      <div className={`item-folha-capa ${base.foto ? '' : 'sem-foto'}`}>
        {base.foto && <Foto src={base.foto} alt={nome} />}
        <button type="button" className="botao-flutuante" onClick={aoFechar} aria-label="Fechar"><Icone nome="fechar" /></button>
      </div>

      <div className="item-folha-cabeca">
        <h2>{nome}</h2>
        {(base.descricao || base.texto) && <p>{base.descricao ?? base.texto}</p>}
        <span className="preco">
          {produto?.tamanhos ? `a partir de ${brl(precoInicial(produto))}` : brl(preco)}
        </span>
      </div>

      {produto?.tamanhos && (
        <Grupo titulo="Tamanho" nome="tamanho" opcoes={produto.tamanhos} valor={tamanho} aoEscolher={setTamanho} />
      )}
      {opcoes && (
        <Grupo
          titulo={opcoes.rotulo}
          nome="sabor"
          opcoes={opcoes.opcoes.map((nome) => ({ nome }))}
          descricoes={opcoes.descricoes}
          valor={sabor}
          aoEscolher={(s) => { setSabor(s); setAviso('') }}
          obrigatorio
        />
      )}

      <label className="campo-obs">
        <span>Alguma observação?</span>
        <textarea rows="2" maxLength={200} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: sem cebola, bem passado" />
      </label>

      <div className="item-folha-acoes">
        {aviso && <p className="erro-campo" role="alert">{aviso}</p>}
        <div>
          <Stepper valor={qtd} aoMudar={setQtd} rotulo={nome} minimo={1} />
          <button ref={botao} type="button" className="botao botao-largo botao-com-valor" onClick={adicionar}>
            <span>Adicionar</span>
            <span>{brl(preco * qtd)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItemFolha({ alvo, aoFechar, aoAdicionar }) {
  const base = alvo?.produto ?? alvo?.promocao
  return (
    <Folha aberta={Boolean(alvo)} aoFechar={aoFechar} titulo={base?.nome ?? base?.titulo ?? ''} comTopo={false} classe="folha-item">
      {alvo && <Conteudo key={base.id} alvo={alvo} aoAdicionar={aoAdicionar} aoFechar={aoFechar} />}
    </Folha>
  )
}
