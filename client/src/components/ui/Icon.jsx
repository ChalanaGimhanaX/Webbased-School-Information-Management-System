import React from 'react';

/** Material Symbols icon (font loaded in index.html). Decorative by default. */
const Icon = ({ name, size = 20, filled = false, className = '', ...rest }) => (
  <span
    aria-hidden="true"
    className={`material-symbols-outlined ${filled ? 'icon-filled' : ''} ${className}`}
    style={{ fontSize: size }}
    {...rest}
  >
    {name}
  </span>
);

export default Icon;

