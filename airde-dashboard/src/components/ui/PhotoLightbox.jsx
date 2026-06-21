import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function PhotoLightbox({ src, alt, caption, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/85"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-300 hover:text-white bg-[#0d1f3c]/80 hover:bg-[#162040] border border-[#1e2d4f] w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        title="Tutup"
      >
        <X size={18} />
      </button>

      <div
        className="max-w-[92vw] max-h-[88vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-[92vw] max-h-[78vh] object-contain rounded-lg shadow-2xl border border-[#1e2d4f]"
        />
        {caption && (
          <div className="mt-3 text-center text-sm text-slate-300 bg-[#0d1f3c]/90 border border-[#1e2d4f] rounded-md px-4 py-2 max-w-full">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
