"use client";

import { useEffect, useState } from "react";
import { FaCalendarAlt, FaUserTie } from "react-icons/fa";
import Cookies from "js-cookie";

export default function DashboardPage() {
  // Filter states (will be used for API later) just hardcoded for now
  const [fromDate, setFromDate] = useState(Date.now().toString());
  const [toDate, setToDate] = useState(Date.now().toString());
  const [customer, setCustomer] = useState("All Customers");

  
  useEffect(() => {
    // FUTURE:
    // fetchDashboardData({ fromDate, toDate, customer });

    console.log("Fetching data with filters:", {
      fromDate,
      toDate,
      customer,
    });
  }, [fromDate, toDate, customer]);

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-gray-200 dark:border-white/10
                      bg-white dark:bg-black p-4 shadow-sm">

        {/* FROM DATE */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg
                        bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
          <FaCalendarAlt />
          <div className="flex flex-col text-sm">
            <span className="text-xs text-gray-500">From Date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e)=>setFromDate(e.target.value)}
              className="bg-transparent outline-none "
            />
          </div>
        </div>

        {/* TO DATE */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg
                        bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
          <FaCalendarAlt />
          <div className="flex flex-col text-sm">
            <span className="text-xs text-gray-500">To Date</span>
            <input
              type="date"
              value={toDate}
              className="bg-transparent outline-none "
              onChange={(e)=>setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg
                        bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
          <FaUserTie />
          <div className="flex flex-col text-sm">
            <span className="text-xs text-gray-500">{Cookies.get("userEmail")}</span>
            <select
              value={customer}
              disabled
              className="bg-transparent outline-none cursor-not-allowed"
            >
              <option>All Customers</option>
            </select>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT PLACEHOLDER */}
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/10
                      p-8 text-center text-gray-500">
        Dashboard analytics will appear here
      </div>
    </div>
  );
}
