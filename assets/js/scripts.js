/**
 * ================================================================
 * STACEY LANDING PAGE - MAIN SCRIPTS
 * ================================================================
 * This file handles:
 * 1. Component Loading (Injecting HTML into the page)
 * 2. Navigation & Mobile Menu
 * 3. Lightbox / Image Zoom
 * 4. Scroll Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE COMPONENTS
    // Components loaded via fetch.
    loadComponents();



    // 2. SCROLL REVEAL ANIMATION
    // Makes elements fade and slide up when they come into view
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15
    });

    // Start observing elements with the 'scroll-reveal' class
    // (Note: We use a small delay because components load dynamically)
    setTimeout(() => {

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            revealObserver.observe(el);
        });
        
        // Initialize Gallery listeners after components load
        initGallery();
        // Initialize Nav listeners after components load
        initNav();
        // 4. ANALYTICS (GA4) - attach click listeners to tracked elements
        initAnalytics();
    }, 500);

    // 3. FLOATING BAR SCROLL BEHAVIOR

    // Hides the floating bar when scrolling down, shows when scrolling up
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
 * LOADS HTML COMPONENTS
 * Finds all divs with an ID in the main file and tries to load 
 * a matching .html file from the 'components/' folder.
 */
async function loadComponents() {
    const components = [
        'navbar',
        'hero',
        'about',
        'gallery',
        'links',
        'footer',
        'floating-bar'
    ];

    // Load floating bar first to keep it visible on initial render.
    const floatingBarEl = document.getElementById('floating-bar');
    if (floatingBarEl) {
        try {
            // Fetch + inject without blocking other component work.
            const floatingBarFile = 'floating-bar';
            const resp = await fetch(`components/${floatingBarFile}.html`);
            if (resp.ok) {
                const html = await resp.text();
                floatingBarEl.innerHTML = html;

                // Lightweight paint/perf hint after insertion.
                // (No visual change; only helps browsers keep transforms smooth.)
                floatingBarEl.style.willChange = 'transform, opacity';
                floatingBarEl.style.transform = 'translateZ(0)';
            }
        } catch (error) {
            console.warn('Could not load component: floating-bar', error);
        }
    }

    // Load remaining components in parallel.
    const remaining = components.filter((c) => c !== 'floating-bar');

    await Promise.all(
        remaining.map(async (component) => {
            const element = document.getElementById(component);
            if (!element) return;

            try {
                // Determine file name
                const fileName = component === 'links' ? 'main-links' : component;
                const response = await fetch(`components/${fileName}.html`);

                if (response.ok) {
                    const html = await response.text();
                    element.innerHTML = html;
                }
            } catch (error) {
                console.warn(`Could not load component: ${component}`, error);
            }
        })
    );
}


/**
 * NAVIGATION & MOBILE MENU
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
    
    // Close menu when clicking a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.style.opacity = '0';
                mobileMenu.style.pointerEvents = 'none';
                document.body.classList.remove('menu-open');
            }
        });
    });
}

/**
 * GALLERY LIGHTBOX
 */
function initAnalytics() {
    // GA4-friendly analytics event wiring.
    // Attaches a single click handler to every element with [data-analytics].
    // Resilient to missing elements/components loaded later.
    const trackedEls = Array.from(document.querySelectorAll('[data-analytics]'));

    trackedEls.forEach((el) => {
        if (el.dataset.analyticsBound === '1') return;
        el.dataset.analyticsBound = '1';

        el.addEventListener('click', () => {
            if (typeof gtag !== 'function') return;
            const name = el.dataset.analytics;
            if (!name) return;

            // Use consistent event name for generic button-like clicks.
            gtag('event', 'button_click', {
                button_name: name
            });
        });
    });

    // Lightbox open + zoom tracking (separate from generic click wiring)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.getElementById('closeLightbox');

    if (lightbox && !lightbox.dataset.analyticsBound) {
        lightbox.dataset.analyticsBound = '1';

        // Track when the lightbox is shown by the existing gallery logic.
        const observer = new MutationObserver(() => {
            if (lightbox.classList.contains('hidden')) return;
            if (typeof gtag !== 'function') return;
            gtag('event', 'lightbox_open');
            observer.disconnect();
        });
        observer.observe(lightbox, { attributes: true, attributeFilter: ['class'] });

    }

    if (closeLightbox && !closeLightbox.dataset.analyticsBound) {
        closeLightbox.dataset.analyticsBound = '1';
        closeLightbox.addEventListener('click', () => {
            if (typeof gtag !== 'function') return;
            gtag('event', 'lightbox_close');
        });
    }

    if (lightboxImg && !lightboxImg.dataset.analyticsBound) {
        lightboxImg.dataset.analyticsBound = '1';
        lightboxImg.addEventListener('click', () => {
            if (typeof gtag !== 'function') return;
            // This event fires after the existing click handler toggles `.zoomed`.
            gtag('event', 'lightbox_zoom', {
                zoom_state: lightboxImg.classList.contains('zoomed') ? 'zoomed' : 'unzoomed'
            });
        });

    }
}

function initGallery() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.getElementById('closeLightbox');

    if (!lightbox || !lightboxImg) return;


    // Find all images in the gallery
    const galleryImages = document.querySelectorAll('#gallery img');
    
    galleryImages.forEach(img => {
        img.classList.add('cursor-zoom-in');
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    const closeAction = () => {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
        lightboxImg.classList.remove('zoomed');
    };

    if (closeLightbox) closeLightbox.addEventListener('click', closeAction);
    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) closeAction();
    });

    // Zoom image on click
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxImg.classList.toggle('zoomed');
    });
}
