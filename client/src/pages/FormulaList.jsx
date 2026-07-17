import React from "react";
import { useState, useEffect } from "react";
import { getFormulas, createFormula, deleteFormula } from "../api/api";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

const FormulaList = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createFormulaModal, setCreateFormulaModal] = useState(false);

  const [formulaPendingDelete, setFormulaPendingDelete] = useState(null);

  // fetch on mount, call API
  // if loading → show a loading indicator; if error → show an error message; if the list is empty → show an empty state; otherwise → the list
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFormulas();
        setFormulas(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleIntendCreateFormula = () => {
    setCreateFormulaModal(true);
  };

  const closeModal = () => {
    setCreateFormulaModal(false);
  };

  const handleCreateFormula = async (name, description) => {
    await createFormula({ name, description }); // now name & description exist
    const formulas = await getFormulas(); // rename to avoid collision
    setFormulas(formulas);
    setCreateFormulaModal(false);
  };

  const handleDeleteFormula = async (id) => {
    await deleteFormula(id);
    const formulas = await getFormulas();
    setFormulas(formulas);
    setFormulaPendingDelete(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;
  if (formulas.length === 0) return <p>No formulas yet.</p>;

  // if we reach here we have the formualas so we will render the list
  return (
    <section className="basic-vertical-section">
      <div className="vertical-column-16">
        <span>Formula list</span>
        <div className="vertical-column-12">
          {formulas.map(({ id, name, description }) => (
            <div className="horizontal-row-centered-16 formula-item" key={id}>
              <Link to={`/formulas/${id}`}>
                <div className="vertical-column-8">
                  Name: {name} <br />
                  Description: {description}
                </div>
              </Link>
              <button onClick={() => setFormulaPendingDelete(id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleIntendCreateFormula}>Create a formula</button>
        {createFormulaModal && (
          <CreateFormulaModal
            closeModal={closeModal}
            handleCreateFormula={handleCreateFormula}
          />
        )}
        {formulaPendingDelete && (
          <ConfirmModal
            message={`Are you sure you would like to delete the formula`}
            onConfirm={() =>
              handleDeleteFormula(formulaPendingDelete)
            }
            onCancel={() => setFormulaPendingDelete(false)}
          />
        )}
      </div>
    </section>
  );
};

const CreateFormulaModal = ({ closeModal, handleCreateFormula }) => {
  const [formulaName, setFormulaName] = useState("");
  const [formulaDescription, setFormulaDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateFormula(formulaName, formulaDescription);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-body">
        <form className="vertical-column-12" onSubmit={handleSubmit}>
          <span>Create a formula</span>
          <div className="vertical-column-8">
            <div className="vertical-column-4">
              <label>Name (required)</label>
              <input
                placeholder="Enter a name for the formula..."
                required
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
              />
            </div>
            <div className="vertical-column-4">
              <label>Description (optional)</label>
              <input
                placeholder="Enter a description..."
                value={formulaDescription}
                onChange={(e) => setFormulaDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-button-row">
            <button type="button" onClick={closeModal}>
              Close
            </button>
            <button type="submit">Create formula</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormulaList;
