// frontend/src/pages/FarmerRegistration/Step4Preview.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import farmerService from "@/services/farmer.service";
import axios from "axios";

type Props = {
  data: {
    household: {};
    personal: any;
    address: any;
    farm: any;
    photo?: File | null;  // ✅ NEW: Photo file
    documents?: Array<{ type: string; file: File }>; // ✅ NEW: Document files
  };
  onBack: () => void;
  onSubmitStart?: () => void;
  onSubmitEnd?: () => void;
  onSubmit?: () => Promise<void>;
  submitButtonText?: string;
};

export default function Step4Preview({ 
  data, 
  onBack, 
  onSubmitStart, 
  onSubmitEnd,
  onSubmit,
  submitButtonText = "✅ Submit & Create Farmer" 
}: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(""); // ✅ NEW: Track upload steps

  // Create farmer with photo, documents, and ID card generation
  const createFarmer = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Step 1: Create basic farmer record
    setUploadProgress("Creating farmer record...");
    
    const payload = {
      personal_info: {
        first_name: data.personal?.first_name || "",
        last_name: data.personal?.last_name || "",
        phone_primary: data.personal?.phone_primary || "",
        phone_secondary: data.personal?.phone_secondary || null,
        email: data.personal?.email || null,
        nrc: data.personal?.nrc || "",
        date_of_birth: data.personal?.date_of_birth || "",
        gender: data.personal?.gender || "other",
      },
      address: {
        province: data.address?.province_id || data.address?.province_name || "",
        province_name: data.address?.province_name || "",
        district: data.address?.district_id || data.address?.district_name || "",
        district_name: data.address?.district_name || "",
        chiefdom_id: data.address?.chiefdom_id || null,
        chiefdom_name: data.address?.chiefdom_name || null,
        village: data.address?.village || "",
        street: data.address?.street || null,
        gps_latitude: data.address?.gps_latitude || null,
        gps_longitude: data.address?.gps_longitude || null,
      },
      farm_info: {
        farm_size_hectares: parseFloat(data.farm?.farm_size_hectares || "0"),
        crops_grown: data.farm?.crops_grown || [],
        livestock_types: data.farm?.livestock_types || [],
        has_irrigation: data.farm?.has_irrigation || false,
        years_farming: parseInt(data.farm?.years_farming || "0"),
      },
      household_info: data.household || {},
    };

    console.log("📤 Submitting farmer payload:", payload);
    const createResponse = await farmerService.create(payload);
    const farmer_id = createResponse.farmer_id;

    console.log("✅ Farmer created with ID:", farmer_id);

    // Step 2: Upload photo if exists
    if (data.photo) {
      setUploadProgress("Uploading photo...");
      const photoFormData = new FormData();
      photoFormData.append('file', data.photo);

      try {
        await axios.post(
          `http://localhost:8000/api/farmers/${farmer_id}/upload-photo`,
          photoFormData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        console.log("✅ Photo uploaded successfully");
      } catch (err: any) {
        console.error("❌ Photo upload failed:", err);
        throw new Error(`Photo upload failed: ${err.response?.data?.detail || err.message}`);
      }
    }

    // Step 3: Upload documents if they exist
    if (data.documents && data.documents.length > 0) {
      setUploadProgress(`Uploading ${data.documents.length} document(s)...`);
      
      for (let i = 0; i < data.documents.length; i++) {
        const doc = data.documents[i];
        const docFormData = new FormData();
        docFormData.append('file', doc.file);

        try {
          await axios.post(
            `http://localhost:8000/api/farmers/${farmer_id}/upload-document?document_type=${doc.type}`,
            docFormData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
          console.log(`✅ Document ${i + 1}/${data.documents.length} uploaded: ${doc.type}`);
        } catch (err: any) {
          console.error(`❌ Document upload failed (${doc.type}):`, err);
          throw new Error(`Document upload failed (${doc.type}): ${err.response?.data?.detail || err.message}`);
        }
      }
    }

    // Step 4: Generate ID card with QR code
    setUploadProgress("Generating ID card with QR code...");
    try {
      await axios.post(
        `http://localhost:8000/api/farmers/${farmer_id}/generate-idcard`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          } 
        }
      );
      console.log("✅ ID card generated successfully");
    } catch (err: any) {
      console.error("❌ ID card generation failed:", err);
      // Don't fail the whole process if ID card generation fails
      console.warn("⚠️ Continuing despite ID card generation failure");
    }

    setUploadProgress("Complete!");
    setSuccess(true);

    setTimeout(() => {
      navigate("/farmers");
    }, 2000);
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSubmitting(true);
      if (onSubmitStart) onSubmitStart();

      if (onSubmit) {
        await onSubmit();
      } else {
        await createFarmer();
      }
    } catch (err: any) {
      console.error("❌ Failed to submit form:", err);
      
      let errorMessage = "An unexpected error occurred during submission.";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => 
            `${e.loc?.join('.')}: ${e.msg}`
          ).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
      setUploadProgress("");
      if (onSubmitEnd) onSubmitEnd();
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <h2 style={{ color: "#16A34A" }}>Farmer Registered Successfully!</h2>
        <p>Photo, documents, and ID card have been processed.</p>
        <p style={{ fontSize: "14px", color: "#6B7280" }}>Redirecting to farmers list...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "24px" }}>Review & Submit</h2>
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          background: "#FEE2E2", 
          color: "#B91C1C", 
          padding: "12px 16px", 
          borderRadius: "6px", 
          marginBottom: "16px",
          border: "1px solid #FCA5A5"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div style={{
          background: "#DBEAFE",
          color: "#1E40AF",
          padding: "12px 16px",
          borderRadius: "6px",
          marginBottom: "16px",
          border: "1px solid #93C5FD",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "18px" }}>⏳</span>
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Personal Info */}
      <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #E5E7EB" }}>
        <h3 style={{ marginTop: 0, color: "#1F2937" }}>👤 Personal Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>First Name</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.personal?.first_name || "-"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Last Name</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.personal?.last_name || "-"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Phone</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.personal?.phone_primary || "-"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>NRC</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.personal?.nrc || "-"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Date of Birth</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.personal?.date_of_birth || "-"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Gender</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.personal?.gender || "-"}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #E5E7EB" }}>
        <h3 style={{ marginTop: 0, color: "#1F2937" }}>📍 Address & Location</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Province</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.address?.province_name || "-"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>District</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.address?.district_name || "-"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Chiefdom</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.address?.chiefdom_name || "Not specified"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Village</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.address?.village || "-"}</p>
          </div>
        </div>
      </div>

      {/* Farm Details */}
      <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #E5E7EB" }}>
        <h3 style={{ marginTop: 0, color: "#1F2937" }}>🚜 Farm Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Farm Size</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.farm?.farm_size_hectares || "0"} hectares</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Years Farming</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.farm?.years_farming || "0"} years</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Crops</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.farm?.crops_grown?.join(", ") || "None"}</p>
          </div>
          <div>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#6B7280" }}>Livestock</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{data.farm?.livestock_types?.join(", ") || "None"}</p>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Photo Preview */}
      {data.photo && (
        <div style={{ background: "#F0FDF4", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #86EFAC" }}>
          <h3 style={{ marginTop: 0, color: "#1F2937" }}>📸 Photo</h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#16A34A" }}>
            ✅ Photo ready to upload: <strong>{data.photo.name}</strong> ({(data.photo.size / 1024).toFixed(2)} KB)
          </p>
        </div>
      )}

      {/* ✅ NEW: Documents Preview */}
      {data.documents && data.documents.length > 0 && (
        <div style={{ background: "#F0FDF4", padding: "16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #86EFAC" }}>
          <h3 style={{ marginTop: 0, color: "#1F2937" }}>📄 Documents</h3>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {data.documents.map((doc, idx) => (
              <li key={idx} style={{ marginBottom: "4px", fontSize: "14px", color: "#16A34A" }}>
                <strong>{doc.type}:</strong> {doc.file.name} ({(doc.file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={onBack}
          disabled={submitting}
          style={{
            padding: "12px 24px",
            background: "#6B7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: "bold",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            flex: 1,
            padding: "12px 24px",
            background: submitting ? "#9CA3AF" : "#16A34A",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {submitting ? "⏳ Submitting..." : submitButtonText}
        </button>
      </div>
    </div>
  );
} 


