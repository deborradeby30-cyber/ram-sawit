'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPetaniPage() {
    const [farmerId, setFarmerId] = useState('');
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
            email: farmerId,
            password,
        });

        if (error) {
            console.log(error);
            setError('ID Petani atau Password salah.');
            setLoading(false);
            return;
        }

        const role = data.user?.user_metadata?.role;
        if (role !== 'petani') {
            await supabase.auth.signOut();
            setError('Akses ditolak. Akun ini bukan akun Petani.');
            setLoading(false);
            return;
        }

        router.push('/portal');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-900 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-amber-900">Portal Petani Sawit</h1>
                    <p className="text-sm text-gray-500">Pantau Hasil Timbangan & Status Pembayaran</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Petani</label>
                        <input
                            type="text"
                            required
                            value={farmerId}
                            onChange={(e) => setFarmerId(e.target.value)}
                            className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-500"
                            placeholder="Contoh: example@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        {loading ? 'Memproses...' : 'Masuk Portal Petani'}
                    </button>
                </form>
            </div>
        </div>
    );
}