// Typography constants for the application

// Font families
export const FONT_FAMILIES = {
  FRAUNCES: 'Fraunces, serif',
  INTER: 'Inter, sans-serif',
} as const

// Font weights
export const FONT_WEIGHTS = {
  REGULAR: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
} as const

// Font sizes (in pixels)
export const FONT_SIZES = {
  // H1 - Main heading
  H1_DESKTOP: '40px',
  H1_MOBILE: '28px',
  
  // H2 - Section subtitles
  H2_DESKTOP: '28px',
  H2_MOBILE: '24px',
  
  // H3 - Card titles, small blocks
  H3: '20px',
  
  // Body text
  BODY: '16px',
  
  // Secondary text (dates, labels, support text)
  SECONDARY: '14px',
  SECONDARY_SMALL: '13px',
  
  // Buttons / CTA
  BUTTON: '15px',
  
  // Navigation menu
  NAV: '15px',
  
  // Testimonials / quotes
  QUOTE: '20px',
  
  // Footer
  FOOTER: '13px',
  FOOTER_SMALL: '12px',
} as const

// Line heights
export const LINE_HEIGHTS = {
  TIGHT: 1.3,
  NORMAL: 1.5,
  RELAXED: 1.6,
  GENEROUS: 1.7,
} as const

// Typography system for different elements
export const TYPOGRAPHY = {
  H1: {
    fontFamily: FONT_FAMILIES.FRAUNCES,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    fontSize: FONT_SIZES.H1_DESKTOP,
    lineHeight: LINE_HEIGHTS.TIGHT,
  },
  H2: {
    fontFamily: FONT_FAMILIES.FRAUNCES,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    fontSize: FONT_SIZES.H2_DESKTOP,
    lineHeight: LINE_HEIGHTS.TIGHT,
  },
  H3: {
    fontFamily: FONT_FAMILIES.FRAUNCES,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontSize: FONT_SIZES.H3,
    lineHeight: LINE_HEIGHTS.NORMAL,
  },
  BODY: {
    fontFamily: FONT_FAMILIES.INTER,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontSize: FONT_SIZES.BODY,
    lineHeight: LINE_HEIGHTS.GENEROUS,
  },
  SECONDARY: {
    fontFamily: FONT_FAMILIES.INTER,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontSize: FONT_SIZES.SECONDARY,
    lineHeight: LINE_HEIGHTS.NORMAL,
  },
  BUTTON: {
    fontFamily: FONT_FAMILIES.INTER,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    fontSize: FONT_SIZES.BUTTON,
    lineHeight: LINE_HEIGHTS.NORMAL,
  },
  NAV: {
    fontFamily: FONT_FAMILIES.INTER,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    fontSize: FONT_SIZES.NAV,
    lineHeight: LINE_HEIGHTS.NORMAL,
  },
  QUOTE: {
    fontFamily: FONT_FAMILIES.FRAUNCES,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontSize: FONT_SIZES.QUOTE,
    lineHeight: LINE_HEIGHTS.RELAXED,
    fontStyle: 'italic',
  },
  FOOTER: {
    fontFamily: FONT_FAMILIES.INTER,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontSize: FONT_SIZES.FOOTER,
    lineHeight: LINE_HEIGHTS.NORMAL,
  },
} as const

// Responsive typography
export const RESPONSIVE_TYPOGRAPHY = {
  H1: {
    desktop: TYPOGRAPHY.H1,
    mobile: {
      ...TYPOGRAPHY.H1,
      fontSize: FONT_SIZES.H1_MOBILE,
    },
  },
  H2: {
    desktop: TYPOGRAPHY.H2,
    mobile: {
      ...TYPOGRAPHY.H2,
      fontSize: FONT_SIZES.H2_MOBILE,
    },
  },
} as const
