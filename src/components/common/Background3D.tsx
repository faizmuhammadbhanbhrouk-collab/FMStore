import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  alpha: number;
}

interface Background3DProps {
  themeMode?: 'light' | 'dark';
}

export const Background3D: React.FC<Background3DProps> = ({ themeMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / width - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle nodes
    const particleCount = 85;
    const particles: Particle[] = [];
    const isLightMode = themeMode === 'light' || (!themeMode && !document.documentElement.classList.contains('dark'));
    const colors = isLightMode
      ? ['#4f46e5', '#0284c7', '#7c3aed', '#2563eb', '#0891b2']
      : ['#06b6d4', '#6366f1', '#8b5cf6', '#3b82f6'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: isLightMode ? Math.random() * 0.45 + 0.35 : Math.random() * 0.6 + 0.2,
      });
    }

    const fov = 400; // Field of view depth

    const render = () => {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const isCurrentLight = themeMode === 'light' || (!themeMode && !document.documentElement.classList.contains('dark'));

      // Clear canvas with theme color
      ctx.fillStyle = isCurrentLight ? '#f8fafc' : '#080b11';
      ctx.fillRect(0, 0, width, height);

      // Render subtle background grid
      ctx.save();
      ctx.strokeStyle = isCurrentLight ? 'rgba(99, 102, 241, 0.045)' : 'rgba(99, 102, 241, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const offsetX = mouseRef.current.x * 20;
      const offsetY = mouseRef.current.y * 20;

      for (let x = offsetX % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = offsetY % gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      const cx = width / 2;
      const cy = height / 2;

      const projected: Array<{ px: number; py: number; scale: number; p: Particle }> = [];

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;
        if (p.z < 100) p.z = 1000;
        if (p.z > 1000) p.z = 100;

        const rx = p.x - mouseRef.current.x * 70;
        const ry = p.y - mouseRef.current.y * 70;
        const rz = p.z;

        const scale = fov / (fov + rz);
        const px = cx + rx * scale;
        const py = cy + ry * scale;

        projected.push({ px, py, scale, p });
      });

      // Draw connecting lines between close projected points
      ctx.lineWidth = 0.75;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineOpacity = isCurrentLight ? 0.16 : 0.18;
            const alpha = (1 - dist / 110) * lineOpacity * ((p1.scale + p2.scale) / 2);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      projected.forEach(({ px, py, scale, p }) => {
        ctx.save();
        const rad = Math.max(0.5, p.radius * scale * 1.5);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * scale;
        if (!isCurrentLight) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10 * scale;
        } else {
          ctx.shadowColor = 'rgba(99, 102, 241, 0.2)';
          ctx.shadowBlur = 4 * scale;
        }

        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeMode]);

  const isLight = themeMode === 'light' || (!themeMode && !document.documentElement.classList.contains('dark'));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Ambient Radial Glowing Orbs for Depth */}
      <div
        className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isLight ? 'bg-indigo-300/25' : 'bg-indigo-600/10'
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          isLight ? 'bg-cyan-300/20' : 'bg-cyan-500/10'
        }`}
      />
      <div
        className={`absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full blur-[110px] pointer-events-none transition-all duration-700 ${
          isLight ? 'bg-violet-300/20' : 'bg-violet-600/10'
        }`}
      />
    </div>
  );
};
