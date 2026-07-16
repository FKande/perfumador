const BASE = import.meta.env.VITE_API_URL

export async function getFormulas() {
  const res = await fetch(`${BASE}/formulas`)
  return res.json()
}

export async function getFormula(id) {
  const res = await fetch(`${BASE}/formulas/${id}`)
  return res.json()
}

export async function createFormula(data) {
  const res = await fetch(`${BASE}/formulas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteFormula(id) {
  const res = await fetch(`${BASE}/formulas/${id}`, {
    method: "DELETE"
  })
  return res.ok 
}