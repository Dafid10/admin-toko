---
name: PasarDigital
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444653'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4c2e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b4200'
  on-tertiary-container: '#ffa929'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for a high-trust, high-conversion e-commerce environment. The brand personality is professional and efficient, positioning itself as a reliable bridge between merchants and consumers. 

The aesthetic follows a **Corporate / Modern** style with a focus on clarity and utility. It utilizes generous white space, a structured grid, and high-quality typography to ensure that product discovery is frictionless. Subtle depth and soft edges are used to humanize the professional tone, creating an inviting digital marketplace that feels both established and contemporary.

## Colors
The color strategy prioritizes legibility and clear status communication:
- **Primary (Deep Blue):** Used for primary actions, navigation headers, and brand moments. It evokes stability and institutional trust.
- **Success (Emerald Green):** Reserved exclusively for 'Lunas' (Paid) statuses and positive checkout confirmations.
- **Warning (Amber):** Used for 'Menunggu Pembayaran' (Pending Payment) and time-sensitive alerts to drive urgency without causing panic.
- **Neutral (Slate):** The background (#F8FAFC) provides a cool, clean canvas that allows product imagery to stand out. Border and muted text colors are pulled from the Slate scale to maintain a cohesive, professional temperature.

## Typography
This design system utilizes **Inter** for all roles to achieve a systematic, utilitarian look that excels in data-heavy retail environments. 

- **Headlines:** Use tighter letter spacing and semi-bold/bold weights to create a strong visual hierarchy.
- **Body:** Standardized at 16px for optimal readability. 14px is used for secondary metadata or descriptions.
- **Labels:** Uppercase or increased weight is used for UI controls and price tags to ensure they are immediately scannable.
- **Scaling:** On mobile, large display titles should scale down to prevent excessive line-wrapping, while body sizes remain constant to preserve legibility.

## Layout & Spacing
The layout uses a **fluid 12-column grid** for desktop and a **4-column grid** for mobile devices. 

- **Grid Logic:** Use a 24px gutter to provide significant breathing room between product cards.
- **Margins:** Desktop views utilize 40px outer margins to center content, while mobile scales down to 16px to maximize screen real estate for product images.
- **Vertical Rhythm:** A base-8 spacing scale is applied for vertical stacking. Use 16px (stack-md) for most component spacing and 32px (stack-lg) for section separation.

## Elevation & Depth
Depth is conveyed through **ambient shadows** and **tonal layering**. The goal is to make interactive elements feel tactile without looking dated.

- **Base Layer:** The slate background (#F8FAFC).
- **Surface Layer:** White (#FFFFFF) cards and containers.
- **Shadows:** Use extra-diffused, low-opacity shadows (e.g., `0 4px 20px rgba(15, 23, 42, 0.05)`). Higher elevation shadows are reserved for floating headers and active modals.
- **Interactions:** On hover, product cards should slightly increase their shadow spread to indicate interactivity.

## Shapes
The design system adopts a highly approachable shape language with **large corner radii**.

- **Standard Components:** Buttons and inputs use a 0.5rem (8px) radius.
- **Cards & Containers:** Product cards and featured banners use `rounded-2xl` (1rem / 16px) to create a soft, modern container.
- **Buttons:** Primary action buttons can optionally use pill-shaping (rounded-full) if used in isolation, but generally adhere to the 16px corner radius for consistency with the card language.

## Components
- **Buttons:** Primary buttons use the Deep Blue background with white text. They feature a subtle inner glow for depth. Secondary buttons use a Slate-200 border with a Slate-50 hover state.
- **Product Cards:** Featuring `rounded-2xl` corners, a 1px border (#E2E8F0), and a soft ambient shadow. The image should occupy the top half, with text and price clearly separated below.
- **Status Chips:** Small, high-contrast badges. 'Lunas' uses an Emerald Green background with dark green text; 'Menunggu Pembayaran' uses an Amber background with dark amber text.
- **Input Fields:** Minimalist style with a Slate-200 border. On focus, the border transitions to Deep Blue with a 3px soft focus ring.
- **Lists:** Clean separation using 1px horizontal dividers. Use 16px padding for list items to maintain a touch-friendly target size.
- **Search Bar:** A prominent, wide component in the header with a soft shadow to distinguish it as the primary navigation tool.