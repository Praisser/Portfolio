const canvas = document.getElementById('skills-canvas');
const overlay = document.getElementById('skills-overlay');
const overlayTitle = document.getElementById('skills-overlay-title');
const overlayCopy = document.getElementById('skills-overlay-copy');
const overlayClose = document.getElementById('skills-overlay-close');

if (canvas && overlay && overlayTitle && overlayCopy && overlayClose) {
    const ctx = canvas.getContext('2d');
    const cards = document.querySelectorAll('[data-skills-category]');
    let width = 0;
    let height = 0;
    let bubbles = [];
    let currentCategory = null;
    let mouse = { x: null, y: null };

    const bubbleThemes = [
        {
            bodyTop: 'rgba(255, 180, 150, 0.18)',
            bodyBottom: 'rgba(255, 140, 92, 0.08)',
            rim: 'rgba(255, 188, 160, 0.66)',
            innerRim: 'rgba(255, 255, 255, 0.11)',
            haze: 'rgba(255, 248, 244, 0.08)',
            glow: 'rgba(255, 140, 92, 0.1)'
        },
        {
            bodyTop: 'rgba(255, 222, 152, 0.18)',
            bodyBottom: 'rgba(255, 198, 92, 0.08)',
            rim: 'rgba(244, 216, 158, 0.64)',
            innerRim: 'rgba(255, 255, 255, 0.1)',
            haze: 'rgba(255, 251, 238, 0.08)',
            glow: 'rgba(255, 190, 92, 0.1)'
        },
        {
            bodyTop: 'rgba(150, 238, 222, 0.18)',
            bodyBottom: 'rgba(72, 214, 188, 0.08)',
            rim: 'rgba(150, 238, 222, 0.62)',
            innerRim: 'rgba(255, 255, 255, 0.1)',
            haze: 'rgba(241, 255, 252, 0.08)',
            glow: 'rgba(72, 214, 188, 0.1)'
        },
        {
            bodyTop: 'rgba(170, 214, 255, 0.18)',
            bodyBottom: 'rgba(99, 180, 255, 0.08)',
            rim: 'rgba(171, 215, 255, 0.64)',
            innerRim: 'rgba(255, 255, 255, 0.11)',
            haze: 'rgba(242, 248, 255, 0.08)',
            glow: 'rgba(99, 180, 255, 0.1)'
        },
        {
            bodyTop: 'rgba(255, 192, 212, 0.18)',
            bodyBottom: 'rgba(255, 126, 163, 0.08)',
            rim: 'rgba(255, 196, 214, 0.64)',
            innerRim: 'rgba(255, 255, 255, 0.1)',
            haze: 'rgba(255, 245, 249, 0.08)',
            glow: 'rgba(255, 126, 163, 0.1)'
        },
        {
            bodyTop: 'rgba(214, 246, 168, 0.18)',
            bodyBottom: 'rgba(173, 227, 97, 0.08)',
            rim: 'rgba(214, 246, 168, 0.62)',
            innerRim: 'rgba(255, 255, 255, 0.1)',
            haze: 'rgba(249, 255, 242, 0.08)',
            glow: 'rgba(173, 227, 97, 0.1)'
        },
        {
            bodyTop: 'rgba(215, 198, 255, 0.18)',
            bodyBottom: 'rgba(177, 147, 255, 0.08)',
            rim: 'rgba(221, 205, 255, 0.62)',
            innerRim: 'rgba(255, 255, 255, 0.11)',
            haze: 'rgba(248, 244, 255, 0.08)',
            glow: 'rgba(177, 147, 255, 0.1)'
        }
    ];

    const categories = {
        'Focus Areas': ['AI Tooling', 'Automation', 'Product UI', 'Distributed Systems'],
        'Languages': ['Python', 'TypeScript', 'JavaScript', 'Rust', 'Java', 'C++'],
        'Frontend': ['React', 'Next.js', 'Svelte', 'HTML', 'CSS', 'GSAP'],
        'Backend & Data': ['Node.js', 'Express', 'SQL', 'MongoDB', 'REST APIs', 'Data Workflows'],
        'Tools & Platforms': ['Git', 'Docker', 'Tauri', 'Vite', 'PyQt5', 'Linux']
    };

    const categoryCopy = Object.fromEntries(
        [...cards].map((card) => {
            const name = card.dataset.skillsCategory;
            const copy = card.querySelector('.skills-card-copy')?.textContent?.trim() || '';
            return [name, copy];
        })
    );

    const resize = () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    };

    const getThemeForSkill = (text, index) => {
        const hash = [...text].reduce((total, char) => total + char.charCodeAt(0), 0);
        return bubbleThemes[(hash + index * 3) % bubbleThemes.length];
    };

    class Bubble {
        constructor(text, index) {
            this.text = text;
            this.radius = text.length * 4 + 16;
            this.x = Math.random() * (width - this.radius * 2) + this.radius;
            this.y = Math.random() * (height - this.radius * 2) + this.radius;
            this.vx = (Math.random() - 0.5) * 1.6;
            this.vy = (Math.random() - 0.5) * 1.6;

            const theme = getThemeForSkill(text, index);
            this.bodyTop = theme.bodyTop;
            this.bodyBottom = theme.bodyBottom;
            this.rimColor = theme.rim;
            this.innerRimColor = theme.innerRim;
            this.hazeColor = theme.haze;
            this.glowColor = theme.glow;
        }

        update(pointer) {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < this.radius || this.x > width - this.radius) this.vx *= -1;
            if (this.y < this.radius || this.y > height - this.radius) this.vy *= -1;

            if (pointer.x !== null && pointer.y !== null) {
                const dx = this.x - pointer.x;
                const dy = this.y - pointer.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 160) {
                    const angle = Math.atan2(dy, dx);
                    const force = (160 - dist) / 160;
                    this.vx += Math.cos(angle) * force * 0.42;
                    this.vy += Math.sin(angle) * force * 0.42;
                }
            }

            this.vx *= 0.99;
            this.vy *= 0.99;

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 4.4) {
                this.vx = (this.vx / speed) * 4.4;
                this.vy = (this.vy / speed) * 4.4;
            }
        }

        draw() {
            const bodyGradient = ctx.createLinearGradient(
                this.x - this.radius,
                this.y - this.radius,
                this.x + this.radius,
                this.y + this.radius
            );
            bodyGradient.addColorStop(0, this.bodyTop);
            bodyGradient.addColorStop(1, this.bodyBottom);

            const hazeGradient = ctx.createRadialGradient(
                this.x - this.radius * 0.18,
                this.y - this.radius * 0.14,
                this.radius * 0.1,
                this.x,
                this.y,
                this.radius * 0.92
            );
            hazeGradient.addColorStop(0, this.hazeColor);
            hazeGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = bodyGradient;
            ctx.strokeStyle = this.rimColor;
            ctx.lineWidth = 1.9;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.glowColor;
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - 1.8, 0, Math.PI * 2);
            ctx.fillStyle = hazeGradient;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - 2.4, 0, Math.PI * 2);
            ctx.strokeStyle = this.innerRimColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = 'white';
            ctx.font = '500 14px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
        }
    }

    const initBubbles = (skillList) => {
        bubbles = [];
        skillList.forEach((skill, index) => {
            bubbles.push(new Bubble(skill, index));
        });
    };

    const clearBubbles = () => {
        bubbles = [];
        mouse = { x: null, y: null };
        ctx.clearRect(0, 0, width, height);
    };

    const setActiveCard = (activeCategory) => {
        cards.forEach((card) => {
            const name = card.dataset.skillsCategory;
            card.classList.toggle('is-selected', name === activeCategory);
        });
    };

    const openOverlay = (categoryName) => {
        if (!categories[categoryName]) return;

        currentCategory = categoryName;
        overlayTitle.textContent = categoryName;
        overlayCopy.textContent = categoryCopy[categoryName] || '';
        setActiveCard(categoryName);
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            resize();
            initBubbles(categories[categoryName]);
        });
    };

    const closeOverlay = () => {
        currentCategory = null;
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setActiveCard(null);
        clearBubbles();
    };

    const applyCategory = (categoryName) => {
        if (currentCategory === categoryName && overlay.classList.contains('active')) {
            closeOverlay();
            return;
        }

        openOverlay(categoryName);
    };

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        bubbles.forEach((bubble) => {
            bubble.update(mouse);
            bubble.draw();
        });
        requestAnimationFrame(animate);
    };

    resize();
    animate();

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            applyCategory(card.dataset.skillsCategory);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                applyCategory(card.dataset.skillsCategory);
            }
        });
    });

    overlayClose.addEventListener('click', closeOverlay);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeOverlay();
        }
    });

    overlay.addEventListener('wheel', (event) => {
        event.stopPropagation();
    }, { passive: true });

    overlay.addEventListener('touchmove', (event) => {
        event.stopPropagation();
    }, { passive: true });

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('active')) {
            closeOverlay();
        }
    });

    window.addEventListener('resize', () => {
        resize();
    });
}
