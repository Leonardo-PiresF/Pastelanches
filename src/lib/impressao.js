// Imprime o cupom num iframe escondido: não abre janela nova e não esbarra no
// bloqueador de pop-up, então também funciona na impressão automática.
// Com o Chrome do caixa aberto em --kiosk-printing, sai direto na térmica.
export function imprimirPedido(codigo) {
  const quadro = document.createElement('iframe')
  quadro.title = `Cupom ${codigo}`
  quadro.className = 'quadro-impressao'
  quadro.src = `${window.location.pathname}#/imprimir/${codigo}`
  document.body.appendChild(quadro)
  setTimeout(() => quadro.remove(), 60000)
}
