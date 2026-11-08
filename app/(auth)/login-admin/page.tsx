'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginAdminPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.log(error);
            setError('Login gagal. Periksa email dan kata sandi Anda.');
            setLoading(false);
            return;
        }

        const role = data.user?.user_metadata?.role;
        if (role !== 'admin') {
            await supabase.auth.signOut();
            setError('Akses ditolak. Akun ini bukan akun Admin.');
            setLoading(false);
            return;
        }

        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-950 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-emerald-900">Login Admin RAM</h1>
                    <p className="text-sm text-gray-500">Portal Pengelolaan Pembelian TBS Sawit</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Admin</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-500"
                            placeholder="example@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        {loading ? 'Memproses...' : 'Masuk sebagai Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}