export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="py-4 text-center">
      <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      <p className="mt-2 mb-0 text-muted">{text}</p>
    </div>
  );
}
