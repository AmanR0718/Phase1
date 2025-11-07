#!/bin/bash
set -e

API="http://localhost:8000/api/auth"
ADMIN_EMAIL="admin@agrimanage.com"
ADMIN_PASSWORD="admin123"

echo "🚀 Starting Authentication Lifecycle Test"

# --- LOGIN ---
echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  echo "❌ Login failed. Response:"; echo "$LOGIN_RESPONSE" | jq
  exit 1
fi

echo "✅ Login successful"
echo "   Access Token:  ${ACCESS_TOKEN:0:30}..."
echo "   Refresh Token: ${REFRESH_TOKEN:0:30}..."

# --- REFRESH TOKEN ---
echo "♻️  Requesting new access token from refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$API/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.access_token')

if [ -z "$NEW_ACCESS_TOKEN" ] || [ "$NEW_ACCESS_TOKEN" == "null" ]; then
  echo "❌ Refresh failed. Response:"; echo "$REFRESH_RESPONSE" | jq
  exit 1
fi

echo "✅ Refresh successful"
echo "   New Access Token: ${NEW_ACCESS_TOKEN:0:30}..."

# --- VERIFY CURRENT USER ---
echo "👤 Fetching current user via /me..."
USER_RESPONSE=$(curl -s -X GET "$API/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

if echo "$USER_RESPONSE" | grep -q '"email"'; then
  echo "✅ User validation successful"
  echo "$USER_RESPONSE" | jq
else
  echo "❌ Failed to fetch current user"
  echo "$USER_RESPONSE" | jq
  exit 1
fi

echo "🎉 All authentication lifecycle tests passed successfully!"
