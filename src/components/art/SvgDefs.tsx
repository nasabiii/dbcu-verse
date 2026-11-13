/**
 * Shared SVG filters/gradients. Rendered once at the app root and referenced
 * by url(#id) from any inline SVG on the page.
 */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {/* slightly trembling ink line */}
        <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="ink-strong" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* watercolor pigment: mottled fill with soft darker edges */}
        <filter id="watercolor" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" result="disp" />
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="5" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 0.62" result="grainA" />
          <feComposite in="disp" in2="grainA" operator="arithmetic" k1="0" k2="1" k3="-0.18" k4="0" result="mottled" />
          <feComposite in="mottled" in2="SourceGraphic" operator="in" />
        </filter>
        {/* granulated texture overlay for painted planets */}
        <filter id="granulate" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.14  0 0 0 0 0.25  0 0 0 0.55 -0.12" result="ga" />
          <feComposite in="ga" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="soft-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="gold-foil" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fbe9b4" />
          <stop offset="0.45" stopColor="#e9c56f" />
          <stop offset="1" stopColor="#b98d3a" />
        </radialGradient>
        <radialGradient id="silver-foil" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#d6dde8" />
          <stop offset="1" stopColor="#8e9bb0" />
        </radialGradient>
        <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="0.35" stopColor="#ffe28a" />
          <stop offset="0.75" stopColor="#f3a64a" />
          <stop offset="1" stopColor="#e9733b" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="flame-core" cx="50%" cy="70%" r="50%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#fff2c4" />
          <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
