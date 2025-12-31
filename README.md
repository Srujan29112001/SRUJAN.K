# K Srujan Portfolio

A stunning, Awwwards-worthy portfolio website built with Next.js 14, Three.js, GSAP, and Tailwind CSS.

## Features

- **3D WebGL Graphics** - Interactive particle systems and floating geometry using Three.js & React Three Fiber
- **Smooth Scroll** - Lenis smooth scrolling with GSAP ScrollTrigger integration
- **Console-Style Preloader** - KPRverse-inspired loading animation with system messages
- **Horizontal Scroll Storytelling** - About section with parallax panels
- **Custom Cursor** - Magnetic cursor with hover effects
- **Responsive Design** - Mobile-first with 3D disabled on smaller screens
- **Performance Optimized** - Dynamic imports, lazy loading, and hardware acceleration

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS 3.4
- **3D Engine:** Three.js + React Three Fiber + @react-three/drei
- **Animation:** GSAP (ScrollTrigger, CustomEase) + Framer Motion
- **Smooth Scroll:** Lenis
- **State:** Zustand

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/srujan-portfolio
├── app/                    # Next.js App Router pages
├── components/
│   ├── three/              # 3D WebGL components
│   ├── sections/           # Page sections
│   ├── ui/                 # Reusable UI components
│   └── providers/          # React context providers
├── lib/                    # Utility libraries
├── data/                   # Static data
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
└── styles/                 # Additional CSS
```

## Customization

- **Colors:** Edit CSS variables in `app/globals.css`
- **Content:** Update data files in `data/` directory
- **3D Scene:** Modify components in `components/three/`
- **Animations:** Adjust GSAP settings in `lib/gsap.ts`

## Performance Tips

- 3D canvas is automatically disabled on mobile devices
- Particle count can be adjusted for performance
- Uses `prefers-reduced-motion` media query
- Images should be optimized before adding to `/public`

## Deployment

Optimized for Vercel deployment. Simply push to GitHub and connect to Vercel for automatic deployments.

## License

MIT License - Feel free to use this as a template for your own portfolio.

---

Built with care by K Srujan
