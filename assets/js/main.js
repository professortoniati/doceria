/* ============================================================
   DELICIAS DA MARY — main.js
   Lazy Loading + Scroll Reveal + Interações
   ============================================================ */

'use strict';

/* ─── 1. Scroll Reveal (IntersectionObserver) ──────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ─── 2. Lazy Loading de Imagens ───────────────────────────── */
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.classList.add('lazy-img');

      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = img.dataset.src;
        img.classList.remove('lazy-img');
        img.classList.add('loaded');
        img.removeAttribute('data-src');
      };
      tempImg.onerror = () => {
        img.src = img.dataset.src; // fallback
        img.classList.remove('lazy-img');
      };
      tempImg.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
}, { rootMargin: '200px' });

lazyImages.forEach(img => imageObserver.observe(img));


/* ─── 3. Header — scroll effect ────────────────────────────── */
const header = document.getElementById('header');
const backToTop = document.querySelector('.back-to-top');

const onScroll = () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  if (window.scrollY > 400) {
    backToTop?.classList.add('visible');
  } else {
    backToTop?.classList.remove('visible');
  }
};

window.addEventListener('scroll', onScroll, { passive: true });


/* ─── 4. Back to top ────────────────────────────────────────── */
backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ─── 5. Hamburger / Mobile Nav ─────────────────────────────── */
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

mobileNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});


/* ─── 6. Menu Cardápio — Tabs ───────────────────────────────── */
const tabs      = document.querySelectorAll('.menu-tab');
const products  = document.querySelectorAll('.product-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const category = tab.dataset.category;

    // Animate out and in
    products.forEach(card => {
      const cardCat = card.dataset.category;
      if (category === 'all' || cardCat === category) {
        card.classList.add('show');
        // Trigger reveal re-animation
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 50);
      } else {
        card.classList.remove('show');
      }
    });
  });
});

// Show all on load
products.forEach(card => card.classList.add('show', 'visible'));


/* ─── 7. Formulário → WhatsApp ──────────────────────────────── */
const form = document.getElementById('contact-form');

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome    = document.getElementById('nome')?.value.trim() || '';
  const tel     = document.getElementById('telefone')?.value.trim() || '';
  const produto = document.getElementById('produto')?.value || '';
  const msg     = document.getElementById('mensagem')?.value.trim() || '';

  if (!nome || !tel) {
    showToast('\u26A0\uFE0F Preencha ao menos nome e telefone!', 'warning');
    return;
  }

  const produtoLabel = document.getElementById('produto')?.selectedOptions[0]?.text || produto;

  // Emojis via \u{XXXXX} — escape Unicode nativo do JS, independente de encoding
  const linhas = [
    '\u{1F36B} *NOVO PEDIDO \u2014 Delicias da Mary* \u{1F36B}',
    '',
    '\u{1F464} *Nome:* ' + nome,
    '\u{1F4F1} *Telefone:* ' + tel,
    '\u{1F382} *Produto de interesse:* ' + produtoLabel,
    msg ? ('\u{1F4AC} *Mensagem:* ' + msg) : '',
    '',
    '\u2728 Pedido enviado pelo site!'
  ];

  const texto     = linhas.filter(Boolean).join('\n');
  const wppNumber = '5511967317980';
  const url       = 'https://wa.me/' + wppNumber + '?text=' + encodeURIComponent(texto);

  window.open(url, '_blank');
  form.reset();
  showToast('\u2705 Redirecionando para o WhatsApp!', 'success');
});


/* ─── 8. Toast Notification ─────────────────────────────────── */
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast-notify');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notify';
    toast.style.cssText = `
      position:fixed; bottom:100px; left:50%; transform:translateX(-50%) translateY(20px);
      background:${type === 'success' ? '#22C55E' : '#F59E0B'};
      color:#fff; padding:14px 28px; border-radius:50px; font-weight:700; font-size:.95rem;
      box-shadow:0 8px 30px rgba(0,0,0,.2); z-index:9999;
      opacity:0; transition:all .35s ease; white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = type === 'success' ? '#22C55E' : '#F59E0B';
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3500);
}


/* ─── 9. Botões "Pedir Agora" nos produtos ──────────────────── */
document.querySelectorAll('.product-btn[data-produto]').forEach(btn => {
  btn.addEventListener('click', () => {
    const produto  = btn.dataset.produto;
    const preco    = btn.dataset.preco;
    const wppNum   = '5511967317980';

    const linhas = [
      '\u{1F382} *Ol\u00E1! Quero fazer um pedido!* \u{1F36B}',
      '',
      '\u{1F4CC} *Produto:* ' + produto,
      preco ? ('\u{1F4B0} *Valor:* R$ ' + preco) : '',
      '',
      '\u{1F4F2} Pedido via site da Delicias da Mary \u2764\uFE0F'
    ];

    const texto = linhas.filter(Boolean).join('\n');
    const url   = 'https://wa.me/' + wppNum + '?text=' + encodeURIComponent(texto);
    window.open(url, '_blank');
  });
});


/* ─── 10. Smooth active nav link highlight on scroll ────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}`
          ? 'var(--gold)' : '';
      });
    }
  });
}, { threshold: 0.5 });

sections.forEach(sec => navObserver.observe(sec));


/* ─── 11. Counter animation ─────────────────────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const isFloat = target % 1 !== 0;
  const duration = 1800;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = eased * target;
    el.textContent = isFloat ? current.toFixed(1) : Math.round(current).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));


/* ─── 12. Parallax sutil no Hero ───────────────────────────── */
const heroBlobs = document.querySelectorAll('.hero-blob');
if (heroBlobs.length) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroBlobs.forEach((blob, i) => {
      const speed = 0.2 + (i * 0.1);
      blob.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }, { passive: true });
}


/* ─── 13. Staggered card animations ─────────────────────────── */
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.reveal');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 100);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stagger-parent').forEach(el => staggerObserver.observe(el));
