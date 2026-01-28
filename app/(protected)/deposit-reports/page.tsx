"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiPlus, FiDownload, FiRefreshCw, FiEye, FiEdit2, FiAlertCircle } from "react-icons/fi";
import DepModal from "@/app/(components)/DepModal";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

type DepositRecord = {
  Id: number;
  PaymentTypeId: number;
  CurrencyTypeId: number;
  Amount: number;
  Narration: string | null;
  Date: string | null;
  CurrencyType: string | null;
  PaymentMethod: string | null;
  ClientId: number;
  IbId: number;
  IbName: string | null;
};

export default function DepositReportsPage() {
  const reportRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    customerId: "",
    depositId: "",
  });

  const [data, setData] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);

  // View Details Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDeposit, setViewDeposit] = useState<DepositRecord | null>(null);

  /* ================= API FUNCTIONS ================= */

  // SEARCH by Date Range
  const searchByDateRange = async () => {
    const { fromDate, toDate } = filters;

    if (!fromDate || !toDate) {
      setError("Please select both From Date and To Date");
      return;
    }

    setSearchLoading(true);
    setError("");

    try {
      // Format dates as MM/DD/YYYY
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      console.log("🔍 Searching deposits by date range:", formattedFromDate, "to", formattedToDate);

      const url = `https://ib.jetafx.com/api/customer/deposit/getDepositTransactionReport?fromDate=${encodeURIComponent(formattedFromDate)}&toDate=${encodeURIComponent(formattedToDate)}`;
      
      const res = await fetch(url);
      const result = await res.json();

      console.log("📥 Date range search result:", result);

      if (result.ResponseCode === 200 && result.Response) {
        if (Array.isArray(result.Response)) {
          setData(result.Response);
          console.log(`✅ Found ${result.Response.length} deposits`);
        } else {
          setData([]);
        }
      } else if (result.ResponseCode === 404) {
        setData([]);
        setError("No deposits found for the selected date range");
      } else {
        setError(result.Message || "Failed to fetch deposits");
        setData([]);
      }
    } catch (err: any) {
      console.error("❌ Date range search error:", err);
      setError("Failed to search deposits");
      setData([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // SEARCH by Customer ID
  const searchByCustomerId = async () => {
    const { customerId } = filters;

    if (!customerId) {
      setError("Please enter Customer ID");
      return;
    }

    setSearchLoading(true);
    setError("");

    try {
      console.log("🔍 Searching deposits by Customer ID:", customerId);

      const url = `https://ib.jetafx.com/api/customer/deposit/getDepositByCustomerId?customerId=${customerId}`;
      
      const res = await fetch(url);
      const result = await res.json();

      console.log("📥 Customer ID search result:", result);

      if (result.ResponseCode === 200 && result.Response) {
        if (Array.isArray(result.Response)) {
          setData(result.Response);
          console.log(`✅ Found ${result.Response.length} deposits`);
        } else if (result.Response.ClientId && result.Response.ClientId !== 0) {
          setData([result.Response]);
          console.log("✅ Found 1 deposit");
        } else {
          setData([]);
          setError("No deposits found for this customer");
        }
      } else if (result.ResponseCode === 404) {
        setData([]);
        setError("No deposits found for this customer");
      } else {
        setError(result.Message || "Failed to fetch deposits");
        setData([]);
      }
    } catch (err: any) {
      console.error("❌ Customer ID search error:", err);
      setError("Failed to search deposits");
      setData([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // SEARCH by Deposit ID
  const searchByDepositId = async () => {
    const { depositId } = filters;

    if (!depositId) {
      setError("Please enter Deposit ID");
      return;
    }

    setSearchLoading(true);
    setError("");

    try {
      console.log("🔍 Searching deposit by Deposit ID:", depositId);

      const url = `https://ib.jetafx.com/api/customer/deposit/getDepositByDepositId?depositId=${depositId}`;
      
      const res = await fetch(url);
      const result = await res.json();

      console.log("📥 Deposit ID search result:", result);

      if (result.ResponseCode === 200 && result.Response) {
        if (result.Response.Id && result.Response.Id !== 0) {
          setData([result.Response]);
          console.log("✅ Found 1 deposit");
        } else {
          setData([]);
          setError("Deposit not found");
        }
      } else if (result.ResponseCode === 404) {
        setData([]);
        setError("Deposit not found");
      } else {
        setError(result.Message || "Failed to fetch deposit");
        setData([]);
      }
    } catch (err: any) {
      console.error("❌ Deposit ID search error:", err);
      setError("Failed to search deposit");
      setData([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // SMART SEARCH - Determines which search to use based on filled filters
  const handleSearch = () => {
    setError("");
    table.setPageIndex(0);

    const { fromDate, toDate, customerId, depositId } = filters;

    // Priority: Deposit ID > Customer ID > Date Range
    if (depositId) {
      searchByDepositId();
    } else if (customerId) {
      searchByCustomerId();
    } else if (fromDate && toDate) {
      searchByDateRange();
    } else {
      setError("Please enter search criteria (Deposit ID, Customer ID, or Date Range)");
    }
  };

  // REFRESH - Clear filters and show message
  const handleRefresh = () => {
    console.log("🔄 Clearing filters...");
    setFilters({
      fromDate: "",
      toDate: "",
      customerId: "",
      depositId: "",
    });
    setData([]);
    setError("");
  };

  // Fetch deposit details for editing
  const fetchDepositById = async (depositId: number) => {
    try {
      console.log("🔍 Fetching deposit details for ID:", depositId);
      const res = await fetch(
        `https://ib.jetafx.com/api/customer/deposit/getDepositByDepositId?depositId=${depositId}`
      );
      const result = await res.json();

      console.log("✅ Deposit details:", result);

      if (result.ResponseCode === 200 && result.Response && result.Response.Id !== 0) {
        return result.Response;
      }
      return null;
    } catch (err) {
      console.error("❌ Fetch deposit by ID error:", err);
      return null;
    }
  };

  /* ================= PDF DOWNLOAD ================= */
  const downloadPDF = async () => {
    if (!reportRef.current) return;

    if (data.length === 0) {
      alert("No data to download. Please search for deposits first.");
      return;
    }

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      html2pdf()
        .set({
          margin: 0.5,
          filename: `deposit-report-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
        })
        .from(reportRef.current)
        .save();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  /* ================= TABLE ================= */
  const columns = useMemo<ColumnDef<DepositRecord>[]>(
    () => [
      {
        accessorKey: "Id",
        header: "Deposit ID",
        size: 100,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-800">
            #{getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "Date",
        header: "Date",
        size: 120,
        cell: ({ getValue }) => {
          const date = getValue<string>();
          if (!date) return <span className="text-gray-400">N/A</span>;
          return new Date(date).toLocaleDateString();
        },
      },
      {
        accessorKey: "ClientId",
        header: "Customer ID",
        size: 100,
        cell: ({ getValue }) => (
          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            {getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "PaymentMethod",
        header: "Payment Method",
        size: 150,
        cell: ({ getValue }) => getValue<string>() || "N/A",
      },
      {
        accessorKey: "CurrencyType",
        header: "Currency",
        size: 100,
        cell: ({ getValue }) => (
          <span className="font-bold text-purple-600">
            {getValue<string>() || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "Amount",
        header: "Amount",
        size: 120,
        cell: ({ getValue }) => (
          <span className="font-bold text-green-600">
            {Number(getValue<number>()).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "IbName",
        header: "IB Name",
        size: 150,
        cell: ({ getValue }) => getValue<string>() || "N/A",
      },
      {
        id: "actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => {
          const deposit = row.original;
          return (
            <div className="flex items-center gap-2 p-1">
              {/* View */}
              <button
                onClick={() => {
                  setViewDeposit(deposit);
                  setViewModalOpen(true);
                }}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                title="View Details"
              >
                <FiEye size={16} className="group-hover:scale-110" />
              </button>

              {/* Edit */}
              <button
                onClick={async () => {
                  setMode("edit");
                  const fullDeposit = await fetchDepositById(deposit.Id);
                  setSelectedDeposit(fullDeposit || deposit);
                  setOpenModal(true);
                }}
                className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
                title="Edit Deposit"
              >
                <FiEdit2 size={16} className="group-hover:scale-110" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-6 p-6">
      {/* ================= FILTER BAR ================= */}
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Search Deposit Reports
        </h2>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Date Range Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <Input
              label="From Date"
              type="date"
              value={filters.fromDate}
              onChange={(v: string) => setFilters({ ...filters, fromDate: v })}
              placeholder="Select from date"
            />
            <Input
              label="To Date"
              type="date"
              value={filters.toDate}
              onChange={(v: string) => setFilters({ ...filters, toDate: v })}
              placeholder="Select to date"
            />
          
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm font-semibold text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* ID Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          
            <Input
              label="Deposit ID"
              type="number"
              value={filters.depositId}
              onChange={(v: string) => setFilters({ ...filters, depositId: v })}
              placeholder="Enter Deposit ID"
            />
       
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all px-8 py-4 font-semibold text-sm disabled:opacity-50"
            >
              <FiSearch /> {searchLoading ? "Searching..." : "Search"}
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all px-8 py-4 font-semibold text-sm"
            >
              <FiRefreshCw /> Clear Filters
            </button>

            <button
              onClick={() => {
                setMode("create");
                setSelectedDeposit(null);
                setOpenModal(true);
              }}
              className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all px-8 py-4 font-semibold text-sm"
            >
              <FiPlus /> Create Deposit
            </button>

            <button
              onClick={downloadPDF}
              disabled={data.length === 0}
              className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg hover:shadow-xl transition-all px-8 py-4 font-semibold text-sm disabled:opacity-50"
            >
              <FiDownload /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div ref={reportRef} className="bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Deposit Records
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {data.length > 0 ? `Found ${data.length} deposits` : "No deposits to display. Use search filters above."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left font-semibold text-gray-900 tracking-tight border-b border-gray-200/50 text-xs uppercase"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading || searchLoading ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium">Loading Deposits...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <FiSearch size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No deposit records found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/50 transition-all duration-200 group/row"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 font-medium text-gray-900 group-hover/row:bg-blue-25/20"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
          <span className="text-sm text-gray-600 font-medium">
            Showing {table.getRowModel().rows.length} of {data.length} deposit records
          </span>

          <div className="flex gap-3">
            <button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
            >
              ← Prev
            </button>
            <span className="px-6 py-3 text-sm font-semibold text-gray-900 bg-white rounded-xl shadow-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ================= CREATE/EDIT MODAL ================= */}
      {openModal && (
        <DepModal
          mode={mode}
          initialData={selectedDeposit}
          onClose={() => {
            setOpenModal(false);
            setSelectedDeposit(null);
          }}
          onSuccess={handleSearch}
        />
      )}

      {/* ================= VIEW DETAILS MODAL ================= */}
      {viewModalOpen && viewDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-black/95 rounded-2xl p-8 max-w-2xl w-full border border-gray-200 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Deposit Details
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <DetailRow label="Deposit ID" value={`#${viewDeposit.Id}`} />
              <DetailRow label="Date" value={viewDeposit.Date ? new Date(viewDeposit.Date).toLocaleDateString() : "N/A"} />
              <DetailRow label="Customer ID" value={viewDeposit.ClientId} />
              <DetailRow label="IB Name" value={viewDeposit.IbName || "N/A"} />
              <DetailRow label="Payment Method" value={viewDeposit.PaymentMethod || "N/A"} />
              <DetailRow label="Currency" value={viewDeposit.CurrencyType || "N/A"} />
              <DetailRow label="Amount" value={Number(viewDeposit.Amount).toLocaleString()} highlight />
              <DetailRow label="IB ID" value={viewDeposit.IbId} />
            </div>

            {viewDeposit.Narration && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Narration</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{viewDeposit.Narration}</p>
              </div>
            )}

            <button
              onClick={() => setViewModalOpen(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-xl font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */
function Input({ label, type = "text", value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="px-5 py-4 rounded-xl border-2 border-gray-200/60 bg-white/70 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 focus:outline-none transition-all shadow-sm hover:shadow-md text-sm font-medium placeholder-gray-500"
      />
    </div>
  );
}

function DetailRow({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}