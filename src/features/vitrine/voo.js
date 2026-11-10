// Efeito de assinatura: a miniatura do item voa até o contador do carrinho (FLIP).
import { arquivo, recorteDe } from '../../lib/config.js'

const semMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function pulsar(el) {
  el?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease-out' })
}

export function voar(origem, foto) {
  requestAnimationFrame(() => {
    const destino = [...document.querySelectorAll('[data-destino-voo]')].find((el) => el.offsetParent)
    if (!destino || !origem || semMovimento()) return pulsar(destino)

    const fim = destino.getBoundingClientRect()
    const tamanho = 56
    const x0 = origem.left + origem.width / 2 - tamanho / 2
    const y0 = origem.top + origem.height / 2 - tamanho / 2
    const x1 = fim.left + fim.width / 2 - tamanho / 2
    const y1 = fim.top + fim.height / 2 - tamanho / 2

    const voador = document.createElement(foto ? 'img' : 'span')
    if (foto) voador.src = arquivo(recorteDe(foto))
    voador.className = 'voador'
    voador.setAttribute('aria-hidden', 'true')
    document.body.appendChild(voador)

    voador.animate(
      [
        { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
        { transform: `translate(${x1}px, ${y1}px) scale(.35)`, opacity: 0.7 }
      ],
      { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }
    ).onfinish = () => {
      voador.remove()
      pulsar(destino)
    }
  })
}
