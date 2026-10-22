
"use client";

import { useEffect, useRef, useState } from "react";

const pianoNotes = [
  { key: "C", freq: 261.63, black: false },
  { key: "C#", freq: 277.18, black: true },
  { key: "D", freq: 293.66, black: false },
  { key: "D#", freq: 311.13, black: true },
  { key: "E", freq: 329.63, black: false },
  { key: "F", freq: 349.23, black: false },
  { key: "F#", freq: 369.99, black: true },
  { key: "G", freq: 392, black: false },
  { key: "G#", freq: 415.3, black: true },
  { key: "A", freq: 440, black: false },
  { key: "A#", freq: 466.16, black: true },
  { key: "B", freq: 493.88, black: false },
];

function playNote(frequency) {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audio = new AudioContextClass();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.2,
    audio.currentTime + 0.02
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audio.currentTime + 0.7
  );

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.start();
  oscillator.stop(audio.currentTime + 0.72);
  oscillator.onended = () => audio.close();
}

function Header({ onContact }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <header className="header">
      <a href="#home" className="logo" aria-label="Home">
        <span className="logo-mark">✳A</span>
      </a>

      <a href="#home" className="brand">ARYAN</a>

      <nav className="navigation">
        <a href="#home">KNOW ME</a>
        <a href="#works">WORKS</a>
        <a href="#memory">MEMORY TUNNEL</a>
        <a href="#piano">PLAY ME OUT</a>
      </nav>

      <div className="socials">
        <a href="https://www.linkedin.com/" target="_blank"
          rel="noreferrer" aria-label="LinkedIn">in</a>
        <a href="https://www.instagram.com/" target="_blank"
          rel="noreferrer" aria-label="Instagram">◎</a>
      </div>

      <button
        className="theme-toggle"
        onClick={() => setDark(!dark)}
        aria-label="Toggle theme"
      >
        ◐
      </button>

      <div className="header-contact">
        <span>Design-led product engineering.</span>
        <button onClick={onContact}>
          Partnerships, retainers, builds → <b>Get in touch</b>
        </button>
      </div>

      <div className="qr" aria-label="QR code placeholder">
        <span>▦</span>
      </div>
    </header>
  );
}

function WaveBackground() {
  const lines = Array.from({ length: 100 }, (_, i) => i);

  return (
    <div className="wave-background" aria-hidden="true">
      <svg
        viewBox="0 0 1200 420"
        preserveAspectRatio="none"
        className="wave-svg"
      >
        {lines.map((i) => {
          const x = i * 12.2;
          const points = Array.from({ length: 50 }, (_, j) => {
            const y = j * 9;
            const wave =
              Math.sin(j * 0.19 + i * 0.055) * 19 +
              Math.sin(j * 0.07 - i * 0.09) * 13;
            return `${x + wave},${y}`;
          }).join(" ");

          return (
            <polyline
              key={i}
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          );
        })}
      </svg>
      <span className="wave-dot" />
    </div>
  );
}

function Ticker({ reverse = false }) {
  return (
    <div className="ticker">
      <span className="ticker-arrow">‹</span>
      <div className="ticker-track">
        <div className={reverse ? "ticker-content reverse" : "ticker-content"}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>
              {i % 2 === 0
                ? "////////////////////"
                : "00006666000000"}
            </span>
          ))}
        </div>
      </div>
      <span className="ticker-arrow">›</span>
    </div>
  );
}

function InteractiveGrid() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [started, setStarted] = useState(false);

  return (
    <section
      id="works"
      className={`grid-section ${started ? "grid-started" : ""}`}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
      style={{
        "--pointer-x": `${position.x}%`,
        "--pointer-y": `${position.y}%`,
      }}
    >
      <svg
        className="grid-svg"
        viewBox="0 0 1200 640"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: 13 }, (_, i) => (
          <path
            key={`v${i}`}
            d={`M ${i * 100} 0 Q ${i * 100 + (i % 3 - 1) * 24} 320 ${i * 100} 640`}
          />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={`h${i}`}
            d={`M 0 ${i * 80} Q 600 ${i * 80 + (i % 2 ? 8 : -8)} 1200 ${i * 80}`}
          />
        ))}
      </svg>

      <button
        className="go-button"
        onClick={() => setStarted(!started)}
        aria-label="Toggle interactive grid"
      >
        {started ? "BACK" : "GO"}
      </button>

      {started && (
        <div className="grid-message">
          <span>CREATIVITY IN MOTION</span>
          <button onClick={() => setStarted(false)}>RETURN ↗</button>
        </div>
      )}
    </section>
  );
}

function Piano() {
  const [active, setActive] = useState(null);
  const [muted, setMuted] = useState(false);
  const releaseTimer = useRef(null);

  function pressNote(note) {
    if (muted) return;

    setActive(note.key);
    playNote(note.freq);

    clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => setActive(null), 180);
  }

  return (
    <section id="piano" className="piano-section">
      <div className="piano-heading">
        <span>GO ON-PLINK THE KEYS</span>
        <button
          className="mute-button"
          onClick={() => setMuted(!muted)}
          aria-label={muted ? "Enable piano sound" : "Mute piano"}
        >
          {muted ? "♪̸" : "▤"}
        </button>
      </div>

      <div className="keyboard">
        {Array.from({ length: 14 }, (_, i) => {
          const note = pianoNotes[i % pianoNotes.length];

          return (
            <button
              key={i}
              className={`white-key ${active === note.key ? "key-active" : ""}`}
              onPointerDown={() => pressNote(note)}
              aria-label={`Play ${note.key}`}
            >
              <span>{note.key}</span>
            </button>
          );
        })}

        {Array.from({ length: 14 }, (_, i) => {
          const note = pianoNotes.find(
            (item) => item.key === ["C#", "D#", "F#", "G#", "A#"][i % 5]
          );
          const positions = [0.67, 1.67, 3.67, 4.67, 5.67];
          const offset = positions[i % 5];

          return (
            <button
              key={`black-${i}`}
              className={`black-key ${active === note.key ? "key-active" : ""}`}
              style={{ left: `${((i * 2 + offset) / 14) * 100}%` }}
              onPointerDown={() => pressNote(note)}
              aria-label={`Play ${note.key}`}
            />
          );
        })}
      </div>
    </section>
  );
}

function ContactModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Submission failed");

      setStatus("Thank you! Your message has been received.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <section
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className="eyebrow">LET&apos;S CREATE SOMETHING</p>
        <h2 id="contact-title">Get in touch.</h2>

        <form onSubmit={handleSubmit}>
          <label>
            YOUR NAME
            <input
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </label>

          <label>
            EMAIL ADDRESS
            <input
              required
              type="email"
              maxLength={254}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>
            YOUR MESSAGE
            <textarea
              required
              maxLength={5000}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell me about your project..."
            />
          </label>

          <button className="submit-button" type="submit">
            SEND MESSAGE ↗
          </button>
          <p className="form-status" role="status">{status}</p>
        </form>
      </section>
    </div>
  );
}

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setContactOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main id="home">
      <Header onContact={() => setContactOpen(true)} />

      <WaveBackground />

      <Ticker />

      <section className="hero-title" id="memory">
        <h1>
          <span>CREATIVE</span>
          <span className="star">✦</span>
          <span>DEVELOPER</span>
        </h1>
      </section>

      <Ticker reverse />

      <InteractiveGrid />

      <footer className="footer">
        <a href="#home" className="footer-name">Aryan</a>
        <div className="footer-links">
          <a href="#terms">TERMS</a>
          <a href="#privacy">PRIVACY</a>
          <button onClick={() => setContactOpen(true)}>
            ARYAN@OGXSTUDIO.IN
          </button>
        </div>
      </footer>

      <Piano />

      {contactOpen && (
        <ContactModal onClose={() => setContactOpen(false)} />
      )}
    </main>
  );
}
