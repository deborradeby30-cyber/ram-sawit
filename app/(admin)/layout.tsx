'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const menu = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Transaksi Penimbangan', path: '/transaksi' },
    { name: 'Data Petani', path: '/petani' },
    { name: 'Harga Sawit', path: '/harga' },
    { name: 'Riwayat & Laporan', path: '/riwayat' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login-admin');
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-emerald-900 text-white p-4 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold p-2 border-b border-emerald-800">RAM Sawit Admin</h2>
                    <nav className="mt-4 space-y-1">
                        {menu.map((item) => {
                            const active = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-amber-400 text-emerald-950 font-bold' : 'hover:bg-emerald-800 text-emerald-100'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm bg-emerald-800 hover:bg-red-600 rounded-lg transition"
                >
                    Keluar (Logout)
                </button>
            </aside>

            {/* Content Main Area */}
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
    );
}