(function() {
  'use strict';

  // Theme toggle
  const toggle = document.querySelector('.theme-btn');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.hasAttribute('data-theme-manual')
        ? html.getAttribute('data-theme') === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = isDark ? 'light' : 'dark';
      html.setAttribute('data-theme-manual', '');
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme-manual', '');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Progress bar
  const progress = document.querySelector('.progress-bar');
  if (progress) {
    window.addEventListener('scroll', () => {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${dh > 0 ? st / dh : 0})`;
    }, { passive: true });
  }

  // Custom cursor system
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchOnly = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches;
  if (!isReducedMotion && !isTouchOnly) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    const nilset = document.createElement('span');
    nilset.textContent = '∅';
    nilset.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:20px;color:var(--accent);opacity:0;transition:opacity .25s;font-weight:700;';
    ring.appendChild(nilset);
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    ring.style.position = 'fixed';
    ring.style.left = '0';
    ring.style.top = '0';
    ring.style.width = '24px';
    ring.style.height = '24px';
    ring.style.opacity = '0.4';
    ring.style.display = 'flex';
    ring.style.alignItems = 'center';
    ring.style.justifyContent = 'center';
    ring.style.borderRadius = '50%';
    ring.style.border = '1.5px solid var(--accent)';
    ring.style.pointerEvents = 'none';
    ring.style.zIndex = '302';
    dot.style.position = 'fixed';
    dot.style.width = '6px';
    dot.style.height = '6px';
    dot.style.borderRadius = '50%';
    dot.style.background = 'var(--accent)';
    dot.style.pointerEvents = 'none';
    dot.style.zIndex = '303';
    dot.style.transform = 'translate(-50%,-50%)';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Click ripple
    const ripples = [];
    document.addEventListener('click', (e) => {
      const r = document.createElement('div');
      r.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:8px;height:8px;border-radius:50%;border:1.5px solid var(--accent);pointer-events:none;z-index:199;transform:translate(-50%,-50%) scale(1);opacity:0.8;transition:transform .6s cubic-bezier(.16,1,.3,1),opacity .6s;`;
      document.body.appendChild(r);
      requestAnimationFrame(() => {
        r.style.transform = 'translate(-50%,-50%) scale(6)';
        r.style.opacity = '0';
      });
      setTimeout(() => r.remove(), 700);
    });

    // Idle breathing
    let idleTimer = null;
    let isIdle = false;
    const IDLE_DELAY = 2000;
    const resetIdle = () => {
      isIdle = false;
      ring.style.animation = '';
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isIdle = true;
        // breathing handled in JS loop
      }, IDLE_DELAY);
    };
    // (no CSS keyframes needed, breathing is in JS loop)

    // Scroll feedback
    let scrollScale = 1;
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      scrollScale = 0.9;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { scrollScale = 1; }, 200);
    }, { passive: true });

    // Trail particles
    const trailDots = [];
    const TRAIL_COUNT = 4;
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const td = document.createElement('div');
      td.style.cssText = `position:fixed;width:5px;height:5px;border-radius:50%;background:var(--accent);pointer-events:none;z-index:198;opacity:0;transform:translate(-50%,-50%);`;
      document.body.appendChild(td);
      trailDots.push({ el: td, x: -100, y: -100, opacity: 0 });
    }

    let mx = -100, my = -100, rx = -100, ry = -100;
    let lastMx = -100, lastMy = -100;
    let ringScale = 1;
    let gravityX = 0, gravityY = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      resetIdle();
      const t = e.target;
      const interactive = t.closest('a, button, .magnetic, .card, .essay-item, .gallery-grid .item');

      if (interactive) {
        ring.style.width = '44px';
        ring.style.height = '44px';
        ring.style.opacity = '1';
        nilset.style.opacity = '0.8';
      } else {
        ring.style.width = '24px';
        ring.style.height = '24px';
        ring.style.opacity = '0.4';
        nilset.style.opacity = '0';
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '0.4';
    });

    function findNearestInteractive() {
      const els = document.querySelectorAll('a, button, .magnetic');
      let nearest = null;
      let minDist = 80;
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        const ex = rect.left + rect.width / 2;
        const ey = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(mx - ex, 2) + Math.pow(my - ey, 2));
        if (dist < minDist) { minDist = dist; nearest = { x: ex, y: ey, dist }; }
      });
      return nearest;
    }

    function animateCursor() {
      // Dot follows directly
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';

      // Ring follows with lerp
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;

      // Gravity pull toward nearest interactive
      const nearest = findNearestInteractive();
      if (nearest && nearest.dist > 0) {
        const strength = 1 - nearest.dist / 80;
        gravityX += ((nearest.x - mx) * 0.08 * strength - gravityX) * 0.1;
        gravityY += ((nearest.y - my) * 0.08 * strength - gravityY) * 0.1;
      } else {
        gravityX *= 0.9;
        gravityY *= 0.9;
      }

      // Scroll scale
      ringScale += (scrollScale - ringScale) * 0.15;

      const breathe = isIdle ? Math.sin(Date.now() * 0.003) * 0.08 + 1.08 : 1;
      const finalScale = ringScale * breathe;
      ring.style.transform = `translate(${rx + gravityX}px, ${ry + gravityY}px) translate(-50%, -50%) scale(${finalScale})`;

      // Trail particles
      trailDots.forEach((td, i) => {
        const delay = (i + 1) * 3;
        const targetX = rx - (rx - mx) * delay * 0.02;
        const targetY = ry - (ry - my) * delay * 0.02;
        td.x += (targetX - td.x) * 0.12;
        td.y += (targetY - td.y) * 0.12;
        const speed = Math.sqrt(Math.pow(mx - lastMx, 2) + Math.pow(my - lastMy, 2));
        const targetOp = Math.min(speed * 0.03, 0.4) * (1 - i / TRAIL_COUNT);
        td.opacity += (targetOp - td.opacity) * 0.1;
        td.el.style.left = td.x + 'px';
        td.el.style.top = td.y + 'px';
        td.el.style.opacity = td.opacity;
      });
      lastMx = mx;
      lastMy = my;

      requestAnimationFrame(animateCursor);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      requestAnimationFrame(animateCursor);
    });

    animateCursor();
  }

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(rect.width, rect.height);
      if (dist < maxDist * 2) {
        const strength = Math.max(0, 1 - dist / (maxDist * 2));
        const pull = strength * strength * 12;
        const angle = Math.atan2(dy, dx);
        btn.style.transform = `translate(${Math.cos(angle) * pull}px, ${Math.sin(angle) * pull}px)`;
        btn.style.borderRadius = (8 + strength * 40) + 'px';
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
      btn.style.borderRadius = '8px';
    });
  });

  // Lightbox for gallery images
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="close-btn" aria-label="关闭">✕</button>
    <img src="" alt="">
  `;
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.close-btn');

  function openLightbox(src) {
    lbImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-grid .item img, .gallery-grid .item').forEach(el => {
    el.addEventListener('click', (e) => {
      const img = el.closest('.item')?.querySelector('img') || el;
      if (img && img.src) {
        e.stopPropagation();
        openLightbox(img.src);
      }
    });
  });
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();
