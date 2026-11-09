import { linkWhatsApp } from './formato.js'

// Hoje o envio é pelo link wa.me: abre a conversa com o texto pronto e alguém toca em enviar.
// Quando a loja contratar a API oficial da Meta, só o corpo desta função muda.
export function abrirWhatsApp(numero, texto) {
  window.open(linkWhatsApp(numero, texto), '_blank', 'noopener')
}

// Sem número: o WhatsApp pergunta para quem mandar. Serve para o motoboy do dia.
export function compartilharWhatsApp(texto) {
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
}
