(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Confetti ---------- */
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#C24E63', '#E3A93C', '#8DB49B', '#7FA4D6', '#F2B8C0'];
  let pieces = [];
  let running = false;
  let last = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  function burst(x, y, { count = 80, angle = -90, spread = 70, speed = 12 } = {}) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const a = (angle + (Math.random() - 0.5) * spread) * Math.PI / 180;
      const v = speed * (0.55 + Math.random() * 0.6);
      pieces.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        tilt: Math.random() * Math.PI * 2,
        vt: 0.05 + Math.random() * 0.12,
        color: colors[(Math.random() * colors.length) | 0],
        age: 0,
      });
    }
    if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    const dt = Math.min((now - last) / 16.67, 3);
    last = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (const p of pieces) {
      const drag = Math.pow(0.985, dt);
      p.vx *= drag;
      p.vy = p.vy * drag + 0.24 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.tilt += p.vt * dt;
      p.age += dt;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.tilt));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    pieces = pieces.filter(p => p.y < innerHeight + 40 && p.age < 600);

    if (pieces.length) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  function celebrate() {
    const speed = Math.sqrt(innerHeight) * 0.65;
    burst(0, innerHeight, { count: 70, angle: -62, spread: 38, speed });
    burst(innerWidth, innerHeight, { count: 70, angle: -118, spread: 38, speed });
  }

  function burstFrom(el, opts) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  }

  // Party poppers on arrival, and again whenever the big title is tapped
  window.addEventListener('load', () => setTimeout(celebrate, 500));
  document.getElementById('hero-title').addEventListener('click', celebrate);

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Brain check ---------- */
  const checkBtn = document.getElementById('run-check');
  const meter = document.querySelector('.meter span');
  const results = document.querySelector('.results');

  const checks = [
    ['Sense of humor', 'Razor sharp'],
    ['Wisdom', 'Off the charts'],
    ['Memory for every embarrassing thing I’ve ever done', 'Flawless'],
  ];

  function addRow(label, status) {
    const li = document.createElement('li');
    const l = document.createElement('span');
    const s = document.createElement('span');
    l.textContent = label;
    s.className = 'status';
    s.textContent = status + ' ✓';
    li.append(l, s);
    results.append(li);
  }

  function addVerdict() {
    const li = document.createElement('li');
    li.className = 'verdict';
    li.innerHTML = 'Result: still got it. <em>100%.</em><small>Verified by a former Student of the Month.</small>';
    results.append(li);
  }

  checkBtn.addEventListener('click', () => {
    checkBtn.disabled = true;

    if (reduceMotion) {
      meter.style.width = '100%';
      checks.forEach(([l, s]) => addRow(l, s));
      addVerdict();
      checkBtn.textContent = 'Confirmed ✓';
      return;
    }

    checkBtn.textContent = 'Checking…';
    requestAnimationFrame(() => { meter.style.width = '100%'; });

    checks.forEach(([l, s], i) => setTimeout(() => addRow(l, s), 600 + i * 750));

    setTimeout(() => {
      addVerdict();
      checkBtn.textContent = 'Confirmed ✓';
      burstFrom(checkBtn, { count: 60, angle: -90, spread: 90, speed: 11 });
    }, 600 + checks.length * 750 + 250);
  });

  /* ---------- Candle ---------- */
  const candle = document.getElementById('candle');
  const wishText = document.getElementById('wish-text');

  candle.addEventListener('click', () => {
    const out = candle.classList.toggle('out');
    candle.setAttribute('aria-pressed', String(out));

    if (out) {
      candle.setAttribute('aria-label', 'Relight the candle');
      wishText.textContent = 'Wish made. I hope it comes true. ♥';
      celebrate();
      burstFrom(candle, { count: 50, angle: -90, spread: 120, speed: 10 });
    } else {
      candle.setAttribute('aria-label', 'Blow out the candle and make a wish');
      wishText.textContent = 'Tap the candle and make a wish.';
    }
  });
})();
