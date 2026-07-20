const BASE = import.meta.env.VITE_API_URL

export async function getFormulas() {
  const res = await fetch(`${BASE}/formulas`)
  return res.json()
}

export async function getDilutions() {
  const res = await fetch(`${BASE}/dilutions`)
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

// POST /formulas/:id/lines
export async function addLine(id, data) {
  const res = await fetch(`${BASE}/formulas/${id}/lines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

// DELETE /formulas/:id/lines/:lineId
export async function deleteLine(formulaId, lineId) {
  const res = await fetch(`${BASE}/formulas/${formulaId}/lines/${lineId}`, {
    method: "DELETE"
  })
  return res.ok
}

// PATCH /formulas/:id
export async function updateFormula(id, data) {
  const res = await fetch(`${BASE}/formulas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}