import { gsap } from 'gsap';

// --- Data ---
const certs = [
    { title: "Smart Interviews DSA", issuer: "Smart Interviews", link: "https://smartinterviews.in/certificate/6ad14a6a" },
    { title: "AWS - Cloud Foundations", issuer: "AWS / Credly", link: "https://www.credly.com/badges/d2c96036-f5b7-40d7-9fed-708a7e790711/public_url" },
    { title: "Google AI-ML Virtual Internship", issuer: "Google", link: "https://drive.google.com/file/d/1sLfxmw6amIsOVbzuzL-YO4zDjC4V_gUw/view?usp=drive_link" },
    { title: "Machine Learning Specialization", issuer: "Coursera", link: "https://coursera.org/share/60886494a687319f0f105beb6eb857a9" },
    { title: "TensorFlow Developer", issuer: "Coursera", link: "https://coursera.org/share/30dc399ec624159944a40e3aabab5385" },
    { title: "Getting Started as a Business Analyst", issuer: "LinkedIn", link: "https://www.linkedin.com/learning/certificates/2c89ea08d4744c27da2fa2a708c14ab83df7540878c606336162c6e8eab78708?trk=share_certificate" },
    { title: "Become A Data Analyst", issuer: "LinkedIn", link: "https://www.linkedin.com/learning/certificates/300cfb84809431e91ee57c783acf939afca8fa8712c7c06771b7511b468727b5?trk=share_certificate" }
];
const SCROLL_NAV_TARGET_KEY = 'portfolio-scroll-nav-target';
const SCROLL_NAV_LOCK_MS = 650;
const SCROLL_BOUNDARY_ARM_MS = 500;
const SCROLL_INTENT_DELTA = 24;
const homeDragState = {
    active: false,
    suppressUntil: 0
};
const pageTransitionState = {
    scrollLockUntil: 0
};

function renderCertifications() {
    const board = document.getElementById('certifications-puzzle');
    const status = document.getElementById('certifications-status');
    if (!board || !status) return;

    const shuffle = (items) => {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const escapeHtml = (value) => value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const wrapTitle = (title, maxChars = 18, maxLines = 3) => {
        const words = title.split(' ');
        const lines = [];
        let current = '';

        words.forEach((word) => {
            const next = current ? `${current} ${word}` : word;
            if (next.length <= maxChars || lines.length === maxLines - 1) {
                current = next;
                return;
            }

            if (current) lines.push(current);
            current = word;
        });

        if (current) lines.push(current);
        return lines.slice(0, maxLines);
    };

    const midpoint = (a, b) => ({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    });

    const lerpPoint = (a, b, t) => ({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
    });

    const createRegularPolygon = (count, radius, rotation = -Math.PI / 2) => (
        Array.from({ length: count }, (_, index) => {
            const angle = rotation + (index * Math.PI * 2) / count;
            return {
                x: 50 + radius * Math.cos(angle),
                y: 50 + radius * Math.sin(angle)
            };
        })
    );

    const toPointString = (points) => (
        points.map(({ x, y }) => `${x.toFixed(3)}% ${y.toFixed(3)}%`).join(', ')
    );

    const revealed = new Set();
    const shuffledCerts = shuffle(certs);
    const outerPoints = createRegularPolygon(shuffledCerts.length, 46);
    const innerPoints = createRegularPolygon(shuffledCerts.length, 16);
    const hubPoints = toPointString(innerPoints);
    const segmentThemes = [
        {
            top: 'rgba(255, 177, 145, 0.18)',
            bottom: 'rgba(255, 140, 92, 0.06)',
            border: 'rgba(255, 188, 160, 0.34)'
        },
        {
            top: 'rgba(255, 224, 166, 0.18)',
            bottom: 'rgba(255, 194, 92, 0.06)',
            border: 'rgba(247, 221, 170, 0.34)'
        },
        {
            top: 'rgba(167, 240, 228, 0.18)',
            bottom: 'rgba(72, 214, 188, 0.06)',
            border: 'rgba(173, 242, 231, 0.34)'
        },
        {
            top: 'rgba(177, 219, 255, 0.18)',
            bottom: 'rgba(99, 180, 255, 0.06)',
            border: 'rgba(186, 224, 255, 0.34)'
        },
        {
            top: 'rgba(222, 209, 255, 0.18)',
            bottom: 'rgba(177, 147, 255, 0.06)',
            border: 'rgba(226, 214, 255, 0.34)'
        }
    ];

    const renderBoard = () => {
        board.innerHTML = '';
        status.textContent = `${revealed.size} / ${shuffledCerts.length} unlocked`;

        shuffledCerts.forEach((cert, index) => {
            const nextIndex = (index + 1) % shuffledCerts.length;
            const clipPoints = [
                outerPoints[index],
                outerPoints[nextIndex],
                innerPoints[nextIndex],
                innerPoints[index]
            ];
            const innerMid = midpoint(innerPoints[index], innerPoints[nextIndex]);
            const outerMid = midpoint(outerPoints[index], outerPoints[nextIndex]);
            const contentPoint = lerpPoint(innerMid, outerMid, 0.6);
            const theme = segmentThemes[index % segmentThemes.length];
            const segment = document.createElement('div');

            segment.className = 'cert-segment';
            segment.style.clipPath = `polygon(${toPointString(clipPoints)})`;
            segment.style.setProperty('--segment-top', theme.top);
            segment.style.setProperty('--segment-bottom', theme.bottom);
            segment.style.setProperty('--segment-border', theme.border);
            segment.style.setProperty('--content-x', `${contentPoint.x.toFixed(3)}%`);
            segment.style.setProperty('--content-y', `${contentPoint.y.toFixed(3)}%`);

            if (revealed.has(index)) {
                segment.classList.add('is-revealed');
                const titleHtml = wrapTitle(cert.title)
                    .map((line) => escapeHtml(line))
                    .join('<br>');

                segment.innerHTML = `
                    <div class="cert-segment__content">
                        <div class="cert-segment__title">${titleHtml}</div>
                        <div class="cert-segment__issuer">${escapeHtml(cert.issuer)}</div>
                        <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="cert-segment__verify">Verify</a>
                    </div>
                `;
            } else {
                segment.tabIndex = 0;
                segment.setAttribute('role', 'button');
                segment.setAttribute('aria-label', `Reveal hidden certification ${index + 1}`);

                const reveal = () => {
                    if (revealed.has(index)) return;
                    revealed.add(index);
                    renderBoard();
                };

                segment.addEventListener('click', reveal);
                segment.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        reveal();
                    }
                });
            }

            board.appendChild(segment);
        });

        const hub = document.createElement('div');
        const allRevealed = revealed.size === shuffledCerts.length;
        hub.className = `cert-puzzle-hub${allRevealed ? ' is-complete' : ''}`;
        hub.style.setProperty('--hub-points', hubPoints);
        hub.innerHTML = allRevealed
            ? `
                <div class="cert-puzzle-hub__content">
                    <div class="cert-puzzle-hub__eyebrow">Completed</div>
                    <div class="cert-puzzle-hub__title">All Certifications Unlocked</div>
                    <div class="cert-puzzle-hub__meta">Every credential on the board is now revealed.</div>
                </div>
            `
            : `
                <div class="cert-puzzle-hub__content">
                    <div class="cert-puzzle-hub__eyebrow">Try Your Luck</div>
                    <div class="cert-puzzle-hub__title">${revealed.size} / ${shuffledCerts.length} Unlocked</div>
                    <div class="cert-puzzle-hub__meta">Pick a segment and reveal the certification behind it.</div>
                </div>
            `;

        board.appendChild(hub);
    };

    renderBoard();
}

// --- Initialization ---
const init = () => {
    initPageEntryScrollState();
    initContactModal();
    renderCertifications();
    initAnimations();
    initMagneticText();
    initHeroBackground();
    initHomeDraggables();
    initEducationDots();
    initActiveNav();
    initGlobalScrollNav();
    initParallax();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function getNormalizedPath(pathname = window.location.pathname) {
    const cleaned = pathname.replace(/\/+$/, '');
    if (cleaned === '' || cleaned === '/' || cleaned.endsWith('/index.html')) return '/';

    const pageMatch = cleaned.match(/\/(about|projects|education|skills|certifications)\.html$/);
    if (pageMatch) {
        return `/${pageMatch[1]}.html`;
    }

    const lastSegment = cleaned.split('/').filter(Boolean).pop() ?? '';
    if (lastSegment && !lastSegment.includes('.')) {
        return '/';
    }

    return cleaned;
}

function toPageHref(path) {
    return path === '/' ? './' : `.${path}`;
}

function getNormalizedHref(href) {
    if (!href || href.startsWith('#')) return href;

    try {
        return getNormalizedPath(new URL(href, window.location.href).pathname);
    } catch {
        return href;
    }
}

function isPageScrollLocked() {
    return Date.now() < pageTransitionState.scrollLockUntil;
}

function markScrollNavigationTarget(path) {
    try {
        sessionStorage.setItem(SCROLL_NAV_TARGET_KEY, JSON.stringify({
            path,
            timestamp: Date.now()
        }));
    } catch {
        // Ignore storage issues and allow navigation to continue.
    }
}

function consumeScrollNavigationTarget() {
    try {
        const saved = sessionStorage.getItem(SCROLL_NAV_TARGET_KEY);
        if (!saved) return null;

        sessionStorage.removeItem(SCROLL_NAV_TARGET_KEY);
        const parsed = JSON.parse(saved);

        if (!parsed?.path || typeof parsed.timestamp !== 'number') {
            return null;
        }

        return parsed;
    } catch {
        sessionStorage.removeItem(SCROLL_NAV_TARGET_KEY);
        return null;
    }
}

function initPageEntryScrollState() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const target = consumeScrollNavigationTarget();
    const currentPath = getNormalizedPath();

    if (!target || target.path !== currentPath || Date.now() - target.timestamp > 5000) {
        return;
    }

    const resetScrollPosition = () => window.scrollTo(0, 0);
    pageTransitionState.scrollLockUntil = Date.now() + SCROLL_NAV_LOCK_MS;
    homeDragState.suppressUntil = Math.max(homeDragState.suppressUntil, pageTransitionState.scrollLockUntil);

    resetScrollPosition();
    requestAnimationFrame(resetScrollPosition);
    setTimeout(resetScrollPosition, 120);

    const preventMomentumScroll = (event) => {
        if (!isPageScrollLocked()) return;
        event.preventDefault();
        resetScrollPosition();
    };

    window.addEventListener('wheel', preventMomentumScroll, { passive: false });
    window.addEventListener('touchmove', preventMomentumScroll, { passive: false });
}

// --- Animations ---
function initAnimations() {
    // 1. Reveal page headers and static reveal elements
    gsap.to('.reveal', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
    });

    // 2. Gravity effect for certification cards (independent of .reveal)
    gsap.to('.bento-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
        delay: 0.4,
        startAt: { y: 100, scale: 0.9, opacity: 0 }
    });
}

// --- Magnetic Text ---
function initMagneticText() {
    const magneticElements = document.querySelectorAll('.magnetic-text');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const currentX = gsap.getProperty(el, "x") || 0;
            const currentY = gsap.getProperty(el, "y") || 0;
            const rect = el.getBoundingClientRect();
            
            const originalLeft = rect.left - currentX;
            const originalTop = rect.top - currentY;
            
            const x = clientX - (originalLeft + rect.width / 2);
            const y = clientY - (originalTop + rect.height / 2);

            // Follows the mouse extremely closely, allowing it to be dragged across the screen
            gsap.to(el, {
                x: x * 0.9,
                y: y * 0.9,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 1,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}
// --- Parallax Effect ---
function initParallax() {
    const rocket = document.querySelector('.floating-rocket');
    const planet = document.querySelector('.myth-planet');
    
    if (document.querySelector('[data-home-draggable]')) return;
    if (!rocket && !planet) return;

    window.addEventListener('mousemove', (e) => {
        // Calculate offset from the center of the screen
        const xOffset = e.clientX - window.innerWidth / 2;
        const yOffset = e.clientY - window.innerHeight / 2;
        
        // Move the rocket
        if (rocket) {
            gsap.to(rocket, {
                marginLeft: xOffset * 1.5,
                marginTop: yOffset * 1.5,
                duration: 1.5,
                ease: 'power2.out'
            });
        }
        
        // Move the saturn planet
        if (planet) {
            gsap.to(planet, {
                marginLeft: xOffset * -0.5,
                marginTop: yOffset * -0.5,
                duration: 2,
                ease: 'power2.out'
            });
        }
    });
}

function initHomeDraggables() {
    const playables = document.querySelectorAll('[data-home-draggable]');
    const hero = document.querySelector('.hero');
    if (!playables.length || !hero) return;

    let topLayer = 10;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    playables.forEach(el => {
        let drag = null;

        const endDrag = (pointerId) => {
            if (!drag || (pointerId !== undefined && drag.pointerId !== pointerId)) return;

            const moved = drag.moved;
            drag = null;
            homeDragState.active = false;
            if (moved) {
                homeDragState.suppressUntil = Date.now() + 250;
            }
            el.classList.remove('is-dragging');

            gsap.to(el, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        };

        el.addEventListener('pointerdown', e => {
            if (e.button !== undefined && e.button !== 0) return;

            e.preventDefault();

            const heroRect = hero.getBoundingClientRect();
            const rect = el.getBoundingClientRect();
            const currentX = Number(gsap.getProperty(el, 'x')) || 0;
            const currentY = Number(gsap.getProperty(el, 'y')) || 0;
            const baseLeft = rect.left - currentX;
            const baseTop = rect.top - currentY;
            const padding = 12;

            drag = {
                pointerId: e.pointerId,
                startPointerX: e.clientX,
                startPointerY: e.clientY,
                startX: currentX,
                startY: currentY,
                minX: Math.min(heroRect.left + padding - baseLeft, heroRect.right - padding - baseLeft - rect.width),
                maxX: Math.max(heroRect.left + padding - baseLeft, heroRect.right - padding - baseLeft - rect.width),
                minY: Math.min(heroRect.top + padding - baseTop, heroRect.bottom - padding - baseTop - rect.height),
                maxY: Math.max(heroRect.top + padding - baseTop, heroRect.bottom - padding - baseTop - rect.height),
                moved: false
            };

            homeDragState.active = true;
            el.classList.add('is-dragging');
            el.style.zIndex = String(++topLayer);
            el.setPointerCapture?.(e.pointerId);

            gsap.to(el, {
                scale: 1.03,
                duration: 0.15,
                ease: 'power2.out',
                overwrite: true
            });
        });

        window.addEventListener('pointermove', e => {
            if (!drag || drag.pointerId !== e.pointerId) return;

            const deltaX = e.clientX - drag.startPointerX;
            const deltaY = e.clientY - drag.startPointerY;
            const nextX = clamp(drag.startX + deltaX, drag.minX, drag.maxX);
            const nextY = clamp(drag.startY + deltaY, drag.minY, drag.maxY);

            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                drag.moved = true;
            }

            gsap.set(el, { x: nextX, y: nextY });
        });

        window.addEventListener('pointerup', e => endDrag(e.pointerId));
        window.addEventListener('pointercancel', e => endDrag(e.pointerId));

        el.addEventListener('dblclick', () => {
            homeDragState.active = false;
            homeDragState.suppressUntil = Date.now() + 250;
            el.classList.remove('is-dragging');
            gsap.to(el, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.45,
                ease: 'power2.out'
            });
        });
    });
}

function initEducationDots() {
    const items = document.querySelectorAll('.education-item');
    if (!items.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    items.forEach((item, index) => {
        const dot = item.querySelector('.education-dot');
        if (!dot) return;

        if (!prefersReducedMotion) {
            gsap.fromTo(dot, {
                opacity: 0,
                scale: 0.82
            }, {
                opacity: 1,
                scale: 1,
                duration: 0.45,
                delay: index * 0.08,
                ease: 'power2.out',
                overwrite: true
            });
        }

        if (!supportsHover || prefersReducedMotion) return;

        item.addEventListener('mouseenter', () => {
            gsap.to(dot, {
                scale: 1.08,
                duration: 0.24,
                ease: 'power2.out',
                overwrite: true
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(dot, {
                scale: 1,
                duration: 0.32,
                ease: 'power2.out',
                overwrite: true
            });
        });
    });
}

// --- Hero Background (Canvas Particles) ---
function initHeroBackground() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    const resize = () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();
    // Initial delay to wait for layout
    setTimeout(resize, 100);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5; // Smaller stars
            this.vx = (Math.random() - 0.5) * 0.2; // Slower drift
            this.vy = (Math.random() - 0.5) * 0.2;
            this.twinkleSpeed = Math.random() * 0.05 + 0.01;
            this.alpha = Math.random();
            this.color = `rgba(255, 255, 255, ${this.alpha})`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Twinkle effect
            this.alpha += this.twinkleSpeed;
            if (this.alpha > 1 || this.alpha < 0.2) this.twinkleSpeed *= -1;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.fill();
            
            // Subtle glow for larger stars
            if (this.size > 1.2) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'var(--accent-primary)';
            } else {
                ctx.shadowBlur = 0;
            }
        }
    }

    for (let i = 0; i < 150; i++) { // More stars
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

// --- Navbar Active State ---
function initActiveNav() {
    const path = getNormalizedPath();
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        const href = getNormalizedHref(link.getAttribute('href'));
        if (href === path) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// --- Global Scroll Navigation ---
function initGlobalScrollNav() {
    const pages = [
        '/',
        '/about.html',
        '/projects.html',
        '/education.html',
        '/skills.html',
        '/certifications.html'
    ];
    
    let currentPath = getNormalizedPath();
    
    const currentIndex = pages.indexOf(currentPath);
    if (currentIndex === -1) return;
    
    let isNavigating = false;
    let boundaryState = {
        side: null,
        timestamp: 0
    };

    const getBoundaryState = () => {
        const atBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 5;
        const atTop = window.scrollY <= 5;

        if (atBottom) return 'bottom';
        if (atTop) return 'top';
        return null;
    };

    const syncBoundaryState = () => {
        const side = getBoundaryState();
        if (!side) {
            boundaryState = { side: null, timestamp: 0 };
            return;
        }

        if (boundaryState.side !== side) {
            boundaryState = {
                side,
                timestamp: Date.now()
            };
        }
    };

    const isBoundaryArmed = (side) => (
        boundaryState.side === side && Date.now() - boundaryState.timestamp <= SCROLL_BOUNDARY_ARM_MS
    );

    const navigateTo = (path) => {
        isNavigating = true;
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s ease';
        markScrollNavigationTarget(path);
        setTimeout(() => window.location.href = toPageHref(path), 400);
    };

    syncBoundaryState();
    window.addEventListener('scroll', syncBoundaryState, { passive: true });
    window.addEventListener('resize', syncBoundaryState);
    
    window.addEventListener('wheel', (e) => {
        if (isPageScrollLocked()) return;
        if (homeDragState.active || Date.now() < homeDragState.suppressUntil) return;
        if (isNavigating) return;
        
        const delta = e.deltaY;

        if (delta > SCROLL_INTENT_DELTA && isBoundaryArmed('bottom')) {
            const nextPage = pages[(currentIndex + 1) % pages.length];
            navigateTo(nextPage);
        } else if (delta < -SCROLL_INTENT_DELTA && isBoundaryArmed('top') && currentIndex > 0) {
            const previousPage = pages[currentIndex - 1];
            navigateTo(previousPage);
        }
    }, { passive: true });

    let touchstartY = 0;
    window.addEventListener('touchstart', e => {
        touchstartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    window.addEventListener('touchend', e => {
        if (isPageScrollLocked()) return;
        if (homeDragState.active || Date.now() < homeDragState.suppressUntil) return;
        if (isNavigating) return;
        
        const touchendY = e.changedTouches[0].screenY;
        const dist = touchstartY - touchendY;
        
        if (dist > 50 && isBoundaryArmed('bottom')) { // Swipe up
            const nextPage = pages[(currentIndex + 1) % pages.length];
            navigateTo(nextPage);
        } else if (dist < -50 && isBoundaryArmed('top') && currentIndex > 0) { // Swipe down
            const previousPage = pages[currentIndex - 1];
            navigateTo(previousPage);
        }
    }, { passive: true });
}

// --- Custom Cursor ---
function initCustomCursor() {
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    const cursorGlow = document.createElement('div');
    
    cursorDot.classList.add('cursor-dot');
    cursorOutline.classList.add('cursor-outline');
    cursorGlow.classList.add('cursor-glow');
    
    document.body.appendChild(cursorGlow);
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);
    
    let isMoving = false;
    let timeout;
    
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards", easing: "ease-out" });
        
        cursorGlow.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 1200, fill: "forwards", easing: "ease-out" });
        
        isMoving = true;
        cursorOutline.style.opacity = '1';
        cursorGlow.style.opacity = '1';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            isMoving = false;
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorGlow.style.opacity = '0';
        }, 150);
    });
    
    window.addEventListener('mouseout', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
        cursorGlow.style.opacity = '0';
    });
    
    window.addEventListener('mouseover', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
    
    document.querySelectorAll('a, button, .magnetic-text, .bento-card, .social-link').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.borderColor = 'transparent';
            cursorOutline.style.background = 'rgba(167, 139, 250, 0.4)'; // Violet accent
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(2)';
            
            // Generate some particle trails just for visual flair when interacting
            for(let i=0; i<3; i++) {
                createTrailPixel(el.getBoundingClientRect());
            }
        });
        
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.borderColor = 'rgba(167, 139, 250, 0.7)';
            cursorOutline.style.background = 'transparent';
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
}

function createTrailPixel(rect) {
    const pixel = document.createElement('div');
    pixel.className = 'cursor-trail';
    
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    
    const colors = ['#6366f1', '#a78bfa', '#f472b6']; // Indigo, Violet, Pink
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    pixel.style.left = `${x}px`;
    pixel.style.top = `${y}px`;
    pixel.style.background = color;
    
    document.body.appendChild(pixel);
    
    gsap.to(pixel, {
        y: y - 50 - Math.random() * 50,
        x: x + (Math.random() - 0.5) * 50,
        opacity: 0,
        scale: 0,
        duration: 0.5 + Math.random() * 0.5,
        ease: 'power1.out',
        onComplete: () => pixel.remove()
    });
}

// --- Contact Modal ---
function initContactModal() {
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreorjvk';

    const modalHTML = `
        <div class="modal-overlay" id="contact-modal">
            <div class="modal-content">
                <button class="close-btn" id="close-modal">&times;</button>
                <div class="section-header" style="margin-bottom: 20px;">
                    <h2 style="font-size: 2rem;">Let's Build Something Thoughtful</h2>
                </div>
                <form id="popup-contact-form" action="${FORMSPREE_ENDPOINT}" method="POST">
                    <div class="form-group">
                        <label for="popup-name">Name</label>
                        <input type="text" id="popup-name" name="name" placeholder="Your name" required>
                    </div>
                    <div class="form-group">
                        <label for="popup-email">Email</label>
                        <input type="email" id="popup-email" name="email" placeholder="you@example.com" required>
                    </div>
                    <div class="form-group">
                        <label for="popup-topic">Project / Topic</label>
                        <input type="text" id="popup-topic" name="topic" placeholder="Frontend build, AI tool, collaboration..." required>
                    </div>
                    <div class="form-group">
                        <label for="popup-message">Message</label>
                        <textarea id="popup-message" name="message" rows="4" placeholder="Tell me what you're building and where you want help." required></textarea>
                    </div>
                    <button type="submit" id="popup-submit-btn" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span class="btn-text">Send Message</span>
                        <div class="loader" style="display: none; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    </button>
                </form>
                <div id="popup-form-status" style="display: none; text-align: center; margin-top: 20px;">
                    <div class="glass-pill contact-modal__status-pill contact-modal__status-pill--success">
                        Submission sent successfully.
                    </div>
                </div>
                <div id="popup-form-error" class="contact-modal__error" hidden>
                    <div class="glass-pill contact-modal__status-pill contact-modal__status-pill--error">
                        The form service did not confirm delivery. Please try again in a moment.
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('close-modal');
    
    const contactLinks = document.querySelectorAll('[data-contact-modal]');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            resetContactUi();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    const form = document.getElementById('popup-contact-form');
    const submitBtn = document.getElementById('popup-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const status = document.getElementById('popup-form-status');
    const errorStatus = document.getElementById('popup-form-error');

    const resetContactUi = () => {
        form.reset();
        form.style.display = 'block';
        form.style.opacity = '1';
        form.style.transform = 'none';
        status.style.display = 'none';
        errorStatus.hidden = true;
        submitBtn.disabled = false;
        btnText.textContent = 'Send Message';
        loader.style.display = 'none';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        loader.style.display = 'block';
        
        const formData = new FormData(form);
        errorStatus.hidden = true;
        
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                gsap.to(form, { opacity: 0, scale: 0.9, duration: 0.5, onComplete: () => {
                    form.style.display = 'none';
                    status.style.display = 'block';
                    gsap.fromTo(status, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' });
                }});
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error('Contact form submission failed:', error);
            errorStatus.hidden = false;
            submitBtn.disabled = false;
            btnText.textContent = 'Send Message';
            loader.style.display = 'none';
        }
    });

    resetContactUi();
}
