import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));

interface VideoTaskState {
  status: "idle" | "generating" | "completed" | "error";
  progressPercent: number;
  stage: string;
  videoUrl: string | null;
  error: string | null;
  startTime: number | null;
  prompt: string;
}

const REFERENCE_IMAGE_PATH = path.join(
  __dirname,
  "public/assets/aistudio/Two_characters_shaking_hands_802699c8_2K_4d0ef9ba.jpg"
);

const GENERATED_VIDEO_PATH = path.join(__dirname, "public/generated-video.mp4");

const taskState: VideoTaskState = {
  status: fs.existsSync(GENERATED_VIDEO_PATH) ? "completed" : "idle",
  progressPercent: fs.existsSync(GENERATED_VIDEO_PATH) ? 100 : 0,
  stage: fs.existsSync(GENERATED_VIDEO_PATH) ? "Video ready" : "Awaiting generation",
  videoUrl: fs.existsSync(GENERATED_VIDEO_PATH) ? "/generated-video.mp4" : null,
  error: null,
  startTime: null,
  prompt: `TITLE: BETWEEN DARKNESS AND PEACE
CHARACTERS:
- Left: Eren Yeager from Attack on Titan (hair tied back, dark jacket, drifting smoke, burning embers)
- Right: Thorfinn from Vinland Saga (blonde hair, brown fur tunic, golden sunrise plains)

ABSOLUTE CHARACTER CONSISTENCY:
Preserve exact character appearances from the reference image without morphing or redesigning.

ANIMATION TIMELINE (8s Total):
- 0–2s: Starting composition. Gentle wind stirs Eren's hair & jacket. Dark smoke moves naturally behind Eren; warm golden sunlight illuminates Thorfinn's side.
- 2–4s: Camera smoothly moves forward towards joined hands. Floating ember particles from left, golden sun motes from right. Smoke drifts to center as golden light reaches handshake.
- 4–6s: Cinematic transformation. The boundary between darkness and light dissolves. Dark clouds soften and golden sunlight penetrates smoky haze. Subtle meaningful mutual look while maintaining handshake.
- 6–8s: Camera gently pulls back, revealing harmonious balanced contrast of charcoal clouds and warm golden sunlight with joined hands at center.

CAMERA: Continuous cinematic slow dolly-in to handshake then gentle pullback. No cuts, no camera shake.
STYLE: Premium Japanese anime movie quality, volumetric lighting, atmospheric depth, 16:9 landscape.`,
};

// Check status endpoint
app.get("/api/status", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const hasImage = fs.existsSync(REFERENCE_IMAGE_PATH);
  const hasVideo = fs.existsSync(GENERATED_VIDEO_PATH);

  res.json({
    hasApiKey: hasKey,
    hasReferenceImage: hasImage,
    referenceImagePath: "/assets/aistudio/Two_characters_shaking_hands_802699c8_2K_4d0ef9ba.jpg",
    hasGeneratedVideo: hasVideo,
    taskState,
  });
});

// Video generation endpoint
app.post("/api/generate-video", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    taskState.status = "error";
    taskState.error = "GEMINI_API_KEY is not configured. A paid model API key is required to invoke gemini-omni-1.2-flash.";
    return res.status(400).json({
      error: "MISSING_API_KEY",
      message: "Please configure your GEMINI_API_KEY with access to Gemini Omni Flash models.",
    });
  }

  if (!fs.existsSync(REFERENCE_IMAGE_PATH)) {
    return res.status(404).json({
      error: "IMAGE_NOT_FOUND",
      message: "Starting frame image was not found.",
    });
  }

  if (taskState.status === "generating") {
    return res.json({
      message: "Generation already in progress",
      taskState,
    });
  }

  taskState.status = "generating";
  taskState.progressPercent = 10;
  taskState.stage = "Analyzing reference image starting frame...";
  taskState.startTime = Date.now();
  taskState.error = null;

  // Respond immediately so client can poll or listen
  res.json({
    message: "Generation started",
    taskState,
  });

  // Execute generation in background
  (async () => {
    try {
      taskState.progressPercent = 25;
      taskState.stage = "Encoding high-resolution 2K starting frame...";

      const imageBuffer = fs.readFileSync(REFERENCE_IMAGE_PATH);
      const base64Image = imageBuffer.toString("base64");

      taskState.progressPercent = 40;
      taskState.stage = "Sending animation parameters to gemini-omni-1.2-flash (8s, 16:9, 720p)...";

      const ai = new GoogleGenAI({ apiKey });

      const videoPrompt = req.body?.prompt || taskState.prompt;

      const interaction = await ai.interactions.create(
        {
          model: "gemini-omni-1.2-flash",
          input: [
            {
              type: "image",
              mime_type: "image/jpeg",
              data: base64Image,
            },
            {
              type: "text",
              text: `Generate an 8-second cinematic anime video maintaining exact character consistency from this starting frame:\n${videoPrompt}`,
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: "video",
            aspect_ratio: "16:9",
            duration: "8s",
            resolution: "720p",
          },
        },
        { timeout: 360000 }
      );

      taskState.progressPercent = 85;
      taskState.stage = "Processing model video output...";

      const outputVideo = interaction.output_video;
      if (outputVideo && outputVideo.data) {
        const videoBuffer = Buffer.from(outputVideo.data, "base64");
        fs.writeFileSync(GENERATED_VIDEO_PATH, videoBuffer);

        taskState.status = "completed";
        taskState.progressPercent = 100;
        taskState.stage = "Video generation complete!";
        taskState.videoUrl = `/generated-video.mp4?t=${Date.now()}`;
      } else {
        throw new Error("No video data received from gemini-omni-1.2-flash output.");
      }
    } catch (err: any) {
      console.error("Video generation failed:", err);
      taskState.status = "error";
      taskState.error = err?.message || "Failed to generate video via gemini-omni-1.2-flash";
      taskState.stage = "Generation encountered an issue";
    }
  })();
});

// Vite middleware / Static serving
async function setupServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
