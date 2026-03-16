#!/bin/bash
# Quick deploy script for DigitalOcean
# Run this on your LOCAL machine to deploy to DO

set -e

# Configuration
DROPLET_IP="${1}"
DROPLET_USER="gympal"

if [ -z "$DROPLET_IP" ]; then
    echo "Usage: ./deploy_to_do.sh YOUR_DROPLET_IP"
    echo "Example: ./deploy_to_do.sh 192.168.1.100"
    exit 1
fi

echo "🚀 Deploying to DigitalOcean droplet: $DROPLET_IP"
echo "================================================"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf /tmp/gympal-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.git' \
    --exclude='db.sqlite3' \
    server/ frontend/ docs/

# Copy to server
echo "📤 Uploading to server..."
scp /tmp/gympal-deploy.tar.gz $DROPLET_USER@$DROPLET_IP:/tmp/

# Deploy on server
echo "🔧 Running deployment on server..."
ssh $DROPLET_USER@$DROPLET_IP 'bash -s' << 'ENDSSH'
set -e

echo "📂 Extracting files..."
cd /home/gympal
mkdir -p gym-app-new
cd gym-app-new
tar -xzf /tmp/gympal-deploy.tar.gz

echo "🐍 Setting up Python backend..."
cd server
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt -q

echo "⚙️  Running migrations..."
python manage.py migrate --noinput

echo "📊 Collecting static files..."
python manage.py collectstatic --noinput -q

echo "🎨 Building frontend..."
cd ../frontend
npm install -q
VITE_API_BASE_URL=/api npm run build

echo "🔄 Deploying new version..."
cd /home/gympal
rm -rf gym-app-backup
mv gym-app gym-app-backup 2>/dev/null || true
mv gym-app-new gym-app

echo "♻️  Restarting services..."
sudo systemctl restart gympal 2>/dev/null || echo "Note: gympal service not configured yet"
sudo systemctl restart nginx 2>/dev/null || echo "Note: nginx not configured yet"

echo "✅ Deployment complete!"
ENDSSH

# Cleanup
rm /tmp/gympal-deploy.tar.gz

echo ""
echo "✅ Deployment successful!"
echo "🌐 Visit: http://$DROPLET_IP"
echo ""
echo "📝 Next steps:"
echo "   1. Configure gunicorn systemd service (see docs/DEPLOYMENT.md)"
echo "   2. Configure nginx (see docs/DEPLOYMENT.md)"
echo "   3. Set up SSL with Let's Encrypt"
echo ""
