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

  // About 섹션 전용 — 스크롤한 만큼만 우상→좌하 대각선으로 비가 흐름(자체 애니메이션 없음)
  const aboutSection = document.getElementById('about');
  const rainCanvas = document.getElementById('about-rain');
  if (aboutSection && rainCanvas && !reduceMotion) {
    const ctx = rainCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, drops = [];

    // 우상 → 좌하 방향 단위벡터(살짝 눕힌 대각선). ux<0(왼쪽), uy>0(아래)
    const DRIFT = 0.5;
    const mag = Math.sqrt(DRIFT * DRIFT + 1);
    const ux = -DRIFT / mag;
    const uy = 1 / mag;

    const makeDrop = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 120 + Math.random() * 160,
      speedMul: 0.4 + Math.random() * 1.1,
      width: 1.6 + Math.random() * 1.4,
      opacity: 0.32 + Math.random() * 0.4,
    });

    // 캔버스 범위를 넉넉히 벗어난 자리에서 다시 시작 — 두 방향 랩어라운드가 서로 덮어쓰지 않도록 else if로 배타 처리
    const respawnFromTopRight = (d) => {
      d.x = w * (0.7 + Math.random() * 0.3);
      d.y = -d.len - Math.random() * h * 0.3;
    };
    const respawnFromBottomLeft = (d) => {
      d.x = w * (-0.3 + Math.random() * 0.3);
      d.y = h + d.len + Math.random() * h * 0.3;
    };

    const resize = () => {
      w = aboutSection.clientWidth;
      h = aboutSection.clientHeight;
      rainCanvas.width = w * dpr;
      rainCanvas.height = h * dpr;
      rainCanvas.style.width = `${w}px`;
      rainCanvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.max(50, Math.round((w * h) / 9000)));
      drops = Array.from({ length: count }, makeDrop);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      drops.forEach((d) => {
        const halfLen = d.len * 0.5;
        const tailX = d.x - ux * halfLen, tailY = d.y - uy * halfLen; // 꼬리(우상)
        const headX = d.x + ux * halfLen, headY = d.y + uy * halfLen; // 머리(좌하)
        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, 'rgba(210,222,255,0)');
        grad.addColorStop(0.5, `rgba(210,222,255,${d.opacity})`);
        grad.addColorStop(1, 'rgba(210,222,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();
      });
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // 스크롤 이동량(delta)만큼만 우상→좌하로 흐르도록 — 자체 애니메이션 없음, 위로 스크롤하면 역방향
    let lastScrollY = window.scrollY;
    let rainTicking = false;
    const updateRain = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (delta !== 0) {
        drops.forEach((d) => {
          d.x += ux * delta * d.speedMul;
          d.y += uy * delta * d.speedMul;
          if (d.y - d.len > h || d.x < -d.len) {
            respawnFromTopRight(d);
          } else if (d.y + d.len < 0 || d.x > w + d.len) {
            respawnFromBottomLeft(d);
          }
        });
        draw();
      }
      rainTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!rainTicking) {
        requestAnimationFrame(updateRain);
        rainTicking = true;
      }
    }, { passive: true });
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
