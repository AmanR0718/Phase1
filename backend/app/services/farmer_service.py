# backend/app/services/farmer_service.py
"""Farmer service containing all business logic."""

import re
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException
from app.utils.crypto_utils import encrypt_deterministic, hmac_hash

# Validation constants
ZAMBIA_LAT_RANGE = (-18.0, -8.0)
ZAMBIA_LON_RANGE = (21.0, 34.0)
NRC_PATTERN = re.compile(r"^\d{6}/\d{2}/\d$")


class FarmerService:
    """Handles all farmer-related business logic."""

    @staticmethod
    async def create(farmer, db):
        """Create a new farmer with validation and encryption."""
        data = farmer.dict()

        # Validate data
        FarmerService._validate_farmer_data(data)

        # Encrypt sensitive fields
        data = FarmerService._encrypt_sensitive_fields(data)

        # Add metadata
        data["farmer_id"] = "ZM" + uuid4().hex[:8].upper()
        data["created_at"] = datetime.utcnow()
        data["registration_status"] = "pending"

        # Insert into database
        result = await db.farmers.insert_one(data)
        created = await db.farmers.find_one({"_id": result.inserted_id})
        created["_id"] = str(created["_id"])

        return created

    @staticmethod
    async def list_all(skip: int, limit: int, db):
        """List all farmers with pagination."""
        farmers = (
            await db.farmers.find({}, {"_id": 0})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        )
        total = await db.farmers.count_documents({})
        return {"results": farmers, "count": total, "skip": skip, "limit": limit}

    @staticmethod
    async def get_by_id(farmer_id: str, db):
        """Get a single farmer by ID."""
        farmer = await db.farmers.find_one({"farmer_id": farmer_id})
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer not found")
        farmer["_id"] = str(farmer["_id"])
        return farmer

    @staticmethod
    async def update(farmer_id: str, updates, db):
        """Update farmer details."""
        update_data = updates.dict(exclude_none=True) if hasattr(updates, 'dict') else updates
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        result = await db.farmers.update_one(
            {"farmer_id": farmer_id}, {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Farmer not found or no changes")

        return await FarmerService.get_by_id(farmer_id, db)

    @staticmethod
    async def delete(farmer_id: str, db):
        """Delete a farmer."""
        result = await db.farmers.delete_one({"farmer_id": farmer_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Farmer not found")
        return {"message": f"Farmer {farmer_id} deleted successfully"}

    # =======================================================
    # Private Validation Methods
    # =======================================================

    @staticmethod
    def _validate_farmer_data(data: dict) -> bool:
        """Validate farmer data."""
        errors = []
        personal = data.get("personal_info", {})
        address = data.get("address", {})

        # NRC validation
        nrc = personal.get("nrc")
        if nrc and not NRC_PATTERN.match(nrc):
            errors.append("Invalid NRC format (expected ######/##/#)")

        # Age validation
        dob = personal.get("date_of_birth")
        if dob:
            try:
                age = (datetime.utcnow() - datetime.strptime(dob, "%Y-%m-%d")).days // 365
                if age < 18:
                    errors.append("Farmer must be at least 18 years old")
            except ValueError:
                errors.append("Invalid date_of_birth format (expected YYYY-MM-DD)")

        # GPS validation
        lat = address.get("gps_latitude")
        lon = address.get("gps_longitude")
        if lat is not None and lon is not None:
            try:
                lat, lon = float(lat), float(lon)
                if not (ZAMBIA_LAT_RANGE[0] <= lat <= ZAMBIA_LAT_RANGE[1]):
                    errors.append("Latitude out of Zambia bounds")
                if not (ZAMBIA_LON_RANGE[0] <= lon <= ZAMBIA_LON_RANGE[1]):
                    errors.append("Longitude out of Zambia bounds")
            except (TypeError, ValueError):
                errors.append("Invalid GPS coordinates")

        # Phone validation
        phone = personal.get("phone_primary")
        if phone and not str(phone).startswith("+260"):
            errors.append("Phone must start with +260")

        if errors:
            raise HTTPException(status_code=400, detail={"errors": errors})

        return True

    @staticmethod
    def _encrypt_sensitive_fields(farmer: dict) -> dict:
        """Encrypt NRC in personal_info."""
        personal = farmer.get("personal_info", {})
        nrc = personal.get("nrc")

        if nrc:
            try:
                personal["nrc_encrypted"] = encrypt_deterministic(nrc)
                personal["nrc_hash"] = hmac_hash(nrc)
                personal.pop("nrc", None)
                farmer["personal_info"] = personal
            except Exception as e:
                # If encryption fails, just skip it (for development)
                print(f"Warning: Encryption failed: {e}")
                pass

        return farmer
