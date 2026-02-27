import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181",
  "#AA96DA", "#FCBAD3", "#A8D8EA", "#FF9A8B", "#88D8B0",
  "#C4E538", "#FDA7DF", "#78E08F", "#F8A5C2", "#63CDDA",
  "#CF6A87", "#786FA6", "#F19066", "#3DC1D3", "#E77F67",
];

function useSounds() {
  const synthRef = useRef(null);
  const initialized = useRef(false);

  const init = useCallback(async () => {
    if (initialized.current) return;
    await Tone.start();
    initialized.current = true;
  }, []);

  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.05, release: 0.3 },
        volume: -12,
      }).toDestination();
    }
    return synthRef.current;
  };

  const playTick = () => {
    if (!initialized.current) return;
    const synth = getSynth();
    const notes = ["C5", "D5", "E5", "F5", "G5", "A5"];
    synth.triggerAttackRelease(notes[Math.floor(Math.random() * notes.length)], "32n");
  };

  const playReveal = () => {
    if (!initialized.current) return;
    const synth = getSynth();
    synth.triggerAttackRelease("E5", "16n");
    setTimeout(() => { try { synth.triggerAttackRelease("G5", "16n"); } catch(e){} }, 120);
    setTimeout(() => { try { synth.triggerAttackRelease("C6", "8n"); } catch(e){} }, 240);
  };

  const playEliminate = () => {
    if (!initialized.current) return;
    const synth = getSynth();
    synth.triggerAttackRelease("C4", "8n");
    setTimeout(() => { try { synth.triggerAttackRelease("A3", "8n"); } catch(e){} }, 150);
  };

  const playWinner = () => {
    if (!initialized.current) return;
    const synth = getSynth();
    const melody = [
      { note: "C5", time: 0 },
      { note: "E5", time: 150 },
      { note: "G5", time: 300 },
      { note: "C6", time: 450 },
      { note: "G5", time: 600 },
      { note: "C6", time: 750 },
    ];
    melody.forEach(({ note, time }) => {
      setTimeout(() => { try { synth.triggerAttackRelease(note, "8n"); } catch(e){} }, time);
    });
  };

  const playStart = () => {
    if (!initialized.current) return;
    const synth = getSynth();
    synth.triggerAttackRelease("G4", "16n");
    setTimeout(() => { try { synth.triggerAttackRelease("C5", "16n"); } catch(e){} }, 100);
    setTimeout(() => { try { synth.triggerAttackRelease("E5", "16n"); } catch(e){} }, 200);
  };

  return { init, playTick, playReveal, playEliminate, playWinner, playStart };
}

function unlockSpeech() {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance("");
  utter.volume = 0;
  utter.rate = 10;
  window.speechSynthesis.speak(utter);
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.rate = 1.1;
  utter.pitch = 1.0;
  utter.volume = 0.9;
  window.speechSynthesis.speak(utter);
}

function Ball({ number, size = 64, color, dimmed = false, onClick, animate = false, isWinner = false }) {
  const ballStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}88, ${color}55)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size * 0.35,
    fontWeight: 800,
    color: "#1a1a2e",
    textShadow: "0 1px 0 rgba(255,255,255,0.3)",
    boxShadow: `0 4px 15px ${color}66, inset 0 -3px 6px rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.25)`,
    cursor: onClick ? "pointer" : "default",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    opacity: dimmed ? 0.25 : 1,
    transform: dimmed ? "scale(0.85)" : animate ? "scale(1.15)" : "scale(1)",
    position: "relative",
    userSelect: "none",
    fontFamily: "'Fredoka', sans-serif",
    border: isWinner ? "3px solid #FFE66D" : "none",
  };

  return (
    <div
      style={ballStyle}
      onClick={onClick}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.transform = "scale(1.1)"; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.transform = dimmed ? "scale(0.85)" : "scale(1)"; }}
    >
      {number}
    </div>
  );
}

function DrawnBall({ number, color }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(-30px) scale(0.3)",
      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}>
      <Ball number={number} size={48} color={color} />
    </div>
  );
}

function SoundToggle({ soundOn, setSoundOn, onInit }) {
  return (
    <button
      onClick={async () => {
        if (!soundOn) {
          await onInit();
          unlockSpeech();
        }
        setSoundOn(!soundOn);
      }}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 100,
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.1)",
        background: soundOn ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.05)",
        color: soundOn ? "#4ECDC4" : "#555",
        fontSize: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backdropFilter: "blur(8px)",
        fontFamily: "system-ui",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = soundOn ? "rgba(78,205,196,0.25)" : "rgba(255,255,255,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = soundOn ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.05)"; }}
      title={soundOn ? "Sound & voice ON" : "Sound & voice OFF"}
    >
      {soundOn ? "🔊" : "🔇"}
    </button>
  );
}

export default function RandomDraw() {
  const [inputValue, setInputValue] = useState("10");
  const [remaining, setRemaining] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [phase, setPhase] = useState("setup");
  const [winner, setWinner] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const spinInterval = useRef(null);
  const soundOnRef = useRef(false);
  const sounds = useSounds();

  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  const getColor = (n) => COLORS[(n - 1) % COLORS.length];

  const startGame = async () => {
    const max = Math.max(2, Math.min(100, parseInt(inputValue) || 10));
    const nums = Array.from({ length: max }, (_, i) => i + 1);
    setRemaining(nums);
    setDrawn([]);
    setCurrentDraw(null);
    setWinner(null);
    setPhase("playing");
    if (soundOnRef.current) {
      await sounds.init();
      sounds.playStart();
    }
  };

  const drawNumber = async () => {
    if (remaining.length <= 1 || isSpinning) return;

    if (soundOnRef.current) {
      await sounds.init();
      unlockSpeech();
    }

    setIsSpinning(true);
    let ticks = 0;
    const totalTicks = 15 + Math.floor(Math.random() * 10);

    spinInterval.current = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * remaining.length);
      setCurrentDraw(remaining[randomIdx]);
      if (soundOnRef.current) sounds.playTick();
      ticks++;

      if (ticks >= totalTicks) {
        clearInterval(spinInterval.current);
        const finalIdx = Math.floor(Math.random() * remaining.length);
        const picked = remaining[finalIdx];
        setCurrentDraw(picked);
        if (soundOnRef.current) sounds.playReveal();

        setTimeout(() => {
          if (soundOnRef.current) {
            sounds.playEliminate();
            speak(String(picked));
          }

          setDrawn((prev) => [...prev, picked]);
          setRemaining((prev) => {
            const next = prev.filter((n) => n !== picked);
            if (next.length === 1) {
              setTimeout(() => {
                setWinner(next[0]);
                setPhase("winner");
                if (soundOnRef.current) {
                  sounds.playWinner();
                  setTimeout(() => {
                    speak(`Number ${next[0]} is the winner!`);
                  }, 900);
                }
              }, 800);
            }
            return next;
          });
          setCurrentDraw(null);
          setIsSpinning(false);
        }, 600);
      }
    }, 60 + ticks * 8);
  };

  const reset = () => {
    clearInterval(spinInterval.current);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPhase("setup");
    setRemaining([]);
    setDrawn([]);
    setCurrentDraw(null);
    setWinner(null);
    setIsSpinning(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0f0c29, #1a1a3e, #24243e)",
      fontFamily: "'Fredoka', sans-serif",
      color: "#e0e0e0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "32px 16px",
      overflow: "hidden",
      position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet" />

      <SoundToggle soundOn={soundOn} setSoundOn={setSoundOn} onInit={sounds.init} />

      <div style={{ position: "fixed", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(78,205,196,0.08), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,107,0.08), transparent)", pointerEvents: "none" }} />

      <h1 style={{
        fontSize: 36,
        fontWeight: 700,
        background: "linear-gradient(135deg, #FF6B6B, #4ECDC4, #FFE66D)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 8,
        letterSpacing: "-0.5px",
      }}>
        Lucky Draw
      </h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 32, fontWeight: 400 }}>
        Draw numbers one by one — last one standing wins!
      </p>

      {phase === "setup" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          animation: "fadeIn 0.5s ease",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 20,
            padding: "32px 40px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}>
            <label style={{ fontSize: 18, fontWeight: 600, color: "#bbb" }}>
              How many numbers?
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20, color: "#666" }}>1</span>
              <span style={{ fontSize: 20, color: "#888" }}>→</span>
              <input
                type="number"
                min={2}
                max={100}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  width: 90,
                  padding: "12px 16px",
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "'Fredoka', sans-serif",
                  borderRadius: 14,
                  border: "2px solid rgba(78,205,196,0.3)",
                  background: "rgba(0,0,0,0.3)",
                  color: "#4ECDC4",
                  textAlign: "center",
                  outline: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                onBlur={(e) => e.target.style.borderColor = "rgba(78,205,196,0.3)"}
              />
            </div>
            <button
              onClick={startGame}
              style={{
                padding: "14px 48px",
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'Fredoka', sans-serif",
                borderRadius: 50,
                border: "none",
                background: "linear-gradient(135deg, #FF6B6B, #ee5a6f)",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 6px 25px rgba(255,107,107,0.35)",
                transition: "all 0.2s ease",
                letterSpacing: "0.5px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,107,107,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 25px rgba(255,107,107,0.35)"; }}
            >
              Start Game
            </button>
            <p style={{ fontSize: 12, color: "#666", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🔊</span> Tap the speaker icon (top-right) for sound & voice
            </p>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          width: "100%",
          maxWidth: 600,
        }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 24,
            padding: "28px",
            width: "100%",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}>
            <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {currentDraw ? (
                <div style={{ animation: isSpinning ? "pulse 0.15s ease infinite" : "none" }}>
                  <Ball number={currentDraw} size={80} color={getColor(currentDraw)} animate />
                </div>
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: "3px dashed rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "#555",
                }}>?</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={drawNumber}
                disabled={isSpinning || remaining.length <= 1}
                style={{
                  padding: "14px 40px",
                  fontSize: 17,
                  fontWeight: 700,
                  fontFamily: "'Fredoka', sans-serif",
                  borderRadius: 50,
                  border: "none",
                  background: isSpinning || remaining.length <= 1
                    ? "rgba(255,255,255,0.08)"
                    : "linear-gradient(135deg, #4ECDC4, #38b2ac)",
                  color: isSpinning || remaining.length <= 1 ? "#555" : "#fff",
                  cursor: isSpinning || remaining.length <= 1 ? "not-allowed" : "pointer",
                  boxShadow: isSpinning || remaining.length <= 1 ? "none" : "0 6px 25px rgba(78,205,196,0.35)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!isSpinning && remaining.length > 1) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {isSpinning ? "Drawing..." : "Draw a Number"}
              </button>
              <button
                onClick={reset}
                style={{
                  padding: "14px 20px", fontSize: 14, fontWeight: 600,
                  fontFamily: "'Fredoka', sans-serif", borderRadius: 50,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent", color: "#888", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                Reset
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
              {remaining.length} remaining · {drawn.length} drawn
            </p>
          </div>

          {drawn.length > 0 && (
            <div style={{ width: "100%", background: "rgba(0,0,0,0.2)", borderRadius: 16, padding: "16px 20px" }}>
              <p style={{ fontSize: 12, color: "#555", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: 1.5 }}>
                Eliminated
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {drawn.map((n) => (
                  <DrawnBall key={n} number={n} color={getColor(n)} />
                ))}
              </div>
            </div>
          )}

          <div style={{ width: "100%" }}>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }}>
              Still in play
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {remaining.map((n) => (
                <Ball
                  key={n} number={n}
                  size={remaining.length > 30 ? 40 : remaining.length > 15 ? 50 : 56}
                  color={getColor(n)}
                  dimmed={currentDraw !== null && currentDraw !== n}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "winner" && winner && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 28, animation: "fadeIn 0.6s ease",
        }}>
          <div style={{
            background: "rgba(255,230,109,0.06)", borderRadius: 28,
            padding: "48px 56px", border: "1px solid rgba(255,230,109,0.15)",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 24, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 12, left: 20, fontSize: 24, opacity: 0.6, animation: "spin 3s linear infinite" }}>✦</div>
            <div style={{ position: "absolute", top: 20, right: 24, fontSize: 18, opacity: 0.4, animation: "spin 4s linear infinite reverse" }}>✦</div>
            <div style={{ position: "absolute", bottom: 16, left: 30, fontSize: 16, opacity: 0.3, animation: "spin 5s linear infinite" }}>✦</div>

            <p style={{ fontSize: 16, color: "#FFE66D", fontWeight: 600, margin: 0, letterSpacing: 3, textTransform: "uppercase" }}>
              Winner!
            </p>
            <div style={{ animation: "bounce 1s ease infinite" }}>
              <Ball number={winner} size={120} color={getColor(winner)} isWinner />
            </div>
            <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
              Number {winner} is the last one standing!
            </p>
          </div>

          {drawn.length > 0 && (
            <div style={{
              background: "rgba(0,0,0,0.2)", borderRadius: 16,
              padding: "16px 20px", maxWidth: 500, width: "100%",
            }}>
              <p style={{ fontSize: 12, color: "#555", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }}>
                Draw order
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {drawn.map((n) => (
                  <Ball key={n} number={n} size={40} color={getColor(n)} dimmed />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={reset}
            style={{
              padding: "14px 48px", fontSize: 17, fontWeight: 700,
              fontFamily: "'Fredoka', sans-serif", borderRadius: 50,
              border: "none", background: "linear-gradient(135deg, #FF6B6B, #ee5a6f)",
              color: "#fff", cursor: "pointer",
              boxShadow: "0 6px 25px rgba(255,107,107,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Play Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1.15); }
          50% { transform: scale(1.25) rotate(5deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
        }
      `}</style>
    </div>
  );
}
