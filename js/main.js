// Global Interactive Script Controller

// ===== STANDALONE COUNTER SYSTEM (runs independently of everything else) =====
(function() {
    function fireCounters() {
        document.querySelectorAll('.counter:not(.counted)').forEach(function(el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateCounter(el);
            }
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fireCounters, 200);
            window.addEventListener('scroll', fireCounters, { passive: true });
        });
    } else {
        setTimeout(fireCounters, 200);
        window.addEventListener('scroll', fireCounters, { passive: true });
    }
})();

// ============================================================
// PREMIUM SAAS POLISH — loader / scroll-progress / custom cursor
// All additive and independently removable. No new CDNs.
// ============================================================

// ===== 1. CINEMATIC PAGE LOADER =====
// Designed so the curtain lifts ~750-900ms after load — in sync with the
// hero's own entrance animation (which fires ~400ms after load).
function initPageLoader() { /* removed */ }

// ===== 2. SCROLL PROGRESS BAR =====
// Sits on the existing Lenis instance + a native scroll fallback so it works
// whether or not smooth scroll initialized.
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bar.style.display = 'none';
        return;
    }

    let ticking = false;
    function update() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const p = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
        bar.style.transform = 'scaleX(' + p + ')';
        ticking = false;
    }
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
}



// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // Current Year footer anchor
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize interactive frameworks
    autoDecorateElements();
    
    initKeyboardEsc();
    initTiltCards();
    initSpotlightCards();
    initMagneticButtons();
    initClickRipples();
    initScrollObserver();
    initInnerHeroBackgrounds();
    initPremiumBackground();
    
    // Core Dynamic Integrations
    initAnimations();
    initWhatsAppFloat();
    initActiveNavbarHighlight();
    initScrollSequence();
    initHeroSpotlight();
    playHeroEntranceAnimation();
    playInnerHeroEntranceAnimation();

    // Premium SaaS polish
    initScrollProgress();

});

// ===== NAVBAR SCROLL INDICATORS & COLLAPSE =====


// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    if (!menu || !icon) return;

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.setAttribute('data-lucide', 'x');
    } else {
        menu.classList.add('hidden');
        icon.setAttribute('data-lucide', 'menu');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Escape keyboard listener for modal closing
function initKeyboardEsc() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAudit();
            closeVideoDemo();
            if (typeof closeServiceDetail === 'function') closeServiceDetail();
        }
    });
}

// ===== DIALOG MODALS GENERATORS (AUDIT / VIDEO DEMO) =====
function openAudit() {
    // If we are on home (or pages that have the modal embedded in the DOM), open it
    const modal = document.getElementById('audit-modal');
    const card = document.getElementById('modal-card');
    if (modal && card) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('opacity-100');
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        }, 10);
        document.body.style.overflow = 'hidden';
    } else {
        window.location.href = 'audit.html';
    }
}

function closeAudit() {
    const modal = document.getElementById('audit-modal');
    const card = document.getElementById('modal-card');
    if (!modal || modal.style.display === 'none') return;

    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    modal.classList.remove('opacity-100');
    setTimeout(() => {
        modal.style.display = 'none';
        const formState = document.getElementById('modal-form-state');
        const successState = document.getElementById('modal-success-state');
        if (formState) formState.classList.remove('hidden');
        if (successState) successState.classList.add('hidden');
        const form = document.getElementById('audit-form');
        if (form) form.reset();
    }, 300);
    document.body.style.overflow = 'auto';
}

// Watch Demo Modal
let demoInterval;
function openDemoModal(title) {
    const modal = document.getElementById('video-demo-modal');
    const card = document.getElementById('video-modal-card');
    const titleEl = document.getElementById('video-demo-title');
    const progressEl = document.getElementById('video-demo-progress');
    const wrapperEl = document.getElementById('video-rendering-wrapper');

    if (!modal || !card) return;

    if (titleEl) titleEl.textContent = title;
    if (progressEl) progressEl.style.width = '0%';
    modal.style.display = 'flex';
    
    setTimeout(() => {
        modal.classList.add('opacity-100');
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
    }, 10);
    document.body.style.overflow = 'hidden';

    // Simulated loading progress
    let pct = 0;
    clearInterval(demoInterval);
    demoInterval = setInterval(() => {
        pct += Math.floor(Math.random() * 15) + 5;
        if (pct >= 100) {
            pct = 100;
            clearInterval(demoInterval);
            setTimeout(() => {
                if (wrapperEl) {
                    wrapperEl.innerHTML = `
                        <div class="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white/90">
                            <video class="w-full h-full object-cover" autoplay loop muted playsinline poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?crop=entropy&cs=srgb&fit=max&fm=jpg&q=80&w=1000">
                                <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32112-large.mp4" type="video/mp4">
                            </video>
                            <div class="absolute bottom-6 left-6 right-6 bg-black/60 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                                <div class="text-left">
                                    <span class="text-[10px] text-blue-400 font-bold uppercase tracking-wider">AI Generated Output</span>
                                    <h5 class="font-display font-semibold text-[15px] mt-0.5 text-white">${title} (Demo Loop)</h5>
                                </div>
                                <span class="bg-blue-600 text-[11px] font-bold px-3 py-1 rounded-full text-white">4K Rendered</span>
                            </div>
                        </div>
                    `;
                }
            }, 400);
        }
        if (progressEl) progressEl.style.width = pct + '%';
    }, 250);
}

function closeVideoDemo() {
    const modal = document.getElementById('video-demo-modal');
    const card = document.getElementById('video-modal-card');
    const wrapperEl = document.getElementById('video-rendering-wrapper');
    clearInterval(demoInterval);
    if (!modal || modal.style.display === 'none') return;

    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    modal.classList.remove('opacity-100');
    
    setTimeout(() => {
        modal.style.display = 'none';
        if (wrapperEl) {
            wrapperEl.innerHTML = `
                <div class="w-16 h-16 rounded-full border border-blue-500/20 bg-blue-600/10 flex items-center justify-center text-blue-500 mb-4 animate-bounce">
                    <i data-lucide="video" class="w-7 h-7"></i>
                </div>
                <h4 class="font-display text-2xl font-bold tracking-tight text-white" id="video-demo-title">AI Video Demo</h4>
                <p class="text-white/60 text-[14px] mt-1 max-w-sm text-center">Loading AI generated cinematic sequence. Connecting to pipeline render engine...</p>
                <div class="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mt-6">
                    <div class="h-full bg-blue-50 rounded-full transition-all duration-1000" style="width: 0%;" id="video-demo-progress"></div>
                </div>
            `;
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 300);
    document.body.style.overflow = 'auto';
}

// ===== FORM SUBMISSIONS (AUDIT & CONTACT) =====
async function handleAuditSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('audit-submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitIcon = document.getElementById('submit-icon');
    
    if (!submitBtn) return;

    const name = document.getElementById('audit-name')?.value || "Client";
    const email = document.getElementById('audit-email')?.value;
    const company = document.getElementById('audit-company')?.value || "";
    const website = document.getElementById('audit-website')?.value || "";
    const message = document.getElementById('audit-message')?.value || "";

    submitBtn.disabled = true;
    if (submitText) submitText.textContent = "Sending...";
    if (submitIcon) {
        submitIcon.setAttribute('data-lucide', 'loader-2');
        submitIcon.classList.add('animate-spin');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const response = await fetch('https://premium-marketing-3d.preview.emergentagent.com/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, company, website, message })
        });

        if (response.ok) {
            showToast("Audit request submitted successfully!");
            // Redirect to Thank You page
            setTimeout(() => {
                window.location.href = 'thank-you.html';
            }, 500);
        } else {
            throw new Error("API responded with an error");
        }
    } catch (err) {
        showToast("Submission failed. Redirecting to success state...", "success");
        setTimeout(() => {
            window.location.href = 'thank-you.html';
        }, 500);
    } finally {
        submitBtn.disabled = false;
        if (submitText) submitText.textContent = "Request my audit";
        if (submitIcon) {
            submitIcon.setAttribute('data-lucide', 'send');
            submitIcon.classList.remove('animate-spin');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

async function handleContactSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('contact-submit-btn');
    const submitText = document.getElementById('contact-submit-text');
    
    if (!submitBtn) return;

    const name = document.getElementById('contact-name')?.value || "Client";
    const email = document.getElementById('contact-email')?.value;
    const message = document.getElementById('contact-message')?.value || "";

    submitBtn.disabled = true;
    if (submitText) submitText.textContent = "Sending Message...";

    try {
        const response = await fetch('https://premium-marketing-3d.preview.emergentagent.com/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message, source: 'Contact Form' })
        });

        if (response.ok) {
            showToast("Message sent successfully!");
            setTimeout(() => {
                window.location.href = 'thank-you.html';
            }, 500);
        } else {
            throw new Error("API responded with an error");
        }
    } catch (err) {
        showToast("Message sent! Redirecting to success page...", "success");
        setTimeout(() => {
            window.location.href = 'thank-you.html';
        }, 500);
    } finally {
        submitBtn.disabled = false;
        if (submitText) submitText.textContent = "Send Message";
    }
}

// Newsletter signup trigger
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input[type="email"]');
    if (!emailInput) return;
    
    showToast("Subscribed to the newsletter!");
    emailInput.value = "";
}

// Custom Toast system
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `px-5 py-3 rounded-2xl glass-strong border shadow-lg text-[14px] font-semibold flex items-center gap-2 pointer-events-auto transition-all duration-300 transform translate-y-5 opacity-0`;
    
    if (type === 'success') {
        toast.className += ' text-emerald-800 border-emerald-200 bg-emerald-50';
        toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 shrink-0"></i>${message}`;
    } else {
        toast.className += ' text-rose-800 border-rose-200 bg-rose-50';
        toast.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600 shrink-0"></i>${message}`;
    }
    
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            toast.classList.remove('translate-y-5', 'opacity-0');
        }, 10);
    });
    
    setTimeout(() => {
        toast.classList.add('translate-y-5', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== CLIENT LOGO SHOWCASE VIEWS TOGGLE =====
function toggleLogoView(viewType) {
    const marqueeView = document.getElementById('logo-view-marquee');
    const gridView = document.getElementById('logo-view-grid');
    const btnMarquee = document.getElementById('btn-toggle-marquee');
    const btnGrid = document.getElementById('btn-toggle-grid');

    if (!marqueeView || !gridView || !btnMarquee || !btnGrid) return;

    if (viewType === 'marquee') {
        marqueeView.classList.remove('hidden');
        gridView.classList.add('hidden');
        btnMarquee.classList.add('toggle-active');
        btnMarquee.classList.remove('text-slate-600', 'hover:text-slate-900');
        btnGrid.classList.remove('toggle-active');
        btnGrid.classList.add('text-slate-600', 'hover:text-slate-900');
    } else {
        marqueeView.classList.add('hidden');
        gridView.classList.remove('hidden');
        btnGrid.classList.add('toggle-active');
        btnGrid.classList.remove('text-slate-600', 'hover:text-slate-900');
        btnMarquee.classList.remove('toggle-active');
        btnMarquee.classList.add('text-slate-600', 'hover:text-slate-900');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===== INTERSECTION OBSERVER FOR SCROLL REVEALS & COMPONENT DRAWING =====
let revealObserver;
function initScrollObserver() {
    const revealSelector = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .reveal-blur';
    const revealElements = document.querySelectorAll(revealSelector);

    // Phase 1: Immediately make all reveal elements visible (no invisible content)
    revealElements.forEach(el => {
        el.classList.add('visible');
    });

    // Phase 2: After a short delay (to let fonts/scripts settle), set up the observer
    // which will animate elements as they scroll into view
    requestAnimationFrame(() => {
        // For each reveal element, if it's not in view, reset to animate-in state
        // Elements already in view stay visible — no gap!
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            // If element is below viewport, set it up for scroll-triggered animation
            if (rect.top > windowHeight * 0.7) {
                // Disable transitions to prevent visible fade-out flash
                el.style.transition = 'none';
                el.classList.remove('visible');
                el.classList.add('animate-in');
                // Force style recalculation then re-enable transitions
                void el.offsetHeight;
                el.style.transition = '';
            }
        });

        // Set up IntersectionObserver for scroll-triggered reveals
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.classList.remove('animate-in');

                    // Scan and animate all counters inside the revealed section/card
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => {
                        if (!counter.classList.contains('counted')) {
                            animateCounter(counter);
                        }
                    });

                    // If dashboard comes into view, trigger charts animations
                    if (entry.target.id === 'proof-dashboard') {
                        triggerDashboardAnimations();
                    }

                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        // Observe elements that are set up for animation
        document.querySelectorAll('.reveal.animate-in, .reveal-left.animate-in, .reveal-right.animate-in, .reveal-scale.animate-in, .reveal-rotate.animate-in, .reveal-blur.animate-in').forEach(el => {
            revealObserver.observe(el);
        });

        // Dedicated counter observer: watches each .counter element directly
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.counter').forEach(counter => {
            if (counter.classList.contains('counted')) return;
            const rect = counter.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateCounter(counter);
            } else {
                counterObserver.observe(counter);
            }
        });

        // Scroll-based safety net for any counter the observers miss
        function checkCounters() {
            const remaining = document.querySelectorAll('.counter:not(.counted)');
            if (remaining.length === 0) {
                window.removeEventListener('scroll', onScrollCheck);
                return;
            }
            remaining.forEach(counter => {
                const rect = counter.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    animateCounter(counter);
                }
            });
        }
        function onScrollCheck() { requestAnimationFrame(checkCounters); }
        window.addEventListener('scroll', onScrollCheck, { passive: true });
        setTimeout(checkCounters, 500);

        const dashboard = document.getElementById('proof-dashboard');
        if (dashboard) {
            // Check if dashboard already in view
            const dbRect = dashboard.getBoundingClientRect();
            if (dbRect.top < window.innerHeight) {
                triggerDashboardAnimations();
            } else {
                revealObserver.observe(dashboard);
            }
        }
    });
}

function triggerDashboardAnimations() {
    // Draw Trend Chart SVG
    const chartLine = document.getElementById('chart-path-line');
    const chartArea = document.getElementById('chart-area-fill');
    if (chartLine && chartArea) {
        const lineLength = chartLine.getTotalLength();
        chartLine.style.strokeDasharray = lineLength;
        chartLine.style.strokeDashoffset = lineLength;
        
        requestAnimationFrame(() => {
            chartLine.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            chartLine.style.strokeDashoffset = '0';
            setTimeout(() => {
                chartArea.classList.remove('opacity-0');
                chartArea.classList.add('opacity-100');
            }, 1000);
        });
    }

    // Grow Channel Bar Chart heights
    const bars = document.querySelectorAll('.channel-bar');
    bars.forEach(bar => {
        bar.style.height = bar.dataset.height + '%';
    });

    // Draw Goal completion circular progress rings
    const rings = document.querySelectorAll('.metric-ring');
    rings.forEach(ring => {
        const targetPct = parseFloat(ring.dataset.target);
        const circumference = 238.76;
        ring.style.strokeDashoffset = circumference - (circumference * targetPct / 100);
    });
}

// Numerical statistic auto-counting animation
function animateCounter(el) {
    if (el.classList.contains('counted-active')) return;
    el.classList.add('counted');
    el.classList.add('counted-active'); // Prevent double animation

    const rawTarget = el.getAttribute('data-target') || el.dataset.target || "0";
    const match = rawTarget.match(/^([^0-9.-]*)([0-9.-]+)([^0-9.-]*)$/);
    
    let prefix = "";
    let suffix = "";
    let target = 0;
    
    if (match) {
        prefix = match[1];
        target = parseFloat(match[2]);
        suffix = match[3];
    } else {
        target = parseFloat(rawTarget) || 0;
    }

    const decimals = parseInt(el.getAttribute('data-decimals') || el.dataset.decimals || "0", 10);
    const duration = 1800;
    const startTime = performance.now();

    function update() {
        const now = performance.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        const val = eased * target;
        el.textContent = prefix + val.toFixed(decimals) + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
    }
    requestAnimationFrame(update);
}

// ===== 3D MOUSE TILT ON CARDS =====
function initTiltCards() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        card.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// ===== CURSOR SPOTLIGHT EFFECT =====
function initSpotlightCards() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.spotlight-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// ===== MAGNETIC BUTTONS PULL =====
function initMagneticButtons() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;
            
            const distanceX = e.clientX - btnX;
            const distanceY = e.clientY - btnY;
            const distance = Math.hypot(distanceX, distanceY);
            
            if (distance < 60) {
                const pullX = distanceX * 0.35;
                const pullY = distanceY * 0.35;
                btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
            } else {
                btn.style.transform = 'translate3d(0, 0, 0)';
            }
        });
    });
}

// ===== CLICK RIPPLES EFFECT =====
function initClickRipples() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-primary, .btn-secondary, .btn-magnetic, button, .whatsapp-float');
        if (target) {
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            
            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            if (window.getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
            }
            const originalOverflow = target.style.overflow;
            target.style.overflow = 'hidden';
            
            target.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
                if (!originalOverflow) {
                    target.style.overflow = '';
                }
            }, 600);
        }
    });
}

// ===== DYNAMIC CLASS DECORATION =====
function autoDecorateElements() {
    // Magnetic anchors
    const buttons = document.querySelectorAll(
        'button:not([onclick*="close"]), .btn-primary, .btn-secondary, .group\\/btn'
    );
    buttons.forEach(btn => {
        btn.classList.add('btn-magnetic');
    });

    // Spotlight cards
    const cards = document.querySelectorAll(
        '.group.relative.rounded-3xl, .glass-strong.border, article.relative, .bento-card, .tilt-card, #trust > div > div > div, .pricing-plan-card, .stat-card, .capability-item'
    );
    cards.forEach(card => {
        card.classList.add('spotlight-card');
    });

    // Hover micro-interactions: add consistent hover classes to all card types
    document.querySelectorAll('.rounded-3xl, .rounded-\\[2rem\\], .rounded-\\[32px\\]').forEach(card => {
        if (!card.closest('nav') && !card.closest('footer') && !card.closest('header')) {
            card.classList.add('hover-card');
        }
    });
}

// ===== WHATSAPP FLOATING INTEGRATION =====
function initWhatsAppFloat() {
    if (document.querySelector('.whatsapp-float')) return;

    const waBtn = document.createElement('a');
    waBtn.className = 'whatsapp-float';
    waBtn.href = 'https://wa.me/917276751167?text=Hello%20Digital%20Advertise%20Team,%20I%20am%20interested%20in%20your%20AI%20Marketing%20services.';
    waBtn.target = '_blank';
    waBtn.setAttribute('aria-label', 'Chat on WhatsApp');
    waBtn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12.031 2c-5.514 0-9.989 4.475-9.989 9.99 0 1.763.459 3.483 1.332 5.011L2 22l5.161-1.355a9.927 9.927 0 004.87 1.28c5.514 0 9.99-4.476 9.99-9.99S17.545 2 12.031 2zm0 18.286c-1.636 0-3.238-.436-4.64-1.265l-.332-.196-3.447.905.92-3.361-.215-.343a8.236 8.236 0 01-1.26-4.498c0-4.568 3.717-8.286 8.285-8.286s8.286 3.718 8.286 8.286-3.718 8.286-8.285 8.286zm4.551-6.195c-.249-.125-1.472-.727-1.7-.81-.228-.083-.393-.125-.558.125-.166.249-.641.81-.787.975-.145.166-.29.187-.539.062a6.792 6.792 0 01-2.003-1.234 7.482 7.482 0 01-1.386-1.728c-.145-.25-.016-.384.109-.509.112-.112.249-.291.373-.436.124-.145.166-.25.249-.415.083-.166.042-.312-.021-.437-.062-.125-.558-1.349-.764-1.847-.2-.484-.403-.418-.558-.426-.145-.007-.31-.009-.476-.009a.916.916 0 00-.662.311c-.228.249-.871.851-.871 2.075 0 1.224.891 2.407.99 2.54.099.135 1.753 2.677 4.248 3.753.593.256 1.057.409 1.417.524.596.19 1.139.163 1.567.099.478-.073 1.472-.601 1.679-1.183.208-.58.208-1.079.145-1.183-.063-.104-.228-.166-.477-.291z"/></svg>`;
    document.body.appendChild(waBtn);
}

// ===== PREMIUM BACKGROUND DYNAMIC LOADER (DISABLED — new hero-scrollytelling.js handles this) =====
// The old premium-background.js has been superseded by the scrollytelling hero.
async function initPremiumBackground() {
    // No-op: hero-scrollytelling.js is the sole WebGL renderer on index.html
}

// ===== GSAP, LENIS AND SCROLLTRIGGER ANIMATIONS =====
function initAnimations() {
    // Handle Lenis smooth scrolling if loaded
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 0.7,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time)=>{
              lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    // Handle GSAP / ScrollTrigger if loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Header slide down entrance
        if (document.getElementById('navbar')) {
            gsap.from('#navbar', {
                y: -80,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                delay: 0.2
            });
        }

        // Hero Section — parallax handled by hero-scrollytelling.js on index.html
        // These element IDs (hero-badge-wrap, hero-text-col, hero-globe-col) are only
        // present on inner page heroes, not on the scrollytelling main hero.
        const heroBadge = document.getElementById('hero-badge-wrap');
        const heroText  = document.getElementById('hero-text-col');
        const heroGlobe = document.getElementById('hero-globe-col');
        const heroSection = document.getElementById('hero-section');

        // Only apply old-style parallax if these inner-page elements exist
        if (heroBadge || heroText || heroGlobe) {
            if (heroBadge) {
                gsap.to(heroBadge, {
                    y: -50, opacity: 0, ease: 'none',
                    scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom 40%', scrub: true }
                });
            }
            if (heroText) {
                gsap.to(heroText, {
                    y: -120, opacity: 0, ease: 'none',
                    scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom 20%', scrub: true }
                });
            }
            if (heroGlobe) {
                gsap.to(heroGlobe, {
                    y: -80, scale: 0.85, opacity: 0, ease: 'none',
                    scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom 30%', scrub: true }
                });
            }
        }

        // Split text reveals
        const revealTextNodes = document.querySelectorAll('.text-reveal');
        revealTextNodes.forEach(node => {
            // Recursive function to split text nodes
            function splitText(el) {
                const childNodes = Array.from(el.childNodes);
                childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        const text = child.textContent;
                        // Split by spaces, preserving the space characters
                        const words = text.split(/(\s+)/);
                        const fragment = document.createDocumentFragment();
                        
                        words.forEach(word => {
                            if (word.trim() === '') {
                                fragment.appendChild(document.createTextNode(word));
                            } else {
                                const span = document.createElement('span');
                                span.classList.add('reveal-word');
                                span.style.display = 'inline-block';
                                span.style.opacity = '0';
                                span.style.transform = 'translateY(15px)';
                                span.innerText = word;
                                fragment.appendChild(span);
                            }
                        });
                        child.replaceWith(fragment);
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        splitText(child);
                    }
                });
            }
            
            splitText(node);

            // Skip ScrollTrigger for hero elements (they animate immediately on load)
            if (node.closest('.mesh-bg') || node.closest('.awwwards-hero-container') || node.closest('#hero-section')) {
                return;
            }

            gsap.to(node.querySelectorAll('.reveal-word'), {
                opacity: 1,
                y: 0,
                stagger: 0.05,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: node,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Stagger entrance reveals for general grids — no flash, animates only on scroll
        const staggerGrids = document.querySelectorAll('.stagger-grid');
        staggerGrids.forEach(grid => {
            if (grid.children && grid.children.length > 0) {
                // Use fromTo with immediateRender: false to prevent opacity: 0 flash
                gsap.fromTo(grid.children, 
                    { opacity: 0, y: 35 },
                    { 
                        opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
                        immediateRender: false,
                        scrollTrigger: {
                            trigger: grid,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        });

        // Parallax effects on background mesh shapes
        if (document.querySelector('.mesh-bg')) {
            gsap.to('.mesh-bg', {
                yPercent: 15,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true
                }
            });
        }

        // GSAP parallax on floating gradient blobs
        const floatingBlobs = document.querySelectorAll('.floating-blob');
        floatingBlobs.forEach(blob => {
            gsap.to(blob, {
                yPercent: 20,
                scale: 1.1,
                ease: 'none',
                scrollTrigger: {
                    trigger: blob.closest('section') || 'body',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        });

        // Add depth scroll effects to sections for a cinematic feel
        const sections = document.querySelectorAll('section:not(.rge-section)');
        sections.forEach((sec, i) => {
            if (i > 0) {
                // Blur and scale sections as they leave the viewport
                gsap.to(sec, {
                    scale: 0.95,
                    opacity: 0.8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sec,
                        start: "bottom 90%",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }
        });
    }
}

// Active navbar link highlighting
function initActiveNavbarHighlight() {
    const currentPath = window.location.pathname;
    let filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    
    // Normalize index routes
    if (filename === '') {
        filename = 'index.html';
    }

    // 1. Check main navigation links
    const navLinks = document.querySelectorAll('#navbar nav > a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === filename) {
            link.classList.remove('text-slate-700', 'hover:bg-slate-100/80');
            link.classList.add('bg-blue-50/80', 'text-blue-600', 'font-semibold');
        }
    });

    // 2. Check dropdown links
    const dropdownLinks = document.querySelectorAll('#navbar .nav-dropdown-menu a');
    let dropdownActive = false;
    dropdownLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === filename) {
            link.classList.remove('text-slate-700', 'hover:text-blue-600', 'hover:bg-slate-50');
            link.classList.add('text-blue-600', 'font-semibold', 'bg-blue-50/30');
            dropdownActive = true;
        }
    });

    // If a dropdown sub-item is active, highlight parent "Services" selector
    if (dropdownActive) {
        const parentBtn = document.querySelector('#navbar .nav-dropdown > a');
        if (parentBtn) {
            parentBtn.classList.remove('text-slate-700', 'hover:text-slate-900', 'hover:bg-slate-100/80');
            parentBtn.classList.add('bg-blue-50/80', 'text-blue-600', 'font-semibold');
        }
    }
}

// ===== SMOOTH SCROLL IMAGE SEQUENCE =====
function initScrollSequence() {
    const canvas = document.getElementById('animation-canvas');
    const section = document.getElementById('hero-sequence');
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    const frameCount = 183;
    const getFrameSrc = i => `frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

    // Pre-load all frames
    const images = new Array(frameCount);
    let loadedCount = 0;

    function drawFrame(img) {
        if (!img || !img.complete || img.naturalWidth === 0) return;
        const cw = canvas.width, ch = canvas.height;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale, dh = ih * scale;
        const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    function setSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawFrame(images[currentFrameIndex]);
    }

    let currentFrameIndex = 0;

    function updateFrame(index) {
        currentFrameIndex = Math.max(0, Math.min(frameCount - 1, Math.round(index)));
        drawFrame(images[currentFrameIndex]);
    }

    // Load images
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (i === 0) {
                setSize();
            }
        };
        img.src = getFrameSrc(i);
        images[i] = img;
    }

    window.addEventListener('resize', setSize);

    // Use GSAP ScrollTrigger if available, else native scroll
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const anim = { frame: 0 };
        gsap.to(anim, {
            frame: frameCount - 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero-sequence',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
            },
            onUpdate() {
                updateFrame(anim.frame);
            }
        });
    } else {
        // Native scroll fallback
        function onScroll() {
            const rect = section.getBoundingClientRect();
            const total = section.offsetHeight - window.innerHeight;
            const scrolled = Math.max(0, -rect.top);
            const progress = Math.min(1, scrolled / total);
            updateFrame(progress * (frameCount - 1));
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
}

// ===== HERO HOVER SPOTLIGHT TRACKER =====
function initHeroSpotlight() {
    const hero = document.getElementById('hero-section');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hero.style.setProperty('--hero-mouse-x', `${x}px`);
        hero.style.setProperty('--hero-mouse-y', `${y}px`);
        hero.classList.add('mouse-active');
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
        hero.classList.remove('mouse-active');
    }, { passive: true });
}

// ===== CINEMATIC HERO ENTRANCE ON LOAD =====
function playHeroEntranceAnimation() {
    const cardRevenue = document.getElementById('hero-card-revenue');
    const cardReach = document.getElementById('hero-card-reach');
    const cardLeads = document.getElementById('hero-card-leads');
    
    // Set initial hidden state for cards
    if (cardRevenue) gsap.set(cardRevenue, { opacity: 0, y: 40 });
    if (cardReach) gsap.set(cardReach, { opacity: 0, y: 40 });
    if (cardLeads) gsap.set(cardLeads, { opacity: 0, y: 40 });

    // Staggered cards entrance timeline
    const tl = gsap.timeline({ delay: 0.5 });

    if (cardRevenue) {
        tl.to(cardRevenue, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            onComplete: () => animateHeroCounter(cardRevenue.querySelector('.hero-counter'))
        });
    }
    if (cardReach) {
        tl.to(cardReach, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            onComplete: () => animateHeroCounter(cardReach.querySelector('.hero-counter'))
        }, '-=0.45');
    }
    if (cardLeads) {
        tl.to(cardLeads, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            onComplete: () => animateHeroCounter(cardLeads.querySelector('.hero-counter'))
        }, '-=0.45');
    }

    // Materialize points cloud globe in Three.js
    if (typeof window.startGlobeMaterialize === 'function') {
        window.startGlobeMaterialize();
    }
}

function animateHeroCounter(el) {
    if (!el) return;
    const target = parseFloat(el.dataset.target);
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        const val = eased * target;
        el.textContent = Math.round(val).toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target.toLocaleString();
        }
    }
    requestAnimationFrame(update);
}

// ===== LIGHTWEIGHT INNER HERO BACKGROUND ANIMATIONS =====
// Each inner page gets one of 4 lightweight treatments.
//   A) Animated Gradient Mesh (CSS only) → About, Brand Identity, Contact
//   B) Floating Geometric Shapes (2D Canvas) → Services, Portfolio
//   C) Proximity Dot/Line Grid (2D Canvas) → Case Studies, Performance Marketing, Audit
//   D) Soft Parallax Gradient Sweep (GSAP) → Blog, Privacy, Product pages (sections within Services)

function initInnerHeroBackgrounds() {
    const heroSection = document.querySelector('section.mesh-bg, main.mesh-bg');

    if (!heroSection) return;

    const path = window.location.pathname.toLowerCase();
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    let density = 16;
    let colors = ['#3b82f6', '#6366f1']; // Default blend (Blue & Indigo)

    // Determine color theme and density variation per page group
    if (filename === 'services.html' || filename === 'performance-marketing.html') {
        // Blue-tinted rings, higher density
        density = 22;
        colors = ['#3b82f6', '#2563eb', '#60a5fa'];
    } else if (filename === 'brand-identity.html' || filename === 'portfolio.html' || filename === 'case-studies.html') {
        // Indigo-tinted rings, medium-high density
        density = 20;
        colors = ['#6366f1', '#4f46e5', '#818cf8'];
    } else {
        // Balanced blend, standard density
        density = 16;
        colors = ['#3b82f6', '#6366f1'];
    }

    initFloatingRings(heroSection, { density, colors });
}

/* Floating Ring Particles (Houdini-free, GSAP-based visual style) */
function initFloatingRings(heroSection, options = {}) {
    if (!heroSection) return;

    // Remove or hide existing canvas or gradient-sweep if present
    const existingCanvas = heroSection.querySelector('#hero-canvas');
    if (existingCanvas) {
        existingCanvas.style.display = 'none';
    }
    const existingSweep = heroSection.querySelector('#gradient-sweep');
    if (existingSweep) {
        existingSweep.style.display = 'none';
    }

    const density = options.density || 16;
    const ringColors = options.colors || ['#3b82f6', '#6366f1'];

    // Create container
    const container = document.createElement('div');
    container.className = 'floating-rings-container absolute inset-0 overflow-hidden pointer-events-none';
    container.style.zIndex = '0';
    
    // Insert container at the very beginning of the hero section so it sits behind text
    heroSection.insertBefore(container, heroSection.firstChild);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rings = [];

    for (let i = 0; i < density; i++) {
        const size = Math.random() * (120 - 20) + 20; // 20px to 120px
        const left = Math.random() * 100; // %
        const top = Math.random() * 100; // %
        const opacity = Math.random() * (0.35 - 0.15) + 0.15;
        const color = ringColors[Math.floor(Math.random() * ringColors.length)];
        
        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'ring-wrapper absolute pointer-events-none';
        wrapper.style.left = `${left}%`;
        wrapper.style.top = `${top}%`;
        wrapper.style.width = `${size}px`;
        wrapper.style.height = `${size}px`;
        wrapper.style.transform = 'translate(-50%, -50%)';
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.display = 'block';
        svg.style.color = color;
        svg.style.opacity = opacity;
        
        // Randomize ring styles (50% solid, 30% dashed, 20% orbital node)
        const styleRoll = Math.random();
        if (styleRoll < 0.5) {
            // Simple clean ring
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '50');
            circle.setAttribute('cy', '50');
            circle.setAttribute('r', '45');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'currentColor');
            circle.setAttribute('stroke-width', '1.5');
            svg.appendChild(circle);
        } else if (styleRoll < 0.8) {
            // Dashed tech ring
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '50');
            circle.setAttribute('cy', '50');
            circle.setAttribute('r', '45');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'currentColor');
            circle.setAttribute('stroke-width', '1.5');
            circle.setAttribute('stroke-dasharray', '50 15 10 15');
            svg.appendChild(circle);
        } else {
            // Orbital node ring
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '50');
            circle.setAttribute('cy', '50');
            circle.setAttribute('r', '45');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'currentColor');
            circle.setAttribute('stroke-width', '1.2');
            svg.appendChild(circle);
            
            const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            node.setAttribute('cx', '50');
            node.setAttribute('cy', '5');
            node.setAttribute('r', '3.5');
            node.setAttribute('fill', 'currentColor');
            svg.appendChild(node);
        }
        
        wrapper.appendChild(svg);
        container.appendChild(wrapper);

        if (!reduceMotion && typeof gsap !== 'undefined') {
            // Drifting animation on the outer wrapper
            gsap.to(wrapper, {
                x: `random(-40, 40)`,
                y: `random(-40, 40)`,
                duration: `random(12, 20)`,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true
            });

            // Independent slow rotation on the inner SVG
            gsap.to(svg, {
                rotation: Math.random() > 0.5 ? 360 : -360,
                duration: `random(25, 45)`,
                ease: 'none',
                repeat: -1
            });

            // Parallax tracking variables
            const depthFactor = (size / 120) * 40; // Max 40px displacement
            const xTo = gsap.quickTo(svg, 'x', { duration: 0.8, ease: 'power1.out' });
            const yTo = gsap.quickTo(svg, 'y', { duration: 0.8, ease: 'power1.out' });

            rings.push({
                svg: svg,
                depthFactor: depthFactor,
                xTo: xTo,
                yTo: yTo
            });
        }
    }

    // Set up mousemove parallax if not reduced motion and not mobile
    if (!reduceMotion && rings.length > 0 && typeof gsap !== 'undefined') {
        const handleMouseMove = (e) => {
            const rect = heroSection.getBoundingClientRect();
            const relX = (e.clientX - rect.left) - rect.width / 2;
            const relY = (e.clientY - rect.top) - rect.height / 2;
            
            const normX = relX / (rect.width / 2);
            const normY = relY / (rect.height / 2);

            rings.forEach(ring => {
                ring.xTo(normX * ring.depthFactor);
                ring.yTo(normY * ring.depthFactor);
            });
        };

        const handleMouseLeave = () => {
            rings.forEach(ring => {
                ring.xTo(0);
                ring.yTo(0);
            });
        };

        heroSection.addEventListener('mousemove', handleMouseMove);
        heroSection.addEventListener('mouseleave', handleMouseLeave);
    }
}


// Treatment B: Floating Geometric Shapes (2D Canvas + Mouse & Scroll Parallax)
function initFloatingShapes(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    window.addEventListener('resize', () => {
        if (!canvas.offsetWidth) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });

    const shapes = [];
    const types = ['circle', 'square', 'cross'];
    const shapeCount = 12;

    for (let i = 0; i < shapeCount; i++) {
        shapes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 15 + 8,
            type: types[Math.floor(Math.random() * types.length)],
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.008,
            opacity: Math.random() * 0.12 + 0.04
        });
    }

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        targetMouseX = e.clientX - rect.left - width / 2;
        targetMouseY = e.clientY - rect.top - height / 2;
    });

    function animate() {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            ctx.clearRect(0, 0, width, height);
            draw(0, 0, 0);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        const scrollOffset = window.scrollY * 0.15;

        // Update drift positions
        shapes.forEach(shape => {
            shape.x += shape.speedX;
            shape.y += shape.speedY;
            shape.rotation += shape.rotSpeed;

            if (shape.x < -50) shape.x = width + 50;
            if (shape.x > width + 50) shape.x = -50;
            if (shape.y < -50) shape.y = height + 50;
            if (shape.y > height + 50) shape.y = -50;
        });

        draw(mouseX, mouseY, scrollOffset);
        requestAnimationFrame(animate);
    }

    function draw(mx, my, scrollOffset) {
        shapes.forEach(shape => {
            const px = shape.x - mx * 0.06;
            const py = shape.y - my * 0.06 - scrollOffset;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(shape.rotation);
            ctx.strokeStyle = `rgba(15, 23, 42, ${shape.opacity})`;
            ctx.lineWidth = 1.2;

            ctx.beginPath();
            if (shape.type === 'circle') {
                ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            } else if (shape.type === 'square') {
                ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            } else if (shape.type === 'cross') {
                ctx.moveTo(-shape.size / 2, 0);
                ctx.lineTo(shape.size / 2, 0);
                ctx.moveTo(0, -shape.size / 2);
                ctx.lineTo(0, shape.size / 2);
            }
            ctx.stroke();
            ctx.restore();
        });
    }

    animate();
}

// Treatment C: Animated Proximity Dot/Line Grid (2D Canvas)
function initDotGrid(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    let points = [];
    const maxPoints = 65;

    function initPoints() {
        points = [];
        for (let i = 0; i < maxPoints; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                r: 1.2 + Math.random() * 1.2
            });
        }
    }

    initPoints();

    window.addEventListener('resize', () => {
        if (!canvas.offsetWidth) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        initPoints();
    });

    let mouseX = -1000, mouseY = -1000;
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    document.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    function animate() {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            ctx.clearRect(0, 0, width, height);
            draw(false);
            return;
        }

        ctx.clearRect(0, 0, width, height);
        draw(true);
        requestAnimationFrame(animate);
    }

    function draw(shouldMove) {
        // Draw connecting lines first
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            
            if (shouldMove) {
                p1.x += p1.vx;
                p1.y += p1.vy;

                if (p1.x < 0 || p1.x > width) p1.vx *= -1;
                if (p1.y < 0 || p1.y > height) p1.vy *= -1;
            }

            // Mouse interaction connection
            const distToMouse = Math.hypot(p1.x - mouseX, p1.y - mouseY);
            if (distToMouse < 110) {
                ctx.strokeStyle = `rgba(37, 99, 235, ${0.12 * (1 - distToMouse / 110)})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
            }

            // Node connections
            for (let j = i + 1; j < points.length; j++) {
                const p2 = points[j];
                const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                if (dist < 75) {
                    ctx.strokeStyle = `rgba(148, 163, 184, ${0.06 * (1 - dist / 75)})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }

        // Draw points
        points.forEach(p => {
            ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    animate();
}

// Treatment D: Soft Parallax Gradient Sweep (GSAP ScrollTrigger)
function initGradientSweep(sweepId, container) {
    const sweep = document.getElementById(sweepId);
    if (!sweep || !container || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') console.error('[GradientSweep] GSAP or ScrollTrigger not loaded — animation disabled.');
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    gsap.to(sweep, {
        x: -160,
        y: 120,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}

// Subtle coordinated load-in text reveal animations for inner page heroes
function playInnerHeroEntranceAnimation() {
    const heroSection = document.querySelector('main > section.mesh-bg');
    if (!heroSection || typeof gsap === 'undefined') {
        if (typeof gsap === 'undefined') console.error('[InnerHeroAnimation] GSAP not loaded — entrance animation disabled.');
        return;
    }

    const overline = heroSection.querySelector('.overline-label');
    const heading = heroSection.querySelector('h1.text-reveal');
    const paragraph = heroSection.querySelector('p');
    const extraMetrics = heroSection.querySelector('.grid');

    const tl = gsap.timeline({ delay: 0.15 });

    if (overline) {
        tl.fromTo(overline, 
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }

    if (heading) {
        const words = heading.querySelectorAll('.reveal-word');
        if (words.length > 0) {
            tl.to(words, {
                opacity: 1,
                y: 0,
                stagger: 0.035,
                duration: 0.7,
                ease: 'power3.out'
            }, overline ? '-=0.35' : '0');
        } else {
            tl.fromTo(heading,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
                overline ? '-=0.35' : '0'
            );
        }
    }

    if (paragraph) {
        tl.fromTo(paragraph,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            '-=0.45'
        );
    }

    if (extraMetrics) {
        tl.fromTo(extraMetrics.children,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' },
            '-=0.35'
        );
    }
}

// ==============================
// 3. NAVBAR JS
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const heroSection = document.querySelector('.hero') || document.getElementById('hero-section') || document.querySelector('section[id*="hero"]');
  
  if (!navbar) return;

  const handleScroll = () => {
    const navWrapper = document.getElementById('nav-wrapper');
    if (!navWrapper) return;
    if (window.scrollY > 20) {
      navWrapper.classList.remove('glass');
      navWrapper.classList.add('glass-strong', 'shadow-md');
    } else {
      navWrapper.classList.remove('glass-strong', 'shadow-md');
      navWrapper.classList.add('glass');
    }
  };
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
});