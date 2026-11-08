'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { rp, kg, fmtD } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function PortalPetaniPage() {
    const supabase = createClient();
    const router = useRouter();
    const [txList, setTxList] = useState<any[]>([]);
    const [farmer, setFarmer] = useState<any>(null);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    useEffect(() => {
        async function loadFarmerData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const farmerId = user.email?.split('@')[0].toUpperCase();

            const { data: fData } = await supabase
                .from('farmers')
                .select('*')
                .eq('id', farmerId)
                .single();
            setFarmer(fData);

            const { data: tx } = await supabase
                .from('transactions')
                .select('*')
                .eq('farmer_id', farmerId)
                .order('dt', { ascending: false });
            if (tx) setTxList(tx);

            const { data: pData } = await supabase
                .from('prices')
                .select('price')
                .order('effective_date', { ascending: false })
                .limit(1)
                .single();
            if (pData) setCurrentPrice(pData.price);
        }

        loadFarmerData();
    }, []);

    const totalBerat = txList.reduce((acc, curr) => acc + Number(curr.net), 0);
    const totalLunas = txList.filter((x) => x.status === 'Lunas').reduce((acc, curr) => acc + Number(curr.total), 0);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login-petani');
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Halo, {farmer?.name || 'Petani'}</h1>
                        <p className="text-sm text-gray-500">Harga Hari Ini: <span className="font-bold text-emerald-700">{rp(currentPrice)}/kg</span></p>
                    </div>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200">
                        Keluar
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Total Sawit Terjual</span>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{kg(totalBerat)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Total Uang Diterima (Lunas)</span>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{rp(totalLunas)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b font-bold text-gray-800">Riwayat Penjualan Anda</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3">No. Transaksi</th>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Berat Bersih</th>
                                    <th className="p-3">Total Pembayaran</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {txList.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-mono">{t.id}</td>
                                        <td className="p-3">{fmtD(t.dt)}</td>
                                        <td className="p-3 font-semibold">{kg(t.net)}</td>
                                        <td className="p-3 font-bold text-emerald-800">{rp(t.total)}</td>
                                        <td className="p-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}