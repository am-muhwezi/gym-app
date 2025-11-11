#!/bin/bash
# Test script for GymPal API
# Demonstrates multi-trainer support

BASE_URL="http://localhost:8000/api"

echo "🧪 Testing GymPal API - Multi-Trainer Support"
echo "=============================================="
echo

# Get admin trainer ID
echo "1️⃣  Getting admin trainer ID..."
ADMIN_ID=$(python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymapp.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
admin = User.objects.filter(username='admin').first()
print(admin.id if admin else '')
")

echo "   Admin Trainer ID: $ADMIN_ID"
echo

# Create client for admin trainer
echo "2️⃣  Creating client for admin trainer..."
curl -X POST "$BASE_URL/clients/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "trainer_id": '$ADMIN_ID'
  }' | python -m json.tool
echo
echo

# Create second trainer
echo "3️⃣  Creating second trainer..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymapp.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
trainer2, created = User.objects.get_or_create(
    username='trainer2',
    defaults={
        'email': 'trainer2@gympal.com',
        'phone_number': '+2345678901'
    }
)
if created:
    trainer2.set_password('trainer123')
    trainer2.save()
    print(f'✅ Created trainer2 with ID: {trainer2.id}')
else:
    print(f'ℹ️  Trainer2 already exists with ID: {trainer2.id}')
print(trainer2.id)
" > /tmp/trainer2_id.txt

TRAINER2_ID=$(cat /tmp/trainer2_id.txt | tail -1)
echo "   Trainer2 ID: $TRAINER2_ID"
echo

# Create client for trainer2
echo "4️⃣  Creating client for trainer2..."
curl -X POST "$BASE_URL/clients/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "2345678901",
    "trainer_id": '$TRAINER2_ID'
  }' | python -m json.tool
echo
echo

# List ALL clients
echo "5️⃣  Listing ALL clients..."
curl -X GET "$BASE_URL/clients/" | python -m json.tool
echo
echo

# List clients for admin only
echo "6️⃣  Listing clients for admin trainer only..."
curl -X GET "$BASE_URL/clients/?trainer_id=$ADMIN_ID" | python -m json.tool
echo
echo

# List clients for trainer2 only
echo "7️⃣  Listing clients for trainer2 only..."
curl -X GET "$BASE_URL/clients/?trainer_id=$TRAINER2_ID" | python -m json.tool
echo
echo

# Get statistics
echo "8️⃣  Getting statistics..."
curl -X GET "$BASE_URL/clients/statistics/" | python -m json.tool
echo
echo

echo "✅ API testing complete!"
echo
echo "🔑 Key points:"
echo "   - Each trainer has their own clients"
echo "   - Use 'trainer_id' parameter to filter clients"
echo "   - Pass 'trainer_id' when creating clients (for testing)"
echo "   - When auth is enabled, clients are automatically filtered by logged-in trainer"
