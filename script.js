document.addEventListener('DOMContentLoaded', () => {
  // Register service worker for PWA support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Reveal-on-scroll
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Topbar scroll effect
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const onScroll = () => {
      topbar.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile hamburger menu — robust implementation
  const nav = document.querySelector('.nav');
  if (topbar && nav) {
    // Only create toggle if not already present
    let toggle = topbar.querySelector('.nav-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.setAttribute('aria-label', 'Menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('type', 'button');
      toggle.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';
      topbar.appendChild(toggle);
    }

    const openIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';
    const closeIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>';

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = openIcon;
    }

    function openMenu() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.innerHTML = closeIcon;
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on any nav link click
    nav.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link')) {
        closeMenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !topbar.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  // Language switcher with flags — inject into nav
  const currentPath = window.location.pathname;
  const isEn = currentPath.includes('/en/');
  const isAr = currentPath.includes('/ar/');
  const isFr = !isEn && !isAr; // root = French

  const sitePrefix = (isEn || isAr) ? '../' : './';

  // Determine current page name
  const pathParts = currentPath.split('/');
  const currentPage = pathParts[pathParts.length - 1] || 'index.html';
  const pageName = currentPage === '' ? 'index.html' : currentPage;

  // Build language URLs for current page
  const frUrl = isFr ? pageName : `${sitePrefix}${pageName}`;
  const enUrl = isEn ? pageName : `${sitePrefix}en/${pageName}`;
  const arUrl = isAr ? pageName : `${sitePrefix}ar/${pageName}`;

  // Replace existing language links with flag-based switcher
  if (nav) {
    // Remove old EN/FR/AR text links
    nav.querySelectorAll('.nav-link').forEach((link) => {
      const text = link.textContent.trim();
      if (text === 'EN' || text === 'FR' || text === 'AR') {
        link.remove();
      }
    });

    // Create flag switcher container
    const langSwitcher = document.createElement('div');
    langSwitcher.className = 'lang-switcher';
    langSwitcher.innerHTML = `
      <a href="${frUrl}" class="lang-flag ${isFr ? 'is-active' : ''}" title="Français" aria-label="Français">🇫🇷</a>
      <a href="${enUrl}" class="lang-flag ${isEn ? 'is-active' : ''}" title="English" aria-label="English">🇬🇧</a>
      <a href="${arUrl}" class="lang-flag ${isAr ? 'is-active' : ''}" title="العربية" aria-label="العربية">🇩🇿</a>
    `;
    nav.appendChild(langSwitcher);
  }

  // Auto-generate footer
  const footer = document.querySelector('.site-footer');
  if (!footer) {
    const footerEl = document.createElement('footer');
    footerEl.className = 'site-shell footer site-footer';

    const isRtl = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
    const termsLabel = isRtl ? 'الشروط' : (isFr ? 'Conditions' : 'Terms');
    const privacyLabel = isRtl ? 'الخصوصية' : (isFr ? 'Confidentialité' : 'Privacy');
    const contactLabel = isRtl ? 'تواصل' : 'Contact';
    const tagline = isRtl
      ? 'عروض المتاجر المحلية في الجزائر'
      : (isFr ? 'Offres locales en Algérie — moins de gaspillage, plus d\'économies.' : 'Local store deals for Algeria — reduce waste, save money.');

    footerEl.innerHTML = `
      <div class="footer-brand"><strong>Waloo</strong><span>${tagline}</span></div>
      <div class="footer-links">
        <a href="${sitePrefix}terms.html">${termsLabel}</a>
        <a href="${sitePrefix}privacy.html">${privacyLabel}</a>
        <a href="${sitePrefix}contact.html">${contactLabel}</a>
      </div>
    `;
    document.body.appendChild(footerEl);
  }
});
