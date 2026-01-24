"use client";

import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoutHandler = () => {
    Cookies.remove("userEmail");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex relative">
      
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
          h-full w-64
          bg-black/95 border-r border-white/10
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="bg-white p-2 rounded-2xl">
            <Image
              src="/icons/jetafx-main-logo.png"
              alt="Jetafx Logo"
              width={70}
              height={70}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {["Dashboard", "Transactions", "Analytics", "Settings"].map(
            (item) => (
              <div
                key={item}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition"
                onClick={() => setSidebarOpen(false)}
              >
                {item}
              </div>
            )
          )}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col md:ml-0">
        
        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/80 backdrop-blur">
          
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden text-white text-2xl"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
{/* 
            <Image
              src="/icons/jetafx-main-logo.png"
              alt="Jetafx Icon"
              width={32}
              height={32}
              className="object-contain md:hidden"
            /> */}

            <h1 className="text-lg font-semibold">Welcome</h1>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:block">
              {Cookies.get("userEmail")}
            </span>
            <button
              className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-sm"
              onClick={logoutHandler}
            >
              Logout
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            Dashboard
          </div>
        </main>
      </div>
    </div>
  );
}
