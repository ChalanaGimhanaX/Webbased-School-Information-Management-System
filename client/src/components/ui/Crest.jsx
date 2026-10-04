import React, { useId } from 'react';

/**
 * Local SVG crest for Wycherley International School (replaces the hot-linked image in the Stitch mock).
 * Each instance gets its own gradient id: several crests render at once (sidebar, header, login) and a
 * shared id breaks when the first instance is display:none.
 */
const Crest = ({ className = 'h-8 w-8' }) => {
  const gradientId = `crest-g-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg viewBox="0 0 40 44" className={className} role="img" aria-label="Wycherley International School crest">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#3525cd" />
        </linearGradient>
      </defs>
      <path d="M20 1.5 37 7v13.2c0 10.4-7.1 18.6-17 22.3C10.1 38.8 3 30.6 3 20.2V7L20 1.5Z" fill={`url(#${gradientId})`} />
      <path d="M20 4.6 34 9.2v11c0 8.7-5.8 15.6-14 18.9-8.2-3.3-14-10.2-14-18.9v-11l14-4.6Z" fill="none" stroke="#c3c0ff" strokeWidth="1" opacity="0.7" />
      <path d="M10.5 14h3.2l2.6 10.2L19 14h2l2.7 10.2L26.3 14h3.2l-4.4 15h-2.6L20 19.6 17.5 29h-2.6l-4.4-15Z" fill="#fff" />
      <circle cx="20" cy="9.6" r="1.6" fill="#6ffbbe" />
    </svg>
  );
};

export default Crest;

