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
        'navbar', 'hero', 'about', 'gallery', 'links', 'footer', 'floating-bar'
    ];

    for (const component of components) {
        const element = document.getElementById(component);
        if (element) {
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
        }
    }
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
