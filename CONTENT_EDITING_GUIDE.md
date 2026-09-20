# Master Content Editing Guide for Client Website

This guide gives you direct instructions on how to manually customize and update all client-specific content, branding, contact channels, copy, and routes across the codebase.

---

## ⚡ Quick Reference: The Central Configuration File
Over **80% of all client details** (Company Name, Phone, WhatsApp, Emails, Physical Address, Google Maps, Social Links) are centralized in a single file:

📁 **`src/config/clientConfig.ts`**

Whenever you update `clientConfig.ts`, the changes automatically reflect across the **Navbar**, **Footer**, **Hero Section**, **Contact Modal**, **Job Portal**, and **Operations Map Hub**.

---

## 1. Complete Question-by-Question Editing Directory

### 1. Company Name
* **Primary File Path**: `src/config/clientConfig.ts`
* **Variable / Constant**: `clientConfig.company.name` & `clientConfig.company.legalName`
* **What to Edit**: Replace `"[Client Company Name Placeholder]"` and `"[Client Legal Entity Name LLC / Ltd Placeholder]"`
* **Example**:
  ```ts
  name: 'Apex Telecom Global',
  legalName: 'Apex Telecom Global LLC',
  ```

---

### 2. Logo & Brand Icon
* **Primary Configuration**: `src/config/clientConfig.ts` (`clientConfig.company.logo: '/Averiqtel.png.jpeg'`)
* **Physical Asset Location**: `public/Averiqtel.png.jpeg` (and `public/Avierqtel.png.jpeg`)
* **Component Rendering**: `src/components/layout/Navbar.tsx` (Lines 68–81)
* **Automatic Behavior**:
  * Automatically loads the logo image from `/Averiqtel.png.jpeg`.
  * Preserves aspect ratio (`object-fit: contain`) with crisp white-glass backing and glowing cyber accents.
  * Sits immediately beside "Averiqtel Limited".

---

### 3. Phone Number
* **Primary File Path**: `src/config/clientConfig.ts`
* **Variable / Constant**: `clientConfig.contact.phoneFormatted` & `clientConfig.contact.phoneRaw`
* **What to Edit**:
  * `phoneFormatted`: Display string shown to users.
  * `phoneRaw`: Digits with country code used for `tel:` links.
* **Example**:
  ```ts
  phoneFormatted: '+1 (212) 555-0199',
  phoneRaw: '+12125550199',
  ```

---

### 4. WhatsApp Number & Quick Link
* **Primary File Path**: `src/config/clientConfig.ts`
* **Variable / Constant**: `clientConfig.contact.whatsappFormatted` & `clientConfig.contact.whatsappRaw`
* **What to Edit**:
  * `whatsappFormatted`: Display string.
  * `whatsappRaw`: Pure numeric string without spaces or `+` used in `https://wa.me/`.
* **Example**:
  ```ts
  whatsappFormatted: '+1 (212) 555-0199',
  whatsappRaw: '12125550199',
  ```

---

### 5. Email Addresses (Departmental)
* **Primary File Path**: `src/config/clientConfig.ts`
* **Variable / Constant**: `clientConfig.contact`
* **What to Edit**:
  * `generalEmail`: Main commercial & inbound contact.
  * `ratesEmail`: Wholesale rate decks & bilateral trading desk.
  * `nocEmail`: 24/7 Network Operations Center support.
  * `careersEmail`: Recruitment inbox for CV applications.
* **Example**:
  ```ts
  generalEmail: 'info@apextelecom.com',
  ratesEmail: 'rates@apextelecom.com',
  nocEmail: 'noc@apextelecom.com',
  careersEmail: 'hr@apextelecom.com',
  ```

---

### 6. Office Address & Business Hours
* **Primary File Path**: `src/config/clientConfig.ts`
* **Variable / Constant**: `clientConfig.location`
* **What to Edit**: `addressLine1`, `addressLine2`, `city`, `stateCountry`, `fullDisplayAddress`, `timeZone`, and `businessHours`.
* **Example**:
  ```ts
  addressLine1: '350 5th Ave',
  addressLine2: 'Suite 4800',
  city: 'New York, NY 10118',
  stateCountry: 'United States',
  fullDisplayAddress: '350 5th Ave, Suite 4800, New York, NY 10118, USA',
  timeZone: 'EST (UTC-5) / 24/7 Global NOC Desk',
  businessHours: 'Monday – Friday, 09:00 – 18:00 EST | 24/7 NOC Desk',
  ```

---

### 7. Google Maps URL & Embed
* **Primary File Path**: `src/config/clientConfig.ts`
* **Variable / Constant**: `clientConfig.location.googleMapsUrl` & `clientConfig.location.googleMapsEmbedUrl`
* **What to Edit**:
  * `googleMapsUrl`: Direct link opened when clicking the address.
  * `googleMapsEmbedUrl`: Google Maps `iframe` `src` URL shown in the interactive map card.
* **Example**:
  ```ts
  googleMapsUrl: 'https://maps.google.com/?q=Empire+State+Building+New+York',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=...',
  ```

---

### 8. Social Media Links
* **Primary File Path**: `src/config/clientConfig.ts`
* **Variable / Constant**: `clientConfig.socialLinks`
* **What to Edit**: `linkedin`, `telegram`, `skype`, and `twitter` URLs.
* **Example**:
  ```ts
  socialLinks: {
    linkedin: 'https://linkedin.com/company/apex-telecom-global',
    telegram: 'https://t.me/apex_carrier_desk',
    skype: 'skype:apex.rates.desk?chat',
    twitter: 'https://twitter.com/apextelecom',
  }
  ```

---

### 9. Hero Heading
* **Primary File Path**: `src/components/sections/HeroShell.tsx` (Lines 35–37)
* **Component / Tag**: `<h1 className="hero-title font-display">`
* **What to Edit**: The main title text and the gradient text inside `<span>`.
* **Example**:
  ```tsx
  <h1 className="hero-title font-display">
    Next-Gen Wholesale Voice &amp; <span className="text-gradient">Enterprise SMS</span> Infrastructure
  </h1>
  ```

---

### 10. Hero Description & Tab Hints
* **Primary File Path**: `src/components/sections/HeroShell.tsx`
* **Component / Lines**:
  * Line 39–41: `<p className="hero-subtext">`
  * Line 66–72: `<p className="tab-hint">` (Voice vs. SMS mode descriptions)
* **Example**:
  ```tsx
  <p className="hero-subtext">
    Engineered for telecommunications carriers, mobile operators, and tier-1 enterprises requiring direct CLI route termination, ultra-low latency, and 24/7 proactive NOC management.
  </p>
  ```

---

### 11. Services Content (Voice & SMS Hub)
* **Primary File Path**: `src/components/sections/ServicesHub.tsx`
* **Constants**:
  * `voiceFeatures` array (Lines 27–32): Title, description, and metric tags for Wholesale Voice.
  * `smsFeatures` array (Lines 34–39): Title, description, and metric tags for Enterprise SMS.
* **Example**:
  ```tsx
  const voiceFeatures = [
    { 
      title: 'A-Z Direct CLI Termination', 
      desc: 'Direct bilateral interconnects with tier-1 national carriers guaranteeing 100% Caller ID transmission.', 
      metric: '100% CLI Guaranteed' 
    },
    ...
  ];
  ```

---

### 12. Advantages & Bento Matrix Content
* **Primary File Path**: `src/components/sections/AdvantagesBento.tsx`
* **Component**: Bento grid cells (Cards 1 to 6)
* **What to Edit**:
  * Card 1: Direct & Proprietary Gateway Destinations (Lines 40–70)
  * Card 2: Dedicated 24/7 NOC Team & SLA response (Lines 72–98)
  * Card 3: Multilingual Trading Desks (7+ Languages) (Lines 100–121)
  * Card 4: Aggressive Market Pricing (Lines 123–144)
  * Card 5: Flexible Settlement & Post-Pay Terms (Lines 146–167)
  * Card 6: Regulatory Compliance & Licensing (Lines 169–191)

---

### 13. Global Destinations & Routes
* **Card Explorer File Path**: `src/components/sections/RouteExplorer.tsx`
  * **Constant**: `DESTINATIONS` array (Lines 20–33)
  * **Fields**: `country`, `region` (`'africa' | 'mena' | 'europe' | 'americas' | 'asia'`), `routeType`, `voiceLatency`, `smsSpeed`, `cliGuaranteed`.
* **3D Globe Coordinates File Path**: `src/components/globe/geoUtils.ts`
  * **Constant**: `MAJOR_HUBS` array (Lines 25–40)
  * **Fields**: `name`, `country`, `lat`, `lng`, `trafficVolume`, `status`, `sla`.

---

### 14. Company & About Content
* **Primary File Path**: `src/components/sections/AboutTimeline.tsx`
* **Constants & Components**:
  * `milestones` array (Lines 9–14): Historical years, titles, and descriptions.
  * Narrative Story (Lines 28–32): `<p className="about-lead-text">`
  * Regulatory / Carrier Certification card (Lines 35–45)

---

### 15. International Events & Summits
* **Primary File Path**: `src/components/sections/EventsCarousel.tsx`
* **Constant**: `EVENTS` array (Lines 16–52)
* **What to Edit**: Summit name, location, year/frequency, badge category, and description (e.g. Capacity Middle East, ITW, Capacity Europe, WWC, GSMA MWC).

---

### 16. Careers & Job Openings
* **Primary File Path**: `src/components/sections/CareersHub.tsx`
* **Constant**: `POSITIONS` array (Lines 18–105)
* **Fields for each job**:
  * `id`: Unique identifier
  * `title`: Job Title
  * `dept`: Department name
  * `type`: Full-time / Part-time
  * `hours`: Work schedule
  * `overview`: Role summary
  * `responsibilities`: List of bullet points
  * `qualifications`: Required skills and background

---

### 17. Call-to-Action (CTA) Section
* **Primary File Path**: `src/components/sections/CinematicCTA.tsx`
* **Component / Lines**:
  * Line 28–30: `<h2 className="cta-headline font-display">`
  * Line 32–34: `<p className="cta-description">`
  * Lines 58–71: `cta-guarantees-row` trust bullet points

---

### 18. Footer Content & Navigation Links
* **Primary File Path**: `src/components/layout/Footer.tsx`
* **Component**: `<footer className="footer-root">`
* **What to Edit**: Category column headers, link anchors, copyright label, and legal disclaimer links (`#privacy`, `#terms`, `#sla`).

---

### 19. SEO Title & Meta Description
* **Primary File Path**: `index.html` (Lines 8–9)
* **Tags**:
  * `<title>`: Browser tab title and search engine headline.
  * `<meta name="description">`: Search engine snippet description.
* **Example**:
  ```html
  <title>Apex Telecom – Global Wholesale Voice & SMS Carrier Infrastructure</title>
  <meta name="description" content="Tier-1 wholesale voice termination, direct enterprise SMS routing gateways, and 24/7 NOC connectivity." />
  ```

---

### 20. Internal Search Index
* **Primary File Path**: `src/components/modals/SearchModal.tsx`
* **Constant**: `SEARCH_INDEX` array (Lines 19–56)
* **What to Edit**: Keywords, titles, categories, and target anchors that users search for via `⌘K` / `Ctrl+K`.

---

## 🔍 Complete Inventory of All Placeholders & Demo Data

Below is the complete inventory of placeholder strings, demo metrics, and temporary values currently in the project:

### 1. Placeholder Strings
| File Path | Line(s) | Current Placeholder Text | Recommended Action |
|---|---|---|---|
| `src/config/clientConfig.ts` | 52 | `'[Client Company Name Placeholder]'` | Replace with official company brand name |
| `src/config/clientConfig.ts` | 53 | `'[Client Legal Entity Name LLC / Ltd Placeholder]'` | Replace with official legal entity name |
| `src/config/clientConfig.ts` | 57 | `'[FCC 214 License / Regulatory Compliance Placeholder]'` | Replace with actual carrier license / registration number |
| `src/config/clientConfig.ts` | 60, 62 | `'+1 (000) 000-0000'` | Replace with client phone & WhatsApp numbers |
| `src/config/clientConfig.ts` | 64–67 | `'contact@clientdomain.com'`, `'rates@...'`, `'noc@...'`, `'careers@...'` | Replace with actual corporate domain email inboxes |
| `src/config/clientConfig.ts` | 70–74 | `'[Client Office Address Line 1 Placeholder]'`, `'[City Placeholder]'` | Replace with real physical headquarters address |
| `src/config/clientConfig.ts` | 81–84 | `'https://linkedin.com/company/client-placeholder'`, `'https://t.me/client_carrier_desk'` | Replace with client social profiles |
| `src/components/sections/HeroShell.tsx` | 105 | `'[Carrier Certification Placeholder]'` | Replace with compliance / ISO / Tier-1 badge |
| `src/components/sections/AdvantagesBento.tsx` | 192, 195 | `'[Carrier Compliance Placeholder]'`, `'[Licensing & Regulatory Placeholder]'` | Replace with specific regulatory licensing text |
| `src/components/sections/AboutTimeline.tsx` | 9 | `title: '[Founding Placeholder]'` | Replace with company establishment milestone |
| `src/components/sections/AboutTimeline.tsx` | 29 | `'[Client Enterprise Overview Placeholder]'` | Replace with client corporate heritage paragraph |
| `src/components/sections/AboutTimeline.tsx` | 38, 40 | `'[Carrier Compliance Placeholder]'`, `'[Regulatory Licensing Placeholder]'` | Replace with carrier compliance details |

---

### 2. Demo Statistics & Benchmarks (Visual Data Only)
These metrics are configured as visual/demo data and should be updated to match the client's actual network performance:

| File Path | Component / Metric | Current Demo Value | Purpose |
|---|---|---|---|
| `src/components/sections/HeroShell.tsx` (Lines 133–151) | Live Metrics Bar | `200+ Destinations`, `99.999% SLA`, `24/7 NOC`, `7+ Languages` | Hero trust counter |
| `src/components/sections/ServicesHub.tsx` (Lines 27–39) | Service Metrics | `100% CLI Guaranteed`, `<15ms Switching`, `120+ Countries`, `35k+ TPS Peak` | Capability highlights |
| `src/components/sections/RouteExplorer.tsx` (Lines 20–33) | Route Latencies | `Ethiopia: 42ms`, `Nigeria: 44ms`, `Lebanon: 29ms`, `USA: 14ms`, `UK: 11ms` | Route SLA benchmark simulations |
| `src/components/sections/AdvantagesBento.tsx` (Line 94) | NOC SLA Response | `< 5min Critical SLA Response` | Technical support benchmark |

---

## 🛠️ Step-by-Step Verification After Editing
Whenever you finish editing content in any of these files, run:

```bash
# 1. Verify TypeScript compiles cleanly with no syntax errors
npm run build

# 2. Start local preview to visually review your changes
npm run dev
```
Open `http://localhost:3000/` in your browser to confirm that your new branding, contact links, and copy appear as expected.
