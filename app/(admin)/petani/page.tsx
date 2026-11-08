'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PetaniPage() {
    const supabase = createClient();
    const [farmers, setFarmers] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [hp, setHp] = useState('');
    const [addr, setAddr] = useState('');
    const [loading, setLoading] = useState(false);

    const loadFarmers = async () => {
        const { data } = await supabase.from('farmers').select('*').order('id');
        if (data) setFarmers(data);
    };

    useEffect(() => {
        loadFarmers();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.rpc('create_ram_user_v2', {
            p_username: id,
            p_password: 'petani123',
            p_role: 'petani',
            p_name: name,
            p_hp: hp,
            p_addr: addr,
        });

        setLoading(false);
        if (error) {
            alert('Gagal menyimpan: ' + error.message);
        } else {
            alert('Data petani & akun berhasil disimpan!');
            setId('');
            setName('');
            setHp('');
            setAddr('');
            loadFarmers();
        }
    };

    const filtered = farmers.filter(
        (f) =>
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-bold mb-4">Tambah / Registrasi Petani Baru</h2>
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="ID (misal: P004)"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="p-2 border rounded text-sm uppercase"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-2 border rounded text-sm"
                        required
                    />
                    <input
                        type="text"
                        placeholder="No HP (08xxx)"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="p-2 border rounded text-sm"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Alamat"
                        value={addr}
                        onChange={(e) => setAddr(e.target.value)}
                        className="p-2 border rounded text-sm"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="sm:col-span-2 lg:col-span-4 bg-emerald-700 text-white font-bold py-2 rounded-lg hover:bg-emerald-800"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Petani'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold">Daftar Petani</h2>
                    <input
                        type="text"
                        placeholder="Cari petani..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 border rounded text-sm w-64"
                    />
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Nama</th>
                            <th className="p-3">No. HP</th>
                            <th className="p-3">Alamat</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-50">
                                <td className="p-3 font-mono font-bold">{f.id}</td>
                                <td className="p-3">{f.name}</td>
                                <td className="p-3">{f.hp}</td>
                                <td className="p-3">{f.addr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}