import React from 'react'
import { useState, useEffect } from "react";
import { getDilutions, createDilution, getAromachemicals } from '../api/api';

const Dilutions = () => {
  const [dilutions, setDilutons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createDilutonModal, setCreateDilutionModal] = useState(false)



  // these states are for the dropdown 
  const [aromachemicals, setAromachemicals] = useState([])
  const [loadingAromachemicals, setLoadingAromachemicals] = useState(true)
  const [errorAromachemicals, setErrorAromachemicals] = useState(null)

  const loadInAromachemicals = async () => {
    try {
      const data = await getAromachemicals()
      setAromachemicals(data)
    } catch (err) {
      setErrorAromachemicals(true)
    } finally {
      setLoadingAromachemicals(false)
    }
  }

  const loadInDilutions = async () => {
    try {
      const data = await getDilutions()
      setDilutons(data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInDilutions();
    loadInAromachemicals()
  }, [])

  const handleCreateDilution = () => {
    setCreateDilutionModal(true)
  }

  const closeModal = () => {
    setCreateDilutionModal(false)
  }

  const actuallyCreateDilution = async (aromachemical_id, dilution_percent, initial_grams) => {
    await createDilution({ aromachemical_id, dilution_percent, initial_grams})
    const data = await getDilutions()
    setDilutons(data)
    setCreateDilutionModal(false)
  }


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;
  // if (dilutions.length === 0) return <p>No dilutons yet.</p>

  return (
    <section className="basic-vertical-section">
      <div className="vertical-column-16">
        <button onClick={handleCreateDilution}>
          + Add new diluton
        </button>
        <span>Dilutions list</span>
        {dilutions.length === 0 ? (
          <p>No dilutons yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="basic-table-header">Bottle ID</th>
                <th className="basic-table-header">Diluton Percent</th>
                <th className="basic-table-header">Scientific Name</th>
                <th className="basic-table-header">Common Name</th>
                <th className="basic-table-header">Note</th>
                <th className="basic-table-header">IFRA Limit</th>
                <th className="basic-table-header">Total Used</th>
                <th className="basic-table-header">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {dilutions.map(({id, dilution_percent, scientific_name, common_name, note, ifra_limit, total_used, remaining}) => (
                <tr key={id}>
                  <td className="basic-table-cell">{id}</td>
                  <td className="basic-table-cell">{dilution_percent}</td>
                  <td className="basic-table-cell">{scientific_name}</td>
                  <td className="basic-table-cell">{common_name}</td>
                  <td className="basic-table-cell">{note}</td>
                  <td className="basic-table-cell">{ifra_limit}</td>
                  <td className="basic-table-cell">{total_used}</td>
                  <td className="basic-table-cell">{remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )} 
      </div>
      {createDilutonModal &&
        <CreateDilutionModal
          closeModal={closeModal}
          actuallyCreateDilution={actuallyCreateDilution}
          aromachemicals={aromachemicals}
        />
      }
    </section>
  )
}

const CreateDilutionModal = ({ closeModal, actuallyCreateDilution, aromachemicals }) => {
  // your state here
  const [aromachemicalId, setAromachemicalId] = useState("")
  const [dilutionPercent, setDilutionPercent] = useState("")
  const [initialGrams, setInitialGrams] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault();
    // your call here
    actuallyCreateDilution(aromachemicalId, dilutionPercent, initialGrams)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-body">
        <form className="vertical-column-12" onSubmit={handleSubmit}>
          <span>Create a dilution</span>
          <div className="vertical-column-8">
            <div className="vertical-column-4">
              <label>Aromachemical (required)</label>
              <select required value={aromachemicalId} onChange={(e) => setAromachemicalId(e.target.value)}>
                <option value="">Select an aromachemical</option>
                {/* map aromachemicalsList to options here */}
                {aromachemicals.map((aromachemical) => (
                  <option key={aromachemical.id} value={aromachemical.id}>
                    {aromachemical.scientific_name} 
                    {aromachemical.common_name && 
                      `(${aromachemical.common_name})`
                    }
                  </option>
                ))}
              </select>
            </div>
            <div className="vertical-column-4">
              <label>Dilution percent (required)</label>
              <input 
                required 
                type="number" 
                value={dilutionPercent}
                onChange={(e) => setDilutionPercent(e.target.value)}
              />
            </div>
            <div className="vertical-column-4">
              <label>Initial grams (required)</label>
              <input 
                required 
                type="number" 
                value={initialGrams}
                onChange={(e) => setInitialGrams(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-button-row">
            <button type="button" onClick={closeModal}>
              Close
            </button>
            <button type="submit">Add dilution</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Dilutions