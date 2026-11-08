import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center my-auto">
        <h1 className="text-4xl font-extrabold text-emerald-950 sm:text-5xl">
          RAM Sawit
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Sistem Informasi Penimbangan, Harga, dan Pembayaran Tandan Buah Segar (TBS) Sawit.
        </p>

        {/* Pilihan Login */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/login-petani"
            className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold shadow-md hover:shadow-lg transition text-center"
          >
            Masuk Portal Petani
          </Link>
          <Link
            href="/login-admin"
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md hover:shadow-lg transition text-center"
          >
            Masuk Portal Admin
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-200">
        © 2026 RAM Sawit — Sistem Informasi Penimbangan TBS
      </footer>
    </div>
  );
}