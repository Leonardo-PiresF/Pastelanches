// Feriados nacionais pela função /api/feriados (BrasilAPI com cache).
// Se falhar, a agenda segue só com as datas especiais da dona.
const cache = new Map()

async function doAno(ano) {
  if (!cache.has(ano)) {
    cache.set(ano, fetch(`/api/feriados?ano=${ano}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((lista) => (Array.isArray(lista) ? lista : []))
      .catch(() => []))
  }
  return cache.get(ano)
}

export async function buscarFeriados(anos) {
  const listas = await Promise.all([...new Set(anos)].map(doAno))
  return Object.fromEntries(listas.flat().map((f) => [f.date, f.name]))
}
