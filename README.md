# Global Express Delivery 🚚

A Progressive Web App (PWA) for managing delivery operations with real-time multi-device synchronization.

## Features ✨

- **Multi-Device Sync**: Real-time updates across all devices
- **Role-Based Access**: Separate interfaces for admins and delivery personnel
- **Offline Support**: Queue operations when offline, sync when back online
- **PWA**: Install on any device like a native app
- **Real-Time Updates**: See changes instantly across all devices

### For Administrators
- Manage delivery personnel (livreurs)
- Assign and track deliveries
- Validate expenses and returns
- Monitor daily payments
- Generate reports

### For Delivery Personnel
- View assigned deliveries
- Mark deliveries as complete
- Submit expenses
- Track daily earnings

## Tech Stack 🛠️

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Netlify
- **PWA**: vite-plugin-pwa

## Getting Started 🚀

### Prerequisites

- Node.js 18+ 
- npm or bun
- A Supabase account (free tier works!)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd global-express-delivery
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the detailed guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

Quick summary:
1. Create a Supabase project
2. Run the database migration (`supabase/migrations/001_initial_schema.sql`)
3. Create an admin user
4. Get your Supabase credentials

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

## Deployment 🌐

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for detailed deployment instructions to Netlify.

Quick deploy:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Don't forget to set environment variables in Netlify!

## Project Structure 📁

```
global-express-delivery/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin dashboard pages
│   │   └── livreur/      # Livreur dashboard pages
│   ├── services/         # Business logic & API calls
│   │   ├── supabaseService.ts  # Supabase operations
│   │   ├── storage.ts          # Legacy localStorage (for migration)
│   │   └── calculations.ts     # Business calculations
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
├── supabase/
│   └── migrations/       # Database schema migrations
├── public/               # Static assets
└── dist/                 # Production build
```

## Database Schema 🗄️

The application uses the following tables:

- **users**: User authentication and roles
- **livreurs**: Delivery personnel information
- **courses**: Delivery assignments
- **expenses**: Expense tracking
- **daily_payments**: Payment records
- **manquants**: Shortage tracking

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Development 💻

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Adding a New Feature

1. Update types in `src/types/index.ts` if needed
2. Add database changes to a new migration file
3. Update `supabaseService.ts` with new operations
4. Create/update UI components
5. Test locally
6. Deploy

## Migration from localStorage 📦

If you have existing data in localStorage, use the migration helper:

```typescript
import { exportLocalStorageData } from '@/services/migrationHelper';

// Export data to JSON file
exportLocalStorageData();
```

Then manually import the data into Supabase.

## Troubleshooting 🔧

### Build Errors

**Error**: "Missing environment variables"
- **Solution**: Make sure `.env` file exists with correct variables

### Authentication Issues

**Error**: "Mot de passe incorrect"
- **Solution**: Verify admin user was created correctly in Supabase

### Real-time Not Working

- Check Supabase replication is enabled
- Verify WebSocket connection in browser console
- Check Row Level Security policies

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

[Your License Here]

## Support 💬

For issues and questions:
- Check `SUPABASE_SETUP.md` for setup help
- Check `DEPLOYMENT.md` for deployment help
- Review browser console for errors
- Check Supabase logs in dashboard

## Roadmap 🗺️

- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Geolocation tracking
- [ ] Photo upload for deliveries

---

Built with ❤️ for Global Express Delivery
