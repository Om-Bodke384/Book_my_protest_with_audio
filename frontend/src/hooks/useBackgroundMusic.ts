import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bgm-enabled";
const BGM_SRC = "/audio/bgm.mp3";

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(BGM_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "none";
    audio.addEventListener("canplaythrough", () => setReady(true));
    audio.addEventListener("error", () => setReady(false));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
      audio.play().catch(() => {});
    };

    tryPlay();
    const events: (keyof DocumentEventMap)[] = ["pointerdown", "keydown", "touchstart"];
    events.forEach((e) => document.addEventListener(e, tryPlay, { once: true }));

    return () => {
      cancelled = true;
      events.forEach((e) => document.removeEventListener(e, tryPlay));
    };
  }, [enabled]);

  function toggle() {
    const audio = audioRef.current;
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (audio) {
        if (next) audio.play().catch(() => {});
        else audio.pause();
      }
      return next;
    });
  }

  return { enabled, toggle, ready };
}