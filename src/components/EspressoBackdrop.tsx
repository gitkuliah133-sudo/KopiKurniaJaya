import React from 'react';

interface EspressoBackdropProps {
  variant?: 'login' | 'hero';
}

export const EspressoBackdrop: React.FC<EspressoBackdropProps> = ({
  variant = 'hero',
}) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Rich espresso roast base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === 'login'
              ? 'radial-gradient(circle at 74% 48%, #3c3226 0%, #231e18 44%, #151311 85%)'
              : 'radial-gradient(circle at 80% 45%, #46392a 0%, #241f1a 48%, #161512 90%)',
        }}
      />

      {/* Warm atmospheric morning window light */}
      <div
        className="absolute -right-12 -top-20 h-[420px] w-[420px] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,184,136,0.45) 0%, rgba(162,126,76,0.12) 55%, transparent 75%)',
        }}
      />

      {/* Minimalist Espresso Machine & Portafilter Architectural Vector Art */}
      <svg
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`absolute ${
          variant === 'login'
            ? 'right-[-6%] bottom-[-4%] h-[86%] w-auto opacity-30 lg:opacity-45'
            : 'right-[-2%] top-1/2 h-[135%] w-auto -translate-y-1/2 opacity-35'
        }`}
      >
        <defs>
          <linearGradient id="steelBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8E7F68" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#4A4136" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1E1B18" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="cremaGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D6B585" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7A5630" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Machine Upper Chassis */}
        <rect
          x="290"
          y="75"
          width="430"
          height="165"
          rx="18"
          fill="url(#steelBody)"
          stroke="#B5A180"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
        {/* Cup Warmer Rail */}
        <path
          d="M315 75V58C315 52 320 48 326 48H685C691 48 696 52 696 58V75"
          stroke="#C8B490"
          strokeOpacity="0.32"
          strokeWidth="2"
        />
        {/* Group Head */}
        <rect
          x="455"
          y="215"
          width="115"
          height="46"
          rx="8"
          fill="#2E2923"
          stroke="#B5A180"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        {/* Portafilter Handle */}
        <path
          d="M475 261H550L542 286H483L475 261Z"
          fill="#24201C"
          stroke="#C8B490"
          strokeOpacity="0.35"
        />
        <rect
          x="338"
          y="266"
          width="142"
          height="20"
          rx="10"
          transform="rotate(-9 338 266)"
          fill="#1D1A17"
          stroke="#B5A180"
          strokeOpacity="0.4"
        />
        {/* Pressure Gauges */}
        <circle
          cx="370"
          cy="152"
          r="26"
          fill="#1D1A17"
          stroke="#C8B490"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <path d="M370 152L383 139" stroke="#D6B585" strokeOpacity="0.65" strokeWidth="2" />
        <circle
          cx="642"
          cy="152"
          r="26"
          fill="#1D1A17"
          stroke="#C8B490"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <path d="M642 152L656 144" stroke="#D6B585" strokeOpacity="0.65" strokeWidth="2" />
        {/* Steam Wand */}
        <path
          d="M618 220C618 255 604 282 586 318"
          stroke="#C8B490"
          strokeOpacity="0.4"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Espresso Stream */}
        <path
          d="M507 286V334M518 286V334"
          stroke="url(#cremaGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Ceramic Latte Cup */}
        <path
          d="M462 332H564L552 388C549 401 538 410 524 410H502C488 410 477 401 474 388L462 332Z"
          fill="#2A241E"
          stroke="#D6B585"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <path
          d="M562 344H577C586 344 592 351 592 360C592 369 586 376 577 376H556"
          stroke="#D6B585"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        {/* Drip Tray */}
        <rect
          x="295"
          y="412"
          width="420"
          height="24"
          rx="4"
          fill="#26211C"
          stroke="#B5A180"
          strokeOpacity="0.3"
        />
        {/* Roasted Coffee Beans */}
        <g opacity="0.45" fill="#2A221A" stroke="#B5A180" strokeOpacity="0.32">
          <ellipse cx="425" cy="456" rx="14" ry="9" transform="rotate(-22 425 456)" />
          <ellipse cx="458" cy="466" rx="13" ry="8" transform="rotate(14 458 466)" />
          <ellipse cx="492" cy="458" rx="14" ry="9" transform="rotate(-12 492 458)" />
          <ellipse cx="528" cy="468" rx="13" ry="8" transform="rotate(28 528 468)" />
          <ellipse cx="395" cy="468" rx="12" ry="8" transform="rotate(18 395 468)" />
        </g>
      </svg>

      {/* Readability contrast scrim for text on the left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === 'login'
              ? 'linear-gradient(90deg, rgba(20,18,16,0.94) 0%, rgba(20,18,16,0.82) 50%, rgba(20,18,16,0.45) 100%)'
              : 'linear-gradient(90deg, rgba(20,18,16,0.95) 0%, rgba(20,18,16,0.78) 52%, rgba(20,18,16,0.38) 100%)',
        }}
      />
    </div>
  );
};
