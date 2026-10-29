const path = require('path');
const fs = require('fs');
const { runCVProcessor, getCVJobStatus } = require('../backend/services/cvBridge');

async function testPipeline() {
  console.log('--- Starting End-to-End Real OpenCV Pipeline Test ---');

  const videoId = 'test_benchmark_cv';
  const videoPath = path.join(__dirname, '../data/videos/examination_cctv_footage.mp4');

  if (!fs.existsSync(videoPath)) {
    console.error('Video file not found at:', videoPath);
    process.exit(1);
  }

  // 4 student ROIs matching test setup:
  // S1 (Bottom-Right), S2 (Bottom-Left), S3 (Top-Right), S4 (Top-Left)
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
    },
    {
      id: 's_003',
      studentName: 'Aarav (S3)',
      row: 1,
      bench: 2,
      seat: 2,
      seatId: 'R1-B2-S2',
      benchId: 'B02',
      roi: { x: 1060, y: 120, width: 440, height: 380 }
    },
    {
      id: 's_004',
      studentName: 'Priya (S4)',
      row: 1,
      bench: 1,
      seat: 1,
      seatId: 'R1-B1-S1',
      benchId: 'B01',
      roi: { x: 180, y: 120, width: 440, height: 380 }
    }
  ];

  const cvConfig = {
    min_movement_area: 350,
    outside_ratio_threshold: 0.25,
    min_persistence_frames: 3,
    alert_cooldown_frames: 30
  };

  console.log(`Launching cvBridge for video: ${videoPath}`);
  const job = runCVProcessor(videoId, videoPath, studentROIs, cvConfig, (incident) => {
    console.log(`[ALERT CALLBACK] Detected: ${incident.studentName} (${incident.activityType}) at ${incident.timestamp}`);
  });

  console.log(`Initial status: ${job.status}`);

  // Poll status until completion
  const startTime = Date.now();
  while (true) {
    await new Promise((r) => setTimeout(r, 1000));
    const status = getCVJobStatus(videoId);

    if (!status) {
      console.log('Job status not found');
      break;
    }

    console.log(
      `[POLL ${Math.round((Date.now() - startTime) / 1000)}s] Status: ${status.status} | ` +
      `Progress: ${status.percent}% | Frame: ${status.currentFrame}/${status.totalFrames} | ` +
      `Incidents: ${status.incidents.length}`
    );

    if (status.status === 'completed') {
      console.log('\n=== REAL OPENCV ANALYSIS COMPLETED SUCCESSFULLY ===');
      console.log(`Processed frames: ${status.currentFrame} / ${status.totalFrames}`);
      console.log(`Total Incidents generated: ${status.incidents.length}`);
      status.incidents.forEach((inc, idx) => {
        console.log(`\nIncident #${idx + 1}:`);
        console.log(`  Student: ${inc.studentName} (${inc.seatId})`);
        console.log(`  Type: ${inc.activityType || inc.type}`);
        console.log(`  Timestamp: ${inc.timestamp} (${inc.timeSec}s)`);
        console.log(`  Outside Ratio: ${inc.outsideRatio}`);
        console.log(`  Movement Area: ${inc.movementArea} px`);
        console.log(`  Reason: ${inc.reason}`);
      });
      break;
    }

    if (status.status === 'failed') {
      console.error('\n=== OPENCV ANALYSIS FAILED ===');
      console.error('Error message:', status.error);
      process.exit(1);
    }
  }

  console.log('\n--- Test Finished ---');
  process.exit(0);
}

testPipeline().catch((err) => {
  console.error('Test pipeline error:', err);
  process.exit(1);
});
