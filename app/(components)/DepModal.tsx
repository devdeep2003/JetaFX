"use client";

import { useState, useEffect } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

type DepositRecord = {
  Id?: number;
  PaymentTypeId: number;
  CurrencyTypeId: number;
  Amount: number;
  Narration: string | null;
  Date: string | null;
  CurrencyType?: string | null;
  PaymentMethod?: string | null;
  ClientId: number;
  IbId: number;
  IbName?: string | null;
};

type DepModalProps = {
  mode: "create" | "edit";
  initialData?: DepositRecord | null;
  onClose: () => void;
  onSuccess: () => void;
};

type PaymentMethod = {
  Id: number;
  PaymentMethod: string;
};

type CurrencyType = {
  Id: number;
  CurrencyType: string;
};

export default function DepModal({ mode, initialData, onClose, onSuccess }: DepModalProps) {
  const [form, setForm] = useState({
    clientId: "",
    ibId: "",
    paymentTypeId: "",
    currencyTypeId: "",
    amount: "",
    date: "",
    narration: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Dynamic options from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencyTypes, setCurrencyTypes] = useState<CurrencyType[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Fetch Payment Methods from API
  const fetchPaymentMethods = async () => {
    try {
      console.log("🔍 Fetching payment methods...");
      const res = await fetch("https://ib.jetafx.com/api/customer/master/getPaymentMethod");
      
      if (!res.ok) {
        console.error("❌ Failed to fetch payment methods:", res.status);
        return;
      }

      const result = await res.json();
      console.log("✅ Payment methods result:", result);

      if (result.ResponseCode === 200 && result.Response && Array.isArray(result.Response)) {
        setPaymentMethods(result.Response);
        console.log(`✅ Loaded ${result.Response.length} payment methods`);
      } else {
        console.error("⚠️ Invalid payment methods response:", result);
      }
    } catch (err) {
      console.error("❌ Error fetching payment methods:", err);
    }
  };

  // Fetch Currency Types from API
  const fetchCurrencyTypes = async () => {
    try {
      console.log("🔍 Fetching currency types...");
      const res = await fetch("https://ib.jetafx.com/api/customer/master/getCurrencyType");
      
      if (!res.ok) {
        console.error("❌ Failed to fetch currency types:", res.status);
        return;
      }

      const result = await res.json();
      console.log("✅ Currency types result:", result);

      if (result.ResponseCode === 200 && result.Response && Array.isArray(result.Response)) {
        setCurrencyTypes(result.Response);
        console.log(`✅ Loaded ${result.Response.length} currency types`);
      } else {
        console.error("⚠️ Invalid currency types response:", result);
      }
    } catch (err) {
      console.error("❌ Error fetching currency types:", err);
    }
  };

  // Fetch dropdown options on mount
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      await Promise.all([fetchPaymentMethods(), fetchCurrencyTypes()]);
      setLoadingOptions(false);
    };
    loadOptions();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // Format date from ISO to YYYY-MM-DD for input
      const formattedDate = initialData.Date 
        ? new Date(initialData.Date).toISOString().split('T')[0] 
        : "";

      setForm({
        clientId: initialData.ClientId.toString(),
        ibId: initialData.IbId.toString(),
        paymentTypeId: initialData.PaymentTypeId.toString(),
        currencyTypeId: initialData.CurrencyTypeId.toString(),
        amount: initialData.Amount.toString(),
        date: formattedDate,
        narration: initialData.Narration || "",
      });
    }
  }, [mode, initialData]);

  const validateForm = () => {
    if (!form.clientId.trim()) {
      setError("Customer ID is required");
      return false;
    }

    if (!form.ibId.trim()) {
      setError("IB ID is required");
      return false;
    }

    if (!form.paymentTypeId) {
      setError("Payment Type is required");
      return false;
    }

    if (!form.currencyTypeId) {
      setError("Currency is required");
      return false;
    }

    if (!form.amount.trim() || parseFloat(form.amount) <= 0) {
      setError("Valid amount is required");
      return false;
    }

    if (!form.date) {
      setError("Date is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload: any = {
        ClientId: parseInt(form.clientId),
        IbId: parseInt(form.ibId),
        PaymentTypeId: parseInt(form.paymentTypeId),
        CurrencyTypeId: parseInt(form.currencyTypeId),
        Amount: parseFloat(form.amount),
        Date: form.date, // YYYY-MM-DD format
        Narration: form.narration || null,
      };

      // If editing, include the Id
      if (mode === "edit" && initialData?.Id) {
        payload.Id = initialData.Id;
      }

      console.log("📤 Sending deposit payload:", payload);

      const response = await fetch(
        "https://ib.jetafx.com/api/customer/deposit/createOrUpdateDeposit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      // Get response text first
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
        (response.ok && Object.keys(result).length === 0);

      if (isSuccess) {
        // Show success message
        setSuccess(true);

        // Wait for user to see success message
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Wait for backend to commit
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Refresh the parent component
        onSuccess();

        // Close modal
        onClose();
      } else {
        // Check for error message in response
        const errorMessage =
          result.ResponseMessage || result.Message || result.message || result.error || "Failed to save deposit";

        console.error("❌ API returned error:", result);
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error("❌ Save error:", err);
      setError(err.message || "Failed to save deposit. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black/95 w-full max-w-3xl rounded-2xl p-8 space-y-6 border border-gray-200 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Create New Deposit" : "Edit Deposit"}
        </h3>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* WARNING MESSAGE - If options failed to load */}
        {!loadingOptions && (paymentMethods.length === 0 || currencyTypes.length === 0) && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">Warning</p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                {paymentMethods.length === 0 && "Payment methods failed to load. "}
                {currencyTypes.length === 0 && "Currency types failed to load. "}
                Please refresh the page or contact support.
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
            <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">Success!</p>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-1">
                Deposit {mode === "create" ? "created" : "updated"} successfully
              </p>
            </div>
          </div>
        )}

        {/* ================= FORM GRID ================= */}
        {loadingOptions ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading form options...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Customer ID *"
              type="number"
              value={form.clientId}
              onChange={(v) => setForm({ ...form, clientId: v })}
              placeholder="Enter Customer ID"
              disabled={mode === "edit"}
            />

            <Input
              label="IB ID *"
              type="number"
              value={form.ibId}
              onChange={(v) => setForm({ ...form, ibId: v })}
              placeholder="Enter IB ID"
            />

            <Select
              label="Payment Type *"
              value={form.paymentTypeId}
              onChange={(v) => setForm({ ...form, paymentTypeId: v })}
              options={paymentMethods.map(pm => ({ 
                value: pm.Id.toString(), 
                label: pm.PaymentMethod 
              }))}
            />

            <Select
              label="Currency *"
              value={form.currencyTypeId}
              onChange={(v) => setForm({ ...form, currencyTypeId: v })}
              options={currencyTypes.map(ct => ({ 
                value: ct.Id.toString(), 
                label: ct.CurrencyType 
              }))}
            />

            <Input
              label="Amount *"
              type="number"
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v })}
              placeholder="0.00"
              step="0.01"
            />

            <Input
              label="Date *"
              type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
            />
          </div>
        )}

        {/* ================= NARRATION ================= */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
            Narration / Notes
          </label>
          <textarea
            value={form.narration}
            onChange={(e) => setForm({ ...form, narration: e.target.value })}
            rows={4}
            placeholder="Add any additional notes or comments..."
            className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-white/20 bg-white dark:bg-black/50 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 transition-all placeholder-gray-400 resize-none"
          />
        </div>

        {/* DEBUG INFO (Remove in production) */}
        {mode === "edit" && initialData && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs">
            <p className="text-blue-700 dark:text-blue-300 font-mono">
              Editing Deposit ID: {initialData.Id} | Customer ID: {initialData.ClientId}
            </p>
          </div>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || loadingOptions || paymentMethods.length === 0 || currencyTypes.length === 0}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {loading ? "Saving..." : mode === "create" ? "Create Deposit" : "Update Deposit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */
function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  step,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
        className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-white/20 bg-white dark:bg-black/50 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-white/5 transition-all placeholder-gray-400"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-white/20 bg-white dark:bg-black/50 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 transition-all cursor-pointer"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}