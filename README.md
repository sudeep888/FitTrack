# FitTrack Pro ⚡

A modern, production-ready fitness tracking and workout analytics web app built with React + Vite + Tailwind CSS.

## Features

- **Dashboard** – Stats overview, streak counter, BMI, weekly/monthly charts
- **Workout Log** – Add, edit, delete, search and filter workouts with volume tracking
- **Progress Tracking** – Body measurements over time with trend charts
- **Analytics** – Workout frequency, volume trends, muscle group distribution, consistency score
- **Fitness Calculators** – BMI, BMR, TDEE (calorie), and protein calculators
- **Goals** – Set and track weight, weekly, and monthly workout goals
- **Personal Records** – Track PRs for key lifts with history charts
- **Settings** – Profile management, dark/light mode, export/import/reset data
- **Achievement System** – Unlock badges as you hit milestones
- **Fully offline** – All data stored in localStorage, no backend needed

## Tech Stack

- React 18 + Vite
- Tailwind CSS 3
- React Router DOM 6
- Recharts
- Lucide React

## Getting Started

```bash
# Clone or copy the project folder
cd fittrack-pro

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

App runs at: http://localhost:5173

## Project Structure

```
src/
  components/
    ui/         # Toast, Modal, EmptyState, ConfirmDialog
    layout/     # Sidebar, Header, Layout
  context/
    AppContext.jsx   # Global state + localStorage persistence
  data/
    quotes.js        # Motivational quotes
    muscleGroups.js  # Constants
  pages/
    Dashboard.jsx
    WorkoutLog.jsx
    Progress.jsx
    Analytics.jsx
    Calculators.jsx
    Goals.jsx
    Records.jsx
    Settings.jsx
```

## Data Persistence

All data is stored in `localStorage` under these keys:
- `fittrack_workouts`
- `fittrack_measurements`
- `fittrack_goals`
- `fittrack_prs`
- `fittrack_profile`
- `fittrack_achievements`
- `fittrack_theme`

Export your data from Settings to back it up as JSON.

## Customization

- Colors: Edit `tailwind.config.js` and the CSS variables in `index.css`
- Muscle groups: Edit `src/data/muscleGroups.js`
- Quotes: Edit `src/data/quotes.js`
