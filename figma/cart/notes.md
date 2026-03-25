# Cart Drawer — Figma Design Parameters

## Container ("Menu Dropdown")
- Width: 444px, content width: 396px (24px side padding)
- Border-radius: 16px
- Background: white
- Top/right offset: 24px from viewport edge
- Shadow: `0px 12px 16px rgba(10,13,18,0.08), 0px 4px 6px rgba(10,13,18,0.03), 0px 2px 2px rgba(10,13,18,0.04)`
- Overflow: hidden

## Header / Action Bar
- Title: "Your Cart" — BDO Grotesk Regular, 28px, lh 1.15, ls -0.84px, color #28292b
- Close icon: 24x24 (menu-close SVG)
- Padding-bottom: 16px
- Layout: space-between

## Free Shipping Progress
- Text: 12px Regular, color #707c86; amount bold in black
- Examples: "You are **$19.01** away from free shipping" / "Congrats, you have unlocked free shipping"
- Bar height: 8px
- Bar bg: #e6eaed (mist-50)
- Bar fill: #1d4ed8 (neon-tide)
- Bar radius: full (9999px)
- Padding-bottom: 16px

## Product Card
- **Image**: 93x93, radius 8px
- **Gap**: 16px (image to info)
- **Name**: NHGT Medium, 16px, lh 1.4, color #232527
- **Prices**: 14px Medium
  - Original: line-through, color #707c86
  - Sale: color #232527
  - Gap: 4px
- **Description**: 12px Regular, lh 1.4, color #707c86
- **Inputs** (padding-top 8px, gap 12px):
  - **Variant dropdown**: h 40px, border 1px #e5e5e5, radius 8px, shadow-xs
    - Text: 12px Medium, color #28292b, pl 16.5px
    - Chevron: 16px
  - **Quantity**: border 1px #e5e5e5, radius 8px, p 12px, gap 24px, shadow-xs
    - Icons: 16px
    - Number: 12px Medium, black, center
  - **Trash**: 16px icon, p 12px, radius 32px
  - Layout: quantity left, trash right (space-between)
- **Border-bottom**: 1px #e6eaed between items

## Subscribe & Save (collapsible)
- **Collapsed**: button full-width, bg #1d4ed8, radius 8px
  - Text: "Subscribe & Save Up To 20%" white + "+" icon right
- **Expanded**: bg #1d4ed8, radius 8px, padding 16px
  - Bullets: checkmark icon + "Save 20% On Every Order" / "Pause & Cancel Anytime" — 12px Regular white
  - Variant dropdown: h 40px, border white/20%, radius 8px, text white
  - Button: "Subscribe & Save →" white bg, radius 8px, h 40px, text #1d4ed8

## Upsell ("You might also like")
- Separator: 1px line top
- Title: "You might also like" — 16px Medium, color #232527
- Dots: 8px, active #1d4ed8, inactive #e6eaed, gap 12px
- Product:
  - Image: 64px, radius 5.5px
  - Name: 12px Medium, lh 1.3, color #232527
  - Prices: 12px (original strikethrough #707c86, sale #232527)
  - Description: 12px Regular, lh 1.4, color #707c86
- Add button: h 48px, radius 8px, blue, "Add" 16px Medium white

## Checkout Button
- Radius: 8px
- Padding: 16px 24px
- Bg: #1d4ed8
- Shadow: shadow-xs + skeuomorphic
- Layout: space-between
  - Left price: 20px Medium, color #93affd (neon-tide-300)
  - Right: "Checkout" 20px Medium white + arrow 22px

## Trust Badges
- 3 badges row
- Icon bg: 32x32, radius 4.83px, bg #e6eaed
- Text: 12px Regular, color #707c86
- Content: "Australian Made & Owned" / "Clinically Proven Ingredients" / "Third Party Tested"

## Bottom Text
- "Prices in AUD. Tax included. Shipping calculated at checkout." — 12px Regular, #707c86, center

## Empty Cart
- Close button: top-right, same style
- Product showcase image: 3 products on podium (bg image)
- Heading: "Your cart is empty" — centered
- Subtext: "Start building your longevity routine today." — centered, #707c86
- Button: "Shop All →" — blue, radius 8px

## Backdrop/Mask
- background: rgba(112, 124, 134, 0.25)
- backdrop-filter: blur(5px)

---

## Design States (PC)
1. Empty cart — showcase image + CTA
2. 1 item — progress bar + product + upsell + checkout
3. 1 item + dropdown open — variant list overlay
4. 2 items — first has variant, second has Subscribe & Save collapsed
5. 2 items + Subscribe expanded — blue panel with options
6. 2 items — both normal (no subscribe)
7. 2 items + upsell visible — scrolled to show 3rd product peek

## Design States (Mobile)
Same 7 states, full-screen layout (no rounded corners, no offset)
