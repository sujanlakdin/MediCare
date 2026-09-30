const test = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test', email: 'test1@test.com', password: 'password123' })
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
};
test();
