# Mind Rain - Architecture Design Competitions

A minimalist, professional website for Mind Rain, an architecture competition and events hosting organization.

## Tech Stack

- **Next.js 16.1.1** - React framework with App Router
- **TypeScript** - Strictly typed (no `any` types used)
- **Tailwind CSS v4** - Utility-first CSS framework
- **Google Fonts** - Playfair Display (headings) & Inter (body text)

## Design System

### Color Palette
All colors are centrally managed in `/utils/colors.ts`:

- **Background**: `#EDEBDF` (warm beige)
- **Accent**: `#2C5F5F` (deep teal)
- **Text Primary**: `#1A1A1A` (near black)
- **Text Secondary**: `#6B6B6B` (mid gray)
- **White**: `#FFFFFF`
- **Card Background**: `#F8F7F2` (off-white)

### Typography

- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, clean & professional)

## Project Structure

```
/app
├── app/
│   ├── layout.tsx              # Root layout with fonts
│   ├── globals.css             # Global styles
│   ├── page.tsx                # Root redirect to /home
│   ├── home/
│   │   └── page.tsx            # Home page with navigation
│   ├── about/
│   │   └── page.tsx            # About page
│   └── competition/
│       └── imaginative-home-2025-2026/
│           └── page.tsx        # Competition details page
├── components/
│   ├── Navigation.tsx          # Navigation bar (only on /home)
│   ├── Footer.tsx              # Footer component
│   ├── CompetitionCard.tsx     # Current competition overview
│   ├── WinnerCard.tsx          # Previous winner display card
│   ├── RegistrationModal.tsx   # Mock registration form
│   └── Timeline.tsx            # Visual timeline for dates
├── data/
│   └── winners.ts              # Previous competition winners data
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   └── colors.ts               # Centralized color constants
└── public/
    └── competition-hero.png    # Hero background image
```

## Features

### Home Page (`/home`)
- **Navigation Bar**: Sticky navigation with links (only appears on home page)
- **Competition Overview**: 75vh hero section with current competition details
- **Prize Pool Display**: Categorized prize breakdown
- **Previous Winners Gallery**: Card-based grid showing past competition winners
- **Footer**: Simple "Get in Touch" section

### Competition Details Page (`/competition/imaginative-home-2025-2026`)
- **Hero Section**: Full-screen with background image and competition title
- **Prize Pool**: Detailed breakdown by category
- **Important Dates**: Visual zigzag timeline
- **Registration Fees**: Three tiers (Early Bird, Advance, Late)
- **Student Discounts**: Information and contact section
- **Registration Modal**: Opens from "Register Now" buttons

### About Page (`/about`)
- Clean, text-focused layout
- Organization mission and vision
- CTA to explore competitions

## Key Design Decisions

1. **No `any` Types**: Strict TypeScript with proper type definitions
2. **Centralized Colors**: All colors in one utility file for easy theme changes
3. **Professional UI**: Minimalist design suitable for design-focused audience
4. **Responsive**: Mobile-first approach with Tailwind responsive utilities
5. **Image Handling**: Configured for external images from web.archive.org
6. **Circular Profile Pictures**: Small, circular thumbnails for winners
7. **Variable Image Ratios**: Card-based layout with `object-contain` for different aspect ratios

## Development

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Configuration

### Next.js Image Optimization

External images from `web.archive.org` are configured in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'web.archive.org',
      pathname: '/**',
    },
  ],
}
```

### Tailwind CSS v4

Using the latest Tailwind CSS v4 with inline theme configuration in `globals.css`.

## Component Props

All components use strictly typed props (no `any`):

- `CompetitionCard`: Competition details with prize breakdown
- `WinnerCard`: Winner info with profile, project image, and position
- `Timeline`: Array of important dates with labels
- `RegistrationModal`: Modal state (open/close) control

## Data Management

Previous winners data is stored in `/data/winners.ts` with proper TypeScript interfaces from `/types/index.ts`.

## Testing IDs

All interactive and important elements have `data-testid` attributes for testing:

- `nav-*`: Navigation links
- `competition-card`: Competition overview
- `winner-card`: Winner cards
- `register-*-button`: Registration buttons
- `registration-modal`: Modal component
- `*-input`, `*-select`: Form fields

## Browser Support

- Modern browsers with ES2017+ support
- Responsive design for mobile, tablet, and desktop

## Notes

- Navigation bar only appears on `/home` page as per requirements
- Mock registration form with no backend integration
- Background image on competition page from user-provided asset
- Images are displayed small to accommodate varying quality/size
- Root path (`/`) automatically redirects to `/home`

---

**Project Name**: Mind Rain  
**Version**: 1.0.0  
**Last Updated**: January 2026
