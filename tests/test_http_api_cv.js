const http = require('http');
const path = require('path');
const app = require('../backend/app');

async function testHttpApi() {
  console.log('--- Testing HTTP Express API Video Processing Route ---');

  // Start server on test port 5002
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5002, resolve));
  console.log('Test Express server listening on port 5002');

  const studentROIs = [
    {
      id: 's_001',
      studentName: 'Sneha (S1)',
      row: 2,
      bench: 2,
      seat: 2,
      seatId: 'R2-B2-S2',
      benchId: 'B02',
      roi: { x: 1060, y: 560, width: 440, height: 380 }
    },
    {
      id: 's_002',
      studentName: 'Rahul (S2)',
      row: 2,
      bench: 1,
      seat: 1,
      seatId: 'R2-B1-S1',
      benchId: 'B01',
      roi: { x: 180, y: 560, width: 440, height: 380 }
    }
  ];

  // 1. Test POST /api/videos/process
  console.log('Sending POST /api/videos/process...');
  const postData = JSON.stringify({
    filename: 'examination_cctv_footage.mp4',
    studentROIs,
    cvConfig: {
      min_movement_area: 350,
      outside_ratio_threshold: 0.25,
      min_persistence_frames: 3
    }
  });

  const postRes = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5002,
        path: '/api/videos/process',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Bearer demo_faculty_token_dev'
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('POST Response:', postRes);

  if (postRes.statusCode !== 200 || !postRes.data.success) {
    console.error('POST /api/videos/process failed!');
    server.close();
    process.exit(1);
  }

  const videoId = postRes.data.videoId;
  console.log(`Polling status for videoId: ${videoId}...`);

  // 2. Poll GET /api/videos/process/status/:videoId
  let completed = false;
  let attempts = 0;

  while (!completed && attempts < 30) {
    attempts++;
    await new Promise((r) => setTimeout(r, 1000));

    const statusRes = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 5002,
          path: `/api/videos/process/status/${videoId}`,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer demo_faculty_token_dev'
          }
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
        }
      );
      req.on('error', reject);
      req.end();
    });

    const job = statusRes.data;
    console.log(`[Poll #${attempts}] Status: ${job.status} (${job.percent}%) | Message: ${job.message}`);

    if (job.status === 'completed') {
      completed = true;
      console.log('\n=== HTTP API END-TO-END VERIFICATION SUCCEEDED ===');
      console.log(`Incidents returned via HTTP: ${job.incidents.length}`);
      break;
    }

    if (job.status === 'failed') {
      console.error('Job failed with error:', job.error);
      server.close();
      process.exit(1);
    }
  }

  server.close();
  console.log('HTTP Test complete.');
  process.exit(0);
}

testHttpApi().catch((err) => {
  console.error('HTTP Test Error:', err);
  process.exit(1);
});
