"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
interface LevelUpProps  { fromLevel: number; toLevel: number; onDone?: () => void; }
interface CheckInProps  { onDone?: () => void; }

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function rand(min: number, max: number) { return Math.random() * (max - min) + min; }

// ─────────────────────────────────────────────────────────────────────────────
// 1. LEVEL UP — explosão de partículas + anel de energia + número do nível
// ─────────────────────────────────────────────────────────────────────────────
export function LevelUpAnimation({ fromLevel, toLevel, onDone }: LevelUpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"explode"|"reveal"|"done">("explode");
  const [show, setShow]   = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    // Partículas
    const COLORS = ["#66cc99","#1a3a5c","#ffd700","#ff6b6b","#a78bfa","#34d399","#f9a8d4"];
    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; alpha: number; decay: number; shape: "circle"|"star"|"diamond";
    };
    const particles: Particle[] = Array.from({ length: 120 }, () => {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(2, 12);
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(0, 4),
        r: rand(3, 9),
        color: COLORS[Math.floor(rand(0, COLORS.length))],
        alpha: 1,
        decay: rand(0.012, 0.025),
        shape: (["circle","star","diamond"] as const)[Math.floor(rand(0,3))],
      };
    });

    // Ondas de energia (anéis)
    type Ring = { r: number; alpha: number; color: string };
    const rings: Ring[] = [
      { r: 0, alpha: 0.9, color: "#66cc99" },
      { r: 0, alpha: 0.6, color: "#ffd700" },
      { r: 0, alpha: 0.4, color: "#a78bfa" },
    ];

    let frame = 0;
    let raf: number;

    function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
        i === 0 ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
                : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
        ctx.lineTo(x + (r * 0.4) * Math.cos(b), y + (r * 0.4) * Math.sin(b));
      }
      ctx.closePath();
      ctx.fill();
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Anéis
      rings.forEach((ring, i) => {
        ring.r += 4 + i * 1.5;
        ring.alpha -= 0.012;
        if (ring.alpha > 0) {
          ctx.save();
          ctx.strokeStyle = ring.color;
          ctx.globalAlpha = ring.alpha;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Partículas
      particles.forEach((p) => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.25;   // gravidade
        p.vx *= 0.98;
        p.alpha -= p.decay;
        if (p.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "star") {
          drawStar(ctx, p.x, p.y, p.r);
        } else {
          ctx.translate(p.x, p.y);
          ctx.rotate(frame * 0.08);
          ctx.fillRect(-p.r * 0.7, -p.r * 0.7, p.r * 1.4, p.r * 1.4);
        }
        ctx.restore();
      });

      const alive = particles.some(p => p.alpha > 0);
      if (alive || frame < 60) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("reveal");
        setTimeout(() => { setPhase("done"); setTimeout(() => { setShow(false); onDone?.(); }, 600); }, 2000);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "radial-gradient(ellipse at center, rgba(26,58,92,0.97) 0%, rgba(5,15,30,0.99) 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      {/* Conteúdo central */}
      <div style={{ position: "relative", textAlign: "center", zIndex: 2 }}>

        {/* Anel giratório decorativo */}
        <div style={{
          width: 180, height: 180, borderRadius: "50%", margin: "0 auto 24px",
          border: "2px solid rgba(102,204,153,0.3)",
          boxShadow: "0 0 40px rgba(102,204,153,0.4), inset 0 0 40px rgba(102,204,153,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: phase === "explode" ? "spin 2s linear infinite" : "none",
          position: "relative",
        }}>
          <div style={{
            width: 150, height: 150, borderRadius: "50%",
            border: "1px solid rgba(255,215,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "spin-reverse 3s linear infinite",
          }}>
            <span style={{
              fontSize: 72, fontWeight: 900, lineHeight: 1,
              background: "linear-gradient(135deg, #ffd700, #66cc99, #ffffff)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(255,215,0,0.8))",
              animation: phase === "reveal" ? "pop 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none",
            }}>
              {toLevel}
            </span>
          </div>
        </div>

        <p style={{
          fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase",
          color: "#66cc99", marginBottom: 8, opacity: phase === "reveal" ? 1 : 0,
          transition: "opacity 0.5s 0.2s",
        }}>
          nível alcançado
        </p>

        <h2 style={{
          fontSize: 32, fontWeight: 900, color: "#ffffff", margin: "0 0 6px",
          opacity: phase === "reveal" ? 1 : 0, transition: "opacity 0.5s 0.3s",
          textShadow: "0 0 30px rgba(255,215,0,0.6)",
        }}>
          Subiu de nível!
        </h2>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.5)",
          opacity: phase === "reveal" ? 1 : 0, transition: "opacity 0.5s 0.5s",
        }}>
          {fromLevel} → {toLevel}
        </p>

        {/* Barra de XP */}
        <div style={{
          width: 200, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99,
          margin: "20px auto 0", overflow: "hidden",
          opacity: phase === "reveal" ? 1 : 0, transition: "opacity 0.5s 0.6s",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg, #66cc99, #ffd700)",
            width: phase === "reveal" ? "100%" : "0%",
            transition: "width 1.2s 0.8s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: "0 0 10px rgba(102,204,153,0.8)",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spin-reverse { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes pop {
          0%  {transform:scale(0.3);opacity:0}
          60% {transform:scale(1.15)}
          100%{transform:scale(1);opacity:1}
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHECK-IN MANHÃ — aurora boreal + sol nascente + pássaros
// ─────────────────────────────────────────────────────────────────────────────
export function CheckInManhaAnimation({ onDone }: CheckInProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase]   = useState<"rise"|"shine"|"done">("rise");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    let sunY = H + 60;
    let frame = 0;
    let raf: number;

    // Pássaros
    type Bird = { x: number; y: number; vx: number; vy: number; wing: number; phase: number };
    const birds: Bird[] = Array.from({ length: 7 }, (_, i) => ({
      x: -60 - i * 80, y: H * 0.25 + rand(-40, 40),
      vx: rand(1.5, 3), vy: 0, wing: 0, phase: rand(0, Math.PI * 2),
    }));

    // Partículas de luz
    type Spark = { x: number; y: number; r: number; alpha: number; vy: number };
    const sparks: Spark[] = [];

    function addSparks() {
      if (frame % 3 === 0) {
        const angle = rand(-Math.PI * 0.8, -Math.PI * 0.2);
        sparks.push({
          x: W / 2 + Math.cos(angle) * rand(10, 80),
          y: sunY     + Math.sin(angle) * rand(10, 80),
          r: rand(1, 4), alpha: rand(0.5, 1), vy: rand(-1.5, -0.3),
        });
      }
      sparks.forEach(s => { s.y += s.vy; s.alpha -= 0.018; });
      sparks.filter(s => s.alpha > 0).forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = "#fff7a0";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const progress = Math.min(frame / 120, 1);
      sunY = H + 60 - (H * 0.52) * progress;

      // Céu gradiente dinâmico
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      const t = progress;
      sky.addColorStop(0, `rgb(${lerp(10,20,t)},${lerp(15,60,t)},${lerp(40,120,t)})`);
      sky.addColorStop(0.5, `rgb(${lerp(30,255,t)},${lerp(20,140,t)},${lerp(30,60,t)})`);
      sky.addColorStop(1, `rgb(${lerp(20,255,t)},${lerp(10,200,t)},${lerp(20,120,t)})`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Aurora boreal
      for (let i = 0; i < 3; i++) {
        const aGrad = ctx.createLinearGradient(0, H * 0.1, 0, H * 0.55);
        aGrad.addColorStop(0, `rgba(102,204,153,${0.12 * progress})`);
        aGrad.addColorStop(1, "rgba(102,204,153,0)");
        ctx.save();
        ctx.globalAlpha = progress * 0.7;
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.moveTo(i * W * 0.4, 0);
        for (let x = 0; x <= W; x += 10) {
          const y = H * 0.2 + Math.sin((x / W) * Math.PI * 3 + frame * 0.02 + i) * 40;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Raios de sol
      if (progress > 0.3) {
        const rays = 14;
        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2;
          const len   = 80 + Math.sin(frame * 0.04 + i) * 20;
          ctx.save();
          ctx.globalAlpha = (progress - 0.3) * 0.15;
          ctx.strokeStyle = "#fffacd";
          ctx.lineWidth   = 2;
          ctx.beginPath();
          ctx.moveTo(W / 2 + Math.cos(angle) * 55, sunY + Math.sin(angle) * 55);
          ctx.lineTo(W / 2 + Math.cos(angle) * (55 + len), sunY + Math.sin(angle) * (55 + len));
          ctx.stroke();
          ctx.restore();
        }
      }

      // Sol
      const sunR = 50;
      const gSun = ctx.createRadialGradient(W/2, sunY, 0, W/2, sunY, sunR * 2.5);
      gSun.addColorStop(0,   "#ffffff");
      gSun.addColorStop(0.3, "#ffe066");
      gSun.addColorStop(0.7, "#ff9c33");
      gSun.addColorStop(1,   "rgba(255,100,50,0)");
      ctx.save();
      ctx.globalAlpha = Math.min(progress * 1.5, 1);
      ctx.fillStyle   = gSun;
      ctx.beginPath();
      ctx.arc(W / 2, sunY, sunR * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      addSparks();

      // Pássaros
      birds.forEach(b => {
        b.x    += b.vx;
        b.phase += 0.08;
        const wingAngle = Math.sin(b.phase) * 0.4;
        ctx.save();
        ctx.strokeStyle = `rgba(20,20,40,${0.6 * progress})`;
        ctx.lineWidth   = 1.5;
        ctx.translate(b.x, b.y);
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.quadraticCurveTo(-5, -8 * Math.sin(b.phase), 0, 0);
        ctx.quadraticCurveTo(5,  -8 * Math.sin(b.phase), 10, 0);
        ctx.stroke();
        ctx.restore();
      });

      // Chão / silhueta montanhas
      ctx.save();
      ctx.fillStyle = `rgba(10,20,40,${0.5 + progress * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.78);
      ctx.quadraticCurveTo(W * 0.2, H * 0.6, W * 0.35, H * 0.72);
      ctx.quadraticCurveTo(W * 0.5, H * 0.55, W * 0.65, H * 0.7);
      ctx.quadraticCurveTo(W * 0.8, H * 0.62, W, H * 0.74);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (frame < 160) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("shine");
        setTimeout(() => { setPhase("done"); setTimeout(() => { setVisible(false); onDone?.(); }, 600); }, 2000);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div style={{
          fontSize: 64, marginBottom: 12,
          filter: "drop-shadow(0 0 20px rgba(255,200,50,0.9))",
          animation: "floatIcon 3s ease-in-out infinite",
        }}>☀️</div>
        <h2 style={{
          fontSize: 28, fontWeight: 900, color: "#ffffff",
          textShadow: "0 2px 20px rgba(255,150,50,0.8)",
          opacity: phase === "shine" ? 1 : 0,
          transform: phase === "shine" ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s 0.2s",
          margin: "0 0 8px",
        }}>
          Bom dia! ☀️
        </h2>
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.8)",
          opacity: phase === "shine" ? 1 : 0,
          transition: "opacity 0.6s 0.5s",
        }}>
          Check-in da manhã concluído!
        </p>
      </div>
      <style>{`
        @keyframes floatIcon {
          0%,100%{transform:translateY(0) rotate(-5deg)}
          50%{transform:translateY(-12px) rotate(5deg)}
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CHECK-IN NOITE — lua, estrelas cadentes, névoa e constelações
// ─────────────────────────────────────────────────────────────────────────────
export function CheckInNoiteAnimation({ onDone }: CheckInProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase]   = useState<"rise"|"glow"|"done">("rise");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    let moonY  = -80;
    let frame  = 0;
    let raf: number;

    // Estrelas fixas
    type Star = { x: number; y: number; r: number; alpha: number; pulse: number };
    const stars: Star[] = Array.from({ length: 160 }, () => ({
      x: rand(0, W), y: rand(0, H * 0.8),
      r: rand(0.5, 2.5), alpha: rand(0.2, 1), pulse: rand(0, Math.PI * 2),
    }));

    // Estrelas cadentes
    type Shooting = { x: number; y: number; vx: number; vy: number; len: number; alpha: number; active: boolean };
    const shooting: Shooting[] = Array.from({ length: 5 }, () => ({
      x: rand(W * 0.2, W), y: rand(0, H * 0.3),
      vx: rand(-6, -3), vy: rand(2, 5),
      len: rand(60, 120), alpha: 0, active: false,
    }));

    // Constelações (linhas)
    const constellation = [
      [{ x: W*0.15, y: H*0.1 }, { x: W*0.22, y: H*0.18 }, { x: W*0.18, y: H*0.28 }],
      [{ x: W*0.75, y: H*0.08 }, { x: W*0.82, y: H*0.15 }, { x: W*0.78, y: H*0.22 }, { x: W*0.85, y: H*0.28 }],
    ];

    // Partículas de névoa
    type Mist = { x: number; y: number; r: number; alpha: number; vx: number };
    const mist: Mist[] = Array.from({ length: 8 }, () => ({
      x: rand(0, W), y: rand(H * 0.6, H),
      r: rand(60, 120), alpha: rand(0.02, 0.06), vx: rand(-0.3, 0.3),
    }));

    function tick() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const progress = Math.min(frame / 100, 1);
      moonY = Math.max(-80, H * 0.2 - (H * 0.35) * progress + 80);

      // Céu noturno
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0,   "#020818");
      sky.addColorStop(0.4, "#061530");
      sky.addColorStop(1,   "#0d2347");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Estrelas
      stars.forEach(s => {
        s.pulse += 0.03;
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse)) * Math.min(progress * 2, 1);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle   = "#ffffff";
        ctx.shadowColor = "#aaddff";
        ctx.shadowBlur  = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Constelações
      if (progress > 0.5) {
        constellation.forEach(pts => {
          ctx.save();
          ctx.globalAlpha = (progress - 0.5) * 0.5;
          ctx.strokeStyle = "#66ccff";
          ctx.lineWidth   = 0.8;
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
          ctx.stroke();
          pts.forEach(p => {
            ctx.fillStyle = "#66ccff";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        });
      }

      // Estrelas cadentes
      if (frame > 40 && frame % 50 === 0) {
        const s = shooting[Math.floor(rand(0, shooting.length))];
        s.x     = rand(W * 0.3, W);
        s.y     = rand(0, H * 0.25);
        s.alpha = 1;
        s.active = true;
      }
      shooting.forEach(s => {
        if (!s.active) return;
        s.x    += s.vx;
        s.y    += s.vy;
        s.alpha -= 0.025;
        if (s.alpha <= 0) { s.active = false; return; }
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.len / 6), s.y - s.vy * (s.len / 6));
        grad.addColorStop(0,   `rgba(255,255,255,${s.alpha})`);
        grad.addColorStop(1,   "rgba(255,255,255,0)");
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * (s.len / 6), s.y - s.vy * (s.len / 6));
        ctx.stroke();
        ctx.restore();
      });

      // Halo lunar
      if (progress > 0.2) {
        const halo = ctx.createRadialGradient(W/2, moonY, 40, W/2, moonY, 140);
        halo.addColorStop(0,   "rgba(180,210,255,0.15)");
        halo.addColorStop(0.5, "rgba(100,160,255,0.05)");
        halo.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.save();
        ctx.globalAlpha = Math.min((progress - 0.2) * 1.5, 1);
        ctx.fillStyle   = halo;
        ctx.beginPath();
        ctx.arc(W/2, moonY, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Lua crescente
      ctx.save();
      ctx.globalAlpha = Math.min(progress * 1.5, 1);
      ctx.shadowColor = "#aaccff";
      ctx.shadowBlur  = 30;
      ctx.fillStyle   = "#e8f0ff";
      ctx.beginPath();
      ctx.arc(W/2, moonY, 44, 0, Math.PI * 2);
      ctx.fill();
      // mordida da lua crescente
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(W/2 + 22, moonY - 8, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Névoa
      mist.forEach(m => {
        m.x += m.vx;
        if (m.x > W + m.r) m.x = -m.r;
        if (m.x < -m.r)    m.x = W + m.r;
        ctx.save();
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        mg.addColorStop(0, `rgba(100,160,220,${m.alpha * progress})`);
        mg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Silhueta cidade
      ctx.save();
      ctx.fillStyle = "#010a1a";
      ctx.beginPath();
      ctx.moveTo(0, H);
      // Prédios
      const buildings = [0,80,60,100,45,90,70,55,85,65,95,50,75,60,40,85,70,100,55,80];
      let bx = 0;
      buildings.forEach((bh, i) => {
        const bw = W / buildings.length;
        ctx.rect(bx, H - bh * 0.6, bw - 2, bh * 0.6);
        bx += bw;
      });
      ctx.fill();
      ctx.restore();

      // Janelas acesas
      ctx.save();
      ctx.fillStyle = "rgba(255,230,100,0.6)";
      bx = 0;
      buildings.forEach((bh, i) => {
        const bw = W / buildings.length;
        if (Math.sin(i * 7.3) > 0.2) {
          ctx.fillRect(bx + 3, H - bh * 0.6 + 8, 5, 5);
        }
        bx += bw;
      });
      ctx.restore();

      if (frame < 150) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("glow");
        setTimeout(() => { setPhase("done"); setTimeout(() => { setVisible(false); onDone?.(); }, 600); }, 2000);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginTop: "40%" }}>
        <div style={{
          fontSize: 64, marginBottom: 12,
          filter: "drop-shadow(0 0 20px rgba(150,180,255,0.9))",
          animation: "floatMoon 4s ease-in-out infinite",
        }}>🌙</div>
        <h2 style={{
          fontSize: 28, fontWeight: 900, color: "#e8f0ff",
          textShadow: "0 2px 20px rgba(100,160,255,0.8)",
          opacity: phase === "glow" ? 1 : 0,
          transform: phase === "glow" ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s 0.2s",
          margin: "0 0 8px",
        }}>
          Boa noite! 🌙
        </h2>
        <p style={{
          fontSize: 15, color: "rgba(200,220,255,0.8)",
          opacity: phase === "glow" ? 1 : 0,
          transition: "opacity 0.6s 0.5s",
        }}>
          Check-in da noite concluído!
        </p>
      </div>
      <style>{`
        @keyframes floatMoon {
          0%,100%{transform:translateY(0) rotate(5deg)}
          50%{transform:translateY(-12px) rotate(-5deg)}
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CHECK-IN COMPLETO — céu crepuscular (sol + lua + estrelas) + 3 ícones
// ─────────────────────────────────────────────────────────────────────────────
export function CheckInCompletoAnimation({ onDone }: CheckInProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase]   = useState<"rise"|"glow"|"done">("rise");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    let frame = 0;
    let raf: number;

    // Estrelas
    type Star = { x: number; y: number; r: number; alpha: number; pulse: number };
    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: rand(0, W), y: rand(0, H * 0.7),
      r: rand(0.5, 2), alpha: rand(0.3, 1), pulse: rand(0, Math.PI * 2),
    }));

    // Partículas tricolores (referência aos 3 check-ins)
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number };
    const particles: Particle[] = Array.from({ length: 80 }, () => {
      const colors = ["#ffe066", "#66ccff", "#66cc99"];
      const angle  = rand(0, Math.PI * 2);
      const speed  = rand(1, 5);
      return {
        x: W / 2, y: H * 0.38,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(1, 3),
        r: rand(2, 6),
        color: colors[Math.floor(rand(0, 3))],
        alpha: 1,
      };
    });

    // Névoa
    type Mist = { x: number; y: number; r: number; alpha: number; vx: number };
    const mist: Mist[] = Array.from({ length: 6 }, () => ({
      x: rand(0, W), y: rand(H * 0.65, H),
      r: rand(80, 130), alpha: rand(0.03, 0.07), vx: rand(-0.2, 0.2),
    }));

    function tick() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const progress = Math.min(frame / 120, 1);

      // Céu crepuscular — meio-termo entre dia e noite
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0,   "#0a0f2e");
      sky.addColorStop(0.35, "#1a1060");
      sky.addColorStop(0.6,  "#7c2d6e");
      sky.addColorStop(0.8,  "#e0601a");
      sky.addColorStop(1,    "#f5a623");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Estrelas (somem conforme progride — crepúsculo)
      stars.forEach(s => {
        s.pulse += 0.025;
        const fade = Math.max(0, 1 - progress * 1.2);
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse)) * fade;
        if (a <= 0) return;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle   = "#ffffff";
        ctx.shadowColor = "#aaddff";
        ctx.shadowBlur  = 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Sol (lado direito, saindo)
      const sunX = W * 0.72;
      const sunY = H * 0.38 - progress * 20;
      const gSun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 90);
      gSun.addColorStop(0,   "#ffffff");
      gSun.addColorStop(0.2, "#ffe066");
      gSun.addColorStop(0.6, "#ff9c33");
      gSun.addColorStop(1,   "rgba(255,100,50,0)");
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle   = gSun;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Lua (lado esquerdo, subindo)
      const moonX = W * 0.28;
      const moonY = H * 0.42 - progress * 30;
      ctx.save();
      ctx.globalAlpha = Math.min(progress * 1.8, 1);
      ctx.shadowColor = "#aaccff";
      ctx.shadowBlur  = 25;
      ctx.fillStyle   = "#e8f0ff";
      ctx.beginPath();
      ctx.arc(moonX, moonY, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(moonX + 18, moonY - 6, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Reflexo horizontal (linha do horizonte)
      const horizon = ctx.createLinearGradient(0, H * 0.72, 0, H * 0.78);
      horizon.addColorStop(0, "rgba(255,180,80,0.25)");
      horizon.addColorStop(1, "rgba(255,180,80,0)");
      ctx.fillStyle = horizon;
      ctx.fillRect(0, H * 0.72, W, H * 0.06);

      // Partículas tricolores
      particles.forEach(p => {
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   += 0.12;
        p.vx   *= 0.98;
        p.alpha -= 0.012;
        if (p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.alpha * Math.min(progress * 3, 1);
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Névoa
      mist.forEach(m => {
        m.x += m.vx;
        if (m.x > W + m.r) m.x = -m.r;
        if (m.x < -m.r)    m.x = W + m.r;
        ctx.save();
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        mg.addColorStop(0, `rgba(200,120,80,${m.alpha * progress})`);
        mg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Silhueta montanhas
      ctx.save();
      ctx.fillStyle = "#05091a";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.76);
      ctx.quadraticCurveTo(W * 0.15, H * 0.58, W * 0.3, H * 0.7);
      ctx.quadraticCurveTo(W * 0.45, H * 0.52, W * 0.6, H * 0.68);
      ctx.quadraticCurveTo(W * 0.75, H * 0.6, W, H * 0.72);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (frame < 160) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("glow");
        setTimeout(() => { setPhase("done"); setTimeout(() => { setVisible(false); onDone?.(); }, 600); }, 2500);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>

        {/* 3 ícones representando sono, nutrição e mental */}
        <div style={{
          display: "flex", gap: 20, justifyContent: "center", marginBottom: 16,
          opacity: phase === "glow" ? 1 : 0,
          transform: phase === "glow" ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.6s 0.1s",
        }}>
          {["🌙", "🥗", "🧠"].map((icon, i) => (
            <div key={i} style={{
              fontSize: 40,
              filter: "drop-shadow(0 0 12px rgba(255,200,100,0.9))",
              animation: `floatIcon${i} ${3 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}>{icon}</div>
          ))}
        </div>

        <h2 style={{
          fontSize: 28, fontWeight: 900, color: "#fff7e6",
          textShadow: "0 2px 20px rgba(255,150,50,0.9)",
          opacity: phase === "glow" ? 1 : 0,
          transform: phase === "glow" ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s 0.3s",
          margin: "0 0 8px",
        }}>
          Check-in completo! 🌅
        </h2>
        <p style={{
          fontSize: 15, color: "rgba(255,240,200,0.85)",
          opacity: phase === "glow" ? 1 : 0,
          transition: "opacity 0.6s 0.6s",
        }}>
          Sono, nutrição e saúde mental registrados.
        </p>
      </div>

      <style>{`
        @keyframes floatIcon0 { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-10px) rotate(5deg)} }
        @keyframes floatIcon1 { 0%,100%{transform:translateY(0) rotate(3deg)}  50%{transform:translateY(-14px) rotate(-3deg)} }
        @keyframes floatIcon2 { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-8px) rotate(6deg)} }
      `}</style>
    </div>
  );
}