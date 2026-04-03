import { useState, useRef, useEffect } from "react";
import { Music, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { useMusic, SOUNDTRACKS, SoundtrackId } from "@/contexts/MusicContext";

const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface MusicControlProps {
  /** Taille du bouton principal */
  size?: "sm" | "md";
  /** Classe CSS supplémentaire pour le bouton */
  className?: string;
}

export function MusicControl({ size = "md", className = "" }: MusicControlProps) {
  const { currentTrack, volume, muted, setTrack, setVolume, toggleMute, play } = useMusic();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermer le panneau si clic en dehors
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const btnSize = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="relative" ref={panelRef}>
      {/* Bouton principal */}
      <button
        onClick={() => { setOpen((o) => !o); play(); }}
        className={`${btnSize} rounded-full border-[2.5px] border-black flex items-center justify-center transition-all active:scale-95 ${className}`}
        style={{
          background: muted ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
          boxShadow: "3px 3px 0px #000",
        }}
        title="Musique de fond"
      >
        {muted
          ? <VolumeX className={`${iconSize} text-white/60`} />
          : <Music className={`${iconSize} text-white`} />
        }
      </button>

      {/* Panneau de contrôle */}
      {open && (
        <div
          className="absolute z-[200] right-0 mt-2 w-64 rounded-2xl border-[3px] border-black overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #1a0a3d 0%, #0c1a4e 100%)",
            boxShadow: "5px 5px 0px #000",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span style={FONT_FREDOKA} className="text-white text-sm tracking-wide">
              🎵 Musique de fond
            </span>
            <button onClick={() => setOpen(false)}>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Sélection des pistes */}
          <div className="px-3 py-2 flex flex-col gap-1.5">
            {SOUNDTRACKS.map((track) => {
              const isActive = currentTrack === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setTrack(track.id as SoundtrackId)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border-[2px] transition-all"
                  style={{
                    background: isActive ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                    borderColor: isActive ? "#7c3aed" : "rgba(255,255,255,0.1)",
                    boxShadow: isActive ? "0 0 10px rgba(124,58,237,0.4)" : "none",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: isActive ? "#a78bfa" : "rgba(255,255,255,0.2)" }}
                    />
                    <div>
                      <p style={FONT_FREDOKA} className="text-white text-xs leading-tight">
                        {track.name}
                      </p>
                      <p className="text-white/50 text-[0.6rem] leading-tight mt-0.5">
                        {track.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Volume + Mute */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full border-[2px] border-white/20 flex items-center justify-center flex-shrink-0 transition-all hover:border-white/40"
              style={{ background: muted ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)" }}
            >
              {muted
                ? <VolumeX className="w-4 h-4 text-red-400" />
                : <Volume2 className="w-4 h-4 text-white/70" />
              }
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (muted && v > 0) toggleMute();
                setVolume(v);
              }}
              className="flex-1 accent-purple-500"
              style={{ cursor: "pointer" }}
            />
            <span style={FONT_FREDOKA} className="text-white/50 text-xs w-8 text-right">
              {muted ? "0%" : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
