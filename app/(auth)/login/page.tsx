"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";

export default function LoginPage() {
  //form logic and states
  //24-01-2026 18:11 just developing the skeleton of the login logic

  const router = useRouter();

  //making a dummy object just for testing , later will implement the api logic
  const user = [
    {
      email: "test@gmail.com",
      password: "123456",
      name: "test",
    },
    {
      email: "test1@gmail.com",
      password: "123456hello",
      name: "testhello",
    },
  ];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    //just for testing , will implement the api logic in try-catch block later

    const matchedUser = user.find(
      (u) => u.email === email && u.password === password,
    );
    if (matchedUser) {
      setLoading(false);
      Cookies.set("userEmail", email);
      router.push("/dashboard");
    } else if (email === "" || password === "") {
      toast.error("Fill all the fields");
      setError("Fill all the fields");
      setLoading(false);
    } else {
      setError("Invalid Credentials");
      toast.error("Invalid Credentials");
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6">
        {/* LEFT — BRANDING */}
        <div className="flex flex-col justify-center text-white space-y-8">
          {/* Logo + Brand */}
          <div className="flex items-center gap-4">
            <div className="relative w-22 h-22 rounded-2xl bg-white backdrop-blur-md border border-white/10 shadow-lg shadow-indigo-500/30">
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
              <p className="text-sm text-gray-400">Smart. Secure. Trading.</p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            Securely manage your finances, track transactions, and grow your
            wealth with institutional-grade security.
          </p>
        </div>

        {/* RIGHT — LOGIN FORM */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Sign in to your JetaFX account
            </p>

            <form className="space-y-5" onSubmit={formHandler}>
              {/* User */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  placeholder="email or username"
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
                <label className="flex items-center gap-2 text-gray-400">
                  <input type="checkbox" className="accent-indigo-500" />
                  Remember me
                </label>

                <a
                  href="#"
                  className="text-indigo-400 hover:text-indigo-300 md:text-right"
                >
                  Forgot password?
                </a>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 hover:cursor-pointer transition py-2.5 text-white font-medium shadow-lg shadow-indigo-600/30"
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
