# Face Detection Implementation

## Overview
We have implemented a secure face detection and monitoring system using `face-api.js`. This system runs entirely on the client side (in the browser/Electron app) to ensure real-time performance and privacy.

## Features
1.  **Reference Face Capture**: At the start of the exam (during the instruction/preview phase), the system automatically scans the student's face to create a "Reference Descriptor". This happens silently once the camera is active.
2.  **Continuous Monitoring**: During the exam, the system checks the camera feed every 3 seconds.
3.  **Face Presence Check**: If no face is detected, a warning is shown ("Face not detected") and logged.
4.  **Multiple Person Detection**: If more than one face is detected in the frame, a high-severity warning is triggered ("Multiple people detected").
5.  **Identity Verification**: If exactly one face is detected, it is compared against the Reference Descriptor. If it doesn't match (Euclidean distance > 0.6), a severe warning is shown ("Face mismatch") and a high-severity event is logged.

## Technical Details

### Dependencies
-   `face-api.js`: Handles face detection, landmark detection, and face recognition (descriptors).

### Models
The system uses the following neural network models:
-   `ssdMobilenetv1`: A high-accuracy model for face detection (replaces TinyFaceDetector for better reliability with glasses/low light).
-   `faceLandmark68Net`: For aligning the face.
-   `faceRecognitionNet`: For generating the unique 128-value descriptor vector for identity comparison.

Current model source: `https://justadudewhohacks.github.io/face-api.js/models` (CDN). Application requires internet access to load these initially. For offline support, download these models to `public/models` and update `FaceDetectionService.js`.

### Implementation Structure
-   **Service**: `src/services/FaceDetectionService.js` encapsulates all face-api logic.
-   **Integration**: `src/pages/ExamPage.jsx` initializes the service and runs the monitoring loops.

### Multiple Person Detection Logic
The system uses `ssdMobilenetv1` to scan the entire frame.
-   **Count = 0**: Warning (Medium Severity).
-   **Count = 1**: Identity verify.
-   **Count > 1**: "Multiple people detected" -> **Violation** (High Severity).

## How to Test
1.  Run the client (`npm run dev` or `npm run electron:dev`).
2.  Start an exam session.
3.  On the Instructions screen, wait for the "SCANNING FACE..." badge to turn into "FACE VERIFIED".
4.  Start the exam.
5.  **Test 1 (No Face)**: Cover your camera -> "Face not detected".
6.  **Test 2 (Multiple Faces)**: Have someone stand behind you -> "Multiple people detected".
7.  **Test 3 (Wrong Face)**: Swap seats with someone else -> "Face mismatch".
