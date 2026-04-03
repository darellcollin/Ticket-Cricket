import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

export type SoundtrackId = "goofy" | "trippy" | "shiny";

export interface Soundtrack {
  id: SoundtrackId;
  name: string;
  description: string;
  url: string;
}

export const SOUNDTRACKS: Soundtrack[] = [
  {
    id: "goofy",
    name: "Hørizøn — Goofy",
    description: "Son 8-bit, style Arcade",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663504841528/GAi8R2QdtqcqsQSZTU62yr/H%C3%B8riz%C3%B8n-Goofy_8550613b.wav",
  },
  {
    id: "trippy",
    name: "Hørizøn — Trippy",
    description: "Son Synthwave, style Electro",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663504841528/GAi8R2QdtqcqsQSZTU62yr/H%C3%B8riz%C3%B8n-Trippy_cf3650cd.wav",
  },
  {
    id: "shiny",
    name: "Hørizøn — Shiny",
    description: "Son Calme, Style Lo-Fi",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663504841528/GAi8R2QdtqcqsQSZTU62yr/H%C3%B8riz%C3%B8n-Shiny_ba9dbd46.wav",
  },
];

const STORAGE_KEY_TRACK = "tc_music_track";
const STORAGE_KEY_VOLUME = "tc_music_volume";
const STORAGE_KEY_MUTED = "tc_music_muted";

interface MusicContextValue {
  currentTrack: SoundtrackId;
  volume: number; // 0–1
  muted: boolean;
  playing: boolean;
  setTrack: (id: SoundtrackId) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  play: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SoundtrackId>(
    () => (localStorage.getItem(STORAGE_KEY_TRACK) as SoundtrackId) || "goofy"
  );
  const [volume, setVolumeState] = useState<number>(() => {
    const v = localStorage.getItem(STORAGE_KEY_VOLUME);
    return v !== null ? parseFloat(v) : 0.4;
  });
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_MUTED) === "true";
  });
  const [playing, setPlaying] = useState(false);

  // Initialiser l'élément audio une seule fois
  useEffect(() => {
    const track = SOUNDTRACKS.find((s) => s.id === currentTrack) || SOUNDTRACKS[0];
    const audio = new Audio(track.url);
    audio.loop = true;
    audio.volume = muted ? 0 : volume;
    audioRef.current = audio;

    // Démarrer la lecture dès que l'utilisateur interagit (politique des navigateurs)
    const startOnInteraction = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
    };

    // Essayer de jouer immédiatement (fonctionne si l'utilisateur a déjà interagi)
    audio.play().then(() => setPlaying(true)).catch(() => {
      // Attendre une interaction utilisateur
      document.addEventListener("click", startOnInteraction);
      document.addEventListener("keydown", startOnInteraction);
      document.addEventListener("touchstart", startOnInteraction);
    });

    return () => {
      audio.pause();
      audio.src = "";
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Changer de piste
  const setTrack = useCallback((id: SoundtrackId) => {
    setCurrentTrack(id);
    localStorage.setItem(STORAGE_KEY_TRACK, id);
    const audio = audioRef.current;
    if (!audio) return;
    const track = SOUNDTRACKS.find((s) => s.id === id)!;
    const wasPlaying = !audio.paused;
    audio.src = track.url;
    audio.load();
    if (wasPlaying) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, []);

  // Changer le volume
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
    if (audioRef.current && !muted) {
      audioRef.current.volume = clamped;
    }
  }, [muted]);

  // Synchroniser le volume quand muted change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [muted, volume]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_MUTED, String(next));
      return next;
    });
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setPlaying(true)).catch(() => {});
  }, []);

  return (
    <MusicContext.Provider value={{ currentTrack, volume, muted, playing, setTrack, setVolume, toggleMute, play }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
}
