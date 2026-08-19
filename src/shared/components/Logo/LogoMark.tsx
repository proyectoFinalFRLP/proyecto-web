/**
 * Isotipo de la marca. Va inline y no como archivo: así hereda el color del
 * contenedor vía `currentColor` en vez de traer el `#8ED5FF` quemado del export
 * de Figma, y no suma un request.
 *
 * El path viene tal cual del diseño (viewBox 22×36).
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={(size * 22) / 36}
      height={size}
      viewBox="0 0 22 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      style={{ display: 'block' }}
    >
      <path
        d="M0.5 36L0 31.6L5.7 15.9C6.2 16.3667 6.74167 16.7583 7.325 17.075C7.90833 17.3917 8.53333 17.6333 9.2 17.8L3.7 32.9L0.5 36V36M21.5 36L18.3 32.9L12.8 17.8C13.4667 17.6333 14.0917 17.3917 14.675 17.075C15.2583 16.7583 15.8 16.3667 16.3 15.9L22 31.6L21.5 36V36M11 16C9.33333 16 7.91667 15.4167 6.75 14.25C5.58333 13.0833 5 11.6667 5 10C5 8.7 5.375 7.54167 6.125 6.525C6.875 5.50833 7.83333 4.8 9 4.4V0H13V4.4C14.1667 4.8 15.125 5.50833 15.875 6.525C16.625 7.54167 17 8.7 17 10C17 11.6667 16.4167 13.0833 15.25 14.25C14.0833 15.4167 12.6667 16 11 16V16M11 12C11.5667 12 12.0417 11.8083 12.425 11.425C12.8083 11.0417 13 10.5667 13 10C13 9.43333 12.8083 8.95833 12.425 8.575C12.0417 8.19167 11.5667 8 11 8C10.4333 8 9.95833 8.19167 9.575 8.575C9.19167 8.95833 9 9.43333 9 10C9 10.5667 9.19167 11.0417 9.575 11.425C9.95833 11.8083 10.4333 12 11 12V12"
        fill="currentColor"
      />
    </svg>
  )
}
