'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { rp, kg, fmtD } from '@/lib/utils';

export default function RiwayatPage() {
    const supabase = createClient();
    const [txList, setTxList] = useState<any[]>([]);

    const loadTx = async () => {
        const { data } = await supabase.from('transactions').select('*, farmers(name)').order('dt', { ascending: false });
        if (data) setTxList(data);
    };

    useEffect(() => {
        loadTx();
    }, []);

    const markAsPaid = async (id: string) => {
        const { error } = await supabase.from('transactions').update({ status: 'Lunas' }).eq('id', id);
        if (!error) loadTx();
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-bold">Riwayat Seluruh Transaksi</h2>
                <button onClick={() => window.print()} className="bg-gray-800 text-white text-xs px-4 py-2 rounded-lg">
                    Cetak Laporan
                </button>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-3">No. Transaksi</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Petani</th>
                        <th className="p-3">Berat Bersih</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {txList.map((t) => (
                        <tr key={t.id}>
                            <td className="p-3 font-mono">{t.id}</td>
                            <td className="p-3">{fmtD(t.dt)}</td>
                            <td className="p-3">{t.farmers?.name || t.farmer_id}</td>
                            <td className="p-3 font-semibold">{kg(t.net)}</td>
                            <td className="p-3 font-bold text-emerald-800">{rp(t.total)}</td>
                            <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="p-3">
                                {t.status !== 'Lunas' && (
                                    <button onClick={() => markAsPaid(t.id)} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded">
                                        Tandai Lunas
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}