"use client";

import { useState, useEffect } from "react";

type IBRecord = {
  Id?: number;
  IbId: number;
  IbName: string;
  Username: string | null;
  Password: string | null;
};

type ModalProps = {
  mode: "create" | "edit";
  initialData: IBRecord | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateIBModal({ mode, initialData, onClose, onSuccess }: ModalProps) {
  const [form, setForm] = useState({
    ibId: "",
    ibName: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        ibId: initialData.IbId.toString(),
        ibName: initialData.IbName,
        username: initialData.Username || "",
        password: initialData.Password || "",
      });
    }
  }, [mode, initialData]);

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!form.ibName.trim()) {
      setError("IB Name is required");
      return;
    }

    if (mode === "create" && !form.ibId.trim()) {
      setError("IB ID is required");
      return;
    }

    setLoading(true);

    try {
      // Prepare payload matching API structure (PascalCase)
      const payload: any = {
        IbId: parseInt(form.ibId),
        IbName: form.ibName,
        Username: form.username || null,
        Password: form.password || null,
      };

      // If editing, include the Id field
      if (mode === "edit" && initialData?.Id) {
        payload.Id = initialData.Id;
      }

      const response = await fetch(
        "https://ib.jetafx.com/api/customer/master/createOrUpdateIbMaster",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save IB");
      }

      const result = await response.json();

      if (result.ResponseCode === 200) {
        // Success
        onSuccess(); // Refresh the table
        onClose(); // Close modal
      } else {
        setError(result.Message || "Failed to save IB");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save IB. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />

      {/* MODAL WRAPPER */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="w-full max-w-2xl rounded-xl bg-white dark:bg-black
          border border-gray-200 dark:border-white/10
          shadow-xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <h2 className="text-lg font-semibold mb-6">
            {mode === "create" ? "Create New IB" : "Edit IB"}
          </h2>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                IB ID {mode === "create" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-4 py-2 text-sm
                bg-transparent
                border-gray-300 dark:border-white/20
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter IB ID"
                value={form.ibId}
                onChange={(e) =>
                  setForm({ ...form, ibId: e.target.value })
                }
                disabled={mode === "edit"}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                IB Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2 text-sm
                bg-transparent
                border-gray-300 dark:border-white/20
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter IB Name"
                value={form.ibName}
                onChange={(e) =>
                  setForm({ ...form, ibName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Username
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2 text-sm
                bg-transparent
                border-gray-300 dark:border-white/20
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Username (optional)"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border px-4 py-2 text-sm
                bg-transparent
                border-gray-300 dark:border-white/20
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Password (optional)"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg
              border border-gray-300 dark:border-white/20
              hover:bg-gray-100 dark:hover:bg-white/10 hover:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg
              bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : mode === "create" ? "Create IB" : "Update IB"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}