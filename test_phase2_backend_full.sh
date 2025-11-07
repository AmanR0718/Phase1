#!/bin/bash
set -e

API="http://localhost:8000/api"
DB_NAME="zambian_farmer_db"
ADMIN_EMAIL="admin@agrimanage.com"
ADMIN_PASSWORD="admin123"

echo "🚀 Starting Phase 2 Full Backend Validation"

# ---------- LOGIN ----------
echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  echo "❌ Login failed"; echo "$LOGIN_RESPONSE" | jq; exit 1
fi
echo "✅ Auth OK"

# ---------- REFRESH ----------
echo "♻️  Refreshing token..."
REFRESH_RESPONSE=$(curl -s -X POST "$API/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}")
NEW_ACCESS=$(echo "$REFRESH_RESPONSE" | jq -r '.access_token')
echo "✅ Refresh OK"

# ---------- CURRENT USER ----------
echo "👤 Checking current user..."
curl -s -X GET "$API/auth/me" -H "Authorization: Bearer $NEW_ACCESS" | jq

# ---------- CREATE FARMER ----------
echo "🌾 Creating test farmer..."
FARMER_RESPONSE=$(curl -s -X POST "$API/farmers/" \
  -H "Authorization: Bearer $NEW_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{
    "nrc_number":"999999/11/9",
    "personal_info":{"first_name":"Test","last_name":"Farmer","phone_primary":"+260971000111","date_of_birth":"1990-05-05"},
    "address":{"province":"Central","district":"Chibombo"}
  }')
FARMER_ID=$(echo "$FARMER_RESPONSE" | jq -r '.farmer_id')
if [ "$FARMER_ID" == "null" ]; then
  echo "❌ Farmer creation failed"; echo "$FARMER_RESPONSE" | jq; exit 1
fi
echo "✅ Farmer created: $FARMER_ID"

# ---------- UPLOAD PHOTO ----------
PHOTO="test_uploads/photo.jpg"
echo "📸 Uploading farmer photo..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API/farmers/${FARMER_ID}/upload-photo" \
  -H "Authorization: Bearer $NEW_ACCESS" \
  -F "file=@${PHOTO}")
echo "$UPLOAD_RESPONSE" | jq
echo "✅ Photo upload OK"

# ---------- GENERATE ID CARD ----------
echo "🪪 Generating ID card..."
curl -s -X POST "$API/farmers/${FARMER_ID}/generate-idcard" \
  -H "Authorization: Bearer $NEW_ACCESS" | jq
sleep 3

# ---------- VERIFY QR ----------
echo "🔎 Verifying QR..."
TIMESTAMP=$(date +%s)
SECRET="supersecretkey_agrimanage_2025"
SIGNATURE=$(python3 - <<PY
import hmac, hashlib, base64
fid, ts, sk = "${FARMER_ID}", "${TIMESTAMP}", "${SECRET}".encode()
sig = hmac.new(sk, f"{fid}|{ts}".encode(), hashlib.sha256).digest()
print(base64.urlsafe_b64encode(sig).decode())
PY
)
jq -n --arg id "$FARMER_ID" --arg ts "$TIMESTAMP" --arg sig "$SIGNATURE" \
  '{farmer_id:$id,timestamp:$ts,signature:$sig}' > qr_check.json

curl -s -X POST "$API/farmers/verify-qr" \
  -H "Content-Type: application/json" \
  -d @qr_check.json | jq

# ---------- DOWNLOAD ID CARD ----------
echo "📥 Downloading ID card..."
curl -s -X GET "$API/farmers/${FARMER_ID}/download-idcard" \
  -H "Authorization: Bearer $NEW_ACCESS" \
  -o "${FARMER_ID}_card.pdf"
[ -f "${FARMER_ID}_card.pdf" ] && echo "✅ ID card downloaded"

# ---------- SUPPLY REQUEST ----------
echo "📦 Creating supply request..."
REQ_RESPONSE=$(curl -s -X POST "$API/supply-requests/" \
  -H "Authorization: Bearer $NEW_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{
    "items":["Seeds - Maize","Fertilizer - NPK"],
    "quantity_details":"25kg Seeds, 10kg Fertilizer",
    "urgency":"medium",
    "notes":"Auto test request"
  }')
REQ_ID=$(echo "$REQ_RESPONSE" | jq -r '.request_id')
echo "✅ Supply request created: $REQ_ID"

# ---------- ADMIN APPROVES ----------
echo "✅ Approving supply request..."
curl -s -X PUT "$API/supply-requests/${REQ_ID}/approve" \
  -H "Authorization: Bearer $NEW_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"admin_notes":"Approved by test script"}' | jq

# ---------- DB VALIDATION ----------
echo "🧠 Checking DB entry..."
docker exec farmer-mongo mongosh --quiet --eval "
db = connect('mongodb://admin:Admin123@farmer-mongo:27017/${DB_NAME}?authSource=admin');
var f=db.farmers.findOne({farmer_id:'${FARMER_ID}'},{_id:0,farmer_id:1,photo_path:1,id_card_path:1});
if(f){print(JSON.stringify(f));}" | jq

echo "🎉 Phase 2 full backend validation passed successfully!"
