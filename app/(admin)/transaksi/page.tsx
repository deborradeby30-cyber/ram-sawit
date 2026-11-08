'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { rp, hitungTransaksi } from '@/lib/utils';

export default function TransaksiPage() {
    const supabase = createClient();
    const [farmers, setFarmers] = useState<any[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [nextNo, setNextNo] = useState<string>('');

    const [selectedFarmer, setSelectedFarmer] = useState('');
    const [hp, setHp] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [gross, setGross] = useState<number>(0);
    const [tare, setTare] = useState<number>(0);
    const [cut, setCut] = useState<number>(0);
    const [method, setMethod] = useState<'Tunai' | 'Transfer'>('Tunai');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function initData() {
            const { data: fData } = await supabase.from('farmers').select('*').order('name');
            if (fData) setFarmers(fData);

            const { data: pData } = await supabase
                .from('prices')
                .select('price')
                .lte('effective_date', new Date().toISOString().slice(0, 10))
                .order('effective_date', { ascending: false })
                .limit(1)
                .single();
            if (pData) setCurrentPrice(pData.price);

            const { data: noData } = await supabase.rpc('get_next_tx_no');
            if (noData) setNextNo(noData);
        }
        initData();
    }, []);

    const handleFarmerChange = (id: string) => {
        setSelectedFarmer(id);
        const f = farmers.find((x) => x.id === id);
        setHp(f ? f.hp : '');
    };

    const { net, total } = hitungTransaksi(gross, tare, currentPrice, cut);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (gross <= tare) {
            alert('Berat kosong (Tare) harus lebih kecil dari Berat kotor (Gross)');
            return;
        }

        setLoading(true);
        const status = method === 'Tunai' ? 'Lunas' : 'Menunggu';

        const { error } = await supabase.from('transactions').insert({
            id: nextNo,
            farmer_id: selectedFarmer,
            vehicle,
            gross,
            tare,
            price: currentPrice,
            cut,
            method,
            status,
        });

        setLoading(false);

        if (error) {
            alert('Gagal menyimpan: ' + error.message);
        } else {
            alert(`Transaksi ${nextNo} berhasil disimpan!`);
            setVehicle('');
            setGross(0);
            setTare(0);
            setCut(0);
            const { data: newNo } = await supabase.rpc('get_next_tx_no');
            if (newNo) setNextNo(newNo);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border shadow-sm">
            <h1 className="text-xl font-bold text-gray-800 mb-6">Form Transaksi Penimbangan</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">No. Transaksi</label>
                    <input type="text" value={nextNo} readOnly className="w-full mt-1 p-2 bg-gray-100 border rounded font-mono text-sm" />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">Pilih Petani</label>
                    <select
                        value={selectedFarmer}
                        onChange={(e) => handleFarmerChange(e.target.value)}
                        className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-emerald-500"
                        required
                    >
                        <option value="">-- Pilih Petani --</option>
                        {farmers.map((f) => (
                            <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">No. HP</label>
                    <input type="text" value={hp} readOnly className="w-full mt-1 p-2 bg-gray-100 border rounded text-sm" />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">No. Kendaraan</label>
                    <input
                        type="text"
                        placeholder="KB 1234 AB"
                        value={vehicle}
                        onChange={(e) => setVehicle(e.target.value)}
                        className="w-full mt-1 p-2 border rounded text-sm uppercase"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">Berat Kotor (Gross / kg)</label>
                    <input
                        type="number"
                        value={gross || ''}
                        onChange={(e) => setGross(Number(e.target.value))}
                        className="w-full mt-1 p-2 border rounded text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">Berat Kosong (Tare / kg)</label>
                    <input
                        type="number"
                        value={tare || ''}
                        onChange={(e) => setTare(Number(e.target.value))}
                        className="w-full mt-1 p-2 border rounded text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">Berat Bersih (Netto)</label>
                    <input type="text" value={`${net} kg`} readOnly className="w-full mt-1 p-2 bg-emerald-50 text-emerald-800 font-bold border rounded text-sm" />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">Harga Sawit / kg</label>
                    <input type="text" value={rp(currentPrice)} readOnly className="w-full mt-1 p-2 bg-gray-100 border rounded text-sm" />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">Potongan (Rp)</label>
                    <input
                        type="number"
                        value={cut}
                        onChange={(e) => setCut(Number(e.target.value))}
                        className="w-full mt-1 p-2 border rounded text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase">Metode Pembayaran</label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value as any)}
                        className="w-full mt-1 p-2 border rounded text-sm"
                    >
                        <option value="Tunai">Tunai (Langsung Lunas)</option>
                        <option value="Transfer">Transfer (Menunggu)</option>
                    </select>
                </div>

                <div className="md:col-span-2 p-4 bg-emerald-100 rounded-lg flex justify-between items-center mt-2">
                    <span className="font-semibold text-emerald-900">Total Pembayaran:</span>
                    <span className="text-2xl font-extrabold text-emerald-950">{rp(total)}</span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="md:col-span-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg transition"
                >
                    {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
            </form>
        </div>
    );
}