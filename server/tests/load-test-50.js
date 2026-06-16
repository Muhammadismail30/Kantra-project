import http from 'k6/http';
import { check, sleep } from 'k6';

// Skenario: Load Test konstan 50 Virtual Users selama 1 menit
export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Target P95 di bawah 2 detik
    http_req_failed: ['rate<0.01'],    // Toleransi error maksimal 1%
  },
};

export default function () {
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzgwMDk5ODA3LCJleHAiOjE3ODAxODYyMDd9.s_7XzWc2m1uv0ohmxLEBjvs9BOnITc83t4tQbWNywaY';

  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // Sesuaikan endpoint ini dengan rute GET yang valid di aplikasi Kantra
  const res = http.get('http://localhost:5000/api/boards', params);

  check(res, {
    'status is 200 (Berhasil)': (r) => r.status === 200,
  });

  sleep(1);
}