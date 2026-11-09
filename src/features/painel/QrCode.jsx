import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QrCode({ texto, rotulo, tamanho = 220 }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let vivo = true
    QRCode.toDataURL(texto, { width: tamanho * 2, margin: 1, color: { dark: '#1D1D21', light: '#FFFFFF' } })
      .then((url) => vivo && setSrc(url))
    return () => { vivo = false }
  }, [texto, tamanho])
  return src ? <img src={src} alt={rotulo} width={tamanho} height={tamanho} /> : <span className="qr-espaco" style={{ width: tamanho, height: tamanho }} />
}
