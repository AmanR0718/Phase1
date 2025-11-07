import re
from datetime import datetime
from fastapi import HTTPException
from ..utils.crypto_utils import encrypt_deterministic, hmac_hash

# =======================================================
# Zambia-specific validation constants
# =======================================================
ZAMBIA_LAT_RANGE = (-18.0, -8.0)
ZAMBIA_LON_RANGE = (21.0, 34.0)
NRC_PATTERN = re.compile(r"^\d{6}/\d{2}/\d$")


class FarmerService:
    """
    Handles business logic for farmer data:
      - Validation (NRC, GPS, age, phone)
      - Encryption of sensitive fields
    """

    # =======================================================
    # 1️⃣ Validation
    # =======================================================
    @staticmethod
    def validate_farmer_data(data: dict) -> bool:
        """
        Validate farmer data before inserting into MongoDB.
        Raises HTTPException(400) if validation fails.
        """
        errors = []

        personal = data.get("personal_info", {})
        address = data.get("address", {})
        nrc = data.get("nrc_number")
        dob = personal.get("date_of_birth")
        phone = personal.get("phone_primary")

        # --- NRC format ---
        if nrc and not NRC_PATTERN.match(nrc):
            errors.append("Invalid NRC format (expected ######/##/#)")

        # --- Date of birth / age ---
        if dob:
            try:
                age = (datetime.utcnow() - datetime.strptime(dob, "%Y-%m-%d")).days // 365
                if age < 18:
                    errors.append("Farmer must be at least 18 years old")
            except ValueError:
                errors.append("Invalid date_of_birth format (expected YYYY-MM-DD)")

        # --- GPS coordinates ---
        lat, lon = address.get("gps_latitude"), address.get("gps_longitude")
        if lat is not None and lon is not None:
            try:
                lat = float(lat)
                lon = float(lon)
                if not (ZAMBIA_LAT_RANGE[0] <= lat <= ZAMBIA_LAT_RANGE[1]):
                    errors.append("Latitude out of Zambia bounds (-18 to -8)")
                if not (ZAMBIA_LON_RANGE[0] <= lon <= ZAMBIA_LON_RANGE[1]):
                    errors.append("Longitude out of Zambia bounds (21 to 34)")
            except (TypeError, ValueError):
                errors.append("Invalid GPS coordinates (must be numbers)")

        # --- Phone number ---
        if not phone or not str(phone).startswith("+260"):
            errors.append("Phone must start with country code +260")

        # --- Raise errors if any ---
        if errors:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Validation failed",
                    "errors": errors,
                },
            )

        return True

    # =======================================================
    # 2️⃣ Encryption
    # =======================================================
    @staticmethod
    def encrypt_sensitive_fields(farmer: dict) -> dict:
        """
        Encrypt NRC number and store secure hash.
        Removes plaintext NRC before saving to DB.
        """
        nrc_value = farmer.get("nrc_number")
        if nrc_value:
            farmer["nrc_encrypted"] = encrypt_deterministic(nrc_value)
            farmer["nrc_hash"] = hmac_hash(nrc_value)
            farmer.pop("nrc_number", None)

        return farmer
