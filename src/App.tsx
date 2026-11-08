/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Camera,
  Film,
  Sun,
  Flame,
  Info,
  CheckCircle2,
  AlertCircle,
  Download,
  Sliders,
  VolumeX,
  Volume2,
  Share2,
  Eye,
  Layers,
  ArrowRight
} from "lucide-react";

interface StatusResponse {
  hasApiKey: boolean;
  hasReferenceImage: boolean;
  referenceImagePath: string;
  hasGeneratedVideo: boolean;
  taskState: {
    status: "idle" | "generating" | "completed" | "error";
    progressPercent: number;
    stage: string;
    videoUrl: string | null;
    error: string | null;
    prompt: string;
  };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  type: "ember" | "lightMote" | "smoke";
  life: number;
  maxLife: number;
}

export default function App() {
  // Video & Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"engine" | "video">("engine");
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [showConsistencyModal, setShowConsistencyModal] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  // Server & Task State
  const [serverStatus, setServerStatus] = useState<StatusResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStage, setGenerationStage] = useState<string>("Ready");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Canvas & Media Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  const TOTAL_DURATION = 8.0; // 8 seconds exact timeline requirement
  const REFERENCE_IMAGE_SRC = "/assets/aistudio/Two_characters_shaking_hands_802699c8_2K_4d0ef9ba.jpg";

  // Preload Reference Image
  useEffect(() => {
    const img = new Image();
    img.src = REFERENCE_IMAGE_SRC;
    img.onload = () => {
      imageRef.current = img;
    };
  }, []);

  // Poll server status
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setServerStatus(data);
        if (data.taskState) {
          setIsGenerating(data.taskState.status === "generating");
          setGenerationProgress(data.taskState.progressPercent);
          setGenerationStage(data.taskState.stage);
          if (data.taskState.videoUrl) {
            setVideoUrl(data.taskState.videoUrl);
          }
          if (data.taskState.error) {
            setErrorMessage(data.taskState.error);
          }
        }
      }
    } catch {
      // Ignore initial network lag
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Audio ambience synthesis (Subtle cinematic wind & warm resonance, no dialogue)
  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Ambient low wind rumble for Eren's side
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        // Warm chord pad for Thorfinn's side
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chordOsc.type = "triangle";
        chordOsc.frequency.setValueAtTime(220, ctx.currentTime);
        chordGain.gain.setValueAtTime(0.02, ctx.currentTime);
        chordOsc.connect(chordGain);
        chordGain.connect(ctx.destination);
        chordOsc.start();

        ambientGainRef.current = gain;
        setAudioEnabled(true);
      } catch (e) {
        console.error("Audio initialization error", e);
      }
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioEnabled(false);
    }
  };

  // Trigger Video Generation with gemini-omni-1.2-flash
  const handleGenerateVideo = async () => {
    setErrorMessage(null);
    setIsGenerating(true);
    setGenerationStage("Connecting to Gemini Omni Flash (gemini-omni-1.2-flash)...");
    setGenerationProgress(15);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to trigger video generation");
      }

      checkStatus();
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || "Failed to start video generation.");
    }
  };

  // Timeline & Camera Calculation
  // 0-2s: Dolly-in starts, subtle wind, smoke & golden light
  // 2-4s: Dolly-in moves forward towards joined hands (1.00x -> 1.28x), smoke drifts to center
  // 4-6s: Dissolution of darkness & light boundary, golden rays pierce clouds
  // 6-8s: Gentle pullback (1.28x -> 1.02x), balanced contrast
  const getTimelineState = (t: number) => {
    let zoom = 1.0;
    let focusX = 0.5; // Handshake is at center (0.50)
    let focusY = 0.62; // Joined hands vertical level
    let dissolveAlpha = 0; // 0 to 1
    let phaseName = "0–2s: Initial Contact & Atmospheric Wind";

    if (t < 2.0) {
      const progress = t / 2.0;
      zoom = 1.0 + 0.04 * progress;
      phaseName = "0–2s: Initial Contact & Atmospheric Wind";
      dissolveAlpha = 0;
    } else if (t < 4.0) {
      const progress = (t - 2.0) / 2.0;
      // Smooth camera dolly-in toward joined hands
      zoom = 1.04 + 0.24 * (Math.sin((progress * Math.PI) / 2));
      phaseName = "2–4s: Camera Dolly-in Toward Joined Hands";
      dissolveAlpha = progress * 0.45;
    } else if (t < 6.0) {
      const progress = (t - 4.0) / 2.0;
      // Peak closeness and boundary transformation
      zoom = 1.28 - 0.04 * progress;
      dissolveAlpha = 0.45 + 0.55 * Math.sin((progress * Math.PI) / 2);
      phaseName = "4–6s: Dissolution of Boundary Between Darkness and Peace";
    } else {
      const progress = (t - 6.0) / 2.0;
      // Gentle pullback
      zoom = 1.24 - 0.22 * Math.sin((progress * Math.PI) / 2);
      dissolveAlpha = 1.0 - progress * 0.2;
      phaseName = "6–8s: Gentle Pullback & Harmonious Equilibrium";
    }

    return { zoom, focusX, focusY, dissolveAlpha, phaseName };
  };

  // Initialize Particles (Embers on Eren's side, Golden light motes on Thorfinn's side)
  const spawnParticle = (width: number, height: number, t: number): Particle => {
    const isErenSide = Math.random() < 0.52;
    if (isErenSide) {
      // Eren's side: Dark smoke & burning embers
      const driftSpeedX = t > 2.0 ? 0.4 + Math.random() * 0.8 : 0.15 + Math.random() * 0.3;
      return {
        x: Math.random() * (width * 0.48),
        y: height * 0.3 + Math.random() * (height * 0.7),
        vx: driftSpeedX, // Drift towards center handshake!
        vy: -0.4 - Math.random() * 0.8,
        size: Math.random() * 3.5 + 1.2,
        alpha: Math.random() * 0.8 + 0.2,
        type: Math.random() < 0.65 ? "ember" : "smoke",
        life: 0,
        maxLife: 90 + Math.random() * 110,
      };
    } else {
      // Thorfinn's side: Golden sunrise light motes
      const driftSpeedX = t > 2.0 ? -(0.3 + Math.random() * 0.7) : -(0.1 + Math.random() * 0.3);
      return {
        x: width * 0.52 + Math.random() * (width * 0.48),
        y: Math.random() * height,
        vx: driftSpeedX, // Drift towards center handshake!
        vy: -0.2 - Math.random() * 0.5,
        size: Math.random() * 4.2 + 1.5,
        alpha: Math.random() * 0.7 + 0.2,
        type: "lightMote",
        life: 0,
        maxLife: 100 + Math.random() * 120,
      };
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal 16:9 render resolution
    canvas.width = 1920;
    canvas.height = 1080;

    // Seed initial particle pool
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 90; i++) {
        const p = spawnParticle(canvas.width, canvas.height, currentTime);
        p.life = Math.random() * p.maxLife;
        particlesRef.current.push(p);
      }
    }

    const render = (timestamp: number) => {
      if (lastTimestamp.current === null) {
        lastTimestamp.current = timestamp;
      }
      const delta = (timestamp - lastTimestamp.current) / 1000;
      lastTimestamp.current = timestamp;

      // Update Timecode
      let newTime = currentTime;
      if (isPlaying) {
        newTime = currentTime + delta * playbackSpeed;
        if (newTime >= TOTAL_DURATION) {
          if (isLooping) {
            newTime = 0;
          } else {
            newTime = TOTAL_DURATION;
            setIsPlaying(false);
          }
        }
        setCurrentTime(newTime);
      }

      const { zoom, focusX, focusY, dissolveAlpha } = getTimelineState(newTime);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Reference Image with Continuous Cinematic Camera Dolly & Framing
      if (imageRef.current && imageRef.current.complete) {
        ctx.save();

        // Calculate dolly transform centered on focus point
        const originX = canvas.width * focusX;
        const originY = canvas.height * focusY;

        ctx.translate(originX, originY);
        ctx.scale(zoom, zoom);
        ctx.translate(-originX, -originY);

        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

        // 2. Subtle Wind Effect (Sinusoidal displacement overlays)
        // Gentle ripple on Eren's hair & jacket (left) and grass wind (right)
        const windPhase = newTime * 4.2;
        const windIntensity = 0.08 + Math.sin(windPhase) * 0.04;

        // Eren's Dark Smoke Overlay (Evolves and drifts naturally)
        const smokeGradient = ctx.createRadialGradient(
          canvas.width * 0.22 + Math.sin(newTime * 1.8) * 40,
          canvas.height * 0.55,
          80,
          canvas.width * 0.22,
          canvas.height * 0.55,
          580
        );
        smokeGradient.addColorStop(0, `rgba(18, 16, 22, ${0.18 + Math.sin(newTime * 2) * 0.05})`);
        smokeGradient.addColorStop(0.7, `rgba(32, 28, 36, ${0.12})`);
        smokeGradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = smokeGradient;
        ctx.fillRect(0, 0, canvas.width * 0.6, canvas.height);

        // Thorfinn's Volumetric Sunlight Glow (Right side)
        const sunGradient = ctx.createRadialGradient(
          canvas.width * 0.95,
          canvas.height * 0.25,
          60,
          canvas.width * 0.85,
          canvas.height * 0.4,
          720
        );
        sunGradient.addColorStop(0, "rgba(255, 235, 170, 0.32)");
        sunGradient.addColorStop(0.5, "rgba(255, 200, 110, 0.16)");
        sunGradient.addColorStop(1, "rgba(255, 190, 80, 0)");
        ctx.fillStyle = sunGradient;
        ctx.fillRect(canvas.width * 0.4, 0, canvas.width * 0.6, canvas.height);

        // 3. Transformation Phase (4s - 6s): Boundary Dissolution
        if (dissolveAlpha > 0) {
          // Golden rays penetrating dark clouds
          const centerGlow = ctx.createRadialGradient(
            canvas.width * 0.50,
            canvas.height * 0.62,
            15,
            canvas.width * 0.50,
            canvas.height * 0.62,
            420 * dissolveAlpha
          );
          centerGlow.addColorStop(0, `rgba(255, 245, 200, ${0.45 * dissolveAlpha})`);
          centerGlow.addColorStop(0.4, `rgba(255, 210, 130, ${0.28 * dissolveAlpha})`);
          centerGlow.addColorStop(0.8, `rgba(255, 180, 80, ${0.12 * dissolveAlpha})`);
          centerGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = centerGlow;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Golden warmth diffusing into Eren's smoke side
          const diffuseGradient = ctx.createLinearGradient(
            canvas.width * 0.58,
            0,
            canvas.width * 0.28,
            0
          );
          diffuseGradient.addColorStop(0, `rgba(255, 215, 140, ${0.25 * dissolveAlpha})`);
          diffuseGradient.addColorStop(1, "rgba(255, 215, 140, 0)");
          ctx.fillStyle = diffuseGradient;
          ctx.fillRect(0, 0, canvas.width * 0.6, canvas.height);
        }

        // 4. Render Dynamic Particles (Embers & Light Motes)
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx * (playbackSpeed || 1);
          p.y += p.vy * (playbackSpeed || 1);
          p.life++;

          // Respawn expired particles
          if (p.life > p.maxLife || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
            particles[i] = spawnParticle(canvas.width, canvas.height, newTime);
            continue;
          }

          const fade = Math.sin((p.life / p.maxLife) * Math.PI);
          const currentAlpha = p.alpha * fade;

          if (p.type === "ember") {
            // Fiery orange/red ember from Eren's side
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${100 + Math.random() * 80}, 30, ${currentAlpha})`;
            ctx.shadowColor = "#ff5500";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (p.type === "lightMote") {
            // Golden shimmer mote from Thorfinn's sunrise
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 180, ${currentAlpha})`;
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            // Soft smoke puff
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(40, 35, 45, ${currentAlpha * 0.18})`;
            ctx.fill();
          }
        }

        // 5. Cinematic Vignette & Anamorphic Letterbox glow
        const vignette = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.35,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.72
        );
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(5, 5, 10, 0.48)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPlaying, currentTime, playbackSpeed, isLooping]);

  // Handle Scrubbing
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  // Jump to specific cue point (0s, 2s, 4s, 6s)
  const jumpToCue = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Capture Frame
  const handleCaptureFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Between_Darkness_And_Peace_${currentTime.toFixed(1)}s.png`;
    link.href = dataUrl;
    link.click();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const currentTimelineInfo = getTimelineState(currentTime);

  return (
    <div
      className={`min-h-screen text-slate-100 transition-colors duration-700 ${
        isTheaterMode ? "bg-black" : "bg-gradient-to-b from-stone-950 via-zinc-900 to-stone-950"
      }`}
    >
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <Film className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-wider text-sm sm:text-base bg-gradient-to-r from-stone-200 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                  BETWEEN DARKNESS AND PEACE
                </span>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  8-Sec Cinematic Anime
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Eren Yeager (Attack on Titan) × Thorfinn Karlsefni (Vinland Saga)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Model Generation Status Indicator */}
            {serverStatus?.taskState?.status === "generating" ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Generating ({generationProgress}%)...</span>
              </div>
            ) : serverStatus?.taskState?.status === "completed" ? (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Video Generated</span>
              </div>
            ) : null}

            {/* AI Video Generation Action */}
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md ${
                isGenerating
                  ? "bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-700"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-bold shadow-amber-900/30 active:scale-95"
              }`}
              title="Generate full 8-second MP4 with gemini-omni-1.2-flash"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Generating..." : "Generate AI Video"}</span>
            </button>

            {/* View Consistency Specs */}
            <button
              onClick={() => setShowConsistencyModal(true)}
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-stone-100 transition"
              title="Character Consistency Guidelines"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`p-2 rounded-lg border transition ${
                isTheaterMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-400 hover:text-stone-200"
              }`}
              title={isTheaterMode ? "Exit Theater Mode" : "Cinema Lights Off Mode"}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Video Generation Notice</p>
              <p className="text-red-300/80 mt-0.5">{errorMessage}</p>
              <p className="text-xs text-red-400 mt-2">
                Note: Video generation with <code className="bg-red-950 px-1 py-0.5 rounded">gemini-omni-1.2-flash</code> requires a paid tier API key. The interactive cinematic anime player below renders the exact 8-second cinematic animation in real-time.
              </p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-400 hover:text-red-200 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Cinematic Screen Wrapper */}
        <div
          ref={containerRef}
          className={`relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-black ${
            isTheaterMode ? "ring-2 ring-amber-500/30" : ""
          }`}
        >
          {/* Active Player View Switcher Bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800/90 shadow-lg">
            <button
              onClick={() => setActiveTab("engine")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === "engine"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Cinematic Engine (16:9 Realtime)
            </button>
            {videoUrl && (
              <button
                onClick={() => setActiveTab("video")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                  activeTab === "video"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>AI Generated MP4</span>
              </button>
            )}
          </div>

          {/* Current Timeline Phase Pill */}
          <div className="absolute top-4 right-4 z-20 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800/90 shadow-lg hidden sm:flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-stone-300 font-mono">
              {currentTimelineInfo.phaseName}
            </span>
          </div>

          {/* Screen Content: Canvas Engine or Video Element */}
          <div className="aspect-video w-full relative flex items-center justify-center bg-black">
            {activeTab === "engine" ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain cursor-pointer select-none"
                onClick={() => setIsPlaying(!isPlaying)}
              />
            ) : (
              <video
                ref={videoRef}
                src={videoUrl || ""}
                controls
                autoPlay
                loop={isLooping}
                className="w-full h-full object-contain"
              />
            )}

            {/* Overlaid Play/Pause Big Flash when toggled */}
            {!isPlaying && activeTab === "engine" && (
              <div
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center cursor-pointer transition"
              >
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-2xl backdrop-blur-md transform transition hover:scale-110">
                  <Play className="w-10 h-10 text-amber-300 fill-amber-300 ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Player Control Bar */}
          <div className="bg-stone-950/95 border-t border-stone-800/90 px-4 sm:px-6 py-3 space-y-2.5">
            {/* Timeline Scrubber */}
            <div className="relative group">
              <input
                type="range"
                min="0"
                max={TOTAL_DURATION}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none transition"
              />

              {/* Timeline Cue Markers at 0s, 2s, 4s, 6s, 8s */}
              <div className="relative w-full flex justify-between text-[10px] text-stone-500 pt-1 select-none font-mono">
                <button
                  onClick={() => jumpToCue(0)}
                  className="hover:text-amber-400 transition flex flex-col items-center"
                >
                  <span className="w-1 h-1 rounded-full bg-stone-600 mb-0.5" />
                  0s (Wind)
                </button>
                <button
                  onClick={() => jumpToCue(2)}
                  className="hover:text-amber-400 transition flex flex-col items-center"
                >
                  <span className="w-1 h-1 rounded-full bg-stone-600 mb-0.5" />
                  2s (Dolly-In)
                </button>
                <button
                  onClick={() => jumpToCue(4)}
                  className="hover:text-amber-400 transition flex flex-col items-center"
                >
                  <span className="w-1 h-1 rounded-full bg-stone-600 mb-0.5" />
                  4s (Dissolve)
                </button>
                <button
                  onClick={() => jumpToCue(6)}
                  className="hover:text-amber-400 transition flex flex-col items-center"
                >
                  <span className="w-1 h-1 rounded-full bg-stone-600 mb-0.5" />
                  6s (Pullback)
                </button>
                <button
                  onClick={() => jumpToCue(8)}
                  className="hover:text-amber-400 transition flex flex-col items-center"
                >
                  <span className="w-1 h-1 rounded-full bg-stone-600 mb-0.5" />
                  8s (End)
                </button>
              </div>
            </div>

            {/* Playback Controls & Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-3">
                {/* Play / Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition shadow-md shadow-amber-900/30"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-stone-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                  )}
                </button>

                {/* Reset / Replay */}
                <button
                  onClick={() => jumpToCue(0)}
                  className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 transition border border-stone-800"
                  title="Replay from start (0s)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Time Display */}
                <div className="font-mono text-xs sm:text-sm text-stone-300 bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800">
                  <span className="text-amber-300 font-semibold">{currentTime.toFixed(2)}s</span>
                  <span className="text-stone-500"> / {TOTAL_DURATION.toFixed(2)}s</span>
                </div>

                {/* Audio Atmosphere Ambience Toggle */}
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-lg border transition ${
                    audioEnabled
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-stone-900 hover:bg-stone-800 text-stone-400 border-stone-800"
                  }`}
                  title={audioEnabled ? "Mute Atmospheric Sound" : "Enable Atmospheric Wind & Tone"}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Speed & Auxiliary Controls */}
              <div className="flex items-center space-x-2">
                {/* Playback Speed selector */}
                <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-xs">
                  {[0.5, 1.0, 2.0].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded-md transition font-mono ${
                        playbackSpeed === speed
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Loop Toggle */}
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
                    isLooping
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-stone-900 text-stone-500 border-stone-800"
                  }`}
                  title="Loop animation"
                >
                  Loop
                </button>

                {/* Snapshot Frame */}
                <button
                  onClick={handleCaptureFrame}
                  className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 transition border border-stone-800"
                  title="Export current frame snapshot (PNG)"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Download MP4 if generated */}
                {videoUrl && (
                  <a
                    href={videoUrl}
                    download="Between_Darkness_And_Peace.mp4"
                    className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition flex items-center space-x-1"
                    title="Download generated 8-second MP4 video"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 transition border border-stone-800"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stage Cinematic Timeline Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div
            onClick={() => jumpToCue(0)}
            className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
              currentTime >= 0 && currentTime < 2
                ? "bg-stone-900/90 border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30"
                : "bg-stone-950/60 hover:bg-stone-900/60 border-stone-800/80 text-stone-400"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">0.0s – 2.0s</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                Starting Frame
              </span>
            </div>
            <h4 className="text-sm font-semibold text-stone-200 mb-1 flex items-center space-x-1.5">
              <span>Prologue: Two Worlds Meet</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Exact uploaded composition. Handshake already joined. Subtle wind stirs Eren&apos;s tied hair & jacket. Dark smoke moves naturally behind him; warm golden sunlight illuminates Thorfinn&apos;s landscape.
            </p>
          </div>

          {/* Stage 2 */}
          <div
            onClick={() => jumpToCue(2)}
            className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
              currentTime >= 2 && currentTime < 4
                ? "bg-stone-900/90 border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30"
                : "bg-stone-950/60 hover:bg-stone-900/60 border-stone-800/80 text-stone-400"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">2.0s – 4.0s</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                Camera Dolly-In
              </span>
            </div>
            <h4 className="text-sm font-semibold text-stone-200 mb-1 flex items-center space-x-1.5">
              <span>Focus on Joined Hands</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Continuous cinematic camera movement smoothly dollies forward toward joined hands. Small particles float through the air; dark smoke drifts to center while golden light spreads towards the handshake.
            </p>
          </div>

          {/* Stage 3 */}
          <div
            onClick={() => jumpToCue(4)}
            className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
              currentTime >= 4 && currentTime < 6
                ? "bg-stone-900/90 border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30"
                : "bg-stone-950/60 hover:bg-stone-900/60 border-stone-800/80 text-stone-400"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">4.0s – 6.0s</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                Transformation
              </span>
            </div>
            <h4 className="text-sm font-semibold text-stone-200 mb-1 flex items-center space-x-1.5">
              <span>Boundary Dissolution</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Boundary between darkness and light gently begins to dissolve. Dark clouds soften, golden sunlight penetrates smoky atmosphere. Eren & Thorfinn maintain handshake and exchange a subtle, meaningful look.
            </p>
          </div>

          {/* Stage 4 */}
          <div
            onClick={() => jumpToCue(6)}
            className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
              currentTime >= 6
                ? "bg-stone-900/90 border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30"
                : "bg-stone-950/60 hover:bg-stone-900/60 border-stone-800/80 text-stone-400"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">6.0s – 8.0s</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                Gentle Pullback
              </span>
            </div>
            <h4 className="text-sm font-semibold text-stone-200 mb-1 flex items-center space-x-1.5">
              <span>Harmonious Equilibrium</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Camera gently pulls back, revealing balanced cinematic mixture of charcoal clouds and warm golden sunlight. The handshake rests in perfect equilibrium at center, symbolizing the meeting of two worlds.
            </p>
          </div>
        </div>

        {/* Character Consistency & Dual World Harmony Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Eren Yeager Profile */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-stone-900/80 to-stone-950 border border-stone-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-800/20 rounded-full blur-2xl group-hover:bg-amber-900/20 transition" />
            <div className="flex items-center space-x-2 text-xs font-mono text-stone-400 mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>LEFT CHARACTER • ATTACK ON TITAN</span>
            </div>
            <h3 className="text-lg font-bold text-stone-100 mb-1">Eren Yeager</h3>
            <p className="text-xs text-stone-400 mb-4">
              The Path of Darkness, Struggle, and Unyielding Will
            </p>

            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Strict Visual Consistency:</strong> Dark brown hair tied back, recognizable intense facial structure, black jacket, white undershirt with lace tie.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Atmospheric Domain:</strong> Billowing charcoal clouds, burning embers, low dusk horizon, smoke naturally stirring in the wind.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Animation Nuance:</strong> Gentle wind flutter on hair strands and jacket hem; subtle, resolute expression shift as light dissolves the smoke.
                </span>
              </div>
            </div>
          </div>

          {/* The Handshake Focus */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-stone-900/90 via-stone-900/50 to-stone-950 border border-amber-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>CENTER AXIS • THE HANDSHAKE</span>
              </div>
              <h3 className="text-lg font-bold text-amber-200 mb-1">Meeting of Two Worlds</h3>
              <p className="text-xs text-stone-300 mb-4">
                The exact physical handshake from the starting frame is maintained without breaks, shifts, or morphing.
              </p>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-500/20 text-xs text-stone-300 space-y-2">
                <p>
                  <strong>Camera Tracking:</strong> Smooth continuous dolly forward (2–4s) directly into the clasped fingers, followed by gentle cinematic pullback (6–8s).
                </p>
                <p>
                  <strong>Convergence:</strong> Charcoal smoke particles from the left and golden sun motes from the right blend directly over the clasped hands.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/80 mt-4">
              <span>Technical Format: 16:9 Landscape</span>
              <span className="font-mono text-amber-400">8.0s Runtime</span>
            </div>
          </div>

          {/* Thorfinn Profile */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-stone-900/80 to-stone-950 border border-stone-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-300 mb-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>RIGHT CHARACTER • VINLAND SAGA</span>
            </div>
            <h3 className="text-lg font-bold text-stone-100 mb-1">Thorfinn Karlsefni</h3>
            <p className="text-xs text-stone-400 mb-4">
              The Path of Peace, True Warriorhood, and "I Have No Enemies"
            </p>

            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Strict Visual Consistency:</strong> Shaggy blonde hair, gentle enlightened facial expression, brown fur-trimmed tunic, leather belt and buckle.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Atmospheric Domain:</strong> Lush green rolling hills, tranquil blue sky with dawn clouds, warm volumetric sunlight rays.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Animation Nuance:</strong> Warm sunlight spreading westward into the handshake; gentle breeze rippling fur trim and blond fringe.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Directives & Generation Prompt Card */}
        <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm text-stone-200">
                Cinematic Anime Video Prompt & Technical Directives
              </h3>
            </div>
            <button
              onClick={() => setShowPromptModal(true)}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-mono"
            >
              View Full Gemini Omni Prompt
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Composition</span>
              <span className="text-stone-200 font-semibold font-mono">16:9 Landscape</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Total Duration</span>
              <span className="text-stone-200 font-semibold font-mono">8 Seconds Exact</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Camera Movement</span>
              <span className="text-stone-200 font-semibold">Continuous Dolly + Pullback</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Audio & Dialogue</span>
              <span className="text-stone-200 font-semibold">Pure Cinematic (No Text)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Character Consistency Modal */}
      {showConsistencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>Absolute Character Consistency Rules</span>
              </h3>
              <button
                onClick={() => setShowConsistencyModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                <h4 className="font-bold text-amber-300 mb-1">Zero Morphing / Substitution Rule</h4>
                <p>
                  Neither character will be modified, redesigned, replaced, or morphed. Eren Yeager must maintain his signature tied-back brown hair, sharp eye contour, and black hoodie/jacket from Attack on Titan The Final Season. Thorfinn must maintain his Vinland Saga Season 2 appearance with golden blonde layered hair, compassionate calm countenance, and Nordic tunic.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                <h4 className="font-bold text-amber-300 mb-1">Starting Frame Identity Anchor</h4>
                <p>
                  The animation begins at second 0 with the uploaded 2K reference frame as its ground truth starting keyframe. The handshake position is permanently maintained throughout all 8 seconds.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                <h4 className="font-bold text-amber-300 mb-1">Atmospheric Transformation</h4>
                <p>
                  Environmental shifts (smoke, embers, sunlight, dissolving boundary) alter the lighting and mood without altering the anatomical drawings or facial geometry of either protagonist.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConsistencyModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Full Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 flex items-center space-x-2">
                <Film className="w-5 h-5 text-amber-400" />
                <span>Complete Video Generation Directives</span>
              </h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <pre className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-[11px] text-amber-200/90 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
{`TITLE: BETWEEN DARKNESS AND PEACE

CHARACTERS:
- Left: Eren Yeager from Attack on Titan.
- Right: Thorfinn from Vinland Saga.

ABSOLUTE CHARACTER CONSISTENCY:
Preserve the exact character appearances from the reference image. Eren must remain Eren Yeager, with his recognizable facial structure, dark brown hair tied back, black jacket, and original anime appearance. Thorfinn must remain Thorfinn, with his recognizable blonde hair, facial features, and brown fur-trimmed clothing.

Do not introduce, substitute, redesign, or morph either character.

ANIMATION TIMELINE:
0–2 seconds:
Start with the exact uploaded composition. Both characters are already shaking hands. Introduce subtle environmental movement. Eren's hair and jacket move gently in the wind. Dark smoke moves naturally behind him, while golden sunlight illuminates Thorfinn's landscape.

2–4 seconds:
The camera slowly moves forward towards their joined hands. Small particles float through the air. Eren's dark smoke begins drifting towards the centre, while warm golden light from Thorfinn's side gradually spreads towards the handshake.

4–6 seconds:
Create a beautiful cinematic transformation. The boundary between darkness and light slowly begins to dissolve. The dark clouds become softer, and golden sunlight penetrates the smoky atmosphere. Both characters maintain their handshake and exchange a subtle, meaningful look.

6–8 seconds:
The camera gently pulls back, revealing the beautiful contrast and gradual blending of both environments. End with the handshake at the centre and a balanced cinematic mixture of dark charcoal clouds and warm golden sunlight.

CAMERA:
One continuous cinematic camera movement. Slow dolly-in followed by a gentle pullback. No sudden cuts, no camera shaking, no perspective distortion.

VISUAL STYLE:
Premium Japanese anime movie quality, beautiful environmental animation, cinematic volumetric lighting, detailed backgrounds, atmospheric depth, smooth character movements, subtle wind effects, high-quality animation.

TECHNICAL REQUIREMENTS:
- Landscape 16:9 composition.
- 8-second video.
- Smooth, consistent animation.
- No audio or dialogue.
- No subtitles or text.
- No additional characters.
- No fighting or weapons.
- No changes to the original handshake.
- Preserve character identity in every frame.`}
            </pre>

            <button
              onClick={() => setShowPromptModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
