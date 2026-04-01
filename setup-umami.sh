#!/bin/bash

echo "🎯 Setting up Umami Analytics..."
echo ""

# Generate random secret
APP_SECRET=$(openssl rand -hex 32)

# Create .env.umami file
cat > .env.umami << EOF
DATABASE_URL=postgresql://postgres:password@umami-db:5432/umami
DATABASE_TYPE=postgresql
APP_SECRET=$APP_SECRET
EOF

echo "✅ Created .env.umami with random APP_SECRET"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start Umami:"
echo "   docker-compose -f docker-compose.umami.yml up -d"
echo ""
echo "2. Wait ~30 seconds for database to initialize"
echo ""
echo "3. Open Umami dashboard:"
echo "   http://localhost:3100"
echo ""
echo "4. Login with default credentials:"
echo "   Username: admin"
echo "   Password: umami"
echo ""
echo "5. ⚠️  IMPORTANT: Change the password immediately!"
echo ""
echo "6. Create a new website in Umami dashboard"
echo ""
echo "7. Copy the tracking code and add it to your React app"
echo ""
echo "📌 To stop Umami:"
echo "   docker-compose -f docker-compose.umami.yml down"
echo ""
