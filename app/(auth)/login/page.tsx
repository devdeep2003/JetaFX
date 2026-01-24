import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6">

        {/* LEFT — BRANDING */}
        <div className="flex flex-col justify-center text-white space-y-8">

          {/* Logo + Brand */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-white backdrop-blur-md border border-white/10 shadow-lg shadow-indigo-500/30">
              <Image
                src="/icons/jetafx-main-logo.png"
                alt="Jetafx Logo"
                fill
                className="object-contain p-3"
                priority
              />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                JetaFX
              </h1>
              <p className="text-sm text-gray-400">
                Smart. Secure. Trading.
              </p>
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

            <form className="space-y-5">
              {/* User */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  placeholder="you@jetafx.com"
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400">
                  <input type="checkbox" className="accent-indigo-500" />
                  Remember me
                </label>
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 transition py-2.5 text-white font-medium shadow-lg shadow-indigo-600/30"
              >
                Sign In
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
