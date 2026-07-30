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
