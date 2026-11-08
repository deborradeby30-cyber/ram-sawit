'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { rp, fmtD } from '@/lib/utils';

export default function HargaPage() {
    const supabase = createClient();
    const [prices, setPrices] = useState<any[]>([]);
    const [price, setPrice] = useState<number>(0);
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

    const loadPrices = async () => {
        const { data } = await supabase.from('prices').select('*').order('effective_date', { ascending: false });
        if (data) setPrices(data);
    };

    useEffect(() => {
        loadPrices();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('prices').insert({ price, effective_date: date });
        if (error) alert('Gagal: ' + error.message);
        else {
            alert('Harga baru disimpan!');
            loadPrices();
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-bold mb-4">Update Harga Sawit Baru</h2>
                <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="number"
                        placeholder="Harga per kg (Rp)"
                        value={price || ''}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="p-2 border rounded text-sm flex-1"
                        required
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="p-2 border rounded text-sm flex-1"
                        required
                    />
                    <button type="submit" className="bg-emerald-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-800">
                        Simpan Harga
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b font-bold">Riwayat Perubahan Harga</div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">Tanggal Berlaku</th>
                            <th className="p-3">Harga Sawit / kg</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {prices.map((p) => (
                            <tr key={p.id}>
                                <td className="p-3">{fmtD(p.effective_date)}</td>
                                <td className="p-3 font-bold text-emerald-800">{rp(p.price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}