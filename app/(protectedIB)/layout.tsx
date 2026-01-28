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
import { IoCashOutline } from "react-icons/io5";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);


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
    router.replace("/loginIB");
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
      

          {/* Masters */}
          <div>
            

             <Link
            href="/dashboard-ib"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <IoCashOutline size={21} className="mr-2" />
            Deposite Reports
          </Link>
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
              {Cookies.get("ibUsername")}
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
