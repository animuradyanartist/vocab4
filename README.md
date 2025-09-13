# Vocabulary Learner - Armenian

A comprehensive vocabulary learning application for Armenian language learners.

## Features

- 📚 Personal vocabulary management
- 🧠 Interactive practice sessions with multiple choice questions
- 📖 Text-based vocabulary extraction and practice
- 🤖 AI assistant for language learning support
- 🏆 Achievement system with badges and progress tracking
- 📱 Progressive Web App (PWA) with offline support
- 🔐 Secure authentication with Supabase
- 👥 Group management for educators (admin feature)
- 🌐 Public text library for community learning

## Live Demo

- **Production:** https://www.course.tips/
- **Staging:** https://staging.ibt.today (for testing)
- **Development:** http://localhost:5173

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **PWA:** Vite PWA Plugin with Workbox
- **Deployment:** Netlify
- **Analytics:** Microsoft Clarity

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your Supabase credentials
4. Start the development server: `npm run dev`

## Environment Variables

```env
# Production
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Staging (optional)
VITE_SUPABASE_URL=your-staging-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-staging-supabase-anon-key
VITE_APP_ENV=staging
```

## Deployment

The project is configured for automatic deployment with multiple environments:

### Production Deployment
1. Push changes to your `main` branch
2. Automatic build and deploy to production
3. Build command: `npm run build`
4. Domain: Your custom domain

### Staging Deployment
1. Push changes to your `staging` branch (if configured)
2. Automatic build and deploy to staging
3. Build command: `npm run build:staging`
4. Domain: staging.yourdomain.com

### Environment Setup
- **Production**: Uses `.env` file
- **Staging**: Uses `.env.staging` file
- **Development**: Uses `.env.local` file (not committed)

## Database Schema

The application uses Supabase with the following main tables:

- `words` - User vocabulary entries
- `texts` - User practice texts
- `public_texts` - Community shared texts
- `user_profiles` - User account information
- `groups` - User groups for educators
- `admins` - Admin user permissions

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.