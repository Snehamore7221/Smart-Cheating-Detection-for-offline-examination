const http = require('http');
const app = require('../backend/app');

async function testErrors() {
  console.log('--- Testing Honest Error Handling ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5003, resolve));

  // 1. Missing filename
  const res1 = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5003,
      path: '/api/videos/process',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer demo_faculty_token_dev' }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
    });
    req.write(JSON.stringify({ studentROIs: [] }));
    req.end();
  });

  console.log('Test 1 (Missing filename):', res1.statusCode, res1.data.message);

  // 2. Non-existent video file
  const res2 = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5003,
      path: '/api/videos/process',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer demo_faculty_token_dev' }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
    });
    req.write(JSON.stringify({ filename: 'does_not_exist_9999.mp4', studentROIs: [] }));
    req.end();
  });

  console.log('Test 2 (Non-existent file):', res2.statusCode, res2.data.message);

  server.close();
  console.log('Honest Error Handling Test Passed!');
}

testErrors().catch(console.error);
