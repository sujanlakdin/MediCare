const fs = require('fs');
const test = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test', email: 'test12@test.com', password: 'password123' })
    });
    const data = await res.json();
    fs.writeFileSync('test-output.json', JSON.stringify(data, null, 2));
    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
test();
