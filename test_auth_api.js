const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

async function testAuth() {
  const testEmail = `caregiver_${Date.now()}@gmail.com`;
  const testPassword = 'Password123!';

  console.log(`1. Testing Registration for ${testEmail}...`);
  try {
    const regRes = await makeRequest('/api/auth/register', {
      fullName: 'Test Caregiver',
      email: testEmail,
      password: testPassword,
      role: 'caregiver',
    });
    console.log('Registration Response:', regRes);

    console.log('\n2. Testing Login for newly registered caregiver...');
    const loginRes = await makeRequest('/api/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    console.log('Login Response:', loginRes);
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

testAuth();
