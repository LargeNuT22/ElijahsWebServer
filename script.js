// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);

        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Announcement banner - driven entirely by banner-config.js
document.addEventListener('DOMContentLoaded', function() {
    const cfg = window.SITE_BANNER;
    if (!cfg || !cfg.enabled || !cfg.text) return;

    const storageKey = 'bannerDismissed:' + (cfg.id || 'default');
    let dismissedBefore = false;
    try {
        dismissedBefore = cfg.dismissible !== false && localStorage.getItem(storageKey) === '1';
    } catch (err) { /* private browsing - just show the banner */ }
    if (dismissedBefore) return;

    function setBannerHeight(h) {
        document.documentElement.style.setProperty('--banner-h', h + 'px');
        document.body.classList.toggle('has-banner', h > 0);
    }

    const banner = document.createElement('div');
    banner.className = 'site-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Announcement');

    const inner = document.createElement('div');
    inner.className = 'site-banner-inner';

    const text = document.createElement('span');
    text.className = 'site-banner-text';
    text.textContent = cfg.text;
    inner.appendChild(text);

    if (cfg.link && cfg.linkText) {
        const cta = document.createElement('a');
        cta.className = 'site-banner-link';
        cta.href = cfg.link;
        cta.textContent = cfg.linkText;
        inner.appendChild(cta);
    }

    banner.appendChild(inner);

    if (cfg.dismissible !== false) {
        const close = document.createElement('button');
        close.className = 'site-banner-close';
        close.innerHTML = '&times;';
        close.setAttribute('aria-label', 'Dismiss announcement');
        close.addEventListener('click', function() {
            try { localStorage.setItem(storageKey, '1'); } catch (err) { /* ignore */ }
            banner.remove();
            setBannerHeight(0);
        });
        banner.appendChild(close);
    }

    document.body.prepend(banner);

    // The banner is fixed above the navbar; push the fixed navbar and page
    // content down by its real rendered height (text can wrap on mobile).
    function measure() {
        if (document.body.contains(banner)) {
            setBannerHeight(banner.offsetHeight);
        }
    }
    measure();

    let resizeTimer = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, 150);
    });
});

// Keep the footer copyright year current
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-year]').forEach(function(el) {
        el.textContent = new Date().getFullYear();
    });
});

// Navbar scrolled state - deepens the glass once the page moves
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;
    function updateNavbar() {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });

    updateNavbar();
});

// Smooth Scrolling for Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// EmailJS Configuration — public key is safe to expose; sending is scoped to this service/template.
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'kJ3glqFmsLWc65O4m',
    SERVICE_ID: 'service_9ai692h',
    TEMPLATE_ID: 'template_sinq4jx'
};

// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate form first
            if (!validateForm(contactForm)) {
                return;
            }

            // Gather form fields
            const formData = new FormData(contactForm);
            const templateParams = {};
            for (const [key, value] of formData.entries()) {
                templateParams[key] = value;
            }

            // Honeypot — bots fill the hidden "company" field; pretend it worked and drop it
            if (templateParams.company) {
                showFormSuccess();
                contactForm.reset();
                return;
            }
            delete templateParams.company;

            templateParams.to_email = 'divinitygym@hotmail.com';
            templateParams.reply_to = templateParams.email;
            templateParams.timestamp = new Date().toLocaleString();

            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            if (typeof emailjs !== 'undefined') {
                emailjs.send(
                    EMAILJS_CONFIG.SERVICE_ID,
                    EMAILJS_CONFIG.TEMPLATE_ID,
                    templateParams
                )
                .then(function() {
                    showFormSuccess();
                    contactForm.reset();
                })
                .catch(function(error) {
                    console.log('Contact form error:', error);
                    showFormError('Failed to send message. Please try again or contact us directly.');
                })
                .finally(function() {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                });
            } else {
                showFormError('Email service not available. Please contact us directly.');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});

function showFormBanner(className, html, timeoutMs) {
    const form = document.getElementById('contactForm');
    const existing = form.parentNode.querySelector('.form-banner');
    if (existing) {
        existing.remove();
    }

    const banner = document.createElement('div');
    banner.className = 'form-banner ' + className;
    banner.innerHTML = html;
    form.parentNode.insertBefore(banner, form);

    setTimeout(() => {
        banner.remove();
    }, timeoutMs);
}

function showFormSuccess() {
    showFormBanner('success', '<strong>Thank you!</strong> Your message has been sent successfully. Elijah will get back to you within 24 hours.', 5000);
}

function showFormError(errorMessage) {
    showFormBanner('error', '<strong>Error:</strong> ' + errorMessage, 7000);
}

// Scroll reveal - cards and sections rise in with a soft stagger
document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealSelectors = [
        '.section-title', '.team-intro',
        '.team-member', '.feature-card', '.gym-image',
        '.reviews-summary', '.reviews-slider', '.reviews-cta',
        '.local-area-content',
        '.program-card', '.package-card', '.credential-card',
        '.faq-item', '.contact-item', '.consultation-cta',
        '.about-text', '.philosophy-content',
        '.contact-form-section', '.contact-info-section',
        '.cta h2', '.cta p', '.cta .btn'
    ];

    const elements = document.querySelectorAll(revealSelectors.join(', '));

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        return; // Elements stay fully visible without the .reveal class
    }

    // Stagger siblings that share a parent (grid rows animate in sequence)
    const parentCounts = new Map();
    elements.forEach(element => {
        const parent = element.parentNode;
        const index = parentCounts.get(parent) || 0;
        parentCounts.set(parent, index + 1);
        element.classList.add('reveal');
        element.style.setProperty('--rd', Math.min(index * 90, 450) + 'ms');
    });

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(element => observer.observe(element));
});

// Form Validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });

    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }
    }

    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;

    field.style.borderColor = '#dc2626';
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '';
}

// Phone number formatting (optional enhancement)
document.addEventListener('DOMContentLoaded', function() {
    const phoneField = document.querySelector('input[type="tel"]');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
            }
            e.target.value = value;
        });
    }
});

// Back to top button
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');

    document.body.appendChild(backToTopButton);

    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Reviews slider - scroll-snap track with arrows, dots and gentle auto-advance
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.reviews-track');
    if (!track) return;

    const prev = document.querySelector('.reviews-prev');
    const next = document.querySelector('.reviews-next');
    const dotsWrap = document.querySelector('.reviews-dots');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let autoTimer = null;
    let userInteracted = false;

    function step() {
        const card = track.querySelector('.review-card');
        if (!card) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.getBoundingClientRect().width + gap;
    }

    function maxScroll() {
        return track.scrollWidth - track.clientWidth;
    }

    function positionCount() {
        return Math.round(maxScroll() / step()) + 1;
    }

    function currentPosition() {
        if (track.scrollLeft >= maxScroll() - 4) return positionCount() - 1;
        return Math.min(Math.round(track.scrollLeft / step()), positionCount() - 1);
    }

    const cards = Array.from(track.querySelectorAll('.review-card'));
    let tweenId = null;

    function cancelTween() {
        if (tweenId) {
            cancelAnimationFrame(tweenId);
            tweenId = null;
            track.style.scrollSnapType = '';
        }
    }

    // Native smooth scrolling fights mandatory scroll-snap in Chrome, so animate
    // scrollLeft ourselves with snap suspended, then restore it on the exact offset.
    function goTo(index) {
        const i = Math.max(0, Math.min(index, cards.length - 1));
        const card = cards[i];
        const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const contentX = card.offsetLeft - track.offsetLeft;
        const centered = getComputedStyle(card).scrollSnapAlign.indexOf('center') !== -1;
        let target = centered
            ? contentX - (track.clientWidth - card.getBoundingClientRect().width) / 2
            : contentX - padLeft;
        target = Math.max(0, Math.min(target, maxScroll()));

        cancelTween();

        if (prefersReducedMotion) {
            track.scrollLeft = target;
            return;
        }

        const from = track.scrollLeft;
        const delta = target - from;
        if (Math.abs(delta) < 1) return;

        const duration = 480;
        const start = performance.now();
        track.style.scrollSnapType = 'none';

        function frame(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            track.scrollLeft = from + delta * eased;
            if (p < 1) {
                tweenId = requestAnimationFrame(frame);
            } else {
                tweenId = null;
                track.scrollLeft = target;
                track.style.scrollSnapType = '';
            }
        }

        tweenId = requestAnimationFrame(frame);
    }

    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        for (let i = 0; i < positionCount(); i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
            dot.addEventListener('click', function() {
                userInteracted = true;
                stopAuto();
                goTo(i);
            });
            dotsWrap.appendChild(dot);
        }
        updateUI();
    }

    function updateUI() {
        const pos = currentPosition();
        if (dotsWrap) {
            Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('active', i === pos));
        }
        if (prev) prev.toggleAttribute('disabled', track.scrollLeft <= 4);
        if (next) next.toggleAttribute('disabled', track.scrollLeft >= maxScroll() - 4);
    }

    function stopAuto() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    let sliderVisible = false;

    function startAuto() {
        if (prefersReducedMotion || userInteracted || autoTimer || !sliderVisible) return;
        autoTimer = setInterval(function() {
            if (track.scrollLeft >= maxScroll() - 4) {
                goTo(0);
            } else {
                goTo(currentPosition() + 1);
            }
        }, 7000);
    }

    // Only auto-advance while the slider is actually on screen
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function(entries) {
            sliderVisible = entries[0].isIntersecting;
            if (sliderVisible) {
                startAuto();
            } else {
                stopAuto();
            }
        }, { threshold: 0.4 }).observe(track);
    } else {
        sliderVisible = true;
    }

    if (prev) prev.addEventListener('click', function() { userInteracted = true; stopAuto(); goTo(currentPosition() - 1); });
    if (next) next.addEventListener('click', function() { userInteracted = true; stopAuto(); goTo(currentPosition() + 1); });

    // Any manual touch/drag halts the auto-advance and any running tween
    track.addEventListener('pointerdown', function() { userInteracted = true; stopAuto(); cancelTween(); }, { passive: true });
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    let scrollTick = false;
    track.addEventListener('scroll', function() {
        if (!scrollTick) {
            window.requestAnimationFrame(function() {
                updateUI();
                scrollTick = false;
            });
            scrollTick = true;
        }
    }, { passive: true });

    let resizeTimer = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildDots, 200);
    });

    buildDots();
    startAuto();
});

// Slideshow Functionality
let currentSlideIndex = 0;
let slides = [];
let indicators = [];
let slideTimer = null;

const SLIDE_INTERVAL = 6000;

function goToSlide(newIndex) {
    if (slides.length === 0) return;

    slides[currentSlideIndex].classList.remove('active');
    if (indicators[currentSlideIndex]) {
        indicators[currentSlideIndex].classList.remove('active');
    }

    currentSlideIndex = ((newIndex % slides.length) + slides.length) % slides.length;

    slides[currentSlideIndex].classList.add('active');
    if (indicators[currentSlideIndex]) {
        indicators[currentSlideIndex].classList.add('active');
    }
}

function restartSlideTimer() {
    if (slideTimer) {
        clearInterval(slideTimer);
    }
    if (slides.length > 1) {
        slideTimer = setInterval(() => goToSlide(currentSlideIndex + 1), SLIDE_INTERVAL);
    }
}

// Change slide (called from the arrow buttons' inline onclick)
function changeSlide(direction) {
    goToSlide(currentSlideIndex + direction);
    restartSlideTimer();
}

// Go to specific slide (called from the indicators' inline onclick)
function currentSlide(slideNumber) {
    goToSlide(slideNumber - 1);
    restartSlideTimer();
}

// Initialize slideshow when page loads
document.addEventListener('DOMContentLoaded', function() {
    slides = Array.from(document.querySelectorAll('.slide'));
    indicators = Array.from(document.querySelectorAll('.indicator'));

    if (slides.length === 0) return;

    restartSlideTimer();

    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        // Pause while the visitor is looking closely, resume when they leave
        slideshowContainer.addEventListener('mouseenter', function() {
            if (slideTimer) {
                clearInterval(slideTimer);
                slideTimer = null;
            }
        });

        slideshowContainer.addEventListener('mouseleave', restartSlideTimer);

        // Touch/swipe support for mobile
        let startX = 0;

        slideshowContainer.addEventListener('touchstart', function(e) {
            startX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshowContainer.addEventListener('touchend', function(e) {
            const difference = startX - e.changedTouches[0].screenX;
            const swipeThreshold = 50;

            if (Math.abs(difference) > swipeThreshold) {
                changeSlide(difference > 0 ? 1 : -1);
            }
        }, { passive: true });
    }
});
