/**
 * ================================================================
 * STACEY LANDING PAGE - MAIN SCRIPTS
 * ================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    loadComponents();

    // Floating bar scroll behavior
    let lastScrollY = window.scrollY;
    const floatingBar = document.getElementById('floating-bar');

    window.addEventListener('scroll', () => {
        if (!floatingBar) return;

        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            floatingBar.classList.add('hide');
        } else {
            floatingBar.classList.remove('hide');
        }

        lastScrollY = window.scrollY;
    });
});

/**
 * LOAD COMPONENTS
 */
async function loadComponents() {
    console.log("🚀 loadComponents started");

    const components = [
        'navbar',
        'hero',
        'about',
        'gallery',
        'links',
        'features',
        'testimonials',
        'cta',
        'footer',
        'floating-bar',
        'chat-popup'
    ];

    // Load floating bar first
    const floatingBarEl = document.getElementById('floating-bar');

    if (floatingBarEl) {
        try {
            const resp = await fetch(`components/floating-bar.html`);
            if (resp.ok) {
                floatingBarEl.innerHTML = await resp.text();
                floatingBarEl.style.willChange = 'transform, opacity';
                floatingBarEl.style.transform = 'translateZ(0)';
            }
        } catch (err) {
            console.warn("Floating bar failed", err);
        }
    }

    const remaining = components.filter(c => c !== 'floating-bar');

    await Promise.all(
        remaining.map(async (component) => {
            const el = document.getElementById(component);
            if (!el) return;

            try {
                let fileName = component;
                if (component === 'links') fileName = 'main-links';

                const res = await fetch(`components/${fileName}.html`);
                if (!res.ok) {
                    console.warn(`Missing component: ${fileName}`);
                    return;
                }

                el.innerHTML = await res.text();

            } catch (err) {
                console.warn(`Error loading ${component}`, err);
            }
        })
    );

    // Init core modules AFTER DOM injection
    initNav();
    initGallery();
    initAnalytics();

    // Chat boot (safe + bounded)
    bootChat();

    initScrollReveal();
}

/**
 * CHAT BOOT LOADER (FIXED)
 */
function bootChat() {
    let tries = 0;

    const wait = () => {
        const ready = document.getElementById("chatBubble");

        if (ready && typeof initChatPopup === "function") {
            initChatPopup();
            return;
        }

        if (tries++ > 120) return;

        setTimeout(wait, 50);
    };

    wait();
}

/**
 * SCROLL REVEAL
 */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-reveal')
        .forEach(el => observer.observe(el));
}

/**
 * NAV
 */
function initNav() {
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.style.opacity = '1';
            mobileMenu.style.pointerEvents = 'auto';
            document.body.classList.add('menu-open');
        });
    }

    if (closeMenuBtn && mobileMenu) {
        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.style.opacity = '0';
            mobileMenu.style.pointerEvents = 'none';
            document.body.classList.remove('menu-open');
        });
    }

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (!mobileMenu) return;
            mobileMenu.style.opacity = '0';
            mobileMenu.style.pointerEvents = 'none';
            document.body.classList.remove('menu-open');
        });
    });
}

/**
 * GALLERY
 */
function initGallery() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.getElementById('closeLightbox');

    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('#gallery img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    });

    const close = () => {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
        lightboxImg.classList.remove('zoomed');
    };

    closeLightbox?.addEventListener('click', close);

    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) close();
    });

    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxImg.classList.toggle('zoomed');
    });
}

/**
 * ANALYTICS
 */
function initAnalytics() {
    const els = document.querySelectorAll('[data-analytics]');

    els.forEach(el => {
        if (el.dataset.bound === "1") return;
        el.dataset.bound = "1";

        el.addEventListener('click', () => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'button_click', {
                button_name: el.dataset.analytics
            });
        });
    });
}