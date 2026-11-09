// Ícones de traço, desenhados no mesmo grid de 24px. Decorativos: o texto ao lado dá o sentido.
const TRACOS = {
  busca: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  mais: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  sacola: <><path d="M5.5 8h13l-1.1 12H6.6L5.5 8z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /></>,
  relogio: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  local: <><path d="M12 21s6.5-5.8 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.3" /></>,
  fechar: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  voltar: <path d="M14.5 6l-6 6 6 6" />,
  seta: <path d="M9.5 6l6 6-6 6" />,
  moto: <><circle cx="5.5" cy="16.5" r="3" /><circle cx="18.5" cy="16.5" r="3" /><path d="M5.5 16.5h6.5l3.5-6.5H12M15.5 10l3 6.5M13.5 6.5h2.5l1 3.5M7 11.5h4.5" /></>,
  loja: <><path d="M4.5 11v8.5h15V11" /><path d="M3 7.5L5 4h14l2 3.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" /><path d="M10 19.5V15h4v4.5" /></>,
  mesa: <><path d="M3 8.5h18M6 8.5V19M18 8.5V19" /><path d="M9.5 8.5V5h5v3.5" /></>,
  festa: <><path d="M4 20l5.5-14L18 14.5 4 20z" /><path d="M14 4.5l.5-1.5M19.5 10l1.5-.5M17 6.5l2-2" /></>
}

export default function Icone({ nome, tamanho = 20 }) {
  return (
    <svg className="icone" width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {TRACOS[nome]}
    </svg>
  )
}
