export const rp = (n: number) =>
  'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

export const kg = (n: number) =>
  (Math.round((n || 0) * 10) / 10).toLocaleString('id-ID') + ' kg';

export const fmtD = (s: string) =>
  new Date(s).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export function hitungTransaksi(gross: number, tare: number, price: number, cut: number) {
  const net = Math.max(0, gross - tare);
  const total = Math.max(0, net * price - cut);
  return { net, total };
}