import React from 'react'
import { useState, useEffect } from "react";
import { getAromachemicals, createAromachemical } from '../api/api';

const Catalog = () => {
  const [aromachemicals, setAromachemicals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createAromachemicalModal, setCreateAromachemicalModal] = useState(false)

  const loadInAromachemicals = async () => {
    try {
      const data = await getAromachemicals()
      setAromachemicals(data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInAromachemicals()
  }, [])

  const handleCreateAromachemical = () => {
    setCreateAromachemicalModal(true)
  }

  const closeModal = () => {
    setCreateAromachemicalModal(false)
  }

  const actuallyCreateAromachemical = async (scientific_name, common_name, cas_number, note, ifra_limit) => {
    await createAromachemical({ scientific_name, common_name, cas_number, note, ifra_limit })
    const newList = await getAromachemicals()
    setAromachemicals(newList)
    setCreateAromachemicalModal(false)
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <section className="basic-vertical-section">
      <div className="vertical-column-16">
        <span>Aromachemical list</span>
        <small>
          Note: this can include raw materials that have no CAS number (eg. Rose Givco 216)
        </small>
        <button onClick={handleCreateAromachemical}>
          + Add a new aromachemical to the database
        </button>
        {aromachemicals.length === 0 ? (
          <p>No aromachemicals yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="basic-table-header">Scientific name</th>
                <th className="basic-table-header">Common name</th>
                <th className="basic-table-header">CAS number</th>
                <th className="basic-table-header">Note</th>
                <th className="basic-table-header">IFRA limit</th>
              </tr>
            </thead>
            <tbody>
              {aromachemicals.map(({ id, scientific_name, common_name, cas_number, note, ifra_limit }) => (
                <tr key={id}>
                  <td className="basic-table-cell">{scientific_name}</td>
                  <td className="basic-table-cell">{common_name}</td>
                  <td className="basic-table-cell">{cas_number}</td>
                  <td className="basic-table-cell">{note}</td>
                  <td className="basic-table-cell">{ifra_limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {createAromachemicalModal &&
        <CreateAromachemicalModal
          closeModal={closeModal}
          actuallyCreateAromachemical={actuallyCreateAromachemical}
        />
      }
    </section>
  )
}

const CreateAromachemicalModal = ({ closeModal, actuallyCreateAromachemical }) => {
  const [scientificName, setScientificName] = useState("")
  const [commonName, setCommonName] = useState("")
  const [casNumber, setCasNumber] = useState("")
  const [note, setNote] = useState("")
  const [ifraLimit, setIfraLimit] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalCommonName = commonName === "" ? null : commonName
    const finalCasNumber = casNumber === "" ? null : casNumber
    const finalIfraLimit = ifraLimit === "" ? null : ifraLimit

    actuallyCreateAromachemical(
      scientificName,
      finalCommonName,
      finalCasNumber,
      note,
      finalIfraLimit
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-body">
        <form className="vertical-column-12" onSubmit={handleSubmit}>
          <span>Create an aromachemical</span>
          <div className="vertical-column-8">
            <div className="vertical-column-4">
              <label>Scientific name (required)</label>
              <input
                required
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
              />
            </div>
            <div className="vertical-column-4">
              <label>Common name (optional)</label>
              <input
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
              />
            </div>
            <div className="vertical-column-4">
              <label>CAS number (optional)</label>
              <input
                value={casNumber}
                onChange={(e) => setCasNumber(e.target.value)}
              />
            </div>
            <div className="vertical-column-4">
              <label>Note (required)</label>
              <select
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
              >
                <option value="">Select an option</option>
                <option value="top">Top</option>
                <option value="mid">Mid</option>
                <option value="base">Base</option>
              </select>
            </div>
            <div className="vertical-column-4">
              <label>IFRA limit (optional)</label>
              <input
                value={ifraLimit}
                type="number"
                onChange={(e) => setIfraLimit(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-button-row">
            <button type="button" onClick={closeModal}>
              Close
            </button>
            <button type="submit">Add aromachemical</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Catalog