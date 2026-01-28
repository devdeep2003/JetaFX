"use client";

import { useState, useEffect } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

type CustomerRecord = {
  Id?: number;
  ClientName: string;
  Email: string;
  ClientId: number;
  IbId: number;
  IbClientId?: number;
  IbName?: string;
};

type ModalProps = {
  mode: "create" | "edit";
  initialData: CustomerRecord | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateCustomerModal({ mode, initialData, onClose, onSuccess }: ModalProps) {
  const [form, setForm] = useState({
    clientId: "",
    customerName: "",
    email: "",
    ibId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        clientId: initialData.ClientId.toString(),
        customerName: initialData.ClientName,
        email: initialData.Email,
        ibId: initialData.IbId.toString(),
      });
    }
  }, [mode, initialData]);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    // Validation
    if (!form.customerName.trim()) {
      setError("Customer Name is required");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!form.ibId.trim()) {
      setError("IB ID is required");
      return;
    }

    if (mode === "create" && !form.clientId.trim()) {
      setError("Client ID is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Prepare payload matching API structure (PascalCase)
      const payload: any = {
        ClientId: parseInt(form.clientId),
        CustomerName: form.customerName,
        Email: form.email,
        IbId: parseInt(form.ibId),
      };

      // If editing, include the Id field
      if (mode === "edit" && initialData?.Id) {
        payload.Id = initialData.Id;
      }

      console.log("📤 Sending payload:", payload);

      const response = await fetch(
        "https://ib.jetafx.com/api/customer/auth/createOrUpdateClient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log("📥 Raw Response:", responseText);

      // Check HTTP status
      if (!response.ok) {
        console.error("❌ HTTP Error:", response.status, response.statusText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Try to parse as JSON
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("⚠️ Response is not valid JSON:", responseText);
        // If response is not JSON but HTTP status was OK, assume success
        if (response.ok) {
          result = { success: true };
        } else {
          throw new Error("Invalid response format from server");
        }
      }

      console.log("✅ Parsed Result:", result);

      // Check for success in various possible response formats
      const isSuccess = 
        result.ResponseCode === 200 || 
        result.success === true || 
        result.Success === true ||
        (response.ok && Object.keys(result).length === 0); // Empty object on success

      if (isSuccess) {
        // Show success message
        setSuccess(true);
        
        // Wait for user to see success message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh the table with a small delay to ensure backend has committed
        await new Promise(resolve => setTimeout(resolve, 300));
        onSuccess();
        
        // Close modal
        onClose();
      } else {
        // Check for error message in response
        const errorMessage = 
          result.ResponseMessage || 
          result.message || 
          result.error ||
          "Failed to save customer";
        
        console.error("❌ API returned error:", result);
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error("❌ Save error:", err);
      setError(err.message || "Failed to save customer. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-black/95 border border-gray-200 dark:border-white/10 p-8 shadow-2xl">
        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Create New Customer" : "Edit Customer"}
        </h3>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
            <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">Success!</p>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-1">
                Customer {mode === "create" ? "created" : "updated"} successfully
              </p>
            </div>
          </div>
        )}

        {/* ================= FORM GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label={`Client ID ${mode === "create" ? "*" : ""}`}
            value={form.clientId}
            onChange={(v) => setForm({ ...form, clientId: v })}
            disabled={mode === "edit"}
            type="number"
            placeholder="Enter Client ID"
          />

          <Input
            label="Customer Name *"
            value={form.customerName}
            onChange={(v) => setForm({ ...form, customerName: v })}
            placeholder="Enter customer name"
          />

          <Input
            label="Email *"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            type="email"
            placeholder="customer@example.com"
          />

          <Input
            label="IB ID *"
            value={form.ibId}
            onChange={(v) => setForm({ ...form, ibId: v })}
            type="number"
            placeholder="Enter IB ID"
          />
        </div>

        {/* DEBUG INFO (Remove in production) */}
        {mode === "edit" && initialData && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs">
            <p className="text-blue-700 dark:text-blue-300 font-mono">
              Editing ID: {initialData.Id} | Client ID: {initialData.ClientId}
            </p>
          </div>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border-2 border-gray-300 dark:border-white/20 px-6 py-3 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {loading ? "Saving..." : mode === "create" ? "Create Customer" : "Update Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE INPUT ================= */
function Input({
  label,
  value,
  onChange,
  disabled = false,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-xl border-2 border-gray-200 dark:border-white/20 px-4 py-3 bg-white dark:bg-black/50 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-white/5 transition-all placeholder-gray-400"
      />
    </div>
  );
}