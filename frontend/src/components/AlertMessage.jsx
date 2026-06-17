export default function AlertMessage({ type = 'info', message }) {
  if (!message) return null;
  return <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">{message}<button type="button" className="btn-close" data-bs-dismiss="alert" /></div>;
}
