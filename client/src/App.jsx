import { useState } from 'react'
import { Routes, Route } from "react-router-dom"
import { Link } from "react-router-dom"
import FormulaList from "./pages/FormulaList"
import FormulaEditor from "./pages/FormulaEditor"
import Catalog from "./pages/Catalog"
import Dilutions from "./pages/Dilutions"


function App() {

  return (
    <>
      <nav>
        <Link to="/formulas">Formulas</Link>
        <Link to="/catalog">Catalog</Link>
        <Link to="/dilutions">Dilutions</Link>
      </nav>

      <Routes>
        <Route path="/" element={<FormulaList />} />
        <Route path="/formulas" element={<FormulaList />} />
        <Route path="/formulas/:id" element={<FormulaEditor />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/dilutions" element={<Dilutions />} />
        <Route path="*" element={<h1>Not found</h1>} />
      </Routes>
    </>
  )
}

export default App
