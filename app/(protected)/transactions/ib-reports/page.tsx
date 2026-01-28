"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiEye } from "react-icons/fi";
import CreateIBModal from "@/app/(components)/IBModal";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

type IBRecord = {
  Id: number;
  IbId: number;
  IbName: string;
  Username: string | null;
  Password: string | null;
};

export default function IBPage() {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    searchIbId: "",
  });

  const [data, setData] = useState<IBRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedIB, setSelectedIB] = useState<IBRecord | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ibToDelete, setIbToDelete] = useState<IBRecord | null>(null);

  /* ================= API FUNCTIONS ================= */

  // GET all IBs
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://ib.jetafx.com/api/customer/master/getIbMaster");
      if (!res.ok) throw new Error("Failed to fetch IBs");
      
      const result = await res.json();
      
      if (result.ResponseCode === 200 && result.Response) {
        setData(result.Response);
      } else {
        console.error("API returned non-success:", result);
        setData([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // GET IB by ID - For searching specific IB
  const searchIBById = async () => {
    if (!filters.searchIbId) {
      // If search is empty, fetch all data
      fetchData();
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://ib.jetafx.com/api/customer/master/getIbMasterByIbId?id=${filters.searchIbId}`
      );
      if (!res.ok) throw new Error("Failed to fetch IB details");
      
      const result = await res.json();
      
      if (result.ResponseCode === 200 && result.Response) {
        setData(result.Response);
      } else {
        console.error("API returned non-success:", result);
        setData([]);
      }
    } catch (err) {
      console.error("Search IB by ID error:", err);
      setData([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // GET IB by ID - For Edit modal
  const fetchIBById = async (id: number) => {
    try {
      const res = await fetch(
        `https://ib.jetafx.com/api/customer/master/getIbMasterByIbId?id=${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch IB details");
      
      const result = await res.json();
      
      if (result.ResponseCode === 200 && result.Response && result.Response[0]) {
        return result.Response[0];
      }
      return null;
    } catch (err) {
      console.error("Fetch IB by ID error:", err);
      return null;
    }
  };

  // DELETE IB
  const deleteIB = async (ibId: number) => {
    try {
      const res = await fetch(
        `https://ib.jetafx.com/api/customer/master/deleteIbMaster/${ibId}`,
        {
          method: "DELETE",
        }
      );
      
      if (!res.ok) throw new Error("Failed to delete IB");
      
      const result = await res.json();
      
      if (result.ResponseCode === 200) {
        // Success - remove from UI
        setData((prev) => prev.filter((ib) => ib.IbId !== ibId));
        setDeleteConfirmOpen(false);
        setIbToDelete(null);
      } else {
        console.error("Delete API returned non-success:", result);
        alert("Failed to delete IB. Please try again.");
      }
    } catch (err) {
      console.error("Delete IB error:", err);
      alert("Error deleting IB. Please try again.");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  /* ================= TABLE ================= */

  const columns = useMemo<ColumnDef<IBRecord>[]>(() => [
    {
      accessorKey: "Id",
      header: "ID",
      size: 80,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-800">
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "IbId",
      header: "IB ID",
      size: 120,
      cell: ({ getValue }) => (
        <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "IbName",
      header: "IB Name",
      size: 200,
    },
    {
      accessorKey: "Username",
      header: "Username",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium">
          {getValue<string>() || "-"}
        </span>
      ),
    },
    {
      accessorKey: "Password",
      header: "Password",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
          {getValue<string>() ? "********" : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 120,
      cell: ({ row }) => {
        const ib = row.original;
        return (
          <div className="flex items-center gap-2 p-1">
            {/* View */}
            <button
              onClick={() => {
                alert(`IB Details:\nID: ${ib.Id}\nIB ID: ${ib.IbId}\nName: ${ib.IbName}\nUsername: ${ib.Username || 'N/A'}`);
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
                // Fetch full details for edit
                const fullIB = await fetchIBById(ib.IbId);
                setSelectedIB(fullIB || ib);
                setOpenModal(true);
              }}
              className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
              title="Edit IB"
            >
              <FiEdit2 size={16} className="group-hover:scale-110" />
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                setIbToDelete(ib);
                setDeleteConfirmOpen(true);
              }}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              title="Delete IB"
            >
              <FiTrash2 size={16} className="group-hover:scale-110" />
            </button>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  /* ================= UI ================= */

  return (
    <div className="space-y-6 p-6">
      {/* ===== FILTER BAR ===== */}
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <Input 
            label="From Date" 
            type="date" 
            value={filters.fromDate} 
            onChange={(v: string) => setFilters({ ...filters, fromDate: v })}
          />
          <Input 
            label="To Date" 
            type="date" 
            value={filters.toDate} 
            onChange={(v: string) => setFilters({ ...filters, toDate: v })}
          />
          <Input 
            label="Search by IB ID" 
            placeholder="Enter IB ID..." 
            value={filters.searchIbId} 
            onChange={(v: string) => setFilters({ ...filters, searchIbId: v })}
          />

          <button
            onClick={() => {
              table.setPageIndex(0);
              searchIBById();
            }}
            className="h-14 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all px-8 font-semibold text-sm"
            disabled={loading || searchLoading}
          >
            <FiSearch /> {searchLoading ? "Searching..." : "Search"}
          </button>

       
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th 
                      key={header.id} 
                      className="px-8 py-5 text-left font-semibold text-gray-900 tracking-tight border-b border-gray-200/50"
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
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium">Loading IB Master...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-gray-500">
                    No IB records found
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
                        className="px-8 py-5 font-medium text-gray-900 group-hover/row:bg-blue-25/20"
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

      {/* ===== PAGINATION ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
        <span className="text-sm text-gray-600 font-medium">
          Showing {table.getRowModel().rows.length} of {data.length} IB records
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

      {/* ===== MODALS ===== */}
      {openModal && (
        <CreateIBModal
          mode={mode}
          initialData={selectedIB}
          onClose={() => {
            setOpenModal(false);
            setSelectedIB(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirmOpen && ibToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-black/95 rounded-2xl p-8 max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-xl border border-red-200 shrink-0">
                <FiTrash2 size={28} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Delete IB?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This will permanently delete IB <strong className="font-mono text-red-600">#{ibToDelete.IbId}</strong> - <strong>{ibToDelete.IbName}</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => deleteIB(ibToDelete.IbId)}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <FiTrash2 size={18} />
                Delete
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setIbToDelete(null);
                }}
                className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 border"
              >
                <FiX size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
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