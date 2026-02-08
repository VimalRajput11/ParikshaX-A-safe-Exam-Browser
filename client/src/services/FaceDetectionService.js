import * as faceapi from 'face-api.js';



// Use a reliable CDN or public URL for models
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

class FaceDetectionService {
    constructor() {
        this.modelsLoaded = false;
        this.referenceDescriptor = null;
        this.isMonitoring = false;
    }

    async loadModels() {
        if (this.modelsLoaded) return;

        try {
            console.log("Loading face detection models...");
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
            ]);
            this.modelsLoaded = true;
            console.log("Face detection models loaded successfully");
        } catch (error) {
            console.error("Error loading face models:", error);
            throw error;
        }
    }

    async detectFaces(videoElement) {
        if (!this.modelsLoaded || !videoElement) return [];

        // Ensure video is playing and has content
        if (videoElement.readyState < 2 || videoElement.paused || videoElement.ended) {
            return [];
        }

        // Use SSD MobileNet V1 options with lower confidence for better recall of multiple faces
        const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.15 });


        try {
            // Detect ALL faces
            const detections = await faceapi.detectAllFaces(videoElement, options)
                .withFaceLandmarks()
                .withFaceDescriptors();

            return detections;
        } catch (error) {
            console.error("Face detection crashed:", error);
            return [];
        }
    }

    setReferenceFace(descriptor) {
        this.referenceDescriptor = descriptor;
        console.log("Reference face set");
    }

    compareFace(newDescriptor) {
        if (!this.referenceDescriptor) return { match: false, distance: 100 };

        const distance = faceapi.euclideanDistance(this.referenceDescriptor, newDescriptor);

        // Log distance for debugging
        console.log(`[Face Match] Distance: ${distance.toFixed(4)}`);

        // Reverting to standard 0.60 threshold to fix false mismatches
        const threshold = 0.60;



        return {
            match: distance < threshold,
            distance: distance
        };

    }

    /**
     * Estimates head pose (Yaw - Left/Right, Pitch - Up/Down) from landmarks.
     * @param {faceapi.FaceLandmarks68} landmarks 
     * @returns {string} One of: 'center', 'looking_left', 'looking_right', 'looking_up', 'looking_down'
     */
    getHeadPose(landmarks) {
        const nose = landmarks.getNose();
        const jaw = landmarks.getJawOutline();

        const noseTip = nose[3]; // Tip of the nose
        const leftJaw = jaw[0];
        const rightJaw = jaw[16];

        // 1. Calculate Yaw (Left/Right Rotation)
        // Compare distance from nose to left jaw vs nose to right jaw
        const distToLeft = Math.abs(noseTip.x - leftJaw.x);
        const distToRight = Math.abs(noseTip.x - rightJaw.x);
        const totalWidth = distToLeft + distToRight;

        // Ratio close to 0.5 is center. < 0.35 is looking left (from camera view), > 0.65 is looking right
        const yawRatio = distToLeft / totalWidth;

        if (yawRatio < 0.30) return 'looking_right'; // User's right (Camera left)
        if (yawRatio > 0.70) return 'looking_left';  // User's left (Camera right)

        // 2. Calculate Pitch (Up/Down Tilt)
        // Compare nose tip vertical position relative to eye line and chin
        // This is a simplified heuristic
        const noseTop = nose[0];
        const noseHeight = Math.abs(noseTip.y - noseTop.y);

        // If the nose looks "short" vertically, they might be looking up. 
        // If it looks "long" or close to mouth, looking down.
        // A better metric: Position of nose tip relative to jaw bottom (chin)
        const chin = jaw[8];
        const distNoseToChin = Math.abs(chin.y - noseTip.y);

        // Face Height reference (Top of nose to Chin)
        const faceHeight = Math.abs(chin.y - noseTop.y);

        // Ratio: How far down is the nose tip?
        const pitchRatio = distNoseToChin / faceHeight;

        // Normal range is typically 0.35 - 0.50
        // Lower val (< 0.30) means nose is close to chin -> Looking Down
        // Higher val (> 0.60) means nose is far from chin -> Looking Up
        if (pitchRatio < 0.25) return 'looking_down';
        // if (pitchRatio > 0.65) return 'looking_up'; // Looking up is rare and harder to detect accurately without 3D projection

        return 'center';
    }

    /**
     * Detects if the camera is likely blocked (completely dark or near-black).
     * @param {HTMLVideoElement} videoElement 
     * @returns {boolean}
     */
    isCameraBlocked(videoElement) {
        if (!videoElement || videoElement.readyState < 2) return false;

        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let totalBrightness = 0;
            for (let i = 0; i < imageData.length; i += 4) {
                // Average of RGB
                totalBrightness += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
            }
            const avgBrightness = totalBrightness / (imageData.length / 4);

            // Console log for debugging (can be removed later)
            console.log(`[Camera Monitor] Avg Brightness: ${avgBrightness.toFixed(2)}`);

            // Higher threshold (50) to be more sensitive to partial blocks or dim lighting
            return avgBrightness < 50;

        } catch (e) {
            console.error("Camera block detection error:", e);
            return false;
        }

    }
}



export default new FaceDetectionService();
