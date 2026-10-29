# 📱 Smart Cheating Detection System (Offline Examination Surveillance)

An AI-powered offline examination surveillance and cheating detection platform designed for faculty and invigilators. The system monitors examination hall CCTV footage, detects unauthorized **Mobile Phones**, maps every detection to configurable classroom benches and student seats, and provides comprehensive incident verification tools.

---

## 🚀 Tech Stack Overview

### **1. Frontend (User Interface & Real-time Canvas Overlays)**
| Layer / Library | Technology | Description & Role |
| :--- | :--- | :--- |
| **Framework** | **React 18.2** | Modern component-based declarative UI architecture |
| **Build Tool & Bundler** | **Vite 5.4** | Ultra-fast Hot Module Replacement (HMR) & ES module bundler |
| **Styling & Design** | **Tailwind CSS 3.4** | Utility-first responsive styling with clean examination theme |
| **Routing** | **React Router DOM v6** | Single-page application (SPA) client-side routing |
| **Icons** | **Lucide React** | Clean, modern feather icon set for all HUD and control elements |
| **HTTP Client** | **Axios 1.6** | REST API client for backend communication and video handling |
| **State Management** | **React Context API** | Global state orchestration for classroom grid, video, and incidents |
| **Audio Engine** | **Web Audio API** | Dynamic synthesized audio cues/beeps on real-time phone alerts |

---

### **2. Backend & API Services (Server Architecture)**
| Layer / Library | Technology | Description & Role |
| :--- | :--- | :--- |
| **Runtime** | **Node.js (ES Modules / CJS)** | Asynchronous event-driven server runtime |
| **Framework** | **Express.js 4.19** | High-performance RESTful API framework |
| **Database & ODM** | **MongoDB & Mongoose 8.3** | Document database for persistent incident logging and users |
| **Authentication** | **JWT (JSON Web Tokens) & bcryptjs** | Role-based authentication (`FACULTY` only) with salted hashing |
| **File Upload Handling** | **Multer 1.4** | Multipart/form-data video streaming and storage processor |
| **Process Bridge** | **Node.js Child Process (`spawn`)** | Real-time inter-process bridge piping stdout/stderr from CV engine |
| **Environment Management** | **dotenv** | Secure environment configuration management |

---

### **3. Computer Vision & Detection Pipeline (CV & Algorithms)**
| Component | Technology | Description & Role |
| :--- | :--- | :--- |
| **Vision Framework** | **OpenCV 4.8 (`cv2`)** | Real-time image processing, edge detection & contour extraction |
| **Numerical Processing** | **NumPy 1.24** | High-dimensional array transformations and matrix operations |
| **Mobile Phone Detector** | **PhoneDetector (Aspect & Extent Heuristic)** | Bounding-box aspect ratio check (1.5–2.3 portrait / 0.43–0.67 landscape) & rectangularity extent verification |
| **Spatial Coordinate Mapper** | **BenchMapper & Dynamic Seat Matrix** | Converts pixel / percentage coordinates $(x, y, w, h)$ into exact `Row R`, `Bench B`, and `Seat S` |
| **Temporal Consistency Engine** | **Multi-Frame Accumulator** | Multi-frame persistence window (ignores single-frame noise/false-positives) |

---

## 🛠️ System Architecture & Data Flow

```
+-------------------------------------------------------------------------------+
|                             FACULTY USER INTERFACE                            |
|                                                                               |
|  +-------------------------------------+   +-------------------------------+  |
|  |       VIDEO PLAYER + HUD OVERLAY    |   |  BENCH & SEAT CONFIGURATION   |  |
|  |  * MP4 Video Player / Canvas        |   |  * Rows (R) x Benches (B)     |  |
|  |  * Real-time Detection Bounding Box |<--|  * Seats per Bench (S)        |  |
|  |  * Target Reticle & Audio Alert     |   |  * Student Name Mapping       |  |
|  |  * Classroom Perspective HUD        |   |  * Two-way Hover/Seek Sync    |  |
|  +-------------------------------------+   +-------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        |
                             (REST API & WebSocket)
                                        |
+---------------------------------------v---------------------------------------+
|                              NODE.JS / EXPRESS BACKEND                        |
|                                                                               |
|   [ Auth Controller ]     [ Video Streaming Engine ]    [ Incident Manager ]  |
|   - Faculty JWT Guard     - HTTP 206 Partial Content    - Incident Logging    |
|   - bcrypt verification   - Chunked MP4 Uploads         - MongoDB Storage     |
+---------------------------------------+---------------------------------------+
                                        |
                           (Child Process CLI / Stream)
                                        |
+---------------------------------------v---------------------------------------+
|                      COMPUTER VISION & DETECTION PIPELINE                     |
|                                                                               |
|   +-----------------------+   +----------------------+   +----------------+   |
|   |  FRAME EXTRACTION     |-->|  ZONE-BASED FILTER   |-->| PHONE DETECTOR |   |
|   |  OpenCV VideoCapture  |   |  Student Seating ROI |   | Contour Extent |   |
|   +-----------------------+   +----------------------+   +--------+-------+   |
|                                                                   |           |
|                               +-----------------------------------+           |
|                               v                                               |
|               +-------------------------------+                               |
|               | DYNAMIC BENCH MAPPING ENGINE  |                               |
|               | Matches (x, y) to Row/Seat    |                               |
|               +---------------+---------------+                               |
|                               |                                               |
|                               v                                               |
|               +-------------------------------+                               |
|               |  TEMPORAL CONSISTENCY BUFFER  |                               |
|               |  Requires N persistent frames |                               |
|               +-------------------------------+                               |
+-------------------------------------------------------------------------------+
```

---

## 💡 Key Features Implemented

1. **Direct On-Video Classroom Overlay**:
   - Displays classroom grid (`Row 1`, `Row 2`, `Bench 1 [B01]`, `Bench 2 [B02]`) directly on top of the examination video player.
   - Shows individual student seat names (`S1: Sneha`, `S2: Rahul`) over each desk.
   - Includes **`▲ FRONT / BLACKBOARD ▲`** orientation perspective.

2. **Accurate Phone Detection & Seat Mapping**:
   - Dynamically calculates bounding box coordinates relative to classroom layout.
   - When a phone is detected, the bounding box locks onto that specific student's seat.
   - Real-time animated target reticle with corner brackets and confidence scores.

3. **Dynamic Classroom Reconfiguration**:
   - Faculty can change the number of rows, benches per row, and seats per bench on the fly.
   - Inline student name editing with instant synchronization across video and reports.

4. **Multi-level Detection Sensitivity**:
   - **Standard (88%+)**: Balanced for standard classroom lighting.
   - **High Sensitivity (82%+)**: Scans for partially concealed phones.
   - **Strict (92%+)**: Zero false-alarm mode.

5. **Two-Way Hover & Video Seeking**:
   - Hovering over a bench card in the configuration panel lights up that bench on the video player.
   - Clicking a detection timestamp automatically seeks the video directly to the incident.

6. **Incident History & Evidence Modal**:
   - Tabular log of all confirmed mobile phone incidents.
   - Filters by bench ID, student name, or date with 1-click video timestamp jump.

---

## 📁 Directory Structure

```
smart-cheating-detection/
├── frontend/                       # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/             # UI Components
│   │   │   ├── VideoSection.jsx    # Video player & On-video bench overlay
│   │   │   ├── BenchConfigSection.jsx # Classroom layout & student assignment
│   │   │   ├── IncidentModal.jsx   # Incident detail modal with seek trigger
│   │   │   └── Navbar.jsx          # Faculty navigation bar
│   │   ├── context/
│   │   │   └── ExamContext.jsx     # Global exam & detection state provider
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Faculty authentication
│   │   │   ├── MainDetectionPage.jsx # Main 2-column surveillance dashboard
│   │   │   └── IncidentHistoryPage.jsx # Incident logs & analytics
│   │   ├── services/
│   │   │   └── examService.js      # Layout generator & detection coordinator
│   │   ├── index.css               # Tailwind directives & custom CSS
│   │   ├── App.jsx                 # Route definitions
│   │   └── main.jsx                # Application root entrypoint
│   ├── package.json
│   └── vite.config.js
├── backend/                        # Node.js Express API Server
│   ├── controllers/                # Auth, Video, & Incident controllers
│   ├── middleware/                 # JWT Auth & Multer upload middleware
│   ├── models/                     # Mongoose Schemas (User, Incident)
│   ├── routes/                     # REST API endpoints
│   ├── services/                   # Child-process CV Bridge & Alert manager
│   ├── app.js
│   └── server.js
├── cv/                             # Computer Vision & Detection Engine
│   ├── phone_detector.py           # Phone contour analysis & heuristic filters
│   ├── bench_mapper.py             # Spatial bench coordinate mapper
│   ├── motion_detector.py          # Temporal motion persistence analyzer
│   └── video_processor.py          # Multi-stream frame processor & CLI runner
├── data/                           # Uploaded videos & evidence frames
├── package.json                    # Root backend dependencies & scripts
└── requirements.txt                # Python CV dependencies
```

---

## 💻 Getting Started / How to Run

### **Prerequisites**
- **Node.js**: `v18.x` or `v20.x`
- **Python**: `v3.9+` (with `pip`)
- **Git**

---

### **1. Install Dependencies**

```powershell
# 1. Install Backend Dependencies (Root directory)
npm install

# 2. Install Frontend Dependencies
cd frontend
npm install
cd ..

# 3. Install Python Computer Vision Dependencies (Optional for local CV runner)
pip install -r requirements.txt
```

---

### **2. Start the Application**

#### **Option A: Run Frontend & Backend Concurrently**
```powershell
npm run dev
```

#### **Option B: Run Individually**
```powershell
# Terminal 1: Start Backend Server (Port 5000)
npm run server

# Terminal 2: Start Frontend Dev Server (Port 3000 / 3001)
npm run client
```

---

## 🔑 Demo Credentials

| Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Faculty / Invigilator** | `faculty@exam.edu` | `Faculty@123` |
*(Or click **"Quick Demo Login"** on the login page for instant 1-click access)*
