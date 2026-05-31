/* ════════════════════════════════════════════
   APEX FITNESS — SCRIPT.JS
   ════════════════════════════════════════════ */

'use strict';

// ──────────────────────────────────────────────
// AUTH SYSTEM
// ──────────────────────────────────────────────
const AUTH = {
  DEMO_EMAIL:    'test@apex.com',
  DEMO_PASSWORD: 'apex123',
  STORAGE_KEY:   'apex_user',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const user = JSON.parse(saved);
      this.onLogin(user);
    } else {
      document.getElementById('authOverlay').classList.add('active');
    }

    this.bindTabs();
    this.bindForms();
    this.bindLogout();
  },

  bindTabs() {
    const tabs  = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
        document.getElementById('loginError').textContent = '';
        document.getElementById('regError').textContent = '';
      });
    });
  },

  bindForms() {
    // LOGIN
    document.getElementById('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass  = document.getElementById('loginPassword').value;
      const err   = document.getElementById('loginError');

      // check saved users or demo
      const users = JSON.parse(localStorage.getItem('apex_users') || '[]');
      const found = users.find(u => u.email === email && u.password === pass);

      if ((email === this.DEMO_EMAIL && pass === this.DEMO_PASSWORD) || found) {
        const user = found || { name: 'Пользователь', email };
        this.saveUser(user);
        this.onLogin(user);
      } else {
        err.textContent = 'Неверный email или пароль';
        this.shakeForm('loginForm');
      }
    });

    // REGISTER
    document.getElementById('registerForm').addEventListener('submit', e => {
      e.preventDefault();
      const name  = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass  = document.getElementById('regPassword').value;
      const err   = document.getElementById('regError');

      if (pass.length < 6) { err.textContent = 'Пароль минимум 6 символов'; this.shakeForm('registerForm'); return; }
      if (!name) { err.textContent = 'Введите ваше имя'; this.shakeForm('registerForm'); return; }

      const users = JSON.parse(localStorage.getItem('apex_users') || '[]');
      if (users.find(u => u.email === email)) {
        err.textContent = 'Email уже зарегистрирован';
        this.shakeForm('registerForm');
        return;
      }

      const user = { name, email, password: pass };
      users.push(user);
      localStorage.setItem('apex_users', JSON.stringify(users));
      this.saveUser(user);
      this.onLogin(user);
    });
  },

  bindLogout() {
    document.getElementById('navLogout').addEventListener('click', () => {
      localStorage.removeItem(this.STORAGE_KEY);
      document.getElementById('authOverlay').classList.add('active');
      document.getElementById('navUser').textContent = '';
    });
  },

  saveUser(user) {
    const safe = { name: user.name, email: user.email };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safe));
  },

  onLogin(user) {
    const overlay = document.getElementById('authOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.classList.remove('active'); overlay.style.opacity = ''; }, 500);

    const firstName = user.name ? user.name.split(' ')[0] : 'Привет';
    document.getElementById('navUser').textContent = `👋 ${firstName}`;
  },

  shakeForm(id) {
    const form = document.getElementById(id);
    form.style.animation = 'none';
    form.offsetHeight; // reflow
    form.style.animation = 'shake 0.4s ease';
  }
};

// Shake keyframe injection
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}`;
document.head.appendChild(shakeStyle);

// ──────────────────────────────────────────────
// CUSTOM CURSOR
// ──────────────────────────────────────────────
const CURSOR = {
  cursor:    document.getElementById('cursor'),
  dot:       document.getElementById('cursorDot'),
  mouseX: 0, mouseY: 0,
  curX: 0,   curY: 0,

  init() {
    document.addEventListener('mousemove', e => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.dot.style.left = e.clientX + 'px';
      this.dot.style.top  = e.clientY + 'px';
    });

    document.querySelectorAll('a, button, .prog-card, .trainer-card, .review-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    this.animate();
  },

  animate() {
    this.curX += (this.mouseX - this.curX) * 0.12;
    this.curY += (this.mouseY - this.curY) * 0.12;
    this.cursor.style.left = this.curX + 'px';
    this.cursor.style.top  = this.curY + 'px';
    requestAnimationFrame(() => this.animate());
  }
};

// ──────────────────────────────────────────────
// NAVBAR
// ──────────────────────────────────────────────
const NAVBAR = {
  init() {
    const nav    = document.getElementById('navbar');
    const burger = document.getElementById('burger');
    const menu   = document.getElementById('mobileMenu');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });

    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
    });

    document.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        menu.classList.remove('open');
      });
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      document.querySelectorAll('.nav-link').forEach(link => {
        link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
      });
    });
  }
};

// ──────────────────────────────────────────────
// SCROLL REVEAL
// ──────────────────────────────────────────────
const REVEAL = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
};

// ──────────────────────────────────────────────
// COUNTER ANIMATION
// ──────────────────────────────────────────────
const COUNTERS = {
  init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.num-val, .stat-num').forEach(el => observer.observe(el));
  },

  animate(el) {
    const target   = parseInt(el.dataset.target);
    const duration = 2000;
    const start    = performance.now();

    const update = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * target).toLocaleString('ru');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
};

// ──────────────────────────────────────────────
// RING ANIMATION (stats circles)
// ──────────────────────────────────────────────
const RINGS = {
  init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const circle = entry.target;
          const pct = parseFloat(circle.dataset.pct);
          const circumference = 251.2;
          const offset = circumference - (pct / 100) * circumference;
          setTimeout(() => {
            circle.style.strokeDashoffset = offset;
          }, 200);
          observer.unobserve(circle);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.ring-fill').forEach(el => observer.observe(el));
  }
};

// ──────────────────────────────────────────────
// HERO TITLE LETTER ANIMATION
// ──────────────────────────────────────────────
const HERO_ANIM = {
  init() {
    const lines = document.querySelectorAll('.hero-title .line');
    lines.forEach((line, i) => {
      const text = line.textContent;
      line.innerHTML = text.split('').map((ch, j) =>
        `<span style="display:inline-block;opacity:0;transform:translateY(80px);transition:opacity 0.6s ${(i * 0.25 + j * 0.04)}s cubic-bezier(0.23,1,0.32,1),transform 0.6s ${(i * 0.25 + j * 0.04)}s cubic-bezier(0.23,1,0.32,1)">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
    });

    setTimeout(() => {
      lines.forEach(line => {
        line.querySelectorAll('span').forEach(span => {
          span.style.opacity  = '1';
          span.style.transform = 'translateY(0)';
        });
      });
    }, 100);
  }
};

// ──────────────────────────────────────────────
// PARALLAX ORBS
// ──────────────────────────────────────────────
const PARALLAX = {
  init() {
    const orbs = document.querySelectorAll('.hero-orb');
    window.addEventListener('mousemove', e => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 15;
        orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
    });
  }
};

// ──────────────────────────────────────────────
// CONTACT FORM
// ──────────────────────────────────────────────
const CONTACT = {
  init() {
    document.getElementById('contactForm').addEventListener('submit', e => {
      e.preventDefault();
      const btn = e.target.querySelector('.btn-primary');
      btn.querySelector('span').textContent = 'Отправка...';
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.querySelector('span').textContent = 'Отправить заявку';
        btn.style.opacity = '';
        e.target.reset();
        const success = document.getElementById('formSuccess');
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      }, 1500);
    });
  }
};

// ──────────────────────────────────────────────
// SMOOTH SCROLL
// ──────────────────────────────────────────────
const SMOOTH = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

// ──────────────────────────────────────────────
// MAGNETIC BUTTONS
// ──────────────────────────────────────────────
const MAGNETIC = {
  init() {
    document.querySelectorAll('.btn-primary, .btn-ghost, .auth-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect   = btn.getBoundingClientRect();
        const dx     = e.clientX - (rect.left + rect.width  / 2);
        const dy     = e.clientY - (rect.top  + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
};

// ──────────────────────────────────────────────
// CARD TILT EFFECT
// ──────────────────────────────────────────────
const TILT = {
  init() {
    document.querySelectorAll('.prog-card, .trainer-card, .price-card, .review-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
        card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
};

// ──────────────────────────────────────────────
// TICKER SPEED ON HOVER
// ──────────────────────────────────────────────
const TICKER = {
  init() {
    const track = document.querySelector('.ticker-track');
    if (!track) return;
    const wrap = track.parentElement;
    wrap.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    wrap.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }
};

// ──────────────────────────────────────────────
// PAGE LOAD ANIMATION
// ──────────────────────────────────────────────
const LOADER = {
  init() {
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
      document.body.style.transition = 'opacity 0.6s ease';
      document.body.style.opacity    = '1';
    });
  }
};

// ──────────────────────────────────────────────
// INIT ALL
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  LOADER.init();
  AUTH.init();
  CURSOR.init();
  NAVBAR.init();
  REVEAL.init();
  COUNTERS.init();
  RINGS.init();
  HERO_ANIM.init();
  PARALLAX.init();
  CONTACT.init();
  SMOOTH.init();
  MAGNETIC.init();
  TILT.init();
  TICKER.init();

  // Number targets for hero
  document.querySelectorAll('.num-val[data-target]').forEach(el => {
    el.dataset.target = el.dataset.target;
  });
});