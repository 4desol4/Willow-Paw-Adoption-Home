# Golden Paws Adoption Home

A puppy adoption website with a full owner area. React 19, TypeScript, Vite, Tailwind CSS 3,
Motion (Framer Motion), Lenis smooth scrolling, TanStack Query, and Supabase (Auth, Postgres with
Row Level Security, Storage).

## Run it

```sh
npm install
cp .env.example .env      # then fill in the two Supabase values
npm run dev
```

Without a `.env` the site still runs on built-in demo content, and the owner area explains what to connect.

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server on http://localhost:5173 |
| `npm run build`     | Production build into `dist/`       |
| `npm run typecheck` | TypeScript, no emit                 |
| `npm run check`     | Typecheck + lint + build            |

## Structure

```
src/
  components/
    animations/   Reveal, Stagger, TextReveal, ScrollWords, Magnetic, Parallax, PageTransition, SmoothScroll
    layout/       PublicLayout, AdminShell (route guard), Footer, Preloader, CustomCursor
    navigation/   Navbar, MobileMenu, ThemeToggle, Logo
    sections/     Hero, Statement, LitterRail, AdoptionSteps, TestimonialReader
    forms/        Fields, EnquiryForm, ImageManager
    ui/           Button, Modal, Img, PuppyCard, StatusTag, States (skeleton / empty / error) ...
  pages/          Public pages; pages/admin for the owner area
  services/       The ONLY place that talks to Supabase
  hooks/          React Query hooks, auth, theme, form state
  lib/            supabase client, validation (zod), helpers, demo data
supabase/migrations/   SQL (run in order)
```

## Supabase

See the setup guide in the project hand-off notes. In short: create a project, put the URL and
publishable key in `.env`, run the three SQL files in `supabase/migrations/` in order, create your owner
user, then run the bootstrap statement at the bottom of the third migration.

Never put the `service_role` key in any `VITE_` variable. Everything Vite sees is public.
