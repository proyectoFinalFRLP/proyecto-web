/** Iniciales del courier: "Correo Argentino" → "CA", "Andreani" → "AN". */
export function carrierInitials(carrier: string): string {
  const words = carrier.trim().split(/\s+/)
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase()

  return carrier.slice(0, 2).toUpperCase()
}
