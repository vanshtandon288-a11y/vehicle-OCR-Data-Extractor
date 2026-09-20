# PROJECT MASTER: Premium Next-Gen Telecom Web Experience

## 1. Project Overview & Scope
A modern, high-performance, and visually captivating web application designed for a premium telecommunications client. Inspired by the visual quality and interaction depth of [vazq.com](https://www.vazq.com/), but crafted as an original, dark-futuristic 3D digital experience.

## 2. Core Stack
* **Framework**: React 18 + Vite 5 + TypeScript
* **Styling**: Vanilla CSS Design System with CSS Tokens, Glassmorphism, CSS Grid & Flexbox
* **3D & Graphics**: Three.js + React Three Fiber + Drei (Interactive 3D Hero Globe)
* **Animation & Kinetic Motion**: GSAP (ScrollTrigger) + Lenis (Inertia Smooth Scroll) + CSS 3D Perspective
* **Configuration Architecture**: Centralized Client Store (`src/config/clientConfig.ts`)
* **Icons**: Lucide React

## 3. Scope Boundaries & Constraints
* **Content Integrity**: All client-specific data (company name, phone numbers, WhatsApp, emails, address, Google Maps, regulatory filings) is centralized in `src/config/clientConfig.ts` and uses clearly marked placeholders until official production data is provided.
* **Functional CTAs**: All phone links use `tel:`, all email buttons use `mailto:`, all WhatsApp triggers use `https://wa.me/`, and office addresses link directly to Google Maps.

---

## 4. Phase-by-Phase Roadmap

- [x] **Phase 0: Research & Architectural Direction** (Completed)
- [x] **Phase 1: Project Foundation & Design System** (Completed & Verified)
  - [x] Vite + React + TypeScript scaffolding & dependency configuration
  - [x] Global design tokens (colors, typography, spacing, glassmorphism filters, glowing accents)
  - [x] Typography setup (Plus Jakarta Sans, Inter, JetBrains Mono)
  - [x] Global layout structure with responsive container system
  - [x] Premium Floating Glass Navbar & Cyber-Grid Footer
- [x] **Phase 2: Premium 3D Hero & Interactive Globe** (Completed & Verified)
  - [x] Real-time 3D Globe with procedural landmass dot matrix and custom atmospheric Fresnel rim shader
  - [x] Major global telecom network hub nodes with accurate spherical coordinates
  - [x] 3D Curved Telecom Arcs with animated flowing data packet particles
  - [x] Dynamic Voice vs. SMS dual-mode state switching
- [x] **Phase 3: Global 3D Motion & Interaction System** (Completed & Verified)
  - [x] Lenis inertia smooth scrolling synchronized with GSAP ScrollTrigger
  - [x] Interactive 3D TiltCards with dynamic cursor-following spotlight glow
  - [x] BackgroundUniverse 2D canvas constellation with floating cyber-nodes
  - [x] Interactive Services Hub with audio codec & throughput visualizer
  - [x] Strategic Advantages Bento Matrix & 3D Events Carousel
- [x] **Phase 4: Client Interactivity & Real Content Architecture** (Completed & Verified)
  - [x] **Centralized Client Config Store (`src/config/clientConfig.ts`)**: Single configuration hub for all company branding, phone numbers, WhatsApp lines, departmental emails, physical office address, Google Maps coordinates, business hours, and social profiles.
  - [x] **Interactive Contact & Interconnect Modal (`ContactModal.tsx`)**: Professional carrier modal for voice/SMS rate inquiries and bilateral testing requests with validation, feedback screens, and fallback channels.
  - [x] **Instant Internal Search Engine (`SearchModal.tsx`)**: Global `⌘K` / `Ctrl+K` keyboard-accessible modal indexing services, bento advantages, carrier routes, job positions, and company heritage with arrow navigation and instant section jumping.
  - [x] **Interactive Destination Inspector (`DestinationModal.tsx`)**: Click-to-inspect modal for global route cards displaying latency SLAs, SMS delivery speed, supported codecs, and direct rate request actions.
  - [x] **Career Job Spec Modal (`JobDetailsModal.tsx`)**: Expandable job specification modal with comprehensive responsibilities, qualifications, carrier benefits, and direct email application triggers (`mailto:`).
  - [x] **Interactive Office Location & Google Maps Hub (`OfficeMapSection.tsx`)**: Interactive headquarters card with clickable address launching Google Maps, direct phone/WhatsApp/email triggers, and embedded dark-mode Google Map view.
  - [x] **Navbar & Footer Full Wiring**: Active section tracking via IntersectionObserver, mobile drawer auto-close, and zero dead links across the entire layout.
  - [x] Clean production build (`npm run build` exit code 0) and active dev server at `http://localhost:3000/`.
- [ ] **Phase 5: SEO, Metadata & Accessibility** (Pending Approval)
  - [ ] Open Graph & Twitter Cards metadata
  - [ ] Semantic HTML5 & ARIA labels audit
  - [ ] sitemap.xml & robots.txt generation
- [ ] **Phase 6: Performance, Mobile & Production Audit** (Pending)
  - [ ] Low-power 3D fallback verification
  - [ ] CWV optimizations (LCP, CLS, INP)
  - [ ] Production build verification

---

## 5. Technical Decisions & Architecture Notes (Phase 4)
1. **Single Source of Truth (`clientConfig.ts`)**:
   - Every phone number, email address, WhatsApp link, physical address, and legal entity name references `clientConfig`. Swapping placeholder values for production client details requires editing only one file.
2. **Keyboard-Driven Power UX**:
   - `⌘K` / `Ctrl+K` globally toggles the internal search index.
   - `Escape` closes any active modal (Contact, Search, Destination, Job Spec).
3. **Graceful Functional Protocol Links**:
   - Direct integration with native device protocols: `tel:`, `mailto:`, `https://wa.me/`, and Google Maps URLs.

---

## 6. Current Status
* **Active Phase**: Phase 4 Complete — Ready for Phase 5 Approval
* **Dev Server**: Active at `http://localhost:3000/`
