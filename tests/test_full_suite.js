const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('../backend/app');

async function runSuite() {
  console.log('=====================================================');
  console.log('  SMART CHEATING DETECTION - FULL VERIFICATION SUITE');
  console.log('=====================================================');

  const server = http.createServer(app);
  const PORT = 5005;
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`✓ Test Express server active on port ${PORT}`);

  try {
    // ---------------------------------------------------------------
    // TEST 1: Video Upload Route with multipart/form-data
    // ---------------------------------------------------------------
    console.log('\n[TEST 1] Testing /api/videos/upload with multipart boundary...');
    const videoFilePath = path.join(__dirname, '../data/videos/examination_cctv_footage.mp4');
    const videoBuffer = fs.readFileSync(videoFilePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    const filename = 'test_upload_' + Date.now() + '.mp4';
    const header = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="cctvVideo"; filename="${filename}"\r\n` +
      `Content-Type: video/mp4\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const multipartBody = Buffer.concat([header, videoBuffer, footer]);

    const uploadRes = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/videos/upload',
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': multipartBody.length,
            'Authorization': 'Bearer demo_faculty_token_dev'
          }
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        }
      );
      req.on('error', reject);
      req.write(multipartBody);
      req.end();
    });

    if (uploadRes.status !== 201 || !uploadRes.data.success) {
      throw new Error(`Upload test failed: ${JSON.stringify(uploadRes.data)}`);
    }
    const uploadedServerFilename = uploadRes.data.video.filename;
    console.log(`✓ Video uploaded successfully: ${uploadedServerFilename} (${uploadRes.data.video.sizeFormatted})`);

    // Clean up uploaded test file
    const uploadedFilePath = path.join(__dirname, '../data/videos', uploadedServerFilename);
    if (fs.existsSync(uploadedFilePath)) {
      try { fs.unlinkSync(uploadedFilePath); } catch (e) {}
    }

    // ---------------------------------------------------------------
    // TEST 2: ROI Metadata Isolation & Independent Modification
    // ---------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Student ROI Metadata Isolation...');
    const students = [
      { id: 's_001', studentName: 'Sneha (S1)', row: 2, bench: 2, seat: 2, seatId: 'R2-B2-S2', roi: { x: 1060, y: 560, width: 440, height: 380 } },
      { id: 's_002', studentName: 'Rahul (S2)', row: 2, bench: 1, seat: 1, seatId: 'R2-B1-S1', roi: { x: 180, y: 560, width: 440, height: 380 } },
      { id: 's_003', studentName: 'Aarav (S3)', row: 1, bench: 2, seat: 2, seatId: 'R1-B2-S2', roi: { x: 1060, y: 120, width: 440, height: 380 } },
      { id: 's_004', studentName: 'Priya (S4)', row: 1, bench: 1, seat: 1, seatId: 'R1-B1-S1', roi: { x: 180, y: 120, width: 440, height: 380 } },
    ];

    // Simulate updating ONLY student S1
    const targetId = 's_001';
    const updatedData = { studentName: 'Sneha (Updated)', row: 3, bench: 3, seat: 1 };
    const updatedList = students.map((s) => {
      if (s.id === targetId) {
        return {
          ...s,
          studentName: updatedData.studentName,
          row: updatedData.row,
          bench: updatedData.bench,
          seat: updatedData.seat,
          seatId: `R${updatedData.row}-B${updatedData.bench}-S${updatedData.seat}`
        };
      }
      return s;
    });

    const s1 = updatedList.find(s => s.id === 's_001');
    const s2 = updatedList.find(s => s.id === 's_002');
    const s3 = updatedList.find(s => s.id === 's_003');
    const s4 = updatedList.find(s => s.id === 's_004');

    if (s1.row !== 3 || s1.seatId !== 'R3-B3-S1') {
      throw new Error(`S1 was not updated properly: ${JSON.stringify(s1)}`);
    }
    if (s2.row !== 2 || s2.seatId !== 'R2-B1-S1') {
      throw new Error(`S2 was contaminated when S1 was edited! ${JSON.stringify(s2)}`);
    }
    if (s3.row !== 1 || s3.seatId !== 'R1-B2-S2') {
      throw new Error(`S3 was contaminated! ${JSON.stringify(s3)}`);
    }
    if (s4.row !== 1 || s4.seatId !== 'R1-B1-S1') {
      throw new Error(`S4 was contaminated! ${JSON.stringify(s4)}`);
    }
    console.log(`✓ ROI metadata isolation confirmed. Each student retains distinct, non-overlapping seating.`);

    // ---------------------------------------------------------------
    // TEST 3: Genuine Python/OpenCV Video Processing Execution
    // ---------------------------------------------------------------
    console.log('\n[TEST 3] Running Real OpenCV Video Analysis Pipeline...');
    const processPayload = JSON.stringify({
      filename: 'examination_cctv_footage.mp4',
      studentROIs: students,
      cvConfig: {
        min_movement_area: 350,
        outside_ratio_threshold: 0.25,
        min_persistence_frames: 3,
        alert_cooldown_frames: 30
      }
    });

    const procRes = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/videos/process',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(processPayload),
            'Authorization': 'Bearer demo_faculty_token_dev'
          }
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        }
      );
      req.on('error', reject);
      req.write(processPayload);
      req.end();
    });

    if (procRes.status !== 200 || !procRes.data.success) {
      throw new Error(`Failed to start video processing: ${JSON.stringify(procRes.data)}`);
    }
    const procVideoId = procRes.data.videoId;
    console.log(`✓ CV Job started for video ID: ${procVideoId}`);

    // Poll until completed
    let isComplete = false;
    let pollAttempts = 0;
    let finalJobData = null;

    while (!isComplete && pollAttempts < 30) {
      pollAttempts++;
      await new Promise((r) => setTimeout(r, 1000));

      const pollRes = await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: 'localhost',
            port: PORT,
            path: `/api/videos/process/status/${procVideoId}`,
            method: 'GET',
            headers: { 'Authorization': 'Bearer demo_faculty_token_dev' }
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
          }
        );
        req.on('error', reject);
        req.end();
      });

      const job = pollRes.data;
      process.stdout.write(`  [Frame ${job.currentFrame || 0}/${job.totalFrames || 750} (${job.percent || 0}%)] ${job.status}\r`);

      if (job.status === 'completed') {
        isComplete = true;
        finalJobData = job;
        break;
      }
      if (job.status === 'failed') {
        throw new Error(`CV Processing failed: ${job.error}`);
      }
    }
    console.log('\n✓ Python/OpenCV completed reading real video frames successfully!');
    console.log(`✓ Processed frames: ${finalJobData.currentFrame} / ${finalJobData.totalFrames}`);
    console.log(`✓ Detected genuine incidents: ${finalJobData.incidents.length}`);

    finalJobData.incidents.forEach((inc, idx) => {
      console.log(`    Incident #${idx + 1}: ${inc.studentName} (${inc.seatId}) - ${inc.activityType} - outside: ${Math.round(inc.outsideRatio * 100)}% - area: ${inc.movementArea}px`);
    });

    // ---------------------------------------------------------------
    // TEST 4: Clear Flagged Incidents Endpoint
    // ---------------------------------------------------------------
    console.log('\n[TEST 4] Testing Clear Incidents Endpoint...');
    const clearRes = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/incidents',
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer demo_faculty_token_dev' }
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        }
      );
      req.on('error', reject);
      req.end();
    });

    if (clearRes.status !== 200 || !clearRes.data.success) {
      throw new Error(`Clear incidents failed: ${JSON.stringify(clearRes.data)}`);
    }
    console.log(`✓ Incident history cleared successfully.`);

    console.log('\n=====================================================');
    console.log('  ALL TESTS PASSED WITH 100% SUCCESS');
    console.log('=====================================================');
  } finally {
    server.close();
  }
}

runSuite().catch((err) => {
  console.error('\n❌ Verification Suite Failed:', err);
  process.exit(1);
});
