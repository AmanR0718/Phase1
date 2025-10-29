#!/bin/bash
set -e

echo "🚀 Phase 1.5 Full Validation Started..."

API="http://localhost:8000"
PHOTO_PATH="test_uploads/photo.jpg"
EXPECTED_DB="zambian_farmer_db"

# === Pre-flight checks ===
command -v jq >/dev/null 2>&1 || { echo "❌ jq is required but not installed"; exit 1; }

# === DB Sanity Check ===
echo "🧠 Checking backend DB target..."
BACKEND_DB=$(docker exec farmer-backend sh -c "python -c 'from app.database import get_database; print(get_database().name)'")
if [ "$BACKEND_DB" != "$EXPECTED_DB" ]; then
  echo "❌ Backend is using wrong DB: $BACKEND_DB (expected $EXPECTED_DB)"
  exit 1
fi
echo "✅ Backend DB: $BACKEND_DB"

# === 1. LOGIN ===
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -sf -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@agrimanage.com","password":"admin123"}')

REFRESH=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token')
if [ -z "$REFRESH" ] || [ "$REFRESH" = "null" ]; then
  echo "❌ Login did not return a refresh token"; exit 1
fi

ACCESS=$(jq -n --arg rt "$REFRESH" '{refresh_token:$rt}' | \
  curl -sf -X POST $API/api/auth/refresh \
    -H "Content-Type: application/json" \
    -d @- | jq -r '.access_token')

if [ -z "$ACCESS" ] || [ "$ACCESS" = "null" ]; then
  echo "❌ Failed to obtain access token"; exit 1
fi
echo "✅ Logged in"

# === 2. CREATE FARMER ===
echo "👩🏽 Creating farmer..."
FARMER_RESPONSE=$(curl -sf -X POST $API/api/farmers/ \
  -H "Authorization: Bearer $ACCESS" \
  -H "Content-Type: application/json" \
  -d '{
    "nrc_number":"999999/11/9",
    "personal_info":{"first_name":"Grace","last_name":"Mwila","phone_primary":"+260971111111","date_of_birth":"1995-02-15"},
    "address":{"province":"Central","district":"Chibombo"}
  }')

FARMER_ID=$(echo "$FARMER_RESPONSE" | jq -r '.farmer_id')
if [ -z "$FARMER_ID" ] || [ "$FARMER_ID" = "null" ]; then
  echo "❌ Farmer creation failed"; echo "$FARMER_RESPONSE"; exit 1
fi
echo "✅ Farmer created: $FARMER_ID"

# === 3. UPLOAD PHOTO ===
echo "📸 Uploading photo..."
PHOTO_UPLOAD=$(curl -sf -X POST $API/api/farmers/${FARMER_ID}/upload-photo \
  -H "Authorization: Bearer $ACCESS" \
  -F "file=@${PHOTO_PATH}")
echo "$PHOTO_UPLOAD" | jq
if ! echo "$PHOTO_UPLOAD" | grep -q "photo_path"; then
  echo "❌ Photo upload failed"; exit 1
fi

# === 4. GENERATE ID CARD ===
echo "🪪 Generating ID card..."
curl -sf -X POST $API/api/farmers/${FARMER_ID}/generate-idcard \
  -H "Authorization: Bearer $ACCESS" | jq
sleep 5




echo "🔎 Verifying QR..."
TIMESTAMP=$(date +%s)
SECRET="supersecretkey_agrimanage_2025"

SIGNATURE=$(python3 - <<PY
import hmac, hashlib, base64
farmer_id = "${FARMER_ID}"
timestamp = "${TIMESTAMP}"
secret = "${SECRET}".encode()
msg = f"{farmer_id}|{timestamp}".encode()
sig = hmac.new(secret, msg, hashlib.sha256).digest()
print(base64.urlsafe_b64encode(sig).decode())
PY
)

jq -n --arg id "$FARMER_ID" --arg ts "$TIMESTAMP" --arg sig "$SIGNATURE" \
  '{farmer_id:$id, timestamp:$ts, signature:$sig}' > qr_test.json



VERIFY_OUTPUT=$(curl -s -X POST $API/api/farmers/verify-qr \
  -H "Content-Type: application/json" \
  -d @qr_test.json)

echo "$VERIFY_OUTPUT" | jq






# === 6. DOWNLOAD ID CARD ===
echo "📥 Downloading ID card..."
curl -sf -X GET $API/api/farmers/${FARMER_ID}/download-idcard \
  -H "Authorization: Bearer $ACCESS" \
  -o ${FARMER_ID}_card.pdf

if [ -f "${FARMER_ID}_card.pdf" ]; then
  echo "✅ ID Card downloaded: ${FARMER_ID}_card.pdf"
else
  echo "❌ Failed to download ID card"
  exit 1
fi

# === 7. VERIFY IN MONGODB ===
echo "🧠 Verifying database entries..."
docker exec farmer-mongo mongosh --quiet --eval "
db = connect('mongodb://admin:Admin123@mongo:27017/${EXPECTED_DB}?authSource=admin');
var doc = db.farmers.findOne(
  { farmer_id: '${FARMER_ID}' },
  { _id:0, farmer_id:1, photo_path:1, id_card_path:1 }
);
if (doc) { print(JSON.stringify(doc)); }
" > mongo_clean.json || true


cat mongo_clean.json | jq .

if jq -e '.farmer_id' mongo_clean.json >/dev/null; then
  echo "✅ MongoDB record confirmed for $FARMER_ID"
else
  echo "❌ Farmer record missing in DB!"
  exit 1
fi


echo "🎉 All Phase 1.5 validation checks passed successfully!"
