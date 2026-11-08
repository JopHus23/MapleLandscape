import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Particle {
  el: SVGCircleElement;
  angle: number;
  radius: number;
  speed: number;
}

export default function BlackHole() {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const slashRef = useRef<SVGLineElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const circle = circleRef.current;
    const slash = slashRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    if (!container || !circle || !slash || !title || !subtitle) return;

    const particles: Particle[] = [];
    const COUNT = 24;
    for (let i = 0; i < COUNT; i++) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const size = 1.5 + Math.random() * 2.5;
      dot.setAttribute('r', String(size));
      dot.setAttribute('fill', Math.random() > 0.6 ? '#D87C5F' : 'var(--fg-muted)');
      dot.setAttribute('opacity', '0');
      container.querySelector('svg')?.appendChild(dot);
      particles.push({
        el: dot,
        angle: Math.random() * Math.PI * 2,
        radius: 120 + Math.random() * 180,
        speed: 0.008 + Math.random() * 0.015,
      });
    }
    particlesRef.current = particles;

    const ctx = gsap.context(() => {
      gsap.set(circle, { drawSVG: '0%', attr: { 'stroke-dasharray': 0, 'stroke-dashoffset': 0 } });
      const circumference = 2 * Math.PI * 50;
      circle.style.strokeDasharray = String(circumference);
      circle.style.strokeDashoffset = String(circumference);
      slash.style.strokeDasharray = String(100);
      slash.style.strokeDashoffset = String(100);

      const tl = gsap.timeline();

      tl.to(circle, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.inOut',
      })
      .to(slash, {
        strokeDashoffset: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
      .to(particles.map(p => p.el), {
        attr: { opacity: 1 },
        duration: 0.4,
        stagger: 0.03,
      })
      .add(() => {
        particlesRef.current.forEach(p => { p.active = true; });
      })
      .to(title, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out',
      }, '-=0.5')
      .to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.6');
    }, container);

    let raf = 0;
    let frame = 0;
    const animateParticles = () => {
      frame++;
      particlesRef.current.forEach(p => {
        if (!p.active) return;
        p.angle += p.speed * (1 + (200 - p.radius) / 100);
        p.radius -= p.speed * 30;

        if (p.radius < 55) {
          p.radius = 120 + Math.random() * 180;
          p.angle = Math.random() * Math.PI * 2;
          p.el.setAttribute('opacity', '0');
          gsap.to(p.el, { attr: { opacity: 0.6 }, duration: 0.3 });
        }

        const cx = 100 + Math.cos(p.angle) * p.radius;
        const cy = 100 + Math.sin(p.angle) * p.radius;
        p.el.setAttribute('cx', String(cx));
        p.el.setAttribute('cy', String(cy));
      });
      raf = requestAnimationFrame(animateParticles);
    };

    const delayedStart = setTimeout(() => {
      particlesRef.current.forEach(p => { p.active = true; });
      raf = requestAnimationFrame(animateParticles);
    }, 2500);

    return () => {
      clearTimeout(delayedStart);
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center py-16" data-cursor="pointer">
      <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 md:h-64" fill="none">
        <circle
          ref={circleRef}
          cx="100"
          cy="100"
          r="50"
          stroke="var(--fg)"
          strokeWidth="1.5"
        />
        <line
          ref={slashRef}
          x1="64"
          y1="136"
          x2="136"
          y2="64"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
      </svg>
      <h1
        ref={titleRef}
        className="font-serif text-4xl md:text-5xl font-bold mt-8 text-center"
        style={{ opacity: 0, transform: 'translateY(20px)', filter: 'blur(8px)', color: 'var(--fg)' }}
      >
        枫糖空集
      </h1>
      <p
        ref={subtitleRef}
        className="mt-4 text-sm font-mono tracking-widest text-center"
        style={{ opacity: 0, transform: 'translateY(12px)', color: 'var(--fg-secondary)' }}
      >
        FROM NOTHING, EVERYTHING
      </p>
    </div>
  );
}
