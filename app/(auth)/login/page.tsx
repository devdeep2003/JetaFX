"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { ThemeToggle } from "@/app/(components)/theme-toggler";

export default function LoginPage() {
  const router = useRouter();

  // dummy users (testing only)
  const user = [
    { email: "test@gmail.com", password: "123456", name: "test" },
    { email: "test1@gmail.com", password: "123456hello", name: "testhello" },
  ];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const matchedUser = user.find(
      (u) => u.email === email && u.password === password
    );

    if (matchedUser) {
      Cookies.set("userEmail", email);
      Cookies.set("welcomeToast", "true");
      router.push("/dashboard");
    } else if (!email || !password) {
      toast.error("Fill all the fields");
      setError("Fill all the fields");
    } else {
      toast.error("Invalid Credentials");
      setError("Invalid Credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-100 text-gray-900
                    dark:bg-black dark:text-white">
      <Toaster position="top-right" />

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6">
        
        {/* LEFT — BRANDING */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-white border
                            border-gray-200 dark:border-white/10 shadow-lg">
              <Image
                src="/icons/jetafx-main-logo.png"
                alt="Jetafx Logo"
                fill
                className="object-contain p-3"
                priority
              />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">JetaFX</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Smart. Secure. Trading.
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md leading-relaxed">
            Securely manage your finances, track transactions, and grow your
            wealth with institutional-grade security.
          </p>
        </div>

        {/* RIGHT — LOGIN FORM */}
        <div className="flex items-center justify-center">
          <div
            className="w-full max-w-md rounded-2xl border p-8 shadow-2xl
                       bg-white border-gray-200
                       dark:bg-white/10 dark:border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-semibold">Welcome back</h2>
              <ThemeToggle />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Sign in to your JetaFX account
            </p>

            <form className="space-y-5" onSubmit={formHandler}>
              
              {/* Email */}
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                  Email or Username
                </label>
                <input
                  type="text"
                  placeholder="email or username"
                  className="w-full rounded-lg px-4 py-2.5
                             bg-gray-100 border border-gray-300 text-gray-900
                             placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             dark:bg-black/40 dark:border-white/10 dark:text-white"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg px-4 py-2.5
                             bg-gray-100 border border-gray-300 text-gray-900
                             placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             dark:bg-black/40 dark:border-white/10 dark:text-white"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
                <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <input type="checkbox" className="accent-indigo-500" />
                  Remember me
                </label>

                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Forgot password?
                </a>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-lg py-2.5 font-medium text-white
                           bg-indigo-600 hover:bg-indigo-500 transition
                           shadow-lg shadow-indigo-600/30"
              >
                {loading ? "..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
