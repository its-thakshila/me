# Thakshila Bandara - Interactive Portfolio

An immersive, hardware-accelerated 3D canvas portfolio built with React and TypeScript, featuring a seamless swipe-to-scroll camera engine, dynamic depth-of-field overlays, and native-feeling gesture interactions.

[**View Live Site (thakshila.me)**](https://its-thakshila.github.io/me)

## 🚀 Technical Highlights

- **3D Hardware Acceleration:** The entire canvas is built using `transform-style: preserve-3d`. Cards exist in true Z-space (`translateZ`), completely bypassing legacy browser rendering bugs and ensuring flawlessly fluid 60fps animations on both desktop and mobile.
- **Custom Gesture Engine:** Bypasses native DOM scrolling in favor of a robust, custom-built coordinate-mapping system. Swiping on mobile smoothly pans and scales the camera to perfectly frame the active content.
- **Adaptive Depth of Field:** On desktop, hovering over items intelligently dims and blurs surrounding context (via dynamic `backdrop-filter` composites).
- **Parallax Background:** The structural canvas grid is decoupled from the main content layer, applying synchronized mathematical scaling and panning to create a convincing, deeply immersive parallax effect with static vignette masking.
- **Responsive Navigation:** 
  - **Desktop:** Edge-detection mouse movement drives an intuitive camera panning system.
  - **Mobile:** Circularly-linked gesture nodes allow users to infinitely swipe through the curated path of content without ever hitting a dead end.

## 🛠️ Stack

- **React 18** (Vite)
- **TypeScript**
- **Vanilla CSS** (Zero-dependency custom design system)
- **GitHub Actions** (Automated CI/CD Deployment)

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/its-thakshila/me.git

# Install dependencies
npm install

# Start the local development server (with HMR)
npm run dev

# Build for production
npm run build
```

## 🧠 Architecture Notes

### The 3D Stacking Context Fix
Traditional 2D React state updates paired with CSS transitions often result in depth-buffer tearing on mobile web engines (especially WebKit/iOS Safari). This project solves that by completely detaching from the 2D layout engine. The main container forces a permanent 3D stacking context (`translateZ(0px)` and `will-change: transform`). When items are focused, they don't just increase their `z-index`—they physically translate `100px` closer to the camera in 3D space, making visual tearing mathematically impossible for the GPU.

### Mobile Status Bar
The mobile interface features a custom, fixed "status bar" injected above the hardware-accelerated canvas. It utilizes dynamic mathematical blending (matching the calculated crossfade of the page background and the translucent overlay) to seamlessly obscure content sliding underneath it without causing rendering bottlenecks.

---
*Designed and engineered by Thakshila Bandara.*
