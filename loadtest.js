import http from 'k6/http';
import { check, sleep } from 'k6';

// Konfigurasi Ramp-up yang AMAN untuk laptop lokal (skala kecil dari 10.000)
export const options = {
  stages: [
    { duration: '10s', target: 10 },  // Naik perlahan ke 10 user
    { duration: '15s', target: 50 },  // Peak load simulasi 50 user
    { duration: '10s', target: 0 },   // Turun kembali ke 0
  ],
};

export default function () {
  // Ganti URL ini dengan salah satu endpoint API GET milikmu yang sudah berjalan
  const res = http.get('http://localhost:5000/api/boards/1'); 
  
  check(res, {
    'status API 200 (Sukses)': (r) => r.status === 200,
    'waktu respon < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}