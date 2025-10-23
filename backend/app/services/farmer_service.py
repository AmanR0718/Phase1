import re
from datetime import datetime
from fastapi import HTTPException
from ..utils.crypto_utils import encrypt_deterministic, hmac_hash

ZAMBIA_LAT_RANGE = (-18.0, -8.0)
ZAMBIA_LON_RANGE = (21.0, 34.0)
NRC_PATTERN = re.compile(r"^\d{6}/\d{2}/\d$")

class FarmerService:
    @staticmethod
    def validate_farmer_data(data: dict):
        errors = []

        personal = data.get("personal_info", {})
        address = data.get("address", {})
        nrc = data.get("nrc_number")
        dob = personal.get("date_of_birth")
        phone = personal.get("phone_primary")

        if nrc and not NRC_PATTERN.match(nrc):
            errors.append("Invalid NRC format, expected ######/##/#")

        if dob:
            try:
                age = (datetime.utcnow() - datetime.strptime(dob, "%Y-%m-%d")).days // 365
                if age < 18:
                    errors.append("Farmer must be at least 18 years old")
            except ValueError:
                errors.append("Invalid date_of_birth format (YYYY-MM-DD)")

        lat, lon = address.get("gps_latitude"), address.get("gps_longitude")
        if lat and lon:
            if not (ZAMBIA_LAT_RANGE[0] <= lat <= ZAMBIA_LAT_RANGE[1]):
                errors.append("Latitude out of Zambia bounds")
            if not (ZAMBIA_LON_RANGE[0] <= lon <= ZAMBIA_LON_RANGE[1]):
                errors.append("Longitude out of Zambia bounds")

        if not phone or not phone.startswith("+260"):
            errors.append("Phone must start with country code +260")

        if errors:
            raise HTTPException(status_code=400, detail={"message": "Validation failed", "errors": errors})

        return True

    @staticmethod
    def encrypt_sensitive_fields(farmer: dict):
        if farmer.get("nrc_number"):
            val = farmer["nrc_number"]
            farmer["nrc_encrypted"] = encrypt_deterministic(val)
            farmer["nrc_hash"] = hmac_hash(val)
            farmer.pop("nrc_number", None)
        return farmer
