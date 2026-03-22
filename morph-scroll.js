/**
 * MORPH-SCROLL SYSTEM v2
 * Header → Ball → Scrollbar → Ball EXPANDS into Footer
 *
 * Key behavior:
 *   - Footer is HIDDEN by default
 *   - Ball physically grows from a circle into a full-width rectangle
 *   - Footer content is cloned inside the ball so it's revealed as the ball expands
 *   - The ball IS the footer — it morphs into it
 */

(function () {
    'use strict';

    // ─── Configuration ───
    const CONFIG = {
        shrinkStart: 60,
        shrinkDistance: 80,
        expandDistance: 200,
        ballSize: 48,
        railRight: 28,
        railTop: 80,
        railBottom: 80,
    };

    // ─── Hide native scrollbar ───
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = `
        html { scrollbar-width: none; }
        html::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(scrollbarStyle);

    // ─── Get references ───
    const header = document.querySelector('nav');
    const footer = document.querySelector('footer');
    if (!header || !footer) return;

    // ─── Measure footer height ───
    const footerRect = footer.getBoundingClientRect();
    let footerHeight = footerRect.height;

    // ─── HIDE THE REAL FOOTER ───
    footer.style.visibility = 'hidden';
    footer.style.position = 'relative';

    // ─── Style the header for morphing ───
    header.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease';
    header.style.transformOrigin = 'top right';

    // ─── Create the Morph Ball ───
    const ball = document.createElement('div');
    ball.id = 'morph-ball';

    // Clone footer content into the ball for the expand reveal
    const footerClone = footer.cloneNode(true);
    footerClone.style.visibility = 'visible';
    footerClone.style.position = 'relative';
    footerClone.style.width = '100%';
    footerClone.style.height = '100%';
    footerClone.style.opacity = '0';
    footerClone.style.transition = 'opacity 0.3s ease';
    footerClone.classList.add('morph-footer-clone');

    ball.innerHTML = `
        <div class="morph-ball-inner">
            <span class="morph-ball-text">MSK</span>
            <svg class="morph-ball-progress" viewBox="0 0 48 48">
                <circle class="morph-ball-track" cx="24" cy="24" r="21" />
                <circle class="morph-ball-fill" cx="24" cy="24" r="21" />
            </svg>
        </div>
        <div class="morph-footer-content"></div>
    `;

    // Insert cloned footer into the ball's footer container
    ball.querySelector('.morph-footer-content').appendChild(footerClone);
    document.body.appendChild(ball);

    // ─── Inject all CSS ───
    const morphStyle = document.createElement('style');
    morphStyle.textContent = `
        /* ─── BALL: default state (small circle on the right) ─── */
        #morph-ball {
            position: fixed;
            right: ${CONFIG.railRight}px;
            top: ${CONFIG.railTop}px;
            width: ${CONFIG.ballSize}px;
            height: ${CONFIG.ballSize}px;
            z-index: 9998;
            pointer-events: auto;
            cursor: pointer;
            opacity: 0;
            transform: scale(0);
            border-radius: 50% !important;
            overflow: hidden;
            background: #0e0e0f;
            border: 2px solid #9cff93;
            box-shadow:
                0 0 20px rgba(156, 255, 147, 0.25),
                0 0 40px rgba(156, 255, 147, 0.1);
            /* NO transition on width/height/top/right/border-radius by default — set per phase */
        }

        #morph-ball.visible {
            opacity: 1;
            transform: scale(1);
            transition:
                opacity 0.3s ease,
                transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* When in scrollbar mode, only animate top smoothly */
        #morph-ball.scrollbar-mode {
            transition:
                top 0.06s linear,
                opacity 0.3s ease,
                transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* When expanding to footer, animate everything */
        #morph-ball.expand-mode {
            cursor: default;
            pointer-events: auto;
            transition:
                width 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                right 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                border-radius 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                border-color 0.4s ease,
                box-shadow 0.4s ease,
                opacity 0.3s ease,
                transform 0.3s ease;
        }

        /* ─── Ball inner (visible in circle state) ─── */
        .morph-ball-inner {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            transition: opacity 0.25s ease;
        }
        .morph-ball-text {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 11px;
            color: #9cff93;
            letter-spacing: 1px;
            user-select: none;
        }
        .morph-ball-progress {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }
        .morph-ball-track {
            fill: none;
            stroke: rgba(72, 72, 73, 0.3);
            stroke-width: 2;
        }
        .morph-ball-fill {
            fill: none;
            stroke: #9cff93;
            stroke-width: 2.5;
            stroke-linecap: square;
            stroke-dasharray: 131.95;
            stroke-dashoffset: 131.95;
            transition: stroke-dashoffset 0.1s linear;
            filter: drop-shadow(0 0 3px rgba(156,255,147,0.5));
        }

        /* ─── Footer content inside ball (hidden until expand) ─── */
        .morph-footer-content {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 4;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
        }
        .morph-footer-clone {
            min-width: 100vw;
            pointer-events: auto;
        }
        .morph-footer-clone a,
        .morph-footer-clone button {
            pointer-events: auto;
            cursor: pointer;
        }

        /* ─── Pulse ring ─── */
        #morph-ball::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: inherit;
            border: 1px solid rgba(156, 255, 147, 0.15);
            animation: morph-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            pointer-events: none;
            z-index: 3;
        }
        #morph-ball.expand-mode::after {
            animation: none;
            opacity: 0;
        }
        @keyframes morph-ping {
            0% { transform: scale(1); opacity: 0.6; }
            75%, 100% { transform: scale(1.4); opacity: 0; }
        }

        /* ─── Hover glow ─── */
        #morph-ball:not(.expand-mode):hover {
            box-shadow:
                0 0 30px rgba(156, 255, 147, 0.4),
                0 0 60px rgba(156, 255, 147, 0.15),
                inset 0 0 20px rgba(156, 255, 147, 0.1);
        }
    `;
    document.head.appendChild(morphStyle);

    // ─── References ───
    const ballInner = ball.querySelector('.morph-ball-inner');
    const footerContent = ball.querySelector('.morph-footer-content');
    const footerCloneEl = ball.querySelector('.morph-footer-clone');
    const progressCircle = ball.querySelector('.morph-ball-fill');
    const circumference = 2 * Math.PI * 21;

    // ─── Click ball → scroll to top ───
    ball.addEventListener('click', (e) => {
        if (!ball.classList.contains('expand-mode')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // ─── State tracking ───
    let currentPhase = null;
    let ticking = false;
    let isExpanded = false;

    function getMetrics() {
        const scrollY = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const maxScroll = Math.max(docHeight - winHeight, 1);
        const scrollPercent = Math.min(scrollY / maxScroll, 1);
        return { scrollY, maxScroll, winHeight, scrollPercent };
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const { scrollY, maxScroll, winHeight, scrollPercent } = getMetrics();

            const shrinkEnd = CONFIG.shrinkStart + CONFIG.shrinkDistance;
            const expandStart = maxScroll - CONFIG.expandDistance;

            // Recalculate footer height on scroll in case of dynamic content
            footerHeight = footer.getBoundingClientRect().height || footerHeight;

            // ═══════════════════════════════════════════════════
            // PHASE 1: HEADER VISIBLE (at top)
            // ═══════════════════════════════════════════════════
            if (scrollY <= CONFIG.shrinkStart) {
                if (currentPhase !== 1) {
                    currentPhase = 1;
                    // Show header
                    header.style.transform = 'none';
                    header.style.opacity = '1';
                    header.style.pointerEvents = 'auto';

                    // Hide ball
                    ball.classList.remove('visible', 'scrollbar-mode', 'expand-mode');
                    ball.style.cssText = '';
                    isExpanded = false;

                    // Ball inner visible, footer clone hidden
                    ballInner.style.opacity = '1';
                    footerCloneEl.style.opacity = '0';
                }
            }

            // ═══════════════════════════════════════════════════
            // PHASE 2: HEADER → BALL MORPH
            // ═══════════════════════════════════════════════════
            else if (scrollY > CONFIG.shrinkStart && scrollY <= shrinkEnd) {
                currentPhase = 2;
                const progress = (scrollY - CONFIG.shrinkStart) / CONFIG.shrinkDistance;

                // Shrink header
                header.style.transform = `scale(${1 - progress * 0.85})`;
                header.style.opacity = `${1 - progress}`;
                header.style.pointerEvents = 'none';

                // Ball appears mid-transition
                if (progress > 0.4) {
                    ball.classList.add('visible');
                } else {
                    ball.classList.remove('visible');
                }
                ball.classList.remove('scrollbar-mode', 'expand-mode');

                // Reset ball to default circle position
                ball.style.right = CONFIG.railRight + 'px';
                ball.style.top = CONFIG.railTop + 'px';
                ball.style.width = CONFIG.ballSize + 'px';
                ball.style.height = CONFIG.ballSize + 'px';
                ball.style.setProperty('border-radius', '50%', 'important');
                ball.style.bottom = '';
                ball.style.border = '2px solid #9cff93';
                ball.style.boxShadow = '0 0 20px rgba(156,255,147,0.25), 0 0 40px rgba(156,255,147,0.1)';

                ballInner.style.opacity = '1';
                footerCloneEl.style.opacity = '0';
                isExpanded = false;

                // Progress ring
                progressCircle.style.strokeDashoffset = circumference;
            }

            // ═══════════════════════════════════════════════════
            // PHASE 3: BALL AS SCROLLBAR
            // ═══════════════════════════════════════════════════
            else if (scrollY > shrinkEnd && scrollY < expandStart) {
                if (currentPhase === 4 || isExpanded) {
                    // Coming back UP from expanded state — snap ball back to circle
                    isExpanded = false;
                    ball.classList.remove('expand-mode');
                    // Small delay to let transition class removal take effect
                    ball.style.setProperty('border-radius', '50%', 'important');
                    ball.style.width = CONFIG.ballSize + 'px';
                    ball.style.height = CONFIG.ballSize + 'px';
                    ball.style.right = CONFIG.railRight + 'px';
                    ball.style.bottom = '';
                    ball.style.border = '2px solid #9cff93';
                    ball.style.boxShadow = '0 0 20px rgba(156,255,147,0.25), 0 0 40px rgba(156,255,147,0.1)';
                    ballInner.style.opacity = '1';
                    footerCloneEl.style.opacity = '0';
                }

                currentPhase = 3;

                // Hide header fully
                header.style.transform = 'scale(0.15)';
                header.style.opacity = '0';
                header.style.pointerEvents = 'none';

                // Ball visible as scrollbar
                ball.classList.add('visible', 'scrollbar-mode');
                ball.classList.remove('expand-mode');

                // Position ball along the rail
                const railHeight = winHeight - CONFIG.railTop - CONFIG.railBottom;
                const ballY = CONFIG.railTop + (scrollPercent * railHeight);
                ball.style.top = ballY + 'px';
                ball.style.right = CONFIG.railRight + 'px';
                ball.style.width = CONFIG.ballSize + 'px';
                ball.style.height = CONFIG.ballSize + 'px';
                ball.style.setProperty('border-radius', '50%', 'important');
                ball.style.bottom = '';

                // Show ball circle, hide footer content
                ballInner.style.opacity = '1';
                footerCloneEl.style.opacity = '0';

                // Progress ring
                const offset = circumference - (scrollPercent * circumference);
                progressCircle.style.strokeDashoffset = offset;
            }

            // ═══════════════════════════════════════════════════
            // PHASE 4: BALL EXPANDS INTO FOOTER
            // ═══════════════════════════════════════════════════
            else if (scrollY >= expandStart) {
                currentPhase = 4;

                // Hide header
                header.style.transform = 'scale(0.15)';
                header.style.opacity = '0';
                header.style.pointerEvents = 'none';

                const expandProgress = Math.min((scrollY - expandStart) / CONFIG.expandDistance, 1);

                // Ball is visible and in expand mode
                ball.classList.add('visible', 'expand-mode');
                ball.classList.remove('scrollbar-mode');

                // ── Interpolate ball from circle → full-width footer ──

                // Size: ballSize → 100vw width, ballSize → footerHeight
                const currentWidth = CONFIG.ballSize + (expandProgress * (window.innerWidth - CONFIG.ballSize));
                const currentHeight = CONFIG.ballSize + (expandProgress * (Math.max(footerHeight, 120) - CONFIG.ballSize));

                // Position: from rail position → bottom:0, right:0
                // bottom edge: start from wherever ball is → stick to viewport bottom
                const startBottom = CONFIG.railBottom;
                const endBottom = 0;
                const currentBottom = startBottom + (expandProgress * (endBottom - startBottom));

                // Right: railRight → 0
                const currentRight = CONFIG.railRight * (1 - expandProgress);

                // Border radius: 50% → 0
                const currentRadius = 50 * (1 - expandProgress);

                // Apply
                ball.style.top = 'auto';
                ball.style.bottom = currentBottom + 'px';
                ball.style.right = currentRight + 'px';
                ball.style.width = currentWidth + 'px';
                ball.style.height = currentHeight + 'px';
                ball.style.setProperty('border-radius', currentRadius + '%', 'important');

                // Fade border & glow out
                const borderOpacity = 1 - expandProgress;
                ball.style.border = `2px solid rgba(156,255,147,${borderOpacity})`;
                ball.style.boxShadow = `0 0 ${20 * borderOpacity}px rgba(156,255,147,${0.25 * borderOpacity})`;

                // Crossfade: ball inner fades out, footer content fades in
                if (expandProgress < 0.3) {
                    ballInner.style.opacity = `${1 - expandProgress * 3}`;
                    footerCloneEl.style.opacity = '0';
                } else {
                    ballInner.style.opacity = '0';
                    footerCloneEl.style.opacity = `${(expandProgress - 0.3) / 0.7}`;
                }

                isExpanded = expandProgress > 0.1;

                // Progress ring full
                progressCircle.style.strokeDashoffset = 0;
            }

            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        footerHeight = footer.getBoundingClientRect().height || footerHeight;
        onScroll();
    }, { passive: true });

    // ─── Initial state ───
    onScroll();
})();
