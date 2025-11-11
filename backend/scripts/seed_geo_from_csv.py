import os
import pandas as pd
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URL") or os.getenv("MONGODB_URI")
DB_NAME = "zambian_farmer_db"

# File paths (assuming you uploaded them into /workspaces/Phase1/backend/data/)
BASE_PATH = "/workspaces/Phase1/backend/data"
FILES = {
    "provinces": os.path.join(BASE_PATH, "provinces.csv"),
    "districts": os.path.join(BASE_PATH, "districts.csv"),
    "chiefdoms": os.path.join(BASE_PATH, "chiefdoms.csv"),
}


async def seed_geo_data():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Clean existing data (optional)
    await db.provinces.delete_many({})
    await db.districts.delete_many({})
    await db.chiefdoms.delete_many({})

    # --- 1️⃣ Seed Provinces ---
    provinces_df = pd.read_csv(FILES["provinces"])
    provinces = provinces_df.to_dict(orient="records")

    for p in provinces:
        await db.provinces.update_one(
            {"province_id": p["province_id"]},
            {"$set": p},
            upsert=True,
        )

    # --- 2️⃣ Seed Districts ---
    districts_df = pd.read_csv(FILES["districts"])
    districts = districts_df.to_dict(orient="records")

    for d in districts:
        province = await db.provinces.find_one({"province_id": d["province_id"]})
        d["province_ref"] = province["_id"] if province else None
        await db.districts.update_one(
            {"district_id": d["district_id"]},
            {"$set": d},
            upsert=True,
        )

    # --- 3️⃣ Seed Chiefdoms ---
    chiefdoms_df = pd.read_csv(FILES["chiefdoms"])
    chiefdoms = chiefdoms_df.to_dict(orient="records")

    for c in chiefdoms:
        district = await db.districts.find_one({"district_id": c["district_id"]})
        province = await db.provinces.find_one({"province_id": c["province_id"]})
        c["district_ref"] = district["_id"] if district else None
        c["province_ref"] = province["_id"] if province else None
        await db.chiefdoms.update_one(
            {"chiefdom_id": c["chiefdom_id"]},
            {"$set": c},
            upsert=True,
        )

    # --- Summary ---
    print("✅ Geo data seeded successfully.")
    print(f"   Provinces: {await db.provinces.count_documents({})}")
    print(f"   Districts: {await db.districts.count_documents({})}")
    print(f"   Chiefdoms: {await db.chiefdoms.count_documents({})}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_geo_data())
