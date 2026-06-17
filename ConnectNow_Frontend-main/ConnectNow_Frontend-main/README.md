# ConnectNow — Frontend

ConnectNow is a modern, minimal, and responsive networking app frontend built with React, Vite, Tailwind CSS, Framer Motion, and Redux Toolkit. It helps users discover professionals, manage profiles, send/receive connection requests, and chat with a helpful floating assistant.

## Features

- Clean, floating glass UI with three-color palette (primary #2563eb, secondary #64748b, accent #10b981)
- Discover feed with stack/grid views, filters, and quick actions
- Professional profile pages (view/edit) with safe skills parsing
- Connections page with search, sorting, and animated transitions
- Floating navbar and Floating Chatbot assistant
- Modern Login and Signup pages with validation and animations
- Redux Toolkit store for user, feed, connections

## Tech Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- Redux Toolkit
- Axios

## Getting Started

1. Install dependencies
   - Run in PowerShell: npm install
2. Update API base URL
   - Edit `src/utils/constants.js` and set `BASE_URL` to your backend URL
3. Start the dev server
   - Run: npm run dev

## Scripts

- npm run dev — Start dev server
- npm run build — Production build
- npm run preview — Preview production build

## Folder Structure (frontend)

- src/components — UI components (Feed, Profile, Connections, Auth, Chatbot, Navbar, etc.)
- src/utils — Redux store and slices, constants, socket helpers
- public — Static assets

## Notes

- Ensure cookies are enabled; most requests use withCredentials
- Feed filters are tolerant to missing fields to keep results visible

— ConnectNow Team
