'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { rp, kg } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
    const supabase = createClient();
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [totalNet, setTotalNet] = useState<number>(0);
    const [totalPay, setTotalPay] = useState<number>(0);
    const [farmerCount, setFarmerCount] = useState<number>(0);
    const [recentTx, setRecentTx] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            const today = new Date().toISOString().slice(0, 10);

            const { data: pData } = await supabase
                .from('prices')
                .select('price')
                .lte('effective_date', today)
                .order('effective_date', { ascending: false })
                .limit(1)
                .single();
            if (pData) setCurrentPrice(pData.price);

            const { data: txData } = await supabase
                .from('transactions')
                .select('*')
                .gte('dt', `${today}T00:00:00`);

            if (txData) {
                setTotalNet(txData.reduce((acc, curr) => acc + Number(curr.net), 0));
                setTotalPay(txData.reduce((acc, curr) => acc + Number(curr.total), 0));
                setFarmerCount(new Set(txData.map((x) => x.farmer_id)).size);
            }

            const { data: recent } = await supabase
                .from('transactions')
                .select('*, farmers(name)')
                .order('dt', { ascending: false })
                .limit(5);

            if (recent) setRecentTx(recent);
        }

        loadData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-emerald-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold">Harga Sawit Hari Ini</h1>
                    <p className="text-3xl font-extrabold text-amber-400 mt-1">{rp(currentPrice)} <span className="text-sm text-emerald-200 font-normal">/ kg</span></p>
                </div>
                <Link href="/transaksi" className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-5 py-2.5 rounded-xl transition">
                    + Tambah Penimbangan
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Total Berat Hari Ini</span>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{kg(totalNet)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Total Pembayaran Hari Ini</span>
                    <p className="text-2xl font-bold text-emerald-800 mt-1">{rp(totalPay)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Petani Menjual Hari Ini</span>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{farmerCount} Orang</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b font-bold text-slate-500">Transaksi Terbaru</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-slate-500">
                            <tr>
                                <th className="p-3">No. Transaksi</th>
                                <th className="p-3">Petani</th>
                                <th className="p-3">Berat Bersih</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {recentTx.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-mono">{tx.id}</td>
                                    <td className="p-3 font-medium">{tx.farmers?.name || tx.farmer_id}</td>
                                    <td className="p-3">{kg(tx.net)}</td>
                                    <td className="p-3 font-bold text-emerald-800">{rp(tx.total)}</td>
                                    <td className="p-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tx.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}