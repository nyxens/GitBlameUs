import React, { useEffect, useRef } from 'react';

export const DotMatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const parent = canvas.parentElement || document.body;
    let width = (canvas.width = parent.clientWidth || window.innerWidth);
    let height = (canvas.height = parent.clientHeight || window.innerHeight);

    // ResizeObserver ensures canvas always matches full section height down to bottom boundary
    const resizeObserver = new ResizeObserver(() => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Global mouse tracking across the entire hero section
    const mouse = { x: -1000, y: -1000, radius: 180 };

    const handleGlobalMouseMove = (e) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleGlobalMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseleave', handleGlobalMouseLeave);

    // Dot Matrix Grid Setup
    const spacing = 32;
    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame += 0.025;

      const cols = Math.floor(width / spacing) + 2;
      const rows = Math.floor(height / spacing) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Undulating wave motion
          const wave = Math.sin(frame + i * 0.18 + j * 0.18) * 2.5;

          // Distance calculation to cursor
          const dx = mouse.x - x;
          const dy = mouse.y - (y + wave);
          const dist = Math.sqrt(dx * dx + dy * dy);

          let dotRadius = 1.5;
          let opacity = 0.22;
          let color = '168, 85, 247'; // Purple core

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            dotRadius = 1.5 + force * 3.2;
            opacity = 0.25 + force * 0.75;
            color = force > 0.45 ? '239, 68, 68' : '168, 85, 247';
          }

          ctx.beginPath();
          ctx.arc(x, y + wave, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${opacity})`;
          ctx.fill();

          // Connect dots near cursor with reactive constellation lines
          if (dist < mouse.radius * 0.6) {
            ctx.beginPath();
            ctx.moveTo(x, y + wave);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.18 * (1 - dist / (mouse.radius * 0.6))})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
