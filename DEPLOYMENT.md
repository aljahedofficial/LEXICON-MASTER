# LEXICON MASTER - Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Building for Production](#building-for-production)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Database**: PostgreSQL 14+ (recommended for production) or SQLite (development only)
- **Git**: Latest version

### System Requirements
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: 10GB+ free space
- **CPU**: 2+ cores recommended

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/aljahedofficial/LEXICON-MASTER.git
cd LEXICON-MASTER
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file based on `.env.production.example`:

```bash
cp .env.production.example .env.local
```

**Critical Variables to Set:**

```env
# Database - Use PostgreSQL for production
DATABASE_URL="postgresql://user:password@host:5432/lexicon_db"

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET="your-generated-secret-here"

# Application URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Node Environment
NODE_ENV="production"
```

---

## Database Setup

### PostgreSQL (Recommended for Production)

1. **Create Database:**
```bash
createdb lexicon_production
```

2. **Update DATABASE_URL in .env.local:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/lexicon_production"
```

3. **Run Migrations:**
```bash
npx prisma migrate deploy
```

4. **Generate Prisma Client:**
```bash
npx prisma generate
```

### Verify Database Setup

```bash
npx prisma studio
```
This opens a GUI to verify your database schema.

---

## Building for Production

### 1. Build the Application

```bash
npm run build
```

This will:
- Compile TypeScript
- Optimize assets
- Generate static pages
- Create production bundles

### 2. Test Production Build Locally

```bash
npm start
```

Access at `http://localhost:3000` and verify all features work.

---

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configure Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.production.example`

5. **Configure Database:**
   - Use Vercel Postgres or external PostgreSQL provider
   - Update `DATABASE_URL` in environment variables

**Vercel Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### Option 2: Docker Deployment

1. **Build Docker Image:**
```bash
docker build -t lexicon-master:latest .
```

2. **Run with Docker Compose:**

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    image: lexicon-master:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/lexicon
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=lexicon_user
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=lexicon
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

3. **Start Services:**
```bash
docker-compose up -d
```

4. **Run Migrations:**
```bash
docker-compose exec app npx prisma migrate deploy
```

---

### Option 3: VPS / Cloud Server (Ubuntu)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (as reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. PostgreSQL Configuration

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE lexicon_production;
CREATE USER lexicon_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE lexicon_production TO lexicon_user;
\q
```

#### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/aljahedofficial/LEXICON-MASTER.git
cd LEXICON-MASTER

# Install dependencies
npm install

# Configure environment
cp .env.production.example .env.local
nano .env.local  # Edit with your values

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start npm --name "lexicon-master" -- start
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/lexicon-master`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/lexicon-master /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Post-Deployment

### 1. Health Checks

Verify these endpoints:
- `https://your-domain.com/` - Homepage loads
- `https://your-domain.com/auth/login` - Login page accessible
- `https://your-domain.com/api/health` - API health check (create this endpoint)

### 2. Create Admin User

```bash
# SSH into server
cd /path/to/LEXICON-MASTER

# Run seed script or create user via Prisma Studio
npx prisma studio
```

### 3. Test Core Features

- ✅ User registration and login
- ✅ File upload
- ✅ Text extraction
- ✅ Analytics generation
- ✅ Export functionality
- ✅ Learning features

---

## Monitoring & Maintenance

### Application Monitoring

1. **PM2 Monitoring (if using PM2):**
```bash
pm2 monit
pm2 logs lexicon-master
```

2. **Disk Space:**
```bash
df -h
du -sh /path/to/uploads
```

3. **Database Size:**
```sql
SELECT pg_size_pretty(pg_database_size('lexicon_production'));
```

### Regular Maintenance

1. **Database Backups:**
```bash
# Create backup
pg_dump lexicon_production > backup_$(date +%Y%m%d).sql

# Restore backup
psql lexicon_production < backup_20260130.sql
```

2. **Log Rotation:**
```bash
# Configure logrotate for PM2 logs
sudo nano /etc/logrotate.d/lexicon-master
```

3. **Updates:**
```bash
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart lexicon-master
```

### Performance Optimization

1. **Enable Redis Caching (Optional):**
   - Install Redis: `sudo apt install redis-server`
   - Configure caching in application

2. **CDN for Static Assets:**
   - Use Cloudflare or similar CDN
   - Configure asset URLs

3. **Database Optimization:**
```sql
-- Analyze tables
ANALYZE;

-- Vacuum database
VACUUM ANALYZE;
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs lexicon-master

# Check port availability
sudo lsof -i :3000

# Verify environment variables
pm2 env lexicon-master
```

### Database Connection Errors

```bash
# Test database connection
psql -h localhost -U lexicon_user -d lexicon_production

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart application
pm2 restart lexicon-master

# Increase Node.js memory limit
pm2 delete lexicon-master
pm2 start npm --name "lexicon-master" --max-memory-restart 1G -- start
```

### File Upload Issues

```bash
# Check upload directory permissions
ls -la /path/to/uploads
chmod 755 /path/to/uploads

# Check disk space
df -h

# Check Nginx client_max_body_size setting
```

---

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured (not in version control)
- [ ] Database credentials strong and unique
- [ ] JWT_SECRET is cryptographically random
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] SSH key authentication enabled (password auth disabled)
- [ ] Regular security updates scheduled
- [ ] Database backups automated
- [ ] Rate limiting configured
- [ ] Security headers enabled

---

## Support & Resources

- **Documentation**: `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/aljahedofficial/LEXICON-MASTER/issues)
- **Security**: Report security issues privately

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Database
npx prisma migrate deploy
npx prisma generate
npx prisma studio

# PM2
pm2 start npm --name "lexicon-master" -- start
pm2 logs lexicon-master
pm2 restart lexicon-master
pm2 stop lexicon-master

# Docker
docker-compose up -d
docker-compose logs -f app
docker-compose down
```

---

**Last Updated**: January 30, 2026  
**Version**: 1.0
