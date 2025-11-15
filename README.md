# GlobeQuest

A geography RPG game built with React where you explore the world, unlock regions, and test your knowledge with daily challenges.

## Features

- **Daily Challenges**: Test your geography knowledge with daily country outline and flag guessing challenges (no account required)
- **Quest Mode**: Unlock regions, gain XP, and explore countries (requires account)
- **Authentication**: Secure user accounts with Supabase
- **Interactive World Map**: Click on unlocked countries to learn about them

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [Supabase](https://supabase.com)
2. Get your project URL and anon key from Project Settings → API
3. Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database tables**:
   - Go to your Supabase project → SQL Editor
   - Run the migration files from `supabase/migrations/` in order:
     - `001_create_profiles.sql`
     - `002_create_country_progress.sql`
     - `003_create_region_progress.sql`
     - `004_add_profile_customization.sql`
   - See `supabase/README.md` for detailed instructions

### 3. Run the App

```bash
npm start
```

The app will open at `http://localhost:3000`

## Routes

- `/` - Landing page with daily challenges
- `/login` - User login
- `/signup` - User registration
- `/quest` - Quest mode (protected route, requires login)

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── daily/         # Daily challenge components
│   └── ...            # Other components
├── context/            # React contexts (AuthContext)
├── data/              # Static data files
├── lib/               # Utility libraries (Supabase client)
├── pages/             # Page components
└── ...
```

## Technologies

- React 18
- React Router DOM
- Supabase (Authentication)
- Tailwind CSS
- react-simple-maps
- d3-geo