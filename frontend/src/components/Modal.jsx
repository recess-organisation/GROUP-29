export default function Modal({ title, message, children, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, inputLabel, inputValue, inputType = 'text', onInputChange }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)'
    }} onClick={onCancel}>
      <div className="content-panel" style={{ maxWidth: 420, width: '90%' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="h5 mb-2">{title}</h3>
        {message && <p className="text-muted mb-3">{message}</p>}
        {inputLabel && (
          <div className="mb-3">
            <label className="form-label">{inputLabel}</label>
            <input className="form-control" type={inputType} value={inputValue} onChange={(e) => onInputChange(e.target.value)} autoFocus />
          </div>
        )}
        {children || (
          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-light" onClick={onCancel}>{cancelText}</button>
            <button className={`btn ${danger ? 'btn-outline-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
          </div>
        )}
      </div>
    </div>
  );
}
