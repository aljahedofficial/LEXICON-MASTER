#!/bin/bash

# Initialize PostgreSQL Database for Lexicon Master
# This script pushes the Prisma schema to your Neon PostgreSQL database

set -e

echo "🚀 Initializing Lexicon Master Database..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it with your Neon PostgreSQL connection string:"
    echo 'export DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"'
    echo ""
    exit 1
fi

# Validate DATABASE_URL format
if [[ ! $DATABASE_URL =~ ^postgresql:// ]]; then
    echo "❌ ERROR: DATABASE_URL must start with 'postgresql://'"
    exit 1
fi

if [[ ! $DATABASE_URL =~ sslmode=require ]]; then
    echo "⚠️  WARNING: DATABASE_URL should end with '?sslmode=require' for Neon"
    echo "   Current URL: ${DATABASE_URL:0:50}..."
    read -p "   Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ DATABASE_URL is set"
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "📊 Pushing schema to database..."
echo "   This will create all tables, indexes, and relations"
echo ""

npx prisma db push --accept-data-loss

echo ""
echo "✅ Database initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify tables were created in your Neon dashboard"
echo "   2. Vercel will use this schema for deployment"
echo ""
echo "🧪 Test your setup:"
echo "   npm run build    # Should succeed now"
echo "   npm run dev      # Start development server"
echo ""
