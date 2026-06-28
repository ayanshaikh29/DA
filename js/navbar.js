/**
 * navbar.js — Universal Navbar Controller
 * Digital Advertise Website
 *
 * Features:
 * 1. On index.html  → Navbar hidden in hero, slides in after scrolling past hero
 * 2. On other pages → Navbar visible immediately on page load
 * 3. Services dropdown → Pure CSS (no JS needed), but JS removes any magnet effect
 * 4. Nav links → All magnet/transform effects removed
 * 5. Mobile menu toggle
 */

(function () {
    'use strict';

    const navbar  = document.getElementById('navbar');
    const isIndex = document.getElementById('hero-scroll-wrapper') !== null;

    /* ─── 1. Show/hide logic ─────────────────────────────────── */

    function showNavbar() {
        navbar.classList.add('nav-visible');
    }

    function hideNavbar() {
        navbar.classList.remove('nav-visible');
    }

    if (!isIndex) {
        /* Non-hero pages: show navbar immediately */
        showNavbar();
    } else {
        /* Index page: watch scroll position vs hero wrapper height */
        const heroWrapper = document.getElementById('hero-scroll-wrapper');

        function onScroll() {
            if (window.scrollY >= heroWrapper.offsetHeight - 100) {
                showNavbar();
            } else {
                hideNavbar();
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Run once on load
    }

    /* ─── 2. Navbar glass effect on scroll ──────────────────── */
    window.addEventListener('scroll', function () {
        if (!navbar) return;
        if (window.scrollY > 20) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }, { passive: true });

    /* ─── 3. Kill any JS magnet / mousemove effects on nav links ─── */
    /* Remove all mousemove listeners from nav elements by cloning them */
    document.addEventListener('DOMContentLoaded', function () {
        const navLinks = navbar ? navbar.querySelectorAll('a, .nav-dropdown > a') : [];
        navLinks.forEach(function (link) {
            /* Override any inline transform styles set by external scripts */
            link.addEventListener('mousemove', function (e) {
                e.currentTarget.style.transform = 'none';
            });
            link.addEventListener('mouseleave', function (e) {
                e.currentTarget.style.transform = 'none';
            });
        });
    });

    /* ─── 4. Mobile Menu Toggle ─────────────────────────────── */
    window.toggleMobileMenu = function () {
        const menu     = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        if (!menu) return;

        const isHidden = menu.classList.contains('hidden');
        if (isHidden) {
            menu.classList.remove('hidden');
            menu.classList.add('flex');
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', 'x');
                if (window.lucide) lucide.createIcons();
            }
        } else {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', 'menu');
                if (window.lucide) lucide.createIcons();
            }
        }
    };

    /* ─── 5. Close mobile menu on outside click ─────────────── */
    document.addEventListener('click', function (e) {
        const menu = document.getElementById('mobile-menu');
        if (!menu || menu.classList.contains('hidden')) return;
        if (!navbar.contains(e.target)) {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
            const menuIcon = document.getElementById('menu-icon');
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', 'menu');
                if (window.lucide) lucide.createIcons();
            }
        }
    });

    /* ─── 6. WhatsApp float button — force green background ─────── */
    setTimeout(function () {
        var wa = document.querySelector('.whatsapp-float');
        if (wa) {
            wa.style.backgroundColor = '#25d366';
            wa.style.color = 'white';
        }
    }, 500);

})();
