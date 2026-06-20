import { Link } from 'react-router-dom';

export default function AssetLink({ id, className = '' }) {
  if (!id) return <span className="text-slate-500">-</span>;
  return (
    <Link
      to={`/asset/${id}`}
      className={`font-medium text-orange-400 hover:text-orange-300 hover:underline ${className}`}
    >
      {id}
    </Link>
  );
}
