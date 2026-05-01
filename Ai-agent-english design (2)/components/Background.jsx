function DotGrid() {
  const canvasRef = React.useRef(null);
  const mouse = React.useRef({ x: -1000, y: -1000 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const spacing = 48;
    const radius = 1.2;
    const pushRadius = 120;
    const pushStrength = 25;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function handleMouse(e) {
      mouse.current = { x: e.clientX, y: e.clientY + window.scrollY };
    }
    window.addEventListener('mousemove', handleMouse, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x, my = mouse.current.y;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = c * spacing + spacing / 2;
          const oy = r * spacing + spacing / 2;
          let dx = ox - mx, dy = oy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let px = ox, py = oy;
          if (dist < pushRadius && dist > 0) {
            const force = (1 - dist / pushRadius) * pushStrength;
            px += (dx / dist) * force;
            py += (dy / dist) * force;
          }
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'oklch(0.75 0.08 275 / 0.25)';
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', top: 0, left: 0, width: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

function CursorGlow() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    let x = -200, y = -200, cx = -200, cy = -200;
    function move(e) { x = e.clientX; y = e.clientY; }
    window.addEventListener('mousemove', move, { passive: true });
    let raf;
    function tick() {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.transform = `translate(${cx - 150}px, ${cy - 150}px)`;
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', move); };
  }, []);

  return (
    <div ref={ref} style={{
      position: 'fixed', top: 0, left: 0, width: 300, height: 300,
      borderRadius: '50%', pointerEvents: 'none', zIndex: 1,
      background: 'radial-gradient(circle, oklch(0.55 0.22 275 / 0.06) 0%, transparent 70%)',
    }} />
  );
}

Object.assign(window, { DotGrid, CursorGlow });
