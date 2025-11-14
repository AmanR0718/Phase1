import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Step1Personal from "./FarmerRegistration/Step1Personal";
import Step2Address from "./FarmerRegistration/Step2Address";
import Step3Farm from "./FarmerRegistration/Step3Farm";
import Step4Preview from "./FarmerRegistration/Step4Preview";

export default function CreateFarmer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    personal: {},
    address: {},
    farm: {},
  });

  const update = (section: string, values: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...values },
    }));
  };

  return (
    <div style={{ minHeight: "100vh", padding: 20, background: "#f7f7f7" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#2563EB",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "8px 8px 0 0",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => navigate("/farmers")}
          style={{
            backgroundColor: "#1E40AF",
            color: "white",
            border: "2px solid white",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ← BACK
        </button>

        <h1 style={{ margin: 0, fontSize: 20 }}>Register New Farmer</h1>

        <div style={{ width: 80 }} /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          padding: 30,
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Step Indicator */}
        <div style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={{ color: "#6B7280", fontSize: 14 }}>
              Step {step} of 4
            </div>
            <div style={{ color: "#6B7280", fontSize: 14 }}>
              {step === 1 && "Personal Information"}
              {step === 2 && "Address & Location"}
              {step === 3 && "Farm Details"}
              {step === 4 && "Review & Submit"}
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: "4px",
              backgroundColor: "#E5E7EB",
              borderRadius: "2px",
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
        </div>

        {/* Step Content */}
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
          <Step4Preview
            data={form}
            onBack={() => setStep(3)}
            onSubmitStart={() => setLoading(true)}
            onSubmitEnd={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
}