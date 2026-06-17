export default function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' });
}
