import http from 'k6/http';
import { check, sleep } from 'k6';

// Skenario: Stress Test dengan Ramp-up beban bertahap hingga 200 VU
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Pemanasan ke 50 VU
    { duration: '1m', target: 200 },  // Ramp-up ekstrem ke 200 VU
    { duration: '1m', target: 200 },  // Tahan di beban puncak 200 VU
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const TOKEN = 'paste_token_jwt_asli_kamu_di_sini';

  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get('http://localhost:5000/api/boards', params);

  check(res, {
    'status is 200 (Berhasil)': (r) => r.status === 200,
  });

  sleep(1);
}