import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function MagneticButton({ children, href, onClick, className = '' }: Props) {
  const btnRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const handleMove = useCallback((e: MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
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
      el.style.transform = `translate(${Math.cos(angle) * pull}px, ${Math.sin(angle) * pull}px)`;
      el.style.borderRadius = `${8 + strength * 40}px`;
    }
  }, []);

  const handleLeave = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
    el.style.borderRadius = '8px';
  }, []);

  const commonProps = {
    ref: btnRef,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    className: `inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border transition-[border-radius,transform,border-color,box-shadow] duration-300 ease-out cursor-pointer ${className}`,
    style: {
      borderRadius: '8px',
      borderColor: 'var(--border)',
      color: 'var(--fg)',
      background: 'var(--card-bg)',
    } as React.CSSProperties,
  };

  if (href) {
    return <a href={href} {...commonProps}>{children}</a>;
  }
  return <button onClick={onClick} {...commonProps}>{children}</button>;
}
