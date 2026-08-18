"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

const ACCENT_RGB = "217, 184, 119";
const BAR_WIDTH = 2;
const BAR_GAP = 3;
const STEP = BAR_WIDTH + BAR_GAP;
const FFT_SIZE = 256;
const ECHO_MS = 4000;
const REDUCED_LIVE_MS = 140;

type Mode = "idle" | "requesting" | "live" | "denied";
type Pulse = { x: number; start: number };

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecEvent = {
  results: ArrayLike<{ 0?: { transcript?: string } }>;
};

type AudioBag = {
  stream: MediaStream | null;
  audioCtx: AudioContext | null;
  source: MediaStreamAudioSourceNode | null;
  analyser: AnalyserNode | null;
  recognition: SpeechRec | null;
};

function audioContextCtor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? w.webkitAudioContext;
}

function speechRecognitionCtor(): (new () => SpeechRec) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function ariaLabelFor(mode: Mode) {
  if (mode === "live") return "Listening. Click to stop.";
  if (mode === "requesting") return "Requesting microphone. Click to cancel.";
  return "Click or tap the wave to start listening. Audio stays in this tab.";
}

/**
 * Click-to-talk waveform. Idle murmur + cursor swell + click ripple are
 * decorative; the microphone is requested only after that gesture,
 * analysed in-tab via AnalyserNode, and never uploaded.
 */
export function VoiceWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerX = useRef<number | null>(null);
  const pulses = useRef<Pulse[]>([]);
  const staticSeed = useRef(0);
  const reducedMotion = useRef(false);
  const unmounted = useRef(false);
  const session = useRef(0);
  const modeRef = useRef<Mode>("idle");
  const transcriptRef = useRef("");
  const echoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timeDomainRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const anim = useRef({
    start: () => {},
    stop: () => {},
    drawStatic: () => {},
  });
  const bag = useRef<AudioBag>({
    stream: null,
    audioCtx: null,
    source: null,
    analyser: null,
    recognition: null,
  });
  const teardownRef = useRef<(next: "idle" | "denied") => void>(() => {});

  const [mode, setMode] = useState<Mode>("idle");
  const [transcript, setTranscript] = useState("");
  const [echo, setEcho] = useState("");

  const setModeSafe = useCallback((next: Mode) => {
    modeRef.current = next;
    if (!unmounted.current) setMode(next);
  }, []);

  const setTranscriptSafe = useCallback((text: string) => {
    transcriptRef.current = text;
    if (!unmounted.current) setTranscript(text);
  }, []);

  const clearEchoTimer = useCallback(() => {
    if (echoTimer.current) {
      clearTimeout(echoTimer.current);
      echoTimer.current = null;
    }
  }, []);

  const releaseAudio = useCallback(() => {
    const { stream, audioCtx, source, recognition } = bag.current;
    bag.current = {
      stream: null,
      audioCtx: null,
      source: null,
      analyser: null,
      recognition: null,
    };
    analyserRef.current = null;
    timeDomainRef.current = null;

    try {
      recognition?.abort();
    } catch {
      /* already stopped */
    }
    try {
      source?.disconnect();
    } catch {
      /* already disconnected */
    }
    stream?.getTracks().forEach((track) => track.stop());
    if (audioCtx && audioCtx.state !== "closed") {
      void audioCtx.close();
    }
  }, []);

  const teardown = useCallback(
    (next: "idle" | "denied") => {
      const leavingLive = modeRef.current === "live";
      const lastLine = transcriptRef.current;
      session.current += 1;
      releaseAudio();
      setTranscriptSafe("");

      if (next === "idle" && leavingLive && lastLine && !unmounted.current) {
        setEcho(lastLine);
        clearEchoTimer();
        echoTimer.current = setTimeout(() => {
          if (!unmounted.current) setEcho("");
          echoTimer.current = null;
        }, ECHO_MS);
      } else if (!unmounted.current) {
        setEcho("");
      }

      setModeSafe(next);
      if (reducedMotion.current) anim.current.drawStatic();
    },
    [clearEchoTimer, releaseAudio, setModeSafe, setTranscriptSafe]
  );

  useEffect(() => {
    teardownRef.current = teardown;
  }, [teardown]);

  const startSpeechRecognition = useCallback(
    (token: number) => {
      const Ctor = speechRecognitionCtor();
      if (!Ctor) return;

      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        typeof navigator !== "undefined" && navigator.language
          ? navigator.language
          : "en-US";

      recognition.onresult = (event) => {
        if (session.current !== token) return;
        const last = event.results[event.results.length - 1];
        const text = last?.[0]?.transcript?.trim() ?? "";
        if (text) setTranscriptSafe(text);
      };
      recognition.onerror = () => {
        /* optional local STT — waveform keeps running */
      };
      recognition.onend = () => {
        if (session.current !== token || modeRef.current !== "live") return;
        try {
          recognition.start();
        } catch {
          /* already running or unsupported */
        }
      };

      try {
        recognition.start();
        bag.current.recognition = recognition;
      } catch {
        /* Safari/Firefox may reject; ignore */
      }
    },
    [setTranscriptSafe]
  );

  const beginListen = useCallback(async () => {
    const token = ++session.current;
    clearEchoTimer();
    if (!unmounted.current) setEcho("");
    setTranscriptSafe("");

    const AudioCtx = audioContextCtor();
    const canCapture =
      typeof window !== "undefined" &&
      window.isSecureContext &&
      !!navigator.mediaDevices?.getUserMedia &&
      !!AudioCtx;

    if (!canCapture || !AudioCtx) {
      setModeSafe("denied");
      return;
    }

    let audioCtx: AudioContext;
    try {
      audioCtx = new AudioCtx();
    } catch {
      setModeSafe("denied");
      return;
    }

    bag.current.audioCtx = audioCtx;
    if (audioCtx.state === "suspended") void audioCtx.resume();

    setModeSafe("requesting");
    startSpeechRecognition(token);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      if (session.current !== token) return;
      releaseAudio();
      setTranscriptSafe("");
      setModeSafe("denied");
      return;
    }

    if (session.current !== token) {
      stream.getTracks().forEach((track) => track.stop());
      if (audioCtx.state !== "closed") void audioCtx.close();
      return;
    }

    if (audioCtx.state === "suspended") {
      try {
        await audioCtx.resume();
      } catch {
        stream.getTracks().forEach((track) => track.stop());
        void audioCtx.close();
        setModeSafe("denied");
        return;
      }
    }

    if (session.current !== token) {
      stream.getTracks().forEach((track) => track.stop());
      if (audioCtx.state !== "closed") void audioCtx.close();
      return;
    }

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);

    bag.current.stream = stream;
    bag.current.source = source;
    bag.current.analyser = analyser;
    analyserRef.current = analyser;
    timeDomainRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));

    setModeSafe("live");
    anim.current.start();
  }, [
    clearEchoTimer,
    releaseAudio,
    setModeSafe,
    setTranscriptSafe,
    startSpeechRecognition,
  ]);

  const spawnRipple = useCallback((clientX: number | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x =
      clientX === null
        ? rect.width / 2
        : Math.min(rect.width, Math.max(0, clientX - rect.left));
    pulses.current.push({ x, start: performance.now() });
    if (reducedMotion.current) {
      staticSeed.current += 1;
      anim.current.drawStatic();
    }
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (modeRef.current === "live" || modeRef.current === "requesting") return;
    spawnRipple(e.clientX);
  };

  const onToggle = (e: MouseEvent<HTMLButtonElement>) => {
    if (modeRef.current === "live" || modeRef.current === "requesting") {
      teardown("idle");
      return;
    }
    // Keyboard (Enter/Space): no pointerdown with a position — ripple from center.
    if (e.detail === 0) spawnRipple(null);
    void beginListen();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = motionQuery.matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let lastLiveDraw = 0;
    const heights: number[] = [];

    const drawBars = (values: number[]) => {
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      for (let i = 0; i < values.length; i++) {
        const v = Math.min(1, Math.max(0.05, values[i]));
        const h = Math.max(2, v * (height - 4));
        ctx.fillStyle = `rgba(${ACCENT_RGB}, ${0.16 + v * 0.7})`;
        ctx.fillRect(i * STEP, mid - h / 2, BAR_WIDTH, h);
      }
    };

    const drawStatic = () => {
      const s = staticSeed.current;
      drawBars(
        Array.from({ length: heights.length }, (_, i) => {
          return (
            0.1 +
            0.4 *
              Math.abs(
                Math.sin(i * 0.41 + s) * Math.sin(i * 0.153 + s * 1.7)
              )
          );
        })
      );
    };

    const pulseBoost = (x: number, now: number) => {
      let extra = 0;
      for (const p of pulses.current) {
        const age = (now - p.start) / 1000;
        const ringDist = Math.abs(x - p.x) - age * 260;
        extra +=
          0.9 *
          Math.exp(-(ringDist * ringDist) / (2 * 26 * 26)) *
          Math.exp(-age * 2.4);
      }
      return extra;
    };

    const drawIdle = (now: number) => {
      const t = now / 1000;
      pulses.current = pulses.current.filter((p) => now - p.start < 1400);
      const px = pointerX.current;
      for (let i = 0; i < heights.length; i++) {
        const x = i * STEP + BAR_WIDTH / 2;
        let target = Math.abs(
          0.08 +
            0.06 * Math.sin(t * 1.4 + i * 0.35) * Math.sin(t * 0.7 + i * 0.11) +
            0.04 * Math.sin(t * 2.3 - i * 0.18)
        );
        if (px !== null) {
          const d = x - px;
          target += 0.75 * Math.exp(-(d * d) / (2 * 42 * 42));
        }
        target += pulseBoost(x, now);
        heights[i] += (Math.min(target, 1) - heights[i]) * 0.18;
      }
      drawBars(heights);
    };

    const drawLive = (now: number) => {
      const analyser = analyserRef.current;
      const buf = timeDomainRef.current;
      if (!analyser || !buf) return;
      analyser.getByteTimeDomainData(buf);

      const count = heights.length;
      const binSize = Math.max(1, Math.floor(buf.length / count));
      const k = reducedMotion.current ? 0.38 : 0.26;
      pulses.current = pulses.current.filter((p) => now - p.start < 1400);

      for (let i = 0; i < count; i++) {
        let peak = 0;
        const offset = i * binSize;
        for (let j = 0; j < binSize; j++) {
          const sample = buf[offset + j];
          const v = Math.abs((sample - 128) / 128);
          if (v > peak) peak = v;
        }
        const x = i * STEP + BAR_WIDTH / 2;
        const target = Math.min(1, 0.07 + peak * 1.7 + pulseBoost(x, now));
        heights[i] += (target - heights[i]) * k;
      }
      drawBars(heights);
    };

    const frame = (now: number) => {
      const live = modeRef.current === "live" && analyserRef.current;
      if (live) {
        const minGap = reducedMotion.current ? REDUCED_LIVE_MS : 0;
        if (!minGap || now - lastLiveDraw >= minGap) {
          lastLiveDraw = now;
          drawLive(now);
        }
      } else if (!reducedMotion.current) {
        drawIdle(now);
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      const live = modeRef.current === "live";
      if (running) return;
      if (reducedMotion.current && !live) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    anim.current = { start, stop, drawStatic };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(1, Math.floor((width + BAR_GAP) / STEP));
      const prev = heights.length;
      heights.length = count;
      for (let i = prev; i < count; i++) heights[i] = 0.12;
      if (reducedMotion.current && modeRef.current !== "live") drawStatic();
      else if (modeRef.current !== "live") drawIdle(performance.now());
    };

    const onMotion = () => {
      reducedMotion.current = motionQuery.matches;
      if (reducedMotion.current && modeRef.current !== "live") {
        stop();
        drawStatic();
      } else {
        start();
      }
    };

    const onVisibility = () => {
      if (
        document.hidden &&
        (modeRef.current === "live" || modeRef.current === "requesting")
      ) {
        teardownRef.current("idle");
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          return;
        }
        if (modeRef.current === "live" || modeRef.current === "requesting") {
          teardownRef.current("idle");
        }
        stop();
        if (reducedMotion.current) drawStatic();
      },
      { rootMargin: "80px 0px", threshold: 0 }
    );
    intersectionObserver.observe(rootRef.current ?? canvas);

    motionQuery.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      teardownRef.current("idle");
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      clearEchoTimer();
      teardownRef.current("idle");
    };
  }, [clearEchoTimer]);

  const shownLine = transcript || echo;
  const liveCaption =
    mode === "denied"
      ? "mic blocked — waveform stays visual only"
      : mode === "requesting"
        ? "requesting microphone…"
        : mode === "live"
          ? "listening locally"
          : "click / tap the wave to start listening";
  const showPrivacyNote = mode === "idle" || mode === "requesting";

  return (
    <div ref={rootRef}>
      <button
        type="button"
        aria-label={ariaLabelFor(mode)}
        aria-pressed={mode === "live"}
        aria-busy={mode === "requesting"}
        onPointerDown={onPointerDown}
        onClick={onToggle}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          pointerX.current = e.clientX - rect.left;
        }}
        onPointerLeave={() => {
          pointerX.current = null;
        }}
        className="block w-full cursor-pointer touch-manipulation rounded-md p-0 shadow-[inset_0_-1px_0_0_transparent] transition-[filter,box-shadow] duration-300 hover:shadow-[inset_0_-1px_0_0_rgba(217,184,119,0.35)] hover:drop-shadow-[0_0_10px_rgba(217,184,119,0.12)] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent/50"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="block h-16 w-full"
        />
      </button>
      <div
        aria-live="polite"
        className="mt-3 font-mono text-[0.7rem] tracking-wide text-faint"
      >
        <p className="truncate">
          {mode === "idle" && (
            <span aria-hidden="true" className="caret-blink text-accent">
              ▍
            </span>
          )}
          {mode === "idle" ? " " : null}
          {mode === "live" ? (
            <span className="text-accent">● </span>
          ) : null}
          {liveCaption}
        </p>
        {showPrivacyNote ? (
          <p className="mt-1 truncate">audio stays in this tab</p>
        ) : null}
        {shownLine ? (
          <p
            className={`mt-1 line-clamp-2 ${
              transcript ? "text-muted" : "text-faint"
            }`}
          >
            {shownLine}
          </p>
        ) : null}
      </div>
    </div>
  );
}
