# LEXICON MASTER - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/aljahedofficial/LEXICON-MASTER.git
cd LEXICON-MASTER
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values (especially DATABASE_URL)
```

### Step 4: Setup Database
```bash
# Run migrations
npm run db:migrate

# (Optional) View database
npm run db:studio
```

### Step 5: Start Development
```bash
npm run dev
```

Visit **http://localhost:3000** in your browser! 🎉

---

## 📋 Requirements

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org/ |
| npm | 9+ | Comes with Node.js |
| PostgreSQL | 12+ | https://postgresql.org/ |
| Git | Latest | https://git-scm.com/ |

---

## 🔧 Important First-Time Setup

### 1. Database Connection
Create a PostgreSQL database and add the URL to `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/lexicon_master"
```

### 2. JWT Secret
Generate a secure JWT secret:
```bash
openssl rand -hex 32
```
Add to `.env.local`:
```
JWT_SECRET="your-generated-secret-here"
```

### 3. File Upload Directory
Create upload directory:
```bash
mkdir -p uploads temp
```

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Check code with ESLint
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed with sample data

# Testing
npm run test             # Run unit tests
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
```

---

## 📁 Project Structure Quick Tour

```
src/
├── components/          # React UI components
├── pages/              # Next.js pages & API routes
├── services/           # API & business logic
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
└── styles/             # Global styles

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations

docs/                   # Documentation
tests/                  # Test files
```

---

## 🎯 Next Steps

1. **Explore the dashboard**: Navigate to `/dashboard`
2. **Create your first project**: Start a new extraction
3. **Upload files**: Try uploading a PDF or DOCX file
4. **View results**: See extracted vocabulary and analytics
5. **Learn more**: Check [IMPLEMENTATION.md](./IMPLEMENTATION.md) for full details

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Solution**: 
- Verify PostgreSQL is running: `psql -U user -d lexicon_master`
- Check DATABASE_URL in .env.local
- Ensure database exists: `createdb lexicon_master`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**:
```bash
# Use different port
npm run dev -- -p 3001
```

### Module Not Found
```
Error: Cannot find module '@/components/...'
```
**Solution**:
- Ensure `tsconfig.json` has correct path aliases
- Check spelling of imports
- Run `npm install` again

### Prisma Client Not Found
```
Error: @prisma/client not found
```
**Solution**:
```bash
npm install @prisma/client
npx prisma generate
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview & features |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Architecture & phases |
| [TASKS.md](./TASKS.md) | Detailed task breakdown (178 tasks) |
| [QUICK_START.md](./QUICK_START.md) | This file - Fast setup |

---

## 💡 Tips for Development

### Hot Reload
Code changes automatically reload - no need to restart the server!

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Database GUI
```bash
npm run db:studio
# Opens http://localhost:5555 with visual database editor
```

### Format on Save
Configure your editor to format on save using Prettier

---

## 🤝 Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/aljahedofficial/LEXICON-MASTER/issues)
- **Discussions**: Ask in [GitHub Discussions](https://github.com/aljahedofficial/LEXICON-MASTER/discussions)
- **Documentation**: Read full docs in [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `npm install` completed without errors
- [ ] Database connection successful (`npm run db:migrate`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can view Prisma Studio (`npm run db:studio`)
- [ ] ESLint passes (`npm run lint`)

---

**Happy Coding! 🚀✨**

*Last Updated: January 29, 2026*
