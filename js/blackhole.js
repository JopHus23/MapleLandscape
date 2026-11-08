(function() {
  'use strict';
  const container = document.getElementById('blackhole');
  if (!container) return;

  const svg = container.querySelector('svg');
  const iconPath = svg.querySelector('.bh-circle');
  const title = container.querySelector('.bh-title');
  const subtitle = container.querySelector('.bh-subtitle');

  // Canvas for particle trails
  const canvas = svg.parentElement.querySelector('.bh-canvas');
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  const size = 192;
  const cx = size / 2;
  const cy = size / 2;

  function getAccentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#D87C5F';
  }
  function getFgMuted() {
    return getComputedStyle(document.documentElement).getPropertyValue('--fg-muted').trim() || 'rgba(128,128,128,0.3)';
  }

  // Animation phases
  let startTime = null;
  const DUR_ICON = 1000;
  const DUR_SPIN = 2000;
  const DUR_SETTLE = 1500;
  const IDLE_SPEED = 0.06;
  const FAST_TRAIL = 15;
  const IDLE_TRAIL = 70;

  // Particle system with trailing lines
  const particles = [];
  const COUNT = 6;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      angle: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 60,
      speed: 0.02 + Math.random() * 0.03,
      wobble: Math.random() * 0.5,
      trail: [],
      maxTrail: FAST_TRAIL,
      color: Math.random() > 0.5 ? getAccentColor() : getFgMuted(),
      width: 0.5 + Math.random() * 1
    });
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateIcon(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;

    if (elapsed < DUR_ICON) {
      const t = easeOutCubic(elapsed / DUR_ICON);
      iconPath.setAttribute('opacity', t);
      iconPath.style.transformOrigin = '12px 12px';
      iconPath.style.transform = `scale(${0.6 + 0.4 * t})`;
    } else {
      iconPath.setAttribute('opacity', '1');
      iconPath.style.transform = 'scale(1)';
    }

    if (elapsed > DUR_ICON * 0.5) {
      const t = easeOutCubic(Math.min(1, (elapsed - DUR_ICON * 0.5) / 800));
      title.style.opacity = t;
      title.style.transform = `translateY(${20 * (1 - t)}px)`;
      title.style.filter = `blur(${8 * (1 - t)}px)`;
    }
    if (elapsed > DUR_ICON * 0.7) {
      const t = easeOutCubic(Math.min(1, (elapsed - DUR_ICON * 0.7) / 600));
      subtitle.style.opacity = t;
      subtitle.style.transform = `translateY(${12 * (1 - t)}px)`;
    }
  }

  function animateParticles() {
    const elapsed = startTime ? performance.now() - startTime : 0;

    let globalSpeed = 1;
    if (elapsed > DUR_SPIN) {
      const settleT = Math.min(1, (elapsed - DUR_SPIN) / DUR_SETTLE);
      globalSpeed = IDLE_SPEED + (1 - IDLE_SPEED) * (1 - easeOutCubic(settleT));
    }
    ctx.clearRect(0, 0, size, size);

    particles.forEach((p, i) => {
      if (globalSpeed > 0.001) {
        p.angle += p.speed * globalSpeed;
        const r = p.radius + Math.sin(p.angle * 2 + i) * p.wobble * 15;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle * 0.8) * r * 0.85;
        p.trail.push({ x, y });
        const targetTrail = globalSpeed < 0.3 ? IDLE_TRAIL : FAST_TRAIL;
        p.maxTrail += (targetTrail - p.maxTrail) * 0.02;
        p.maxTrail = Math.round(p.maxTrail);
        if (p.trail.length > p.maxTrail) p.trail.shift();
      }

      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let j = 1; j < p.trail.length; j++) {
          ctx.lineTo(p.trail[j].x, p.trail[j].y);
        }
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.min(0.3 + 0.3 * globalSpeed, 0.5);
        ctx.lineWidth = p.width;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (p.trail.length > 0) {
        const last = p.trail[p.trail.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    });
  }

  function loop(time) {
    animateIcon(time);
    animateParticles();
    const elapsed = time - (startTime || time);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
