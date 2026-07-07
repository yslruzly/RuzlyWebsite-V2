"use client";

import { useState, useEffect, useRef } from "react";
import { Radio, SkipBack, SkipForward, Play, Pause, Volume2, X } from "lucide-react";

interface RadioStation { name: string; url_resolved: string; }

const RadioWidget: React.FC = () => {
  const [genre, setGenre] = useState<"rock" | "sports">("rock");
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStations = (g: "rock" | "sports") => {
    const spanishKeywords = ["deportes", "espn deportes", "latino", "español", "española", "radio mia", "cadena", "onda", "futbol", "fútbol", "radio sol", "caracol", "univision", "telemundo"];
    const url = g === "sports"
      ? "https://de1.api.radio-browser.info/json/stations/bytag/sports?limit=20&hidebroken=true&order=clickcount&reverse=true&countrycode=US&language=english"
      : "https://de1.api.radio-browser.info/json/stations/bytag/rock?limit=20&hidebroken=true&order=clickcount&reverse=true&language=english";
    fetch(url)
      .then(r => r.json())
      .then((data: RadioStation[]) => {
        const filtered = data
          .filter(s => s.url_resolved)
          .filter(s => !spanishKeywords.some(kw => s.name.toLowerCase().includes(kw)));
        setStations(filtered);
        setIdx(0);
      })
      .catch(() => setError(true));
  };

  useEffect(() => { fetchStations(genre); }, [genre]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const station = stations[idx];

  const play = async () => {
    if (!station) return;
    if (!audioRef.current) audioRef.current = new Audio();
    setLoading(true);
    setError(false);
    audioRef.current.src = station.url_resolved;
    audioRef.current.volume = volume;
    audioRef.current.onerror = () => { setError(true); setLoading(false); setPlaying(false); };
    audioRef.current.oncanplay = () => setLoading(false);
    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch { setError(true); setLoading(false); }
  };

  const pause = () => { audioRef.current?.pause(); setPlaying(false); };
  const toggle = () => playing ? pause() : play();
  const next = () => { pause(); setIdx(i => (i + 1) % stations.length); };
  const prev = () => { pause(); setIdx(i => (i - 1 + stations.length) % stations.length); };

  useEffect(() => {
    if (playing) play();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const stationName = station?.name?.replace(/\s+/g, " ").trim() ?? "Loading...";

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: "9.5rem", right: "2rem", zIndex: 150,
          width: 48, height: 48, borderRadius: "50%",
          background: "#ffffff", color: "#000000",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(255,255,255,0.12)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        title="Radio"
      >
        {open ? <X size={18} /> : <Radio size={18} />}
        {playing && !open && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            width: 6, height: 6, borderRadius: "50%",
            background: "#4ade80", boxShadow: "0 0 6px #4ade80",
            animation: "radio-pulse 1.5s ease-in-out infinite",
          }} />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: "14.5rem", right: "2rem", zIndex: 150,
          width: "min(320px, calc(100vw - 2.5rem))", height: 420,
          background: "#0d0d0d",
          border: "1px solid #2a2a2a",
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "fadeUp 0.2s ease forwards",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "0.85rem 1rem",
            borderBottom: "1px solid #1e1e1e",
            background: "#111",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: playing ? "#4ade80" : "#fff",
                boxShadow: playing ? "0 0 6px #4ade80, 0 0 14px #4ade8066" : "0 0 6px rgba(255,255,255,0.8)",
                animation: "blink 2s ease-in-out infinite",
              }} />
              <div>
                <div style={{ fontSize: "0.68rem", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {genre === "rock" ? "Music Radio" : "Sports Radio"}
                </div>
                <div style={{ fontSize: "0.56rem", color: "#555", letterSpacing: "0.06em", marginTop: 1 }}>
                  {playing ? "Now streaming" : "Press play to start"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#555", cursor: "pointer", lineHeight: 1, transition: "color 0.15s", display: "flex", alignItems: "center" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            ><X size={16} /></button>
          </div>

          {/* Genre toggle */}
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1rem 0" }}>
            {(["rock", "sports"] as const).map(g => (
              <button
                key={g}
                onClick={() => { pause(); setGenre(g); }}
                style={{
                  flex: 1, padding: "0.35rem 0",
                  background: genre === g ? "#fff" : "rgba(255,255,255,0.06)",
                  color: genre === g ? "#000" : "#555",
                  border: "1px solid #2a2a2a",
                  borderRadius: 6, cursor: "pointer",
                  fontSize: "0.65rem", fontWeight: genre === g ? 700 : 400,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
              >
                {g === "rock" ? "🎵 Music" : "🏀 Sports"}
              </button>
            ))}
          </div>

          {/* Station info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "1.5rem" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Radio size={28} color={playing ? "#fff" : "#444"} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#fff", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4 }}>
                {error ? "Stream error" : loading ? "Connecting..." : stationName}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#444", letterSpacing: "0.06em" }}>
                {error ? "Try next station" : playing ? "Live" : "Paused"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: "0 1rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <button onClick={prev} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            ><SkipBack size={20} /></button>

            <button onClick={toggle} style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#fff", color: "#000",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading ? <span style={{ fontSize: "0.7rem" }}>…</span> : playing ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button onClick={next} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            ><SkipForward size={20} /></button>
          </div>

          {/* Volume */}
          <div style={{ padding: "0 1rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Volume2 size={13} color="#555" />
            <input
              type="range" min={0} max={1} step={0.05}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "#fff", height: "3px", cursor: "pointer" }}
            />
          </div>

          <div style={{ textAlign: "center", fontSize: "0.53rem", color: "#2a2a2a", padding: "0.3rem", letterSpacing: "0.08em", textTransform: "uppercase", background: "#0d0d0d" }}>
            powered by radio browser · live streams
          </div>
        </div>
      )}

      <style>{`@keyframes radio-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </>
  );
};

export default RadioWidget;
