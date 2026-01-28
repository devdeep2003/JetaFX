"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiEye, FiRefreshCw } from "react-icons/fi";
import CreateCustomerModal from "@/app/(components)/CustModal";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

type CustomerRecord = {
  Id: number;
  ClientName: string;
  Email: string;
  ClientId: number;
  IbId: number;
  IbClientId: number;
  IbName: string;
};

export default function CustomerPage() {
  const [filters, setFilters] = useState({
    searchIbId: "",
    searchClientId: "",
  });

  const [data, setData] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRecord | null>(null);

  /* ================= API FUNCTIONS ================= */

  // GET all customers
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("📡 Fetching all customers...");
      const res = await fetch("https://ib.jetafx.com/api/customer/auth/getCustomer");
      
      if (!res.ok) {
        console.error("❌ HTTP Error:", res.status, res.statusText);
        throw new Error(`Failed to fetch customers: ${res.status}`);
      }
      
      const result = await res.json();
      console.log("✅ Fetch result:", result);
      
      if (result.ResponseCode === 200 && result.Response) {
        setData(result.Response);
        console.log(`✅ Loaded ${result.Response.length} customers`);
      } else {
        console.error("⚠️ API returned non-success:", result);
        setData([]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH by IB ID or Client ID
  const searchCustomers = async () => {
    const { searchIbId, searchClientId } = filters;

    // If both empty, fetch all
    if (!searchIbId && !searchClientId) {
      fetchData();
      return;
    }

    setSearchLoading(true);
    try {
      let url = "";
      
      // Priority: Client ID first, then IB ID
      if (searchClientId) {
        url = `https://ib.jetafx.com/api/customer/auth/getCustomerByCustomerId?customerId=${searchClientId}`;
        console.log("🔍 Searching by Client ID:", searchClientId);
      } else if (searchIbId) {
        url = `https://ib.jetafx.com/api/customer/auth/getCustomerByIBId?ibId=${searchIbId}`;
        console.log("🔍 Searching by IB ID:", searchIbId);
      }

      const res = await fetch(url);
      
      if (!res.ok) {
        console.error("❌ Search HTTP Error:", res.status);
        throw new Error("Failed to search customers");
      }
      
      const result = await res.json();
      console.log("✅ Search result:", result);
      
      if (result.ResponseCode === 200 && result.Response) {
        // Handle array response (IB ID search)
        if (Array.isArray(result.Response)) {
          setData(result.Response);
          console.log(`✅ Found ${result.Response.length} customers`);
        } else {
          // Handle single object response (Client ID search)
          if (result.Response.ClientName) {
            setData([result.Response]);
            console.log("✅ Found 1 customer");
          } else {
            setData([]);
            console.log("⚠️ No customer found");
          }
        }
      } else if (result.ResponseCode === 404) {
        setData([]);
        console.log("⚠️ Customer not found (404)");
      } else {
        console.error("⚠️ API returned non-success:", result);
        setData([]);
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      setData([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // GET customer by Client ID - For Edit modal
  const fetchCustomerById = async (clientId: number) => {
    try {
      console.log("🔍 Fetching customer details for Client ID:", clientId);
      const res = await fetch(
        `https://ib.jetafx.com/api/customer/auth/getCustomerByCustomerId?customerId=${clientId}`
      );
      
      if (!res.ok) {
        console.error("❌ Fetch customer by ID error:", res.status);
        throw new Error("Failed to fetch customer details");
      }
      
      const result = await res.json();
      console.log("✅ Customer details:", result);
      
      if (result.ResponseCode === 200 && result.Response && result.Response.ClientName) {
        return result.Response;
      }
      return null;
    } catch (err) {
      console.error("❌ Fetch customer by ID error:", err);
      return null;
    }
  };

  // DELETE customer
  const deleteCustomer = async (clientId: number) => {
    try {
      const res = await fetch(
        `https://ib.jetafx.com/api/customer/auth/deleteCustomer/${clientId}`,
        {
          method: "DELETE",
        }
      );
      
      if (!res.ok) throw new Error("Failed to delete customer");
      
      const result = await res.json();
      
      if (result.ResponseCode === 200) {
        // Success - remove from UI
        setData((prev) => prev.filter((customer) => customer.ClientId !== clientId));
        setDeleteConfirmOpen(false);
        setCustomerToDelete(null);
      } else {
        console.error("Delete API returned non-success:", result);
        alert("Failed to delete customer. Please try again.");
      }
    } catch (err) {
      console.error("Delete customer error:", err);
      alert("Error deleting customer. Please try again.");
    }
  };

  // Refresh handler - used after create/update
  const handleRefresh = async () => {
    console.log("🔄 Refreshing customer list...");
    
    // Clear filters
    setFilters({ searchIbId: "", searchClientId: "" });
    
    // Wait for backend to commit changes
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch fresh data
    await fetchData();
    
    // Reset to first page
    table.setPageIndex(0);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  /* ================= TABLE ================= */

  const columns = useMemo<ColumnDef<CustomerRecord>[]>(() => [
    {
      accessorKey: "Id",
      header: "ID",
      size: 60,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-800">
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "ClientId",
      header: "Client ID",
      size: 100,
      cell: ({ getValue }) => (
        <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "ClientName",
      header: "Client Name",
      size: 150,
    },
    {
      accessorKey: "Email",
      header: "Email",
      size: 200,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "IbId",
      header: "IB ID",
      size: 80,
      cell: ({ getValue }) => (
        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "IbName",
      header: "IB Name",
      size: 150,
    },
    {
      accessorKey: "IbClientId",
      header: "IB Client ID",
      size: 100,
      cell: ({ getValue }) => (
        <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
          {getValue<number>()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 120,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-2 p-1">
            {/* View */}
            <button
              onClick={() => {
                alert(`Customer Details:\nID: ${customer.Id}\nClient ID: ${customer.ClientId}\nName: ${customer.ClientName}\nEmail: ${customer.Email}\nIB: ${customer.IbName} (${customer.IbId})`);
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
                const fullCustomer = await fetchCustomerById(customer.ClientId);
                setSelectedCustomer(fullCustomer || customer);
                setOpenModal(true);
              }}
              className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
              title="Edit Customer"
            >
              <FiEdit2 size={16} className="group-hover:scale-110" />
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                setCustomerToDelete(customer);
                setDeleteConfirmOpen(true);
              }}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              title="Delete Customer"
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
            label="Search by IB ID" 
            placeholder="Enter IB ID..." 
            value={filters.searchIbId} 
            onChange={(v: string) => setFilters({ ...filters, searchIbId: v })}
          />
          
          <Input 
            label="Search by Client ID" 
            placeholder="Enter Client ID..." 
            value={filters.searchClientId} 
            onChange={(v: string) => setFilters({ ...filters, searchClientId: v })}
          />

          <button
            onClick={() => {
              table.setPageIndex(0);
              searchCustomers();
            }}
            className="h-14 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all px-8 font-semibold text-sm"
            disabled={loading || searchLoading}
          >
            <FiSearch /> {searchLoading ? "Searching..." : "Search"}
          </button>

          <button
            onClick={handleRefresh}
            className="h-14 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all px-8 font-semibold text-sm"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={() => {
              setMode("create");
              setSelectedCustomer(null);
              setOpenModal(true);
            }}
            className="h-14 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all px-8 font-semibold text-sm"
          >
            <FiPlus /> Create Customer
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
                      <p className="text-gray-500 font-medium">Loading Customers...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center text-gray-500">
                    No customer records found
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

      {/* ===== PAGINATION ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
        <span className="text-sm text-gray-600 font-medium">
          Showing {table.getRowModel().rows.length} of {data.length} customer records
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
        <CreateCustomerModal
          mode={mode}
          initialData={selectedCustomer}
          onClose={() => {
            setOpenModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={handleRefresh}
        />
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirmOpen && customerToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-black/95 rounded-2xl p-8 max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-xl border border-red-200 shrink-0">
                <FiTrash2 size={28} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Delete Customer?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This will permanently delete customer <strong className="font-mono text-red-600">#{customerToDelete.ClientId}</strong> - <strong>{customerToDelete.ClientName}</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => deleteCustomer(customerToDelete.ClientId)}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <FiTrash2 size={18} />
                Delete
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setCustomerToDelete(null);
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