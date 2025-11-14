import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import farmerService from "@/services/farmer.service";
import Step1Personal from "./FarmerRegistration/Step1Personal";
import Step2Address from "./FarmerRegistration/Step2Address";
import Step3Farm from "./FarmerRegistration/Step3Farm";
import Step4Preview from "./FarmerRegistration/Step4Preview";

export default function EditFarmer() {
  const { farmerId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await farmerService.getFarmer(farmerId!);

        // Transform backend → wizard format
        setForm({
          personal: {
            first_name: data.personal_info?.first_name || "",
            last_name: data.personal_info?.last_name || "",
            phone_primary: data.personal_info?.phone_primary || "",
            phone_secondary: data.personal_info?.phone_secondary || "",
            email: data.personal_info?.email || "",
            date_of_birth: data.personal_info?.date_of_birth || "",
            gender: data.personal_info?.gender || "",
            nrc_number: data.nrc_number || "",
          },
          address: {
            province_code: data.address?.province_code || "",
            province_name: data.address?.province || "",
            district_code: data.address?.district_code || "",
            district_name: data.address?.district || "",
            chiefdom_code: data.address?.chiefdom_code || "",
            chiefdom_name: data.address?.chiefdom || "",
            village: data.address?.village || "",
            street_village: data.address?.street_village || "",
            postal_code: data.address?.postal_code || "",
            gps_latitude: data.address?.gps_latitude || null,
            gps_longitude: data.address?.gps_longitude || null,
          },
          farm: {
            farm_size_hectares: data.farm_details?.farm_size_hectares || 0,
            crops_grown: data.farm_details?.crops_grown || [],
            livestock: data.farm_details?.livestock || [],
            has_irrigation: data.farm_details?.has_irrigation || false,
            farming_experience_years: data.farm_details?.farming_experience_years || 0,
          },
        });
      } catch (err: any) {
        console.error("Error loading farmer:", err);
        setError(err.response?.data?.detail || "Failed to load farmer.");
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) {
      load();
    }
  }, [farmerId]);

  const update = (section: string, values: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev?.[section], ...values },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      // Transform wizard format → backend format
      const payload = {
        personal_info: {
          first_name: form.personal.first_name,
          last_name: form.personal.last_name,
          phone_primary: form.personal.phone_primary,
          phone_secondary: form.personal.phone_secondary,
          email: form.personal.email,
          date_of_birth: form.personal.date_of_birth,
          gender: form.personal.gender,
        },
        nrc_number: form.personal.nrc_number,
        permanent_address: {
          province_code: form.address.province_code,
          province: form.address.province_name,
          district_code: form.address.district_code,
          district: form.address.district_name,
          chiefdom_code: form.address.chiefdom_code,
          chiefdom: form.address.chiefdom_name,
          village: form.address.village,
          street_village: form.address.street_village,
          postal_code: form.address.postal_code,
          gps_latitude: form.address.gps_latitude,
          gps_longitude: form.address.gps_longitude,
        },
        farm_details: {
          farm_size_hectares: form.farm.farm_size_hectares,
          crops_grown: form.farm.crops_grown,
          livestock: form.farm.livestock,
          has_irrigation: form.farm.has_irrigation,
          farming_experience_years: form.farm.farming_experience_years,
        },
      };

      await farmerService.updateFarmer(farmerId!, payload);

      // Show success and redirect after 2 seconds
      alert("✅ Farmer updated successfully!");
      
      setTimeout(() => {
        navigate("/farmers/");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating farmer:", err);
      setError(err.response?.data?.detail || "❌ Failed to save changes.");
      alert(err.response?.data?.detail || "❌ Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f7f7f7",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "20px",
            }}
          >
            ⏳
          </div>
          <div style={{ fontSize: "18px", color: "#666" }}>Loading farmer data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", padding: 20, background: "#f7f7f7" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "#fff",
            padding: 24,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "15px",
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
          <button
            onClick={() => navigate("/farmers/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ← Back to Farmers List
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  const Preview: any = Step4Preview;

  return (
    <div style={{ minHeight: "100vh", padding: 20, background: "#f7f7f7" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginBottom: "15px",
              padding: "8px 16px",
              backgroundColor: "#6B7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, color: "#1F2937" }}>Edit Farmer</h2>
          <div style={{ marginTop: 8, color: "#6B7280", fontSize: "14px" }}>
            Step {step} of 4
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: "4px",
            backgroundColor: "#E5E7EB",
            borderRadius: "2px",
            marginBottom: "30px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#2563EB",
              width: `${(step / 4) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Step Content */}
        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "15px",
              borderRadius: "6px",
              marginBottom: "20px",
              border: "1px solid #FCA5A5",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {step === 1 && (
          <Step1Personal
            data={form.personal}
            onNext={(vals) => {
              update("personal", vals);
              setStep(2);
            }}
            onBack={() => navigate("/farmers")}
          />
        )}

        {step === 2 && (
          <Step2Address
            data={form.address}
            onBack={() => setStep(1)}
            onNext={(vals) => {
              update("address", vals);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <Step3Farm
            data={form.farm}
            onBack={() => setStep(2)}
            onNext={(vals) => {
              update("farm", vals);
              setStep(4);
            }}
          />
        )}
        {step === 4 && (
          <Preview
            data={form}
            onBack={() => setStep(3)}
            onSubmitStart={() => setLoading(true)}
            onSubmitEnd={() => setLoading(false)}
            onSubmit={handleSave}
            submitButtonText="💾 Save Changes"
          />
        )}
      </div>
    </div>
  );
}