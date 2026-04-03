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
  volume: number;
  muted: boolean;
  playing: boolean;
  waitingForInteraction: boolean;
  setTrack: (id: SoundtrackId) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  play: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

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
  const [waitingForInteraction, setWaitingForInteraction] = useState(false);

  // Créer l'élément audio une seule fois
  useEffect(() => {
    const track = SOUNDTRACKS.find((s) => s.id === currentTrack) || SOUNDTRACKS[0];
    const audio = new Audio(track.url);
    audio.loop = true;
    audio.volume = muted ? 0 : volume;
    audioRef.current = audio;

    // Tenter de jouer immédiatement
    const tryPlay = () => {
      if (startedRef.current) return;
      audio.play()
        .then(() => {
          startedRef.current = true;
          setPlaying(true);
          setWaitingForInteraction(false);
          cleanup();
        })
        .catch(() => {
          // Navigateur bloque — attendre interaction
          setWaitingForInteraction(true);
        });
    };

    const handleInteraction = () => {
      if (startedRef.current) return;
      audio.play()
        .then(() => {
          startedRef.current = true;
          setPlaying(true);
          setWaitingForInteraction(false);
          cleanup();
        })
        .catch(() => {});
    };

    const cleanup = () => {
      document.removeEventListener("click", handleInteraction, true);
      document.removeEventListener("touchstart", handleInteraction, true);
      document.removeEventListener("keydown", handleInteraction, true);
    };

    // Écouter TOUTE interaction (capture phase = avant tout autre handler)
    document.addEventListener("click", handleInteraction, true);
    document.addEventListener("touchstart", handleInteraction, true);
    document.addEventListener("keydown", handleInteraction, true);

    // Essayer immédiatement (fonctionne si l'utilisateur a déjà interagi dans cette session)
    tryPlay();

    return () => {
      cleanup();
      audio.pause();
      audio.src = "";
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
    if (wasPlaying || startedRef.current) {
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

  // Synchroniser volume/mute
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
    audio.play().then(() => { startedRef.current = true; setPlaying(true); setWaitingForInteraction(false); }).catch(() => {});
  }, []);

  return (
    <MusicContext.Provider value={{ currentTrack, volume, muted, playing, waitingForInteraction, setTrack, setVolume, toggleMute, play }}>
      {children}
      {/* Indicateur discret si en attente d'interaction */}
      {waitingForInteraction && (
        <div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "2px solid rgba(124,58,237,0.6)",
            borderRadius: "999px",
            padding: "4px 14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: "0.7rem", color: "rgba(167,139,250,0.9)", letterSpacing: "0.05em" }}>
            🎵 Touchez pour activer la musique
          </span>
        </div>
      )}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
}
