#!/bin/bash
# ============================================
# Build and Push Docker Image to ECR
# ============================================

# SAFETY GUARD: Build & push to ECR temporarily DISABLED
echo "[SAFE-GUARD] AWS build-and-push disabled. Remove guard to re-enable." >&2
exit 0

set -e

REGION="ap-south-1"
ACCOUNT_ID="701708343469"
ECR_REPO="cem-backend"
IMAGE_TAG="latest"

echo "🐳 Building and pushing Docker image..."

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build Docker image
echo "🔨 Building Docker image..."
cd /workspaces/Phase1/backend
docker build -t $ECR_REPO:$IMAGE_TAG -f Dockerfile .

# --------------------------------------------------
# Build frontend (optional) - inject VITE_MOBILE_API_URL
# --------------------------------------------------
echo "📦 Building frontend (optional) with VITE_MOBILE_API_URL..."
FRONTEND_DIR="/workspaces/Phase1/frontend"
if [ -d "$FRONTEND_DIR" ]; then
	if command -v node >/dev/null 2>&1; then
		echo "➡️  Building frontend in $FRONTEND_DIR"
		pushd "$FRONTEND_DIR" >/dev/null

		# Install dependencies if node_modules missing
		if [ ! -d "node_modules" ]; then
			npm ci
		fi

		# Require a configured production URL; never bake a stale endpoint into a build.
		if [ -z "$VITE_API_BASE_URL" ] && [ -z "$VITE_API_PROD_URL" ] && [ -z "$VITE_MOBILE_API_URL" ]; then
			echo "Set VITE_API_BASE_URL, VITE_API_PROD_URL, or VITE_MOBILE_API_URL before building." >&2
			exit 1
		fi

		# Run build
		npm run build

		# Optional: upload to S3 if S3_BUCKET is configured
		if [ -n "$S3_BUCKET" ]; then
			echo "📤 Uploading built frontend to S3 bucket: $S3_BUCKET"
			if command -v aws >/dev/null 2>&1; then
				aws s3 sync dist/ s3://$S3_BUCKET/ --delete --acl public-read
				echo "✅ Frontend uploaded to s3://$S3_BUCKET/"
			else
				echo "⚠️ aws cli not found; skipping s3 upload"
			fi
		else
			echo "ℹ️ S3_BUCKET not set; skipping frontend upload"
		fi

		popd >/dev/null
	else
		echo "⚠️ Node.js not installed in this environment; skipping frontend build"
	fi
else
	echo "ℹ️ Frontend directory not found; skipping frontend build"
fi

# Tag for ECR
echo "🏷️  Tagging image..."
docker tag $ECR_REPO:$IMAGE_TAG $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG

# Push to ECR
echo "📤 Pushing to ECR..."
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG

echo ""
echo "✅ Docker image pushed successfully!"
echo "   Image: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG"
echo ""
echo "Next: Run 06-deploy-ecs-service.sh"
