// Feriados nacionais do ano, da BrasilAPI (gratuita, sem chave).
// Cache de 30 dias na borda da Vercel: a lista de um ano não muda.
export default async function handler(req, res) {
  const ano = Number(req.query.ano)
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
    return res.status(400).json({ erro: 'ano inválido' })
  }
  try {
    const resp = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`, { signal: AbortSignal.timeout(5000) })
    if (!resp.ok) throw new Error(`BrasilAPI ${resp.status}`)
    const lista = await resp.json()
    res.setHeader('Cache-Control', 'public, s-maxage=2592000, stale-while-revalidate=86400')
    return res.status(200).json(lista.map(({ date, name }) => ({ date, name })))
  } catch {
    res.setHeader('Cache-Control', 'public, s-maxage=600')
    return res.status(502).json([])
  }
}
