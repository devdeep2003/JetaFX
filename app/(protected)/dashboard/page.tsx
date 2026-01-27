"use client";

import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/app/(components)/theme-toggler";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //Just to greet the user for the first time and not to spam welcome on every render

  useEffect(() => {
    const welcomeUser = Cookies.get("welcomeToast");
    if (welcomeUser) {
      toast.success("Welcome back!");
      Cookies.remove("welcomeToast");
    }
  }, []);

  const logoutHandler = () => {
    Cookies.remove("userEmail");
    router.replace("/login");
  };

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

        {/* Navigation (fills remaining height) */}
        <nav className="flex-1 flex flex-col px-4 py-6 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100
                       dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/transactions"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100
                       dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition"
          >
            Transactions
          </Link>

          <Link
            href="/analytics"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100
                       dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition"
          >
            Analytics
          </Link>

          <Link
            href="/settings"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100
                       dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition"
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header
          className="h-16 flex items-center justify-between px-6 border-b
                     bg-white/80 dark:bg-black/80
                     border-gray-200 dark:border-white/10 backdrop-blur"
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-2xl"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <h1 className="text-lg font-semibold">Welcome</h1>
            <ThemeToggle />
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              {Cookies.get("userEmail")}
            </span>

            <button
              className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500
                         hover:bg-red-500/20 transition text-sm hover:cursor-pointer"
              onClick={logoutHandler}
            >
              Logout
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            Dashboard
          </div>
        </main>
      </div>
    </div>
  );
}
