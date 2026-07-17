import React from 'react'
import "./ConfirmModal.css"


const ConfirmModal = ({message, onConfirm, onCancel}) => {
  return (
    <section className="confirm-modal-overlay">
        <div className="confirm-modal-body">
            <div className="vertical-column-4">
              <span>{message}</span>
              <span>This action cannot be reversed.</span>
            </div>
            <div className="confirm-modal-button-row">
              <button onClick={onCancel}>Cancel</button>
              <button onClick={onConfirm}>Confirm</button>
            </div>
        </div>
    </section>
  )
}

export default ConfirmModal