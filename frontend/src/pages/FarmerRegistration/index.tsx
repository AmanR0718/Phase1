import React, { useState } from "react";
import Step1Personal from "./Step1Personal";
import Step2Address from "./Step2Address";
import Step3Farm from "./Step3Farm";
import Step4Preview from "./Step4Preview";

// ===========================================
// 🧩 Wizard data structure
// ===========================================
export type WizardState = {
  personal: {
    first_name?: string;
    last_name?: string;
    phone_primary?: string;
  };
  address: {
    province_code?: string;
    province_name?: string;
    district_code?: string;
    district_name?: string;
    chiefdom_code?: string;
    chiefdom_name?: string;
    village?: string;
  };
  farm?: {
    size_hectares?: string;
    crops?: string;
  };
};

// initial empty structure
const initialState: WizardState = {
  personal: {},
  address: {},
  farm: {},
};

// ===========================================
// 🧩 Wizard component
// ===========================================
export default function FarmerRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardState>(initialState);
  const [loading, setLoading] = useState(false);

  // merge updates into each section
  const update = (section: keyof WizardState, values: any) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev as any)[section], ...values },
    }));
  };

  return (
    <div style={{ minHeight: "100vh", padding: 20, background: "#f7f7f7" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>New Farmer — Registration</h2>
          <div style={{ marginTop: 8, color: "#666" }}>
            Step {step} / 4
            {loading && (
              <span style={{ marginLeft: 10, fontSize: 13, color: "#2563EB" }}>
                (Submitting...)
              </span>
            )}
          </div>
        </div>

        {/* Step navigation */}
        {step === 1 && (
          <Step1Personal
            data={form.personal}
            onNext={(vals) => {
              update("personal", vals);
              setStep(2);
            }}
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

        <div style={{ marginTop: 16, color: "#999", fontSize: 13 }}>
          Tip: fields marked * are required. Use the back button to edit.
        </div>
      </div>
    </div>
  );
}
