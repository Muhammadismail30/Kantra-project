import http from 'k6/http';
import { check, sleep } from 'k6';

// Konfigurasi pengujian k6
export const options = {
  // Skenario Ramp-up: Bertahap naik hingga 10.000 pengguna (Virtual Users / VUs)
  stages: [
    { duration: '1m', target: 1000 },  // Tahap 1: Naik perlahan ke 1.000 VUs (batas aman server saat ini)
    { duration: '2m', target: 1000 },  // Tahap 2: Tahan di 1.000 VUs selama 2 menit (Baseline)
    { duration: '3m', target: 5000 },  // Tahap 3: Naik bertahap ke 5.000 VUs
    { duration: '3m', target: 10000 }, // Tahap 4: Naik ke puncak 10.000 VUs
    { duration: '5m', target: 10000 }, // Tahap 5: Tahan beban puncak 10.000 VUs selama 5 menit
    { duration: '2m', target: 0 },     // Tahap 6: Turun perlahan hingga 0 (Cool down)
  ], 
  
  // Ambang batas kelulusan (Thresholds) sesuai standar performa
  thresholds: {
    // 95% dari total request harus selesai di bawah 2000 milidetik (2 detik)
    http_req_duration: ['p(95)<2000'], 
    // Tingkat kegagalan (error rate) tidak boleh lebih dari 1%
    http_req_failed: ['rate<0.01'],    
  },
};

// Skenario simulasi pengguna
export default function () {
  // Simulasi pengguna mengakses endpoint pencarian aplikasi
  // (Sesuaikan URL ini dengan endpoint API Node.js kamu)
  const res = http.get('http://localhost:5000/api/board');

  // Validasi respons dari server
  check(res, {
    'status is 200 (Berhasil)': (r) => r.status === 200,
    'waktu respons < 2000ms': (r) => r.timings.duration < 2000,
  });

  // Jeda 1 detik antar interaksi agar menyerupai perilaku manusia nyata
  sleep(1); 
}
