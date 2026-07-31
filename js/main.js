(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 그룹 스태거 — 같은 그룹 안에서 순서대로 살짝 늦게 나타나도록 지연값 부여
  const staggerGroups = [
    { selector: '.collection-card', step: 100 },
    { selector: '.res-card', step: 100 },
    { selector: '.stockist-chip', step: 60 },
    { selector: '.journal__item', step: 70 },
    { selector: '.stat-card', step: 90 },
  ];
  staggerGroups.forEach(({ selector, step }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.dataset.staggerDelay = String(Math.min(i, 6) * step);
    });
  });

  // 스크롤 리빌 (커지면서 페이드 인 + 그룹 스태거)
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.staggerDelay;
          if (delay && delay !== '0') {
            el.style.transitionDelay = `${delay}ms`;
          }
          el.classList.add('is-visible');
          // 리빌이 끝나면 will-change·delay를 지워 불필요한 레이어 유지를 막는다
          el.addEventListener('transitionend', () => {
            el.style.transitionDelay = '';
            el.style.willChange = 'auto';
          }, { once: true });
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  // 통계 카운트업 — 카드가 화면에 들어올 때 각자 시작
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
    } else {
      const statsIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statsIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach((c) => statsIo.observe(c));
    }
  }

  // 히어로 사진 — 스크롤할수록 서서히 커짐
  const heroSection = document.querySelector('.hero');
  const heroPhoto = document.querySelector('.hero__photo');
  if (heroSection && heroPhoto && !reduceMotion) {
    let ticking = false;
    const maxZoom = 0.16;
    const update = () => {
      const rect = heroSection.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / heroSection.offsetHeight, 0), 1);
      heroPhoto.style.transform = `scale(${1 + progress * maxZoom})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  // 비 내리는 인터랙션 — 히어로를 지나 스크롤하면 서서히 나타남
  const rainCanvas = document.getElementById('rain');
  if (rainCanvas && !reduceMotion) {
    const ctx = rainCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, drops = [];

    const makeDrop = (randomY) => ({
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      len: 14 + Math.random() * 18,
      speed: 4 + Math.random() * 5,
      drift: -0.6 - Math.random() * 0.4,
      opacity: 0.12 + Math.random() * 0.28,
    });

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      rainCanvas.width = w * dpr;
      rainCanvas.height = h * dpr;
      rainCanvas.style.width = `${w}px`;
      rainCanvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.max(70, Math.round((w * h) / 9000)));
      drops = Array.from({ length: count }, () => makeDrop(true));
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      drops.forEach((d) => {
        ctx.strokeStyle = `rgba(200,214,255,${d.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.drift * (d.len * 0.4), d.y - d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x += d.drift;
        if (d.y - d.len > h) Object.assign(d, makeDrop(false));
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    // 히어로 구간에서는 숨기고, 그 아래로 스크롤하면 서서히 등장
    let rainTicking = false;
    const updateRainOpacity = () => {
      const heroH = heroSection ? heroSection.offsetHeight : window.innerHeight;
      const progress = Math.min(Math.max((window.scrollY - heroH * 0.5) / (heroH * 0.6), 0), 1);
      rainCanvas.style.opacity = String(progress * 0.5);
      rainTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!rainTicking) {
        requestAnimationFrame(updateRainOpacity);
        rainTicking = true;
      }
    }, { passive: true });
    updateRainOpacity();
  }

  // 상단 nav — 스크롤 시 투명 → 배경 등장
  const navEl = document.querySelector('.nav');
  if (navEl) {
    let navTicking = false;
    const updateNav = () => {
      navEl.classList.toggle('nav--scrolled', window.scrollY > 40);
      navTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!navTicking) {
        requestAnimationFrame(updateNav);
        navTicking = true;
      }
    }, { passive: true });
    updateNav();
  }

  // 모바일 메뉴 토글
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('is-open'))
    );
  }
})();
