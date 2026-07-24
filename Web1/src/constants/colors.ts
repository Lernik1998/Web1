// Color constants for the application
export const COLORS = {
  // FONDO - Background color
  BACKGROUND: '#FCFAF6',
  
  // BASE - Base color
  BASE: '#F7F3EC',
  
  // BORDES-TARJETA - Card border color
  CARD_BORDER: '#E8E0D2',
  
  // BOTON - Button color
  BUTTON: '#BE9292',
  
  // FONDO-SUAVE - Soft background color
  SOFT_BACKGROUND: '#D8BEBE',
  
  // HOVER - Hover state color
  HOVER: '#987575',
  
  // PRIMARIO - Primary color
  PRIMARY: '#3E4C55',
  
  // SECUNDARIO - Secondary color
  SECONDARY: '#8B9399',
  
  // ENCABEZADO - Header/heading color
  HEADING: '#323D44',
} as const

// Export individual constants for convenience
export const {
  BACKGROUND,
  BASE,
  CARD_BORDER,
  BUTTON,
  SOFT_BACKGROUND,
  HOVER,
  PRIMARY,
  SECONDARY,
  HEADING,
} = COLORS

// Type for color keys
export type ColorKey = keyof typeof COLORS
