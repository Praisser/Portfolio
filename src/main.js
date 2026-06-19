// ============================================================
// SINGLE ORIGIN — interaction layer (no framework)
// roast toggle · mobile menu · bloom/drawdown/pour reveals ·
// roast-curve draw · active nav · cross-page scroll nav ·
// cursor drip · order-ticket contact modal
// ============================================================

const ROAST_KEY = 'so-roast';
const PAGES = ['/', '/about.html', '/projects.html', '/education.html', '/skills.html', '/certifications.html'];
const SCROLL_NAV_TARGET_KEY = 'so-scroll-nav-target';
const SCROLL_NAV_LOCK_MS = 650;
const SCROLL_BOUNDARY_ARM_MS = 500;
const SCROLL_INTENT_DELTA = 24;

const pageTransitionState = { scrollLockUntil: 0 };

const init = () => {
    initPageEntryScrollState();
    initRoastToggle();
    initMobileMenu();
    initActiveNav();
    initScrollMotion();
    initGlobalScrollNav();
    initCursorDrip();
    initContactModal();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ---- Path helpers ----------------------------------------
function getNormalizedPath(pathname = window.location.pathname) {
    const cleaned = pathname.replace(/\/+$/, '');
    if (cleaned === '' || cleaned === '/' || cleaned.endsWith('/index.html')) return '/';

    const pageMatch = cleaned.match(/\/(about|projects|education|skills|certifications)\.html$/);
    if (pageMatch) return `/${pageMatch[1]}.html`;

    const lastSegment = cleaned.split('/').filter(Boolean).pop() ?? '';
    if (lastSegment && !lastSegment.includes('.')) return '/';
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

// ---- Roast toggle (light / dark) -------------------------
function initRoastToggle() {
    const toggle = document.querySelector('[data-roast-toggle]');
    if (!toggle) return;

    const flip = () => {
        const root = document.documentElement;
        const next = root.dataset.roast === 'dark' ? 'light' : 'dark';
        root.dataset.roast = next;
        try { localStorage.setItem(ROAST_KEY, next); } catch { /* ignore */ }
    };

    toggle.addEventListener('click', flip);
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
}

// ---- Mobile menu -----------------------------------------
function initMobileMenu() {
    const burger = document.querySelector('[data-menu-toggle]');
    const links = document.getElementById('so-navlinks');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
        links.dataset.open = links.dataset.open === 'true' ? 'false' : 'true';
    });

    links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => { links.dataset.open = 'false'; });
    });
}

// ---- Active nav by path ----------------------------------
function initActiveNav() {
    const path = getNormalizedPath();
    document.querySelectorAll('#so-navlinks a').forEach((link) => {
        const href = getNormalizedHref(link.getAttribute('href'));
        link.classList.toggle('active', href === path);
    });
}

// ---- Scroll motion: bloom / drawdown / pour / draw -------
function initScrollMotion() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = document.querySelectorAll('[data-reveal]');
    const pours = document.querySelectorAll('[data-pour]');
    const draws = document.querySelectorAll('[data-draw]');

    draws.forEach((el) => {
        try {
            const len = el.getTotalLength();
            el.style.strokeDasharray = len;
            el.style.strokeDashoffset = reduce ? 0 : len;
            el.style.transition = 'stroke-dashoffset 1.6s ease-out';
        } catch { /* not an SVG path */ }
    });

    if (reduce) {
        reveals.forEach((el) => el.classList.add('is-in'));
        pours.forEach((el) => el.classList.add('is-in'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.hasAttribute('data-draw')) {
                el.style.strokeDashoffset = '0';
            } else {
                el.classList.add('is-in');
            }
            io.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach((el) => io.observe(el));
    pours.forEach((el) => io.observe(el));
    draws.forEach((el) => io.observe(el));
}

// ---- Cross-page scroll navigation ------------------------
function isPageScrollLocked() {
    return Date.now() < pageTransitionState.scrollLockUntil;
}

function markScrollNavigationTarget(path) {
    try {
        sessionStorage.setItem(SCROLL_NAV_TARGET_KEY, JSON.stringify({ path, timestamp: Date.now() }));
    } catch { /* ignore */ }
}

function consumeScrollNavigationTarget() {
    try {
        const saved = sessionStorage.getItem(SCROLL_NAV_TARGET_KEY);
        if (!saved) return null;
        sessionStorage.removeItem(SCROLL_NAV_TARGET_KEY);
        const parsed = JSON.parse(saved);
        if (!parsed?.path || typeof parsed.timestamp !== 'number') return null;
        return parsed;
    } catch {
        sessionStorage.removeItem(SCROLL_NAV_TARGET_KEY);
        return null;
    }
}

function initPageEntryScrollState() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const target = consumeScrollNavigationTarget();
    const currentPath = getNormalizedPath();
    if (!target || target.path !== currentPath || Date.now() - target.timestamp > 5000) return;

    const resetScroll = () => window.scrollTo(0, 0);
    pageTransitionState.scrollLockUntil = Date.now() + SCROLL_NAV_LOCK_MS;
    resetScroll();
    requestAnimationFrame(resetScroll);
    setTimeout(resetScroll, 120);

    const block = (event) => {
        if (!isPageScrollLocked()) return;
        event.preventDefault();
        resetScroll();
    };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
}

function initGlobalScrollNav() {
    const currentIndex = PAGES.indexOf(getNormalizedPath());
    if (currentIndex === -1) return;

    let isNavigating = false;
    let boundaryState = { side: null, timestamp: 0 };

    const getBoundaryState = () => {
        const atBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 5;
        const atTop = window.scrollY <= 5;
        if (atBottom) return 'bottom';
        if (atTop) return 'top';
        return null;
    };

    const syncBoundaryState = () => {
        const side = getBoundaryState();
        if (!side) { boundaryState = { side: null, timestamp: 0 }; return; }
        if (boundaryState.side !== side) boundaryState = { side, timestamp: Date.now() };
    };

    const isBoundaryArmed = (side) => (
        boundaryState.side === side && Date.now() - boundaryState.timestamp <= SCROLL_BOUNDARY_ARM_MS
    );

    const navigateTo = (path) => {
        isNavigating = true;
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity = '0';
        markScrollNavigationTarget(path);
        setTimeout(() => { window.location.href = toPageHref(path); }, 400);
    };

    syncBoundaryState();
    window.addEventListener('scroll', syncBoundaryState, { passive: true });
    window.addEventListener('resize', syncBoundaryState);

    window.addEventListener('wheel', (e) => {
        if (isPageScrollLocked() || isNavigating) return;
        if (e.deltaY > SCROLL_INTENT_DELTA && isBoundaryArmed('bottom')) {
            navigateTo(PAGES[(currentIndex + 1) % PAGES.length]);
        } else if (e.deltaY < -SCROLL_INTENT_DELTA && isBoundaryArmed('top') && currentIndex > 0) {
            navigateTo(PAGES[currentIndex - 1]);
        }
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => { touchStartY = e.changedTouches[0].screenY; }, { passive: true });
    window.addEventListener('touchend', (e) => {
        if (isPageScrollLocked() || isNavigating) return;
        const dist = touchStartY - e.changedTouches[0].screenY;
        if (dist > 50 && isBoundaryArmed('bottom')) {
            navigateTo(PAGES[(currentIndex + 1) % PAGES.length]);
        } else if (dist < -50 && isBoundaryArmed('top') && currentIndex > 0) {
            navigateTo(PAGES[currentIndex - 1]);
        }
    }, { passive: true });
}

// ---- Cursor drip trail (desktop pointers only) -----------
function initCursorDrip() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;

    const dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;left:-40px;top:-40px;width:7px;height:7px;border-radius:50%;background:var(--accent);pointer-events:none;z-index:60;transform:translate(-50%,-50%);opacity:0;transition:opacity .4s;';
    const drip = document.createElement('div');
    drip.style.cssText = 'position:fixed;left:-40px;top:-40px;width:5px;height:8px;border-radius:50% 50% 50% 50% / 38% 38% 62% 62%;background:var(--bloom);pointer-events:none;z-index:59;transform:translate(-50%,-50%);opacity:0;transition:opacity .5s;';
    document.body.appendChild(dot);
    document.body.appendChild(drip);

    let mx = -40, my = -40, dx = -40, dy = -40, rx = -40, ry = -40, on = false;
    window.addEventListener('mousemove', (ev) => {
        mx = ev.clientX; my = ev.clientY;
        if (!on) { on = true; dot.style.opacity = '0.9'; drip.style.opacity = '0.5'; }
    });
    document.addEventListener('mouseleave', () => {
        on = false; dot.style.opacity = '0'; drip.style.opacity = '0';
    });

    const tick = () => {
        dx += (mx - dx) * 0.4; dy += (my - dy) * 0.4;
        rx += (dx - rx) * 0.13; ry += (dy - ry) * 0.13;
        dot.style.left = `${dx}px`; dot.style.top = `${dy}px`;
        drip.style.left = `${rx}px`; drip.style.top = `${ry + 5}px`;
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

// ---- Contact modal — "Place an Order" receipt ------------
function initContactModal() {
    const CONTACT_EMAIL = 'mhmmdwasifahmed@gmail.com';
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreorjvk';

    const buildMailto = ({ name = '', email = '', message = '' } = {}) => {
        const subject = encodeURIComponent(`Order ticket — ${name || 'new order'}`);
        const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` · ${email}` : ''}`);
        return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    };

    const modalHTML = `
        <div class="so-modal-overlay" id="contact-modal" aria-hidden="true">
            <div class="so-ticket" role="dialog" aria-modal="true" aria-label="Place an order">
                <button class="so-ticket-close" id="so-modal-close" aria-label="Close">&times;</button>
                <div class="so-ticket-perf"></div>
                <div class="so-ticket-body">
                    <div class="so-ticket-head"><span>Order&nbsp;Ticket</span><span class="muted">No.&nbsp;0042</span></div>
                    <div class="so-ticket-sub">Single&nbsp;Origin&nbsp;Counter&nbsp;·&nbsp;Open&nbsp;daily</div>
                    <div class="so-ticket-items">
                        <div><span>01 · Coffee chat</span><span class="muted">Free</span></div>
                        <div><span>01 · Code review</span><span class="muted">Free</span></div>
                        <div><span>01 · A new role</span><span class="open">Open</span></div>
                    </div>
                    <form class="so-ticket-form" id="order-form" action="${FORMSPREE_ENDPOINT}" method="POST">
                        <div class="so-field">
                            <label for="o-name">Name</label>
                            <input id="o-name" type="text" name="name" placeholder="Your name" required>
                        </div>
                        <div class="so-field">
                            <label for="o-email">Email</label>
                            <input id="o-email" type="email" name="email" placeholder="you@domain.com" required>
                        </div>
                        <div class="so-field">
                            <label for="o-message">Message</label>
                            <textarea id="o-message" name="message" rows="3" placeholder="What are we brewing?" required></textarea>
                        </div>
                        <button type="submit" class="so-send-btn" id="order-submit">
                            <span class="btn-text">Send&nbsp;It&nbsp;Through&nbsp;↗</span>
                            <span class="so-ticket-loader" style="display:none;"></span>
                        </button>
                    </form>
                    <div class="so-ticket-status so-ticket-status--ok" id="order-ok" hidden>
                        Order received. If you don't hear back, email me directly.
                    </div>
                    <div class="so-ticket-status so-ticket-status--err" id="order-err" hidden>
                        Counter didn't confirm — <a id="order-mailto" href="mailto:${CONTACT_EMAIL}" style="color:inherit;">email me directly</a>.
                    </div>
                    <div class="so-ticket-foot">Thank&nbsp;you&nbsp;·&nbsp;Replies&nbsp;within&nbsp;one&nbsp;brew&nbsp;cycle</div>
                </div>
                <div class="so-ticket-perf"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('so-modal-close');
    const form = document.getElementById('order-form');
    const submitBtn = document.getElementById('order-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.so-ticket-loader');
    const okStatus = document.getElementById('order-ok');
    const errStatus = document.getElementById('order-err');
    const mailtoLink = document.getElementById('order-mailto');

    const resetUi = () => {
        form.reset();
        form.style.display = 'flex';
        okStatus.hidden = true;
        errStatus.hidden = true;
        submitBtn.disabled = false;
        btnText.textContent = 'Send It Through ↗';
        loader.style.display = 'none';
        mailtoLink.href = `mailto:${CONTACT_EMAIL}`;
    };

    const openModal = (e) => {
        if (e) e.preventDefault();
        resetUi();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-contact-modal]').forEach((link) => link.addEventListener('click', openModal));
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        btnText.textContent = 'Pouring…';
        loader.style.display = 'block';
        errStatus.hidden = true;

        const formData = new FormData(form);
        mailtoLink.href = buildMailto({
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        });

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to send');
            form.style.display = 'none';
            okStatus.hidden = false;
        } catch (error) {
            console.error('Order submission failed:', error);
            errStatus.hidden = false;
            submitBtn.disabled = false;
            btnText.textContent = 'Send It Through ↗';
            loader.style.display = 'none';
        }
    });
}
