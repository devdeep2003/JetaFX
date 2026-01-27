"use client";

import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/app/(components)/theme-toggler";
import toast, { Toaster } from "react-hot-toast";
import { MdArrowUpward, MdSpaceDashboard } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";
import { GrTransaction } from "react-icons/gr";
import { PAGE_TITLES } from "@/lib/pageTitles";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropDownMasters, setDropDownMasters] = useState(false);
  const [dropDownTransactions, setDropDownTransactions] = useState(false);

  //one time welcome toast
  useEffect(() => {
    const welcomeUser = Cookies.get("welcomeToast");
    if (welcomeUser) {
      toast.success("Welcome back!");
      Cookies.remove("welcomeToast");
    }
  }, []);

  //logout handler
  const logoutHandler = () => {
    Cookies.remove("userEmail");
    router.replace("/login");
  };

  //Dynamic title
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <div className="h-screen flex relative bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      <Toaster position="top-right" />

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-50
          h-screen md:h-full w-64
          bg-white border-r border-gray-200
          dark:bg-black/95 dark:border-white/10
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/10">
          <div className="bg-white p-2 rounded-2xl dark:bg-white">
            <Image
              src="/icons/jetafx-main-logo.png"
              alt="Jetafx Logo"
              width={70}
              height={70}
            />
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 flex flex-col px-4 py-6 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <MdSpaceDashboard size={21} className="mr-2" />
            Dashboard
          </Link>

          {/* Masters */}
          <div>
            <button
              onClick={() => setDropDownMasters((p) => !p)}
              className="hover:cursor-pointer w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <div className="flex items-center">
                <RiAdminFill size={21} className="mr-2" />
                Masters
              </div>
              <MdArrowUpward
                className={`transition-transform ${dropDownMasters ? "" : "rotate-180"}`}
              />
            </button>

            {dropDownMasters && (
              <div className="ml-6 mt-2 space-y-1">
                <Link
                  href="/masters/ib"
                  className="block px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  IB
                </Link>
                <Link
                  href="/masters/customers"
                  className="block px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  Customers
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setDropDownTransactions((p) => !p)}
              className="hover:cursor-pointer w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <div className="flex items-center">
                <GrTransaction size={21} className="mr-2" />
                Transactions
              </div>
              <MdArrowUpward
                className={`transition-transform ${dropDownTransactions ? "" : "rotate-180"}`}
              />
            </button>

            {dropDownTransactions && (
              <div className="ml-6 mt-2 space-y-1">
                <Link
                  href="/transactions/ib-reports"
                  className="block px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  IB Reports
                </Link>
                <Link
                  href="/transactions/customer-reports"
                  className="block px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  Customer Reports
                </Link>
                <Link
                  href="/transactions/deposit-reports"
                  className="block px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  Deposit Reports
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white/80 dark:bg-black/80">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-2xl"
              onClick={() => setSidebarOpen((p) => !p)}
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold">{title}</h1>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block">
              {Cookies.get("userEmail")}
            </span>
            <button
              onClick={logoutHandler}
              className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/*DYNAMIC CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
