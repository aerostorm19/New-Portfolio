/* ===================================================================
   AR · CORE  — cinematic engineering portfolio
   Vanilla JS + Lenis + GSAP.  Custom RAF orchestrator.
   =================================================================== */

(() => {
  'use strict';

  /* ---------------- console greeting ---------------- */
  const greet = [
    '%c  AR · CORE  ',
    '%c  Systems engineer / FPGA / Edge AI  ',
    '',
    '%cwelcome — you found the console.',
    '%ctry typing  %cwindow.AR.help()%c  here, or press  %c~ %c  on the page.'
  ];
  console.log(
    greet.join('\n'),
    'background:#fff;color:#000;font-weight:700;font-size:14px;padding:4px 8px;border-radius:4px',
    'background:#111;color:#fff;font-size:11px;padding:2px 6px;border-radius:3px',
    'color:#fff;font-size:12px',
    'color:#888;font-size:12px','color:#fff','color:#888','color:#fff','color:#888'
  );

  /* ---------------- RAF orchestrator ---------------- */
  const raf = (() => {
    const tasks = new Set();
    let running = false;
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 1000;
      last = now;
      tasks.forEach(fn => { try { fn(dt, now); } catch (e) { console.warn(e); } });
      if (tasks.size) requestAnimationFrame(loop); else running = false;
    }
    return {
      add(fn) { tasks.add(fn); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } },
      remove(fn) { tasks.delete(fn); }
    };
  })();

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.8, infinite: false });
    if (window.ScrollTrigger && window.gsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function lenisRaf(time) { lenis.raf(time); requestAnimationFrame(lenisRaf); }
      requestAnimationFrame(lenisRaf);
    }
  }

  /* ── Gallery pin must run FIRST so its spacer exists before all other ScrollTriggers ── */
  ;(function galScrollEarly() {
    const sec   = document.querySelector('.gal-sec');
    const track = document.getElementById('galTrack');
    if (!sec || !track || typeof ScrollTrigger === 'undefined') return;
    if (window.innerWidth <= 700) return; /* mobile uses vertical layout */
    const getScrollDist = () => track.scrollWidth - window.innerWidth;
    gsap.set(track, { willChange: 'transform' });
    gsap.to(track, {
      id: 'galMainTween',
      x: () => -getScrollDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: () => '+=' + getScrollDist(),
        pin: true,
        anticipatePin: 1,
        scrub: 1.0,
        invalidateOnRefresh: true,
        onComplete: () => gsap.set(track, { willChange: 'auto' }),
      }
    });
  })();

  /* ---------------- loader ---------------- */
  const loader    = document.getElementById('loader');
  const ldBar     = document.getElementById('loaderBar');
  const ldPct     = document.getElementById('ldPct');
  const ldSysLine = document.getElementById('ldSysLine');
  const ldContent = document.getElementById('ldContent');
  const ldProgressWrap = document.getElementById('ldProgressWrap');
  const ldCurtainL = document.getElementById('ldCurtainL');
  const ldCurtainR = document.getElementById('ldCurtainR');
  const ldScan    = document.getElementById('ldScan');

  /* ── Skip loader on re-visits (session-persisted) ── */
  const hasLoaded = sessionStorage.getItem('ar_loaded');
  if (hasLoaded) {
    loader.style.display = 'none';
    revealHero();
  } else {
    sessionStorage.setItem('ar_loaded', '1');
    runLoader();
  }

  function runLoader() {
    const lcEls  = Array.from(document.querySelectorAll('.lc'));
    const lcSEls = Array.from(document.querySelectorAll('.lc-s'));

    if (window.gsap) {
      /* 1. Scan line sweeps top → bottom */
      gsap.fromTo(ldScan,
        { top: '0%', opacity: 1 },
        { top: '100%', duration: 1.4, ease: 'power2.inOut', delay: 0.08 }
      );

      /* 2. ABHIJIT letters fall from top — slow start, fast end (gravity) */
      gsap.to(lcEls, {
        y: 0, duration: 0.72, ease: 'power3.in',
        stagger: 0.055, delay: 0.22
      });
      /* 3. Rai. falls in after — same gravity feel */
      gsap.to(lcSEls, {
        y: 0, duration: 0.68, ease: 'power3.in',
        stagger: 0.07, delay: 0.65
      });

      /* 4. Subtle glitch snap on name after it settles */
      if (ldContent) {
        gsap.timeline({ delay: 1.35 })
          .to(ldContent, { x: 4,  duration: 0.04, ease: 'none' })
          .to(ldContent, { x: -3, duration: 0.04, ease: 'none' })
          .to(ldContent, { x: 0,  duration: 0.06, ease: 'none' });
      }
    } else {
      lcEls.concat(lcSEls).forEach(el => { el.style.transform = 'translateY(0)'; });
    }

    const sysMsgs = ['SYS · INIT', 'FPGA · ICE40', 'CORE · LINK', 'AGENTS · UP', 'ONLINE'];
    let pct = 0;
    const loaderTimer = setInterval(() => {
      pct = Math.min(100, pct + (0.8 + Math.random() * 3.4));
      if (ldBar) ldBar.style.width = pct + '%';
      if (ldPct) ldPct.textContent = String(Math.floor(pct)).padStart(3, '0');
      if (ldSysLine) ldSysLine.textContent = sysMsgs[Math.min(4, Math.floor(pct / 22))];
      if (pct >= 100) {
        clearInterval(loaderTimer);
        setTimeout(exitLoader, 240);
      }
    }, 55);
  }

  function exitLoader() {
    if (!window.gsap) {
      loader.style.display = 'none';
      revealHero();
      return;
    }
    const lcEls  = Array.from(document.querySelectorAll('.lc'));
    const lcSEls = Array.from(document.querySelectorAll('.lc-s'));
    gsap.set([ldContent, ldProgressWrap, ldScan, ldCurtainL, ldCurtainR], { willChange: 'transform, opacity' });
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set([ldContent, ldProgressWrap, ldScan, ldCurtainL, ldCurtainR], { willChange: 'auto' });
        loader.style.display = 'none';
        revealHero();
        if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 320);
      }
    });
    /* Content shoots up + fades */
    tl.to(ldContent, { y: -32, opacity: 0, duration: 0.36, ease: 'power3.in' }, 0);
    tl.to(ldProgressWrap, { opacity: 0, duration: 0.26 }, 0);
    /* Brief scan flash at center before curtains split */
    tl.set(ldScan, { top: '50%', opacity: 0.75 }, 0.12);
    tl.to(ldScan, { opacity: 0, duration: 0.20 }, 0.14);
    /* Curtains slam open — the cinematic split reveal */
    tl.to(ldCurtainL, { x: '-100%', duration: 0.72, ease: 'power4.inOut' }, 0.20);
    tl.to(ldCurtainR, { x: '100%',  duration: 0.72, ease: 'power4.inOut' }, 0.20);
  }

  /* ---------------- film grain ---------------- */
  (() => {
    const c = document.getElementById('grain');
    const ctx = c.getContext('2d', { alpha: true });
    let w, h;
    function resize() { w = c.width = Math.floor(window.innerWidth * 0.5); h = c.height = Math.floor(window.innerHeight * 0.5); }
    resize();
    window.addEventListener('resize', resize);
    let frame = 0;
    raf.add(() => {
      if (++frame % 2) return; // 30fps grain
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 38;
      }
      ctx.putImageData(img, 0, 0);
    });
  })();

  /* ---------------- cursor ---------------- */
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    raf.add(() => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    });
    document.querySelectorAll('a, button, .proj-card, .post, .stack-cell, .nav-link, .btn-magnetic, .btn-ghost').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* ---------------- hero reveal (Nakula layout) ---------------- */
  function revealHero() {
    if (!window.gsap) {
      document.querySelectorAll('.hn-inner').forEach(el => { el.style.transform = 'translateY(0)'; });
      ['heroInfoBar','heroStmtR','heroBottomL','heroBottomR'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.opacity = '1';
      });
      return;
    }

    /* Big name lines rise up into view */
    const nameInners = gsap.utils.toArray('.hn-line .hn-inner');
    gsap.set(nameInners, { willChange: 'transform' });
    gsap.to(nameInners, {
      y: 0, duration: 1.6, ease: 'power4.out',
      stagger: 0.14, delay: 0.05,
      onComplete: () => gsap.set(nameInners, { willChange: 'auto' }),
    });

    /* Info bar + statement + bottom blocks fade in with stagger */
    const overlays = ['heroInfoBar', 'heroStmtR', 'heroBottomL', 'heroBottomR']
      .map(id => document.getElementById(id)).filter(Boolean);
    gsap.set(overlays, { willChange: 'transform, opacity' });
    gsap.fromTo(overlays,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: 'power3.out', delay: 0.55,
        onComplete: () => gsap.set(overlays, { willChange: 'auto' }) }
    );
  }

  /* ---------------- intersection reveals ---------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.section-head, .rs-row, .post, .metric, .id-h2, .id-paras, .id-stat-row, .id-users-card, .cut-quote, .contact-title, .contact-sub').forEach(el => {
    el.classList.add('fade-rise');
    io.observe(el);
  });

  /* ---------------- section entrance animations ---------------- */
  (() => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const sections = [
      { sel: '.manifesto-inner',  y: 30 },
      { sel: '.id-stage',         y: 28 },
      { sel: '.stack-inner',      y: 0  },   // stack has its own anim
      { sel: '.sj-content',       y: 28 },
      { sel: '.cut-inner',        y: 24 },
      { sel: '.contact-inner',    y: 28 },
    ];

    sections.forEach(({ sel, y }) => {
      const el = document.querySelector(sel);
      if (!el || y === 0) return;
      gsap.fromTo(el,
        { opacity: 0, y },
        {
          opacity: 1, y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });
  })();

  /* Refresh ScrollTrigger after full page load (images/videos sized) */
  window.addEventListener('load', () => {
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
      if (lenis) lenis.resize();
    }
  });

  /* ---------------- nav · active section + sector HUD ---------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionsForNav = ['#home','#projects','#research','#blog','#notes','#experiments','#contact']
    .map(id => document.querySelector(id)).filter(Boolean);
  const sectorEl = document.getElementById('hudSector');

  const sectorIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
      }
      const ds = e.target.getAttribute('data-sector');
      if (ds && e.intersectionRatio > 0.35) sectorEl.textContent = ds;
    });
  }, { threshold: [0.35, 0.6] });
  sectionsForNav.forEach(s => sectorIO.observe(s));
  document.querySelectorAll('[data-sector]').forEach(s => sectorIO.observe(s));

  /* ---------------- nav clock + frame counter ---------------- */
  const navClock = document.getElementById('navClock');
  const hudFrame = document.getElementById('hudFrame');
  let frameCount = 0;
  setInterval(() => {
    const d = new Date();
    const z = n => String(n).padStart(2,'0');
    const t = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    navClock.textContent = t;
    const heroTime = document.getElementById('heroTime');
    if (heroTime) heroTime.textContent = t;
  }, 1000);
  raf.add(() => { frameCount++; if (frameCount % 6 === 0) hudFrame.textContent = 'F-' + String(frameCount).padStart(6, '0'); });

  /* ---------------- keyword reel rotator ---------------- */
  (() => {
    const kws = document.querySelectorAll('.keyword-reel .kw');
    if (!kws.length) return;
    let idx = 0;
    setInterval(() => {
      kws.forEach((k, i) => k.classList.toggle('active', i === idx));
      idx = (idx + 1) % kws.length;
    }, 1800);
  })();

  /* ---------------- floating telemetry values ---------------- */
  (() => {
    const lut = document.getElementById('flLut');
    const bram = document.getElementById('flBram');
    const pwr = document.getElementById('flPwr');
    const clk = document.getElementById('flClk');
    const fpgaClk = document.getElementById('fpgaClk');
    const telUtil = document.getElementById('telUtil');
    const telNets = document.getElementById('telNets');
    const telSlack = document.getElementById('telSlack');
    const telPwr = document.getElementById('telPwr');
    const telTemp = document.getElementById('telTemp');
    let baseClk = 125;
    setInterval(() => {
      const jitter = () => (Math.random() - 0.5) * 0.4;
      if (lut) lut.textContent = (38 + jitter() * 4).toFixed(1) + '%';
      if (bram) bram.textContent = (62 + jitter() * 4).toFixed(1) + '%';
      if (pwr) pwr.textContent = (1.07 + jitter() * 0.1).toFixed(2) + ' W';
      if (clk) clk.textContent = (baseClk + jitter() * 0.2).toFixed(3) + ' MHz';
      if (fpgaClk) fpgaClk.textContent = (baseClk + jitter() * 0.2).toFixed(3);
      if (telUtil) telUtil.textContent = (67 + jitter() * 2).toFixed(1);
      if (telNets) telNets.textContent = (12489 + (Math.random()*60|0)).toLocaleString();
      if (telSlack) telSlack.textContent = '+' + (0.34 + jitter() * 0.05).toFixed(2);
      if (telPwr) telPwr.textContent = (1.07 + jitter() * 0.05).toFixed(2);
      if (telTemp) telTemp.textContent = (42 + (Math.random()*2|0));
    }, 700);
  })();

  /* ---------------- hero parallax (mouse) ---------------- */
  (() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const v1 = hero.querySelector('.hero-video');
    const v2 = hero.querySelector('.hero-video-2');
    const ghost = hero.querySelector('.ghost-mark');
    let mx = 0, my = 0, cx = 0, cy = 0;
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    }, { passive: true });
    raf.add(() => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      if (v1) v1.style.transform = `scale(1.06) translate3d(${cx * -18}px, ${cy * -18}px, 0)`;
    });
  })();

  /* ---------------- FPGA canvas ---------------- */
  (() => {
    const canvas = document.getElementById('fpgaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, cw, ch;
    const COLS = 64, ROWS = 40;
    let cells, pulses = [], mouseX = -1, mouseY = -1;

    function resize() {
      const r = canvas.getBoundingClientRect();
      cw = r.width; ch = r.height;
      canvas.width = (w = cw * dpr); canvas.height = (h = ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    cells = Array.from({ length: COLS * ROWS }, (_, i) => ({
      x: (i % COLS),
      y: (i / COLS) | 0,
      lit: Math.random() < 0.18 ? Math.random() * 0.6 : 0,
      type: Math.random() < 0.12 ? 'bram' : (Math.random() < 0.08 ? 'dsp' : 'clb'),
    }));

    function spawnPulse() {
      const fromX = Math.random() * COLS | 0;
      const fromY = Math.random() * ROWS | 0;
      const toX = Math.random() * COLS | 0;
      const toY = Math.random() * ROWS | 0;
      pulses.push({ fromX, fromY, toX, toY, t: 0, life: 1.0 + Math.random() * 0.8 });
    }

    let pulseTimer = 0;
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width * COLS;
      mouseY = (e.clientY - r.top) / r.height * ROWS;
    });
    canvas.addEventListener('mouseleave', () => { mouseX = mouseY = -1; });

    raf.add(dt => {
      // visibility gate
      const r = canvas.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight + 200) return;

      pulseTimer += dt;
      if (pulseTimer > 0.18) { spawnPulse(); pulseTimer = 0; }

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, cw, ch);

      const padX = 20, padY = 20;
      const gw = (cw - padX*2) / COLS;
      const gh = (ch - padY*2) / ROWS;

      // cells
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        let lit = c.lit * 0.4;
        // mouse halo
        if (mouseX > 0) {
          const dx = c.x - mouseX, dy = c.y - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist < 6) lit += (1 - dist / 6) * 0.7;
        }
        // ambient sparkle
        c.lit = Math.max(0, c.lit - dt * 0.6);
        if (Math.random() < 0.0008) c.lit = 0.6;

        const cx2 = padX + c.x * gw, cy2 = padY + c.y * gh;
        ctx.fillStyle = `rgba(255,255,255,${0.05 + lit * 0.7})`;
        ctx.fillRect(cx2 + 1, cy2 + 1, gw - 2, gh - 2);
        if (c.type === 'bram' && lit > 0.1) {
          ctx.strokeStyle = `rgba(255,255,255,${0.18 + lit * 0.5})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(cx2 + 1.5, cy2 + 1.5, gw - 3, gh - 3);
        }
      }

      // routing pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += dt / p.life;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const seg = Math.abs(p.toX - p.fromX) > Math.abs(p.toY - p.fromY);
        const midX = seg ? p.toX : p.fromX;
        const midY = seg ? p.fromY : p.toY;
        // light trail of cells along the L-shape
        const points = [];
        const ax = p.fromX, ay = p.fromY, bx = midX, by = midY, cx2 = p.toX, cy2 = p.toY;
        const stepCount = 14;
        for (let s = 0; s <= stepCount; s++) {
          const t = s / stepCount;
          let px, py;
          if (t < 0.5) { const k = t*2; px = ax + (bx-ax)*k; py = ay + (by-ay)*k; }
          else { const k = (t-0.5)*2; px = bx + (cx2-bx)*k; py = by + (cy2-by)*k; }
          points.push([px, py]);
        }
        const idx = Math.floor(p.t * stepCount);
        for (let s = Math.max(0, idx - 4); s <= idx; s++) {
          const a = 1 - (idx - s) / 4;
          const pt = points[s]; if (!pt) continue;
          ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`;
          ctx.fillRect(padX + pt[0] * gw + gw*0.25, padY + pt[1] * gh + gh*0.25, gw*0.5, gh*0.5);
        }
      }
    });
  })();

  /* ---------------- experiment canvases ---------------- */
  // 1 — FBM noise field
  (() => {
    const c = document.getElementById('exp1');
    if (!c) return; const ctx = c.getContext('2d');
    let w, h; function resize() { const r = c.getBoundingClientRect(); c.width = w = r.width; c.height = h = r.height; } resize(); window.addEventListener('resize', resize);
    let t = 0;
    raf.add(dt => {
      const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight + 200) return;
      t += dt * 0.25;
      const img = ctx.createImageData(w, h); const d = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x * 0.012, ny = y * 0.012;
          const v = (Math.sin(nx + t) + Math.cos(ny + t*1.3) + Math.sin((nx+ny)*1.2 + t*0.7)) / 3;
          const g = ((v + 1) * 70) | 0;
          const i = (y * w + x) * 4;
          d[i] = d[i+1] = d[i+2] = g; d[i+3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    });
  })();
  // 2 — kinetic typography axis (live string)
  (() => {
    const c = document.getElementById('exp2'); if (!c) return; const ctx = c.getContext('2d');
    let w, h; function resize() { const r = c.getBoundingClientRect(); c.width = w = r.width; c.height = h = r.height; } resize(); window.addEventListener('resize', resize);
    const text = 'TYPE · MOTION';
    let t = 0;
    raf.add(dt => {
      const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight + 200) return;
      t += dt;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#050505'; ctx.fillRect(0,0,w,h);
      const baseSize = Math.min(w/text.length*1.4, h*0.5);
      for (let line = 0; line < 5; line++) {
        const yy = h * (0.18 + line * 0.17);
        const phase = t * 0.4 + line * 0.6;
        const wt = Math.sin(phase) * 0.5 + 0.5; // 0..1
        ctx.font = `${100 + wt*500} ${baseSize}px Inter`;
        ctx.fillStyle = `rgba(255,255,255,${0.18 + wt*0.5})`;
        ctx.textAlign = 'center';
        ctx.fillText(text, w/2 + Math.sin(phase)*8, yy);
      }
    });
  })();
  // 3 — FFT-ish bars
  (() => {
    const c = document.getElementById('exp3'); if (!c) return; const ctx = c.getContext('2d');
    let w, h; function resize() { const r = c.getBoundingClientRect(); c.width = w = r.width; c.height = h = r.height; } resize(); window.addEventListener('resize', resize);
    const N = 64, vals = new Array(N).fill(0);
    let t = 0;
    raf.add(dt => {
      const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight + 200) return;
      t += dt;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#050505'; ctx.fillRect(0,0,w,h);
      const bw = w / N;
      for (let i = 0; i < N; i++) {
        const target = Math.abs(Math.sin(t*1.2 + i*0.3) * Math.cos(t*0.4 + i*0.1)) * (0.9 - i/N*0.3) + Math.random()*0.04;
        vals[i] += (target - vals[i]) * 0.15;
        const bh = vals[i] * h * 0.9;
        ctx.fillStyle = `rgba(255,255,255,${0.5 + vals[i]*0.4})`;
        ctx.fillRect(i*bw + 1, h - bh, bw - 2, bh);
      }
    });
  })();
  // 4 — pipeline stages
  (() => {
    const c = document.getElementById('exp4'); if (!c) return; const ctx = c.getContext('2d');
    let w, h; function resize() { const r = c.getBoundingClientRect(); c.width = w = r.width; c.height = h = r.height; } resize(); window.addEventListener('resize', resize);
    const stages = ['IF','ID','EX','WB']; let t = 0;
    raf.add(dt => {
      const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight + 200) return;
      t += dt;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#050505'; ctx.fillRect(0,0,w,h);
      const padX = 20; const sw = (w - padX*2) / stages.length;
      const tick = Math.floor(t * 1.4) % stages.length;
      for (let i = 0; i < stages.length; i++) {
        const x = padX + i*sw;
        const active = i === tick;
        ctx.strokeStyle = active ? '#fff' : 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 8, h*0.32, sw - 16, h*0.36);
        ctx.fillStyle = active ? '#fff' : 'rgba(255,255,255,0.4)';
        ctx.font = '600 13px Kanit'; ctx.textAlign = 'center';
        ctx.fillText(stages[i], x + sw/2, h*0.55);
        if (i < stages.length - 1) {
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.beginPath();
          ctx.moveTo(x + sw - 8, h*0.5);
          ctx.lineTo(x + sw + 8, h*0.5);
          ctx.stroke();
        }
      }
      // moving instruction packet
      const px = padX + 8 + ((t*1.4) % stages.length) * sw;
      ctx.fillStyle = '#fff';
      ctx.fillRect(px - 4, h*0.5 - 2, 6, 4);
    });
  })();

  /* ---------------- contribution heatmap ---------------- */
  (() => {
    const grid = document.getElementById('contribGrid');
    if (!grid) return;
    const weeks = 53;
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const cell = document.createElement('div');
        const r = Math.pow(Math.random(), 1.8);
        const a = 0.04 + r * 0.85;
        cell.style.background = `rgba(255,255,255,${a})`;
        grid.appendChild(cell);
      }
    }
  })();

  /* ---------------- metric counters ---------------- */
  (() => {
    const els = document.querySelectorAll('.metric-num[data-target]');
    const mio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = +el.dataset.target;
        const fmt = el.dataset.fmt;
        const start = performance.now();
        const dur = 1400;
        const tick = now => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const v = target * eased;
          if (fmt === 'ratio') el.textContent = (v / 1000).toFixed(3) + '%';
          else if (target >= 1e6) el.textContent = (v / 1e6).toFixed(1) + 'M';
          else if (target >= 1e3) el.textContent = Math.floor(v).toLocaleString();
          else el.textContent = Math.floor(v).toString();
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        mio.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach(el => mio.observe(el));
  })();

  /* ---------------- magnetic buttons ---------------- */
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width/2)) * 0.35;
      ty = (e.clientY - (r.top + r.height/2)) * 0.5;
    });
    btn.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      btn.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    }
    loop();
  });

  /* ---------------- sticky project effect (parallax tilt) ---------------- */
  (() => {
    const cards = document.querySelectorAll('.proj-card');
    if (!cards.length) return;
    raf.add(() => {
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        // pin-progression: 0 at start of pin, 1 when fully scrolled past
        const start = window.innerHeight * 0.4;
        const range = r.height + window.innerHeight * 0.6;
        const p = Math.min(1, Math.max(0, (start - r.top) / range));
        const v = card.querySelector('.proj-bg');
        if (v) v.style.transform = `scale(${1.08 + p*0.04}) translateY(${p * -22}px)`;
      });
    });
  })();

  /* =====================================================
     EASTER EGGS
     ===================================================== */

  /* Konami code */
  (() => {
    const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let i = 0;
    window.addEventListener('keydown', e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === code[i]) { i++; if (i === code.length) { i = 0; triggerKonami(); } }
      else { i = (k === code[0]) ? 1 : 0; }
    });
  })();
  function triggerKonami() {
    const f = document.createElement('div'); f.className = 'konami-flash'; document.body.appendChild(f);
    document.body.classList.add('konami-on');
    setTimeout(() => { f.remove(); document.body.classList.remove('konami-on'); }, 1300);
    console.log('%c FPGA mode unlocked. Hover the fabric. ', 'background:#fff;color:#000;padding:4px 10px;border-radius:4px');
  }

  /* Terminal palette  (~ or backtick) */
  const termEgg = document.getElementById('termEgg');
  const termInput = document.getElementById('termInput');
  const termEggBody = document.getElementById('termEggBody');
  const termClose = document.getElementById('termClose');
  function termOpen() {
    termEgg.classList.add('open');
    setTimeout(() => termInput.focus(), 80);
    if (!termEggBody.dataset.init) {
      termEggBody.dataset.init = '1';
      termPrint([
        'AR · CORE · tty.0',
        'connection established · ' + new Date().toUTCString(),
        '',
        "type 'help' for available commands",
      ].join('\n'));
    }
  }
  function termCloseFn() { termEgg.classList.remove('open'); }
  function termPrint(s) { termEggBody.textContent += s + '\n'; termEggBody.scrollTop = termEggBody.scrollHeight; }

  window.addEventListener('keydown', e => {
    if (e.key === '`' || e.key === '~') { e.preventDefault(); termOpen(); }
    if (e.key === 'Escape' && termEgg.classList.contains('open')) termCloseFn();
  });
  termClose.addEventListener('click', termCloseFn);

  const cmds = {
    help: () => [
      'commands:',
      '  about        — who is abhi',
      '  projects     — list selected systems',
      '  stack        — what i build with',
      '  fpga         — toggle fabric live mode',
      '  whoami       — identity broadcast',
      '  uptime       — process info',
      '  contact      — open channel',
      '  clear        — wipe terminal',
      '  konami       — try ↑↑↓↓←→←→ba'
    ].join('\n'),
    about: () => 'Abhijit Rai · systems engineer · FPGA / embedded AI / defense edge ML · Bengaluru.',
    projects: () => [
      '01 · FPGA-Accelerated SDR        — 1.6 Gbps · 4.2 µs',
      '02 · AI Smart Contract Auditor   — $1.6B TVL · F1 0.94',
      '03 · Smart Glasses Edge AI       — 1.2 TOPS @ 380 mW',
      '04 · ML WAF                      — P99 340 µs · 240k RPS',
      '05 · Autonomous Reconciliation   — 4M txns/day · 99.997%',
      '06 · Invoice Recovery Agent      — $10M / 90 days',
      '07 · Embedded RISC-V SoC         — 1.8 DMIPS/MHz',
      '08 · SDR PHY Stack               — 40 MHz · EVM -42dB'
    ].join('\n'),
    stack: () => 'Verilog · Chisel · RISC-V · Rust · C · CUDA · TS · GNU Radio · Zephyr · Postgres · ClickHouse',
    whoami: () => 'abhi@core · uid=1000 · groups=engineers,operators · shell=zsh · home=/abhi',
    uptime: () => `up ${Math.floor(performance.now()/1000)}s · load avg 0.31 0.27 0.18 · 1 user · core temp 42°C`,
    contact: () => 'mailto:abhi@abhijit.dev  · signal: @abhi.07  · github: @abhirai',
    clear: () => { termEggBody.textContent = ''; return ''; },
    konami: () => { triggerKonami(); return 'engaged.'; },
    fpga: () => 'fabric is already live · scroll to section 08.',
  };

  termInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const v = termInput.value.trim().toLowerCase();
    if (!v) return;
    termPrint('$ ' + v);
    const fn = cmds[v];
    if (fn) { const out = fn(); if (out) termPrint(out); }
    else termPrint(`unknown command: ${v} · type 'help'`);
    termInput.value = '';
  });

  /* ---------------- AR namespace ---------------- */
  window.AR = {
    help() { console.log('%c try `~` or Konami code.', 'color:#fff'); termOpen(); },
    konami: triggerKonami,
  };

  /* ---------------- 3D tilt on .tilt cards ---------------- */
  (() => {
    document.querySelectorAll('.tilt').forEach(card => {
      let rx = 0, ry = 0, trx = 0, try_ = 0, active = false;
      const sheen = card.querySelector('.tilt-sheen');
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width;
        const my = (e.clientY - r.top) / r.height;
        trx = (my - 0.5) * -8;
        try_ = (mx - 0.5) * 10;
        active = true;
        if (sheen) { sheen.style.setProperty('--sx', (mx * 100) + '%'); sheen.style.setProperty('--sy', (my * 100) + '%'); }
      });
      card.addEventListener('mouseleave', () => { trx = 0; try_ = 0; active = false; });
      function loop() {
        rx += (trx - rx) * 0.12;
        ry += (try_ - ry) * 0.12;
        card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        requestAnimationFrame(loop);
      }
      loop();
    });
  })();

  /* ---------------- manifesto kinetic drift ---------------- */
  (() => {
    const lines = document.querySelectorAll('.manifesto-line');
    const section = document.querySelector('.manifesto');
    if (!lines.length || !section) return;
    raf.add(() => {
      const r = section.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const center = window.innerHeight / 2;
      const sectionCenter = r.top + r.height / 2;
      const progress = (center - sectionCenter) / window.innerHeight; // -0.5..0.5 around center
      lines.forEach(l => {
        const kx = +(l.dataset.kx || 0);
        l.style.transform = `translate3d(${progress * kx * 1.6}px, 0, 0)`;
      });
    });
  })();

  console.log('%c hint: press ~ or backtick to open the engineering terminal.', 'color:#888; font-style:italic;');

  /* ─────────── PROJECTS — editorial chapter animations ─────────── */
  (() => {
    const chapters = Array.from(document.querySelectorAll('.pc'));
    if (!chapters.length) return;

    /* Parallax bg on scroll + IntersectionObserver for video perf */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const vid = e.target.querySelector('.pc-bg');
        if (!vid) return;
        if (e.isIntersecting) { vid.play && vid.play().catch(()=>{}); }
        else { vid.pause && vid.pause(); }
      });
    }, { threshold: 0.05 });

    chapters.forEach((ch, i) => {
      io.observe(ch);

      /* Scroll-triggered content reveal */
      const body = ch.querySelector('.pc-body');
      const numCol = ch.querySelector('.pc-num-col');
      const bg = ch.querySelector('.pc-bg');
      const isFlip = ch.classList.contains('pc-flip');

      const xFrom = isFlip ? 60 : -60;
      gsap.set([body, numCol], { opacity: 0, x: xFrom });

      ScrollTrigger.create({
        trigger: ch,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(numCol, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.05 });
          gsap.to(body,   { opacity: 1, x: 0, duration: 0.85, ease: 'power3.out', delay: 0.18 });
        }
      });

      /* Subtle video parallax */
      if (bg) {
        gsap.to(bg, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: ch,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          }
        });
      }
    });
  })();

  /* ─────────── TIMELINE v5 — Steve Jobs "Moments that Defined" ─────────── */
  (() => {
    const wrap = document.getElementById('sjEntriesWrap');
    const svg  = document.getElementById('sjSpineSvg');
    if (!wrap) return;

    const ENT = [
      {
        num: '01', badge: 'INTERNSHIP', color: '#ff8c00',
        year: 'JAN…06 – MAR…06',
        role: 'Signal Processing & Edge Computing Intern',
        org:  'GalaxEye Space · BLR',
        period: 'Jan 2026 – Mar 2026',
        desc: 'Worked on SAR image formation and edge acceleration pipelines using CUDA and Jetson-based systems. Focused on GPU optimization, memory-efficient processing, and real-time edge inference for constrained hardware environments.',
        chips: ['Python','C++','CUDA','CuPy','Jetson Orin Nano','Linux'],
      },
      {
        num: '02', badge: 'CLUB LEAD', color: '#4fc3f7',
        year: '2025 – 2026',
        role: 'Embedded Lead',
        org:  'CEAR Robotics Club · Pune',
        period: '2025 – 2026',
        desc: 'Leading development of embedded and SDR systems involving STM32, FPGA acceleration, DSP pipelines, and secure hardware-software integration for robotics and autonomous platforms.',
        chips: ['STM32','FPGA','SDR','DSP','RISC-V','FreeRTOS'],
      },
      {
        num: '03', badge: 'RESEARCH', color: '#ce93d8',
        year: 'APR – MAY…25',
        role: 'Undergraduate Research Assistant',
        org:  'AIT Pune',
        period: 'Apr 2025 – May 2025',
        desc: 'Worked on an ML-based Web Application Firewall using anomaly detection and NLP-driven request analysis for real-time API threat detection.',
        chips: ['Python','FastAPI','Machine Learning','NLP'],
      },
      {
        num: '04', badge: 'WEB DEV', color: '#66bb6a',
        year: '2023 – 2025',
        role: 'Web Developer',
        org:  'AIT OSS Team · Pune',
        period: '2023 – 2025',
        desc: 'Contributed to internal platforms and production web systems for college technical initiatives, across the full stack.',
        chips: ['React','Next.js','Node.js','MongoDB'],
      },
    ];

    /* ── Build HTML entries ── */
    const entryEls = ENT.map(e => {
      const row = document.createElement('div');
      row.className = 'sj-entry';
      row.style.setProperty('--nc', e.color);
      row.innerHTML = `
        <div class="sj-entry-spine">
          <div class="sj-node">${e.num}</div>
          <span class="sj-date-label">${e.year}</span>
        </div>
        <div class="sj-entry-content">
          <span class="sj-badge">${e.badge}</span>
          <h3 class="sj-role">${e.role}</h3>
          <div class="sj-org kanit">${e.org} · ${e.period}</div>
          <p class="sj-desc">${e.desc}</p>
          <div class="sj-chips">${e.chips.map(c => `<span>${c}</span>`).join('')}</div>
        </div>`;
      wrap.appendChild(row);
      return row;
    });

    /* ── Draw winding SVG spine behind entries ── */
    function buildSpine() {
      if (!svg) return null;
      svg.innerHTML = '';

      const wrapH = wrap.offsetHeight;
      if (wrapH < 10) return null;

      const SPINE_X = 50; // center x of spine column (half of 100px col)
      svg.style.width  = '100px';
      svg.style.height = wrapH + 'px';
      svg.setAttribute('viewBox', `0 0 100 ${wrapH}`);

      /* Gather node y-centers from DOM */
      const wrapRect = wrap.getBoundingClientRect();
      const nodeY = entryEls.map(row => {
        const r = row.getBoundingClientRect();
        return r.top + r.height / 2 - wrapRect.top;
      });

      const top  = nodeY[0]  - 60;
      const bot  = nodeY[nodeY.length - 1] + 60;

      /* Slight S-curve: alternate x by ±8 to create winding feel */
      const xWave = [SPINE_X - 6, SPINE_X + 6, SPINE_X - 6, SPINE_X + 6];

      /* Build bezier path through nodes */
      let d = `M ${xWave[0]} ${top}`;
      nodeY.forEach((y, i) => {
        const px = i === 0 ? xWave[0] : xWave[i - 1];
        const py = i === 0 ? top      : nodeY[i - 1];
        const cx1 = px, cy1 = (py + y) / 2;
        const cx2 = xWave[i], cy2 = (py + y) / 2;
        d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${xWave[i]} ${y}`;
      });
      d += ` C ${xWave[xWave.length-1]} ${(nodeY[nodeY.length-1]+bot)/2}, ${SPINE_X} ${(nodeY[nodeY.length-1]+bot)/2}, ${SPINE_X} ${bot}`;

      const NS = 'http://www.w3.org/2000/svg';

      /* defs for gradient */
      const defs = document.createElementNS(NS, 'defs');
      const grad = document.createElementNS(NS, 'linearGradient');
      grad.setAttribute('id', 'sjSpineGrad');
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      grad.setAttribute('x1', '0'); grad.setAttribute('y1', top);
      grad.setAttribute('x2', '0'); grad.setAttribute('y2', bot);
      ['0,rgba(255,255,255,0.04)','0.2,rgba(255,255,255,0.14)',
       '0.5,rgba(255,255,255,0.12)','0.8,rgba(255,255,255,0.14)','1,rgba(255,255,255,0.04)']
        .forEach(s => {
          const [off, col] = s.split(',', 2);
          const stop = document.createElementNS(NS, 'stop');
          stop.setAttribute('offset', off);
          stop.setAttribute('stop-color', col);
          grad.appendChild(stop);
        });
      defs.appendChild(grad);
      svg.appendChild(defs);

      /* dim background spine */
      const spineBg = document.createElementNS(NS, 'path');
      spineBg.setAttribute('d', d);
      spineBg.setAttribute('fill', 'none');
      spineBg.setAttribute('stroke', 'url(#sjSpineGrad)');
      spineBg.setAttribute('stroke-width', '1.5');
      spineBg.setAttribute('stroke-dasharray', '5 4');
      svg.appendChild(spineBg);

      /* animated color progress spine */
      const spineAnim = document.createElementNS(NS, 'path');
      spineAnim.setAttribute('d', d);
      spineAnim.setAttribute('fill', 'none');
      spineAnim.setAttribute('stroke', 'rgba(255,255,255,0.28)');
      spineAnim.setAttribute('stroke-width', '1.5');
      spineAnim.setAttribute('stroke-linecap', 'round');
      const totalLen = spineAnim.getTotalLength ? spineAnim.getTotalLength() : 1200;
      spineAnim.style.strokeDasharray  = totalLen;
      spineAnim.style.strokeDashoffset = totalLen;
      svg.appendChild(spineAnim);

      /* Node glow rings */
      nodeY.forEach((y, i) => {
        const nx = xWave[i];
        [{ r: 28, op: 0.18 }, { r: 42, op: 0.08 }].forEach(({ r, op }) => {
          const gc = document.createElementNS(NS, 'circle');
          gc.setAttribute('cx', nx); gc.setAttribute('cy', y);
          gc.setAttribute('r', r);
          gc.setAttribute('fill', 'none');
          gc.setAttribute('stroke', ENT[i].color);
          gc.setAttribute('stroke-width', '0.8');
          gc.setAttribute('opacity', op);
          svg.appendChild(gc);
        });
        /* colored dot pulse */
        const pulse = document.createElementNS(NS, 'circle');
        pulse.setAttribute('cx', nx); pulse.setAttribute('cy', y);
        pulse.setAttribute('r', '3');
        pulse.setAttribute('fill', ENT[i].color);
        pulse.setAttribute('opacity', '0.55');
        svg.appendChild(pulse);
      });

      return { spineAnim, totalLen };
    }

    let spineData = null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      spineData = buildSpine();
      window.addEventListener('resize', () => { spineData = buildSpine(); }, { passive: true });
      animate();
    }));

    function animate() {
      if (typeof gsap === 'undefined') return;

      const titleBlock = document.querySelector('.sj-title-block');
      const spines  = entryEls.map(r => r.querySelector('.sj-entry-spine'));
      const contents = entryEls.map(r => r.querySelector('.sj-entry-content'));

      gsap.set(titleBlock, { opacity: 0, y: 36 });
      gsap.set(spines,  { opacity: 0, scale: 0.7 });
      gsap.set(contents, { opacity: 0, x: 32 });

      const sec = document.querySelector('.sj-sec');

      ScrollTrigger.create({
        trigger: sec, start: 'top 68%', once: true,
        onEnter: () => {
          gsap.to(titleBlock, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
          gsap.to(spines, {
            opacity: 1, scale: 1, duration: 0.6,
            ease: 'back.out(2)', stagger: 0.18, delay: 0.3,
            transformOrigin: 'center center',
          });
          gsap.to(contents, {
            opacity: 1, x: 0, duration: 0.75,
            ease: 'power3.out', stagger: 0.18, delay: 0.42,
          });
        },
      });

      /* Spine draw scrubbed to scroll */
      if (spineData) {
        const { spineAnim, totalLen } = spineData;
        ScrollTrigger.create({
          trigger: sec, start: 'top 80%', end: 'bottom 15%', scrub: 1.6,
          onUpdate: self => {
            if (spineAnim) spineAnim.style.strokeDashoffset = totalLen * (1 - self.progress);
          },
        });
      }

      /* Per-entry pulse when entering viewport */
      entryEls.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row, start: 'top 88%', once: true,
          onEnter: () => {
            const node = row.querySelector('.sj-node');
            gsap.fromTo(node,
              { boxShadow: `0 0 0 0 ${ENT[i].color}` },
              { boxShadow: `0 0 22px -4px ${ENT[i].color}`, duration: 0.8, ease: 'power2.out' }
            );
          },
        });
      });
    }
  })();

  /* ================================================================
     // 05 · PROJECTS — SCROLL-DRIVEN TIMED CARDS
     ================================================================ */
  (() => {
    const BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';
    const PROJECTS = [
      {
        num: 'P·01', cat: 'INTELLIGENT INFRASTRUCTURE', cc: '#FF6B00',
        title: 'Kairo',
        desc: 'AI Chief-of-Staff for startup founders that processes operational communication across Gmail and Slack to generate focused executive briefings and decision summaries.',
        stack: ['LLMs', 'AI Agents', 'RAG', 'FastAPI', 'PostgreSQL'],
        link: 'https://github.com/aerostorm19/Kairo',
        poster: './projects/Kairo.png',
        video: BASE + 'hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4',
      },
      {
        num: 'P·02', cat: 'INTELLIGENT INFRASTRUCTURE', cc: '#FF6B00',
        title: 'Imprint',
        desc: 'A brand intelligence platform that transforms logos, design assets, copy, and guidelines into a persistent brand memory — then evaluates new content for consistency across visual identity, tone, and brand rules.',
        stack: ['Multi-Modal AI', 'Embeddings', 'RAG', 'FastAPI', 'Next.js', 'PostgreSQL', 'Qdrant'],
        link: '',
        poster: './projects/Imprint.png',
        video: BASE + 'hf_20260507_150203_44a5bd32-516a-47ce-a077-8acbf9aa8991.mp4',
      },
      {
        num: 'P·03', cat: 'INTELLIGENT INFRASTRUCTURE', cc: '#FF6B00',
        title: 'Helio',
        desc: 'Voice-based AI operations assistant for local businesses capable of handling calls, appointment scheduling, FAQs, and intelligent escalation workflows.',
        stack: ['TypeScript', 'AI Workflows', 'Realtime Systems', 'APIs'],
        link: 'https://github.com/aerostorm19/Helio',
        poster: './projects/Helio.png',
        video: BASE + 'hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4',
      },
      {
        num: 'P·04', cat: 'INTELLIGENT INFRASTRUCTURE', cc: '#FF6B00',
        title: 'DoOne',
        desc: 'Adaptive AI productivity system that learns behavioral patterns, prioritizes tasks dynamically, and generates calm, context-aware execution workflows.',
        stack: ['Next.js', 'FastAPI', 'Gemini API', 'PostgreSQL', 'Zustand'],
        link: 'https://github.com/aerostorm19/DoOne',
        poster: '',
        video: BASE + 'hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
      },
      {
        num: 'P·05', cat: 'EMBEDDED SYSTEMS & FPGA', cc: '#59E1FF',
        title: '5-Stage RV32I',
        desc: 'Designed and verified a modular pipelined RISC-V processor featuring hazard detection, forwarding, stalling logic, and simulation-driven verification.',
        stack: ['SystemVerilog', 'RISC-V', 'Computer Architecture'],
        link: 'https://github.com/aerostorm19/5-Stage-Pipelined-RV32I-Processor-SystemVerilog-',
        poster: './projects/Risc-V.png',
        video: BASE + 'hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
      },
      {
        num: 'P·06', cat: 'EMBEDDED SYSTEMS & FPGA', cc: '#59E1FF',
        title: 'CAN Bus STM32',
        desc: 'Built a real-time embedded communication system using bare-metal C and interrupt-driven CAN communication between STM32 microcontrollers.',
        stack: ['STM32', 'Embedded C', 'CAN Bus', 'Bare Metal'],
        link: 'https://github.com/aerostorm19/CAN-Bus-Communication-Between-STM32F407G-STM32F446RE',
        poster: './projects/Can-Bus.png',
        video: BASE + 'hf_20260507_153148_d7a3e1dd-e5d0-4ce6-8306-00d7522ecc44.mp4',
      },
      {
        num: 'P·07', cat: 'EMBEDDED SYSTEMS & FPGA', cc: '#59E1FF',
        title: 'Smart Glasses',
        desc: 'Edge-AI assistive system combining embedded sensing, real-time object detection, and autonomous feedback for navigation support of the visually impaired.',
        stack: ['ESP32', 'Embedded AI', 'Computer Vision', 'Edge Systems'],
        link: 'https://github.com/aerostorm19/Smart-Glasses-for-Visually--Impaired',
        poster: './projects/smartglasses.png',
        video: BASE + 'hf_20260507_154543_d5b83fc1-9cea-44f3-b5e8-8f325935211a.mp4',
      },
      {
        num: 'P·08', cat: 'SIGNAL PROCESSING, SDR & EDGE', cc: '#D7FF3F',
        title: 'SAR Imaging',
        desc: 'Modular SAR imaging pipeline for surveillance drones involving FFT-based image formation, matched filtering, and signal enhancement workflows.',
        stack: ['Python', 'DSP', 'SDR', 'Signal Processing', 'Edge Computing'],
        link: 'https://github.com/aerostorm19/software-defined-sar-drone',
        poster: './projects/sar.png',
        video: BASE + 'hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4',
      },
      {
        num: 'P·09', cat: 'SIGNAL PROCESSING, SDR & EDGE', cc: '#D7FF3F',
        title: 'WiFi Motion',
        desc: 'Wireless sensing system using RSSI variance analysis for device-free motion detection — no wearable hardware or cameras required.',
        stack: ['Raspberry Pi', 'Wireless Sensing', 'DSP', 'Embedded Systems'],
        link: 'https://github.com/aerostorm19/-WiFi-Based-Device-Free-Motion-Detection-System',
        poster: './projects/wifi-based.png',
        video: BASE + 'hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4',
      },
      {
        num: 'P·10', cat: 'SIGNAL PROCESSING, SDR & EDGE', cc: '#D7FF3F',
        title: 'GLOFzilla EWS',
        desc: 'AI-driven flood prediction and hazard classification system for glacial lake outburst events developed during Smart India Hackathon 2024.',
        stack: ['Machine Learning', 'Geospatial AI', 'Disaster Systems'],
        link: 'https://github.com/aerostorm19/New-EWS-GLOF-SIH-2024',
        poster: './projects/GLOF.png',
        video: BASE + 'hf_20260419_064822_f120e48a-d545-45dd-a02d-facb07829888.mp4',
      },
      {
        num: 'P·11', cat: 'SECURITY & AI', cc: '#CE93D8',
        title: 'ML WAF',
        desc: 'AI-powered Web Application Firewall combining NLP-based classification and anomaly detection for real-time API threat mitigation.',
        stack: ['Python', 'FastAPI', 'Machine Learning', 'Cybersecurity'],
        link: 'https://github.com/aerostorm19/ML-Based-Web-App-Firewall',
        poster: './projects/ML-firewall.png',
        video: BASE + 'hf_20260511_131941_d136af49-e243-495a-be14-6ff3f24e09e6.mp4',
      },
      {
        num: 'P·12', cat: 'SECURITY & AI', cc: '#CE93D8',
        title: 'µArch Spectroscope',
        desc: 'Low-level CLI tool for probing CPU microarchitectural characteristics including cache hierarchy, TLB behavior, coherence overhead, and NUMA topology.',
        stack: ['C++', 'Systems Programming', 'Computer Architecture'],
        link: 'https://github.com/aerostorm19/Micro-Arch-Spectroscope',
        poster: '',
        video: BASE + 'hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4',
      },
    ];

    const bgEl        = document.getElementById('pjBg');
    const cardsEl     = document.getElementById('pjCards');
    const detailsWrap = document.getElementById('pjDetailsWrap');
    const catEl       = document.getElementById('pjCat');
    const numEl       = document.getElementById('pjNum');
    const titleEl     = document.getElementById('pjTitle');
    const descEl      = document.getElementById('pjDesc');
    const chipsEl     = document.getElementById('pjChips');
    const linkEl      = document.getElementById('pjLink');
    const prevBtn     = document.getElementById('pjPrev');
    const nextBtn     = document.getElementById('pjNext');
    const curEl       = document.getElementById('pjCur');
    const totEl       = document.getElementById('pjTot');
    const sec         = document.getElementById('projects');
    const carousel    = sec ? sec.querySelector('.pj-carousel') : null;

    if (!bgEl || !sec) return;

    let active = 0;
    let busy   = false;
    const total = PROJECTS.length;
    totEl.textContent = String(total).padStart(2, '0');

    /* ── Build BG slides ── */
    PROJECTS.forEach((p, i) => {
      const slide = document.createElement('div');
      slide.className = 'pj-slide' + (i === 0 ? ' active' : '');
      /* only first slide autoplays; rest load lazily and play on demand */
      const autoAttr = i === 0 ? 'autoplay' : '';
      const preloadAttr = i === 0 ? 'auto' : 'none';
      slide.innerHTML = `
        ${p.poster ? `<img src="${p.poster}" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;">` : ''}
        <video ${autoAttr} muted loop playsinline preload="${preloadAttr}" style="position:relative;z-index:1;"${p.poster ? ` poster="${p.poster}"` : ''}><source src="${p.video}" type="video/mp4"></video>`;
      bgEl.appendChild(slide);
    });

    /* ── Build card stack ── */
    PROJECTS.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'pj-card';
      card.setAttribute('data-index', i);
      card.setAttribute('data-slot', slotFor(i, 0));
      card.style.setProperty('--pj-cc', p.cc);
      /* cards use poster image for perf — video only plays when card is in slot 0 */
      const isActive = i === 0;
      card.innerHTML = `
        <video ${isActive ? 'autoplay' : ''} muted loop playsinline preload="${isActive ? 'auto' : 'none'}"${p.poster ? ` poster="${p.poster}"` : ''}>
          <source src="${p.video}" type="video/mp4">
        </video>
        <div class="pj-card-body">
          <span class="pj-card-cat">${p.cat}</span>
          <div class="pj-card-title">${p.title}</div>
        </div>`;
      card.addEventListener('click', () => { if (!busy && i !== active) goToAndScroll(i); });
      cardsEl.appendChild(card);
    });

    /* ── Manage video playback: only play videos in visible slots ── */
    function manageBgVideos(idx) {
      bgEl.querySelectorAll('.pj-slide').forEach((slide, i) => {
        const vid = slide.querySelector('video');
        if (!vid) return;
        if (i === idx) {
          if (vid.getAttribute('data-loaded') !== '1') {
            vid.load();
            vid.setAttribute('data-loaded', '1');
          }
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }

    function manageCardVideos(idx) {
      cardsEl.querySelectorAll('.pj-card').forEach(card => {
        const ci = +card.getAttribute('data-index');
        const slot = card.getAttribute('data-slot');
        const vid = card.querySelector('video');
        if (!vid) return;
        /* play only hero card (slot 0) and adjacent cards (slot 1,2) */
        const shouldPlay = slot === '0' || slot === '1' || slot === '2';
        if (shouldPlay) {
          if (vid.getAttribute('data-loaded') !== '1') {
            vid.load();
            vid.setAttribute('data-loaded', '1');
          }
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }

    /* ── Progress dots (replaces timer bar) ── */
    const tlWrap = document.querySelector('.pj-timeline');
    if (tlWrap) {
      tlWrap.innerHTML = '';
      const dotsEl = document.createElement('div');
      dotsEl.className = 'pj-timeline-dots';
      for (let i = 0; i < total; i++) {
        const d = document.createElement('div');
        d.className = 'pj-dot' + (i === 0 ? ' active' : '');
        dotsEl.appendChild(d);
      }
      tlWrap.appendChild(dotsEl);
    }

    /* ── Scroll hint ── */
    if (carousel) {
      const hint = document.createElement('div');
      hint.className = 'pj-scroll-hint';
      hint.id = 'pjScrollHint';
      hint.innerHTML = `<span class="kanit">SCROLL</span><div class="pj-scroll-hint-line"></div>`;
      carousel.appendChild(hint);
    }

    /* slotFor: 0=hero, 1/2=cascade behind, rest=invisible */
    function slotFor(idx, act) {
      const off = ((idx - act) % total + total) % total;
      if (off === 0) return '0';
      if (off === 1) return '1';
      if (off === 2) return '2';
      if (off >= total - 2) return 'active-out';
      return 'upcoming-in';
    }

    function updateBg(idx) {
      bgEl.querySelectorAll('.pj-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
      manageBgVideos(idx);
    }

    function updateCards(idx) {
      cardsEl.querySelectorAll('.pj-card').forEach(card => {
        const ci      = +card.getAttribute('data-index');
        const newSlot = slotFor(ci, idx);
        const curSlot = card.getAttribute('data-slot');
        const invis   = s => s === 'active-out' || s === 'upcoming-in';
        if (invis(curSlot) && invis(newSlot)) {
          card.style.transition = 'none';
          card.setAttribute('data-slot', newSlot);
          void card.offsetHeight;
          card.style.transition = '';
        } else {
          card.setAttribute('data-slot', newSlot);
        }
      });
      /* defer card video management slightly so slot attrs are set first */
      requestAnimationFrame(() => manageCardVideos(idx));
    }

    function updateDetails(idx) {
      const p = PROJECTS[idx];
      detailsWrap.classList.add('fade-out');
      setTimeout(() => {
        catEl.textContent   = p.cat;
        catEl.style.setProperty('--pj-cc', p.cc);
        numEl.textContent   = p.num;
        titleEl.textContent = p.title;
        descEl.textContent  = p.desc;
        chipsEl.innerHTML   = p.stack.map(s => `<span>${s}</span>`).join('');
        linkEl.href         = p.link;
        curEl.textContent   = String(idx + 1).padStart(2, '0');
        curEl.style.color   = p.cc;
        document.querySelectorAll('.pj-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
        if (carousel) carousel.style.setProperty('--pj-cc-active', p.cc);
        detailsWrap.classList.remove('fade-out');
        detailsWrap.classList.add('fade-prep');
        void detailsWrap.offsetWidth;
        detailsWrap.classList.remove('fade-prep');
      }, 280);
    }

    /* ── Core navigation ── */
    function goTo(idx) {
      if (busy) return;
      busy = true;
      active = idx;
      updateBg(idx);
      updateCards(idx);
      updateDetails(idx);
      if (idx > 0) document.getElementById('pjScrollHint')?.classList.add('hidden');
      setTimeout(() => { busy = false; }, 650);
    }

    /* ── ScrollTrigger pin — 450 px per card ── */
    let _st = null;
    const SCROLL_PER_CARD = 450;

    function goToAndScroll(idx) {
      goTo(idx);
      if (_st && lenis) {
        const prog = idx / (total - 1);
        const dest = _st.start + prog * (_st.end - _st.start);
        lenis.scrollTo(dest, { duration: 1.05, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    }

    if (window.ScrollTrigger && window.gsap && window.innerWidth > 700) {
      _st = ScrollTrigger.create({
        trigger: sec,
        start: 'top top',
        end: `+=${(total - 1) * SCROLL_PER_CARD}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        snap: {
          snapTo: 1 / (total - 1),
          duration: { min: 0.28, max: 0.55 },
          delay: 0.02,
          ease: 'power3.inOut',
        },
        onUpdate: self => {
          const idx = Math.round(self.progress * (total - 1));
          if (idx !== active && !busy) goTo(idx);
        },
      });
    }

    /* ── Arrow buttons ── */
    prevBtn?.addEventListener('click', () => { if (!busy) goToAndScroll(Math.max(0, active - 1)); });
    nextBtn?.addEventListener('click', () => { if (!busy) goToAndScroll(Math.min(total - 1, active + 1)); });

    /* ── Touch swipe support for mobile (horizontal) ── */
    if (window.innerWidth <= 700) {
      let _tx0 = 0;
      sec.addEventListener('touchstart', e => { _tx0 = e.touches[0].clientX; }, { passive: true });
      sec.addEventListener('touchend', e => {
        const dx = _tx0 - e.changedTouches[0].clientX;
        if (Math.abs(dx) < 40 || busy) return;
        if (dx > 0 && active < total - 1) goTo(active + 1);
        else if (dx < 0 && active > 0)    goTo(active - 1);
      }, { passive: true });
    }

    /* ── Init ── */
    const p0 = PROJECTS[0];
    catEl.style.setProperty('--pj-cc', p0.cc);
    curEl.style.color = p0.cc;
    if (carousel) carousel.style.setProperty('--pj-cc-active', p0.cc);
    manageBgVideos(0);
    requestAnimationFrame(() => manageCardVideos(0));
  })();

  /* ================================================================
     GALLERY — parallax + reveal + hover (pin already set above)
     ================================================================ */
  ;(function galScroll() {
    const sec   = document.querySelector('.gal-sec');
    const track = document.getElementById('galTrack');
    if (!sec || !track || typeof ScrollTrigger === 'undefined') return;
    if (window.innerWidth <= 700) return; /* mobile uses vertical layout */

    const getScrollDist = () => track.scrollWidth - window.innerWidth;

    /* ── Per-item parallax: foreground faster, background slower ── */
    document.querySelectorAll('.gal-item[data-speed]').forEach(item => {
      const speed = parseFloat(item.dataset.speed);
      if (speed === 1.0) return;
      const extra = (speed - 1) * getScrollDist() * 0.22;
      gsap.to(item, {
        x: -extra,
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: () => '+=' + getScrollDist(),
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      });
    });

    /* ── Image reveal: frames fade+scale in as they enter ── */
    document.querySelectorAll('.gal-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.9, ease: 'power3.out', delay: i * 0.04,
          scrollTrigger: {
            trigger: sec,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    });

    /* ── Hover 3D tilt on individual cards ── */
    document.querySelectorAll('.gal-item').forEach(item => {
      gsap.set(item, { transformPerspective: 900 });
      let live = false;

      item.addEventListener('mouseenter', () => { live = true; });
      item.addEventListener('mouseleave', () => {
        live = false;
        gsap.to(item, {
          rotateX: 0, rotateY: 0, scale: 1,
          duration: 0.9, ease: 'expo.out', overwrite: 'auto'
        });
      });
      item.addEventListener('mousemove', e => {
        if (!live) return;
        const r  = item.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width  - 0.5;
        const ny = (e.clientY - r.top)  / r.height - 0.5;
        gsap.to(item, {
          rotateY:  nx *  14,
          rotateX:  ny * -14,
          scale: 1.03,
          duration: 0.45, ease: 'power2.out', overwrite: 'auto'
        });
      });
    });

  })();

  /* ================================================================
     TECH STACK — bidirectional split slide (left ↔ right on scroll)
     ================================================================ */
  ;(function stackReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const sec = document.querySelector('.stack');
    if (!sec) return;

    const lhsEls = [
      document.getElementById('stEyebrow'),
      document.getElementById('stLine1'),
      document.getElementById('stLine2'),
      document.getElementById('stSub'),
      sec.querySelector('.stack-rule'),
      document.getElementById('stMeta'),
    ].filter(Boolean);

    const cards = gsap.utils.toArray('.sc');
    const isMobile = () => window.innerWidth < 800;
    let triggers = [];

    function killAll() {
      triggers.forEach(t => t && t.kill && t.kill());
      triggers = [];
      gsap.set([...lhsEls, ...cards], { clearProps: 'all' });
    }

    function initDesktop() {
      /* Each element scrubs from its off-screen position to resting place.
         scrub: true means it reverses perfectly when scrolling back up. */
      lhsEls.forEach((el, i) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: 'top 90%',
            end:   'top 20%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          }
        });
        tl.fromTo(el,
          { x: -80, opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out', duration: 1 },
          i * 0.06
        );
        triggers.push(tl.scrollTrigger);
      });

      cards.forEach((card, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: 'top 90%',
            end:   'top 20%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          }
        });
        tl.fromTo(card,
          { x: 80, opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out', duration: 1 },
          row * 0.08 + col * 0.04
        );
        triggers.push(tl.scrollTrigger);
      });
    }

    function initMobile() {
      /* On mobile: slide up from below — also bidirectional via scrub */
      [...lhsEls, ...cards].forEach((el, i) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: 'top 92%',
            end:   'top 30%',
            scrub: 0.7,
            invalidateOnRefresh: true,
          }
        });
        tl.fromTo(el,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out', duration: 1 },
          i * 0.04
        );
        triggers.push(tl.scrollTrigger);
      });
    }

    function build() {
      killAll();
      if (isMobile()) initMobile(); else initDesktop();
    }

    build();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 300);
    }, { passive: true });
  })();

  /* ================================================================
     SCROLL-REVEAL · LEFT / RIGHT ALTERNATING
     ================================================================ */
  (() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    document.querySelectorAll('.scroll-reveal-section').forEach(el => {
      observer.observe(el);
    });
  })();


})();
  /* ================================================================
     SCROLL PROGRESS BAR
     ================================================================ */
  (() => {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();


  /* ================================================================
     SECTION BG PARALLAX (subtle depth on scroll)
     ================================================================ */
  ;(function sectionParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.innerWidth < 768) return;

    const pairs = [
      { section: '.manifesto',  bg: '.manifesto-bg' },
      { section: '.cutaway',    bg: '.cut-video' },
    ];

    pairs.forEach(({ section, bg }) => {
      const sec = document.querySelector(section);
      const el  = document.querySelector(bg);
      if (!sec || !el) return;

      gsap.fromTo(el,
        { y: '-6%' },
        {
          y: '6%',
          ease: 'none',
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            end:   'bottom top',
            scrub: 1.0,
          }
        }
      );
    });
  })();

  /* ================================================================
     BUTTON RIPPLE EFFECT
     ================================================================ */
  ;(function buttonRipple() {
    document.querySelectorAll('.contact-btn-primary, .contact-btn-ghost, .hib-cta, .pj-arrow').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const r = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(r.width, r.height) * 2;
        ripple.style.cssText = `
          position:absolute;
          width:${size}px; height:${size}px;
          left:${e.clientX - r.left - size/2}px;
          top:${e.clientY - r.top - size/2}px;
          border-radius:50%;
          background:rgba(255,255,255,0.18);
          transform:scale(0);
          animation:rippleAnim 0.55s ease-out forwards;
          pointer-events:none;
        `;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });

    /* Inject ripple keyframe once */
    if (!document.getElementById('rippleStyle')) {
      const s = document.createElement('style');
      s.id = 'rippleStyle';
      s.textContent = '@keyframes rippleAnim { to { transform:scale(1); opacity:0; } }';
      document.head.appendChild(s);
    }
  })();

  /* ================================================================
     SMOOTH SECTION LABEL TRANSITIONS (HUD sector update)
     ================================================================ */
  ;(function hudSectorTransition() {
    const el = document.getElementById('hudSector');
    if (!el) return;
    let pending = null;
    const orig = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'textContent');
    Object.defineProperty(el, 'textContent', {
      set(v) {
        if (v === el.dataset.last) return;
        el.dataset.last = v;
        el.style.opacity = '0';
        el.style.transform = 'translateY(-4px)';
        clearTimeout(pending);
        pending = setTimeout(() => {
          orig.set.call(el, v);
          el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 180);
      },
      get() { return orig.get.call(el); }
    });
    el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  })();



/* ── Mobile gallery: IntersectionObserver scroll-reveal ── */
;(function mobileGalReveal() {
  if (window.innerWidth > 700) return;
  const items  = Array.from(document.querySelectorAll('.gal-sec .gal-item'));
  const quotes = Array.from(document.querySelectorAll('.gal-sec .gal-float-quote'));
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('mob-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });

  items.forEach(el => io.observe(el));
  quotes.forEach(el => io.observe(el));
})();
