/**
 * ============================================================
 * DIGITAL ADVERTISE — 3D Particle Morphing Hero Engine
 * Three.js r128 + GSAP 3 + ScrollTrigger
 * GPU-Accelerated particle morphs with fluid explosion & glowing custom shader
 * Model Loader Integration (GLTFLoader) with Math Fallbacks
 * ============================================================
 */

(function () {
    'use strict';

    // ── Guard ──────────────────────────────────────────────────────────────────
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
        console.error('[Hero] THREE.js or GSAP failed to load — hero animation disabled.');
        return;
    }

    const HERO = document.getElementById('hero-section');
    const WRAPPER = document.getElementById('hero-scroll-wrapper');
    const canvas = document.getElementById('hero-threejs-canvas');
    if (!HERO || !WRAPPER || !canvas) {
        console.error('[Hero] Required DOM elements missing — hero animation disabled.');
        return;
    }

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const IS_MOBILE = window.innerWidth < 768;

    // ── Particle counts (scaled for mobile performance) ───────────────────────
    const PARTICLE_COUNT = REDUCED ? 0 : (IS_MOBILE ? 6000 : 14000);

    // Scroll inertia variables for atmospheric particle system
    let currentScrollVelocity = 0;
    let targetScrollVelocity = 0;

    if (REDUCED) {
        console.log('[Hero] Reduced motion detected. Disabling WebGL animation.');
        return;
    }

    // ============================================================
    //  THREE.JS SETUP
    // ============================================================
    const W = () => HERO.clientWidth;
    const H = () => HERO.clientHeight;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !IS_MOBILE,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x050816, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050816);

    const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100);
    
    // Zoomed out Z positions to push the object further back and prevent overflow
    const getCamZ = () => {
        const aspect = W() / H();
        if (aspect < 0.8) return 30.0; // Mobile / vertical aspect ratio
        if (aspect < 1.2) return 25.0; // Tablet
        return 22.0; // Desktop
    };
    camera.position.set(0, 0, getCamZ());

    // Subtle ambient lighting
    scene.add(new THREE.AmbientLight(0x080c25, 1));

    const clock = new THREE.Clock();

    // ============================================================
    //  FALLBACK MATHEMATICAL SHAPE GENERATORS (REFINED TO MATCH IMAGES)
    // ============================================================

    // ============================================================
    //  SHAPE 1 — CLASSIC PARTICLE ROCKET (mathematical)
    //  Reference: orange body shell + blue fins/window/nozzle + exhaust plume
    // ============================================================
    function generateRocketPositions(i, total) {
        var x = 0, y = 0, z = 0;
        var pct = i / total;

        if (pct < 0.10) {
            // ── PART 1 — NOSE CONE (10%) ────────────────────────
            // Sharp ogive taper: y from 5.0 to 10.0, radius tapers to 0 at tip
            var t = Math.random();
            var ny = 5.0 + t * 5.0;
            var nr = 0.95 * Math.sqrt(Math.max(0, 1.0 - Math.pow(t, 1.6)));
            var theta = Math.random() * Math.PI * 2;
            var rr = Math.random() < 0.80 ? nr : Math.random() * nr * 0.5;
            x = rr * Math.cos(theta);
            y = ny;
            z = rr * Math.sin(theta);

        } else if (pct < 0.42) {
            // ── PART 2 — MAIN BODY CYLINDER (32%) ───────────────
            // y from -3.5 to 5.0, radius 0.95 with barrel bulge
            // 78% surface shell particles, 22% sparse interior fill
            var fy = -3.5 + Math.random() * 8.5;
            var bulge = 0.12 * Math.sin(((fy + 3.5) / 8.5) * Math.PI);
            var fr = 0.95 + bulge;
            var theta = Math.random() * Math.PI * 2;
            var rr = Math.random() < 0.78 ? fr : Math.random() * fr * 0.6;
            x = rr * Math.cos(theta);
            y = fy;
            z = rr * Math.sin(theta);

        } else if (pct < 0.47) {
            // ── PART 3 — PORTHOLE WINDOW (5%) ───────────────────
            // Prominent circular ring at y=2.0 to y=3.5, ring radius 0.50
            var wy = 2.0 + Math.random() * 1.5;
            var theta = Math.random() * Math.PI * 2;
            var rr = 0.50 + (Math.random() - 0.5) * 0.06;
            x = rr * Math.cos(theta);
            y = wy;
            z = rr * Math.sin(theta);

        } else if (pct < 0.60) {
            // ── PART 4 — LEFT FIN (13%) ─────────────────────────
            // Large swept-back curved fin, LEFT side (z negative)
            var t1 = Math.random(), t2 = Math.random();
            if (t1 + t2 > 1) { t1 = 1 - t1; t2 = 1 - t2; }
            var t3 = 1 - t1 - t2;
            // Swept-back triangle: top at body(-0.95, -2.5), trailing(-0.95, -6.5), tip(-4.5, -5.5)
            z = t1 * (-0.95) + t2 * (-0.95) + t3 * (-4.5);
            y = t1 * (-2.5) + t2 * (-6.5) + t3 * (-5.5);
            x = (Math.random() - 0.5) * 0.12;

        } else if (pct < 0.73) {
            // ── PART 5 — RIGHT FIN (13%) ────────────────────────
            // Mirror of left fin, RIGHT side (z positive)
            var t1 = Math.random(), t2 = Math.random();
            if (t1 + t2 > 1) { t1 = 1 - t1; t2 = 1 - t2; }
            var t3 = 1 - t1 - t2;
            z = t1 * (0.95) + t2 * (0.95) + t3 * (4.5);
            y = t1 * (-2.5) + t2 * (-6.5) + t3 * (-5.5);
            x = (Math.random() - 0.5) * 0.12;

        } else if (pct < 0.78) {
            // ── PART 6 — CENTER BOTTOM FIN (5%) ─────────────────
            // Small ventral fin at x=0.95 to x=3.0, y=-3.5 to y=-5.5
            x = 0.95 + Math.random() * 2.05;
            y = -3.5 - Math.random() * 2.0;
            z = (Math.random() - 0.5) * 0.10;

        } else if (pct < 0.85) {
            // ── PART 7 — ENGINE NOZZLE (7%) ─────────────────────
            // Bell-shaped nozzle, y from -3.8 to -5.0
            var ny = -3.8 - Math.random() * 1.2;
            var nr = 0.45 + (0.80 - 0.45) * ((-3.8 - ny) / 1.2);
            var theta = Math.random() * Math.PI * 2;
            x = nr * Math.cos(theta);
            y = ny;
            z = nr * Math.sin(theta);

        } else {
            // ── PART 8 — EXHAUST FLAME PLUME (15%) ──────────────
            // Wide spreading cone below nozzle, y from -5.0 to -11.0
            var t = Math.random();
            var ny = -5.0 - t * 6.0;
            var plumeR = 0.85 * Math.sin(t * Math.PI * 0.85);
            plumeR = Math.max(0.02, plumeR);
            var theta = Math.random() * Math.PI * 2;
            var rr = Math.random() * plumeR;
            var spread = t * 4.0;
            x = rr * Math.cos(theta) + (Math.random() - 0.5) * spread;
            y = ny;
            z = rr * Math.sin(theta) + (Math.random() - 0.5) * spread;
        }

        // Apply -15 degree Z rotation (slight diagonal tilt)
        var TILT_Z = -15 * Math.PI / 180;
        var cosZ = Math.cos(TILT_Z), sinZ = Math.sin(TILT_Z);
        var rx = x * cosZ - y * sinZ;
        var ry = x * sinZ + y * cosZ;

        // Apply +5 degree X rotation for 3D depth
        var TILT_X = 5 * Math.PI / 180;
        var cosX = Math.cos(TILT_X), sinX = Math.sin(TILT_X);
        var ry2 = ry * cosX - z * sinX;
        var rz2 = ry * sinX + z * cosX;

        return { x: rx, y: ry2, z: rz2 };
    }

    // ============================================================
    //  SHAPE 2 — BULLSEYE TARGET (precision targeting visualization)
    //  5 concentric rings + center dot + arrow + crosshair lines
    // ============================================================
    function generateBullseyePositions(i, total) {
        var x = 0, y = 0, z = 0;
        var pct = i / total;

        if (pct < 0.12) {
            // ── RING 5 — Outermost white ring (12%) ──
            var subPct = pct / 0.12;
            var r;
            if (subPct < 0.25) {
                r = 7.0;
            } else {
                r = 7.0 + Math.random() * 0.6;
            }
            var theta = Math.random() * Math.PI * 2;
            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 0.3;

        } else if (pct < 0.22) {
            // ── RING 4 — Black ring (10%) ──
            var subPct = (pct - 0.12) / 0.10;
            var r;
            if (subPct < 0.25) {
                r = 5.5;
            } else {
                r = 5.5 + Math.random() * 1.3;
            }
            var theta = Math.random() * Math.PI * 2;
            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 0.3;

        } else if (pct < 0.34) {
            // ── RING 3 — Blue ring (12%) ──
            var subPct = (pct - 0.22) / 0.12;
            var r;
            if (subPct < 0.25) {
                r = 4.0;
            } else {
                r = 4.0 + Math.random() * 1.3;
            }
            var theta = Math.random() * Math.PI * 2;
            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 0.3;

        } else if (pct < 0.48) {
            // ── RING 2 — Red ring (14%) ──
            var subPct = (pct - 0.34) / 0.14;
            var r;
            if (subPct < 0.25) {
                r = 2.4;
            } else {
                r = 2.4 + Math.random() * 1.4;
            }
            var theta = Math.random() * Math.PI * 2;
            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 0.3;

        } else if (pct < 0.60) {
            // ── RING 1 — Inner dark red ring (12%) ──
            var subPct = (pct - 0.48) / 0.12;
            var r;
            if (subPct < 0.25) {
                r = 1.0;
            } else {
                r = 1.0 + Math.random() * 1.2;
            }
            var theta = Math.random() * Math.PI * 2;
            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 0.3;

        } else if (pct < 0.68) {
            // ── BULLSEYE CENTER DOT (8%) ──
            var r = Math.random() * 0.8;
            var theta = Math.random() * Math.PI * 2;
            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 0.3;

        } else if (pct < 0.76) {
            // ── CROSSHAIR LINES (8%) ──
            if (Math.random() < 0.5) {
                y = (Math.random() - 0.5) * 0.12;
                x = -8.5 + Math.random() * 17.0;
                z = (Math.random() - 0.5) * 0.08;
                if (x > -0.9 && x < 0.9) {
                    x = Math.random() < 0.5 ? -0.9 - Math.random() * 0.5 : 0.9 + Math.random() * 0.5;
                }
            } else {
                x = (Math.random() - 0.5) * 0.12;
                y = -8.5 + Math.random() * 17.0;
                z = (Math.random() - 0.5) * 0.08;
                if (y > -0.9 && y < 0.9) {
                    y = Math.random() < 0.5 ? -0.9 - Math.random() * 0.5 : 0.9 + Math.random() * 0.5;
                }
            }

        } else {
            // ── ARROW (24% — pct 0.76 to 1.0) ──
            var arrowPct = (pct - 0.76) / 0.24;

            if (arrowPct < 0.50) {
                // Arrow shaft — from (7.0,7.0) to exact center (0,0)
                var t = arrowPct / 0.50;
                var startX = 7.0, startY = 7.0;
                var tipX = 0.0, tipY = 0.0;
                var dx = tipX - startX;
                var dy = tipY - startY;
                var len = Math.sqrt(dx * dx + dy * dy);
                var nx = dx / len;
                var ny = dy / len;
                var px = -ny;
                var py = nx;
                var perpOffset = (Math.random() - 0.5) * 0.14;
                x = startX + t * dx + perpOffset * px;
                y = startY + t * dy + perpOffset * py;
                z = (Math.random() - 0.5) * 0.1;

            } else if (arrowPct < 0.80) {
                // Arrow head triangle — tip at exact center (0,0)
                // Base left: (-1.0, 1.4), Base right: (1.0, 1.4)
                var r1 = Math.random();
                var r2 = Math.random();
                if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
                var r3 = 1 - r1 - r2;
                x = r1 * 0.0 + r2 * (-1.0) + r3 * 1.0;
                y = r1 * 0.0 + r2 * 1.4 + r3 * 1.4;
                z = (Math.random() - 0.5) * 0.08;

            } else if (arrowPct < 0.90) {
                // Fletching fin 1 — tail at (7.0,7.0)
                var t1 = Math.random(), t2 = Math.random();
                if (t1 + t2 > 1) { t1 = 1 - t1; t2 = 1 - t2; }
                var t3 = 1 - t1 - t2;
                x = t1 * 7.0 + t2 * 7.7 + t3 * 7.3;
                y = t1 * 7.0 + t2 * 6.5 + t3 * 7.7;
                z = (Math.random() - 0.5) * 0.08;

            } else {
                // Fletching fin 2 — tail at (7.0,7.0)
                var t1 = Math.random(), t2 = Math.random();
                if (t1 + t2 > 1) { t1 = 1 - t1; t2 = 1 - t2; }
                var t3 = 1 - t1 - t2;
                x = t1 * 7.0 + t2 * 6.5 + t3 * 7.7;
                y = t1 * 7.0 + t2 * 7.7 + t3 * 6.5;
                z = (Math.random() - 0.5) * 0.08;
            }
        }

        // 15 degree X-axis tilt (face viewer)
        var TILT_X = 15 * Math.PI / 180;
        var ry = y * Math.cos(TILT_X) - z * Math.sin(TILT_X);
        var rz = y * Math.sin(TILT_X) + z * Math.cos(TILT_X);

        // 8 degree Z-axis rotation (slight clockwise tilt)
        var TILT_Z = 8 * Math.PI / 180;
        var rx2 = x * Math.cos(TILT_Z) - ry * Math.sin(TILT_Z);
        var ry2 = x * Math.sin(TILT_Z) + ry * Math.cos(TILT_Z);

        return { x: rx2, y: ry2, z: rz };
    }

    // ============================================================
    //  SHAPE 3 — EARTH GLOBE (global reach data visualization)
    //  Particle sphere + grid lines + data stream arcs + city markers
    // ============================================================
    function generateGlobePositions(i, total) {
        var x = 0, y = 0, z = 0;
        var pct = i / total;
        var R = 4.2;

        if (pct < 0.45) {
            // ── GLOBE SPHERE SURFACE (45%) ──
            var phi = Math.acos(1 - 2 * Math.random());
            var theta = Math.random() * 2 * Math.PI;
            x = R * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 0.15;
            y = R * Math.cos(phi) + (Math.random() - 0.5) * 0.15;
            z = R * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 0.15;

        } else if (pct < 0.60) {
            // ── LATITUDE GRID LINES (15%) ──
            var latIdx = Math.floor(Math.random() * 6);
            var latY = -3.6 + latIdx * 1.44;
            var latR = Math.sqrt(Math.max(0, R * R - latY * latY));
            var theta = Math.random() * 2 * Math.PI;
            x = latR * Math.cos(theta);
            y = latY + (Math.random() - 0.5) * 0.08;
            z = latR * Math.sin(theta);

        } else if (pct < 0.70) {
            // ── LONGITUDE GRID LINES (10%) ──
            var lonIdx = Math.floor(Math.random() * 8);
            var lonTheta = (lonIdx / 8) * 2 * Math.PI;
            var phi = Math.random() * Math.PI;
            x = R * Math.sin(phi) * Math.cos(lonTheta) + (Math.random() - 0.5) * 0.08;
            y = R * Math.cos(phi);
            z = R * Math.sin(phi) * Math.sin(lonTheta);

        } else if (pct < 0.90) {
            // ── DATA STREAM ARCS (20%) ──
            var arcIdx = Math.floor(Math.random() * 6);
            var arcCities = [
                { lat: 40.7 * Math.PI / 180, lon: -74.0 * Math.PI / 180 },
                { lat: 51.5 * Math.PI / 180, lon: -0.1 * Math.PI / 180 },
                { lat: 25.2 * Math.PI / 180, lon: 55.3 * Math.PI / 180 },
                { lat: 19.1 * Math.PI / 180, lon: 72.9 * Math.PI / 180 },
                { lat: 1.3 * Math.PI / 180, lon: 103.8 * Math.PI / 180 },
                { lat: 35.7 * Math.PI / 180, lon: 139.7 * Math.PI / 180 }
            ];
            var arcPairs = [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]
            ];
            var pair = arcPairs[arcIdx];
            var start = arcCities[pair[0]];
            var end = arcCities[pair[1]];

            var p1x = R * Math.cos(start.lat) * Math.cos(start.lon);
            var p1y = R * Math.sin(start.lat);
            var p1z = R * Math.cos(start.lat) * Math.sin(start.lon);
            var p2x = R * Math.cos(end.lat) * Math.cos(end.lon);
            var p2y = R * Math.sin(end.lat);
            var p2z = R * Math.cos(end.lat) * Math.sin(end.lon);

            var t = Math.random();
            var dotProduct = p1x * p2x + p1y * p2y + p1z * p2z;
            var omega = Math.acos(Math.min(1, Math.max(-1, dotProduct / (R * R))));
            var sinOmega = Math.sin(omega);

            if (Math.abs(sinOmega) < 0.001) {
                x = p1x + t * (p2x - p1x);
                y = p1y + t * (p2y - p1y);
                z = p1z + t * (p2z - p1z);
            } else {
                var c1 = Math.sin((1 - t) * omega) / sinOmega;
                var c2 = Math.sin(t * omega) / sinOmega;
                x = c1 * p1x + c2 * p2x;
                y = c1 * p1y + c2 * p2y;
                z = c1 * p1z + c2 * p2z;
            }

            var altitude = R + 1.2 * Math.sin(t * Math.PI);
            var len = Math.sqrt(x * x + y * y + z * z);
            x = (x / len) * altitude;
            y = (y / len) * altitude;
            z = (z / len) * altitude;

        } else if (pct < 0.96) {
            // ── CITY DOT MARKERS (6%) ──
            var cityIdx = Math.floor(Math.random() * 6);
            var cities = [
                { lat: 40.7 * Math.PI / 180, lon: -74.0 * Math.PI / 180 },
                { lat: 51.5 * Math.PI / 180, lon: -0.1 * Math.PI / 180 },
                { lat: 25.2 * Math.PI / 180, lon: 55.3 * Math.PI / 180 },
                { lat: 19.1 * Math.PI / 180, lon: 72.9 * Math.PI / 180 },
                { lat: 1.3 * Math.PI / 180, lon: 103.8 * Math.PI / 180 },
                { lat: 35.7 * Math.PI / 180, lon: 139.7 * Math.PI / 180 }
            ];
            var city = cities[cityIdx];
            var cx = R * Math.cos(city.lat) * Math.cos(city.lon);
            var cy = R * Math.sin(city.lat);
            var cz = R * Math.cos(city.lat) * Math.sin(city.lon);
            x = cx + (Math.random() - 0.5) * 0.25;
            y = cy + (Math.random() - 0.5) * 0.25;
            z = cz + (Math.random() - 0.5) * 0.25;

        } else {
            // ── AXIS POLES (4%) ──
            if (Math.random() < 0.5) {
                y = 4.0 + Math.random() * 1.5;
            } else {
                y = -5.5 + Math.random() * 1.5;
            }
            x = (Math.random() - 0.5) * 0.2;
            z = (Math.random() - 0.5) * 0.2;
        }

        // Apply 23.5 degree Z tilt (Earth's axial tilt)
        var TILT_Z = 23.5 * Math.PI / 180;
        var cosZ = Math.cos(TILT_Z), sinZ = Math.sin(TILT_Z);
        var rx = x * cosZ - y * sinZ;
        var ry = x * sinZ + y * cosZ;

        return { x: rx, y: ry, z: z };
    }

    // ============================================================
    //  BUFFER GEOMETRY INITIALIZATION
    // ============================================================
    const geometry = new THREE.BufferGeometry();

    const positionsShape1 = new Float32Array(PARTICLE_COUNT * 3);
    const positionsShape2 = new Float32Array(PARTICLE_COUNT * 3);
    const positionsShape3 = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    // Per-particle randomized sizes (small / medium / large variation)
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Pre-populate Shape1 with math fallback
        const s1 = generateRocketPositions(i, PARTICLE_COUNT);
        positionsShape1[i * 3]     = s1.x;
        positionsShape1[i * 3 + 1] = s1.y;
        positionsShape1[i * 3 + 2] = s1.z;

        const s2 = generateBullseyePositions(i, PARTICLE_COUNT);
        positionsShape2[i * 3]     = s2.x;
        positionsShape2[i * 3 + 1] = s2.y;
        positionsShape2[i * 3 + 2] = s2.z;

        const s3 = generateGlobePositions(i, PARTICLE_COUNT);
        positionsShape3[i * 3]     = s3.x;
        positionsShape3[i * 3 + 1] = s3.y;
        positionsShape3[i * 3 + 2] = s3.z;

        // ── COLOR: Bullseye Target — precision targeting colors ──
        var sPct = i / PARTICLE_COUNT;
        var color;

        if (sPct < 0.12) {
            color = new THREE.Color(0xe2e8f0); // ring 5 white
        } else if (sPct < 0.22) {
            color = new THREE.Color(0x1e293b); // ring 4 black
        } else if (sPct < 0.34) {
            color = new THREE.Color(0x2563eb); // ring 3 blue
        } else if (sPct < 0.48) {
            color = new THREE.Color(0xef4444); // ring 2 red
        } else if (sPct < 0.60) {
            color = new THREE.Color(0xdc2626); // ring 1 dark red
        } else if (sPct < 0.68) {
            color = new THREE.Color(0xfbbf24); // center gold
        } else if (sPct < 0.76) {
            color = new THREE.Color(0x94a3b8); // crosshair slate
        } else {
            color = new THREE.Color(0xf59e0b); // arrow amber
        }
        colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;

        // ── PARTICLE SIZE: randomized small / medium / large variation ─────────
        const sRand = Math.random();
        if (sRand < 0.60)      { sizes[i] = 40 + Math.random() * 35;  }
        else if (sRand < 0.90) { sizes[i] = 75 + Math.random() * 45;  }
        else                   { sizes[i] = 120 + Math.random() * 55; }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positionsShape1, 3));
    geometry.setAttribute('aTarget1', new THREE.BufferAttribute(positionsShape2, 3));
    geometry.setAttribute('aTarget2', new THREE.BufferAttribute(positionsShape3, 3));
    geometry.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    // ============================================================
    //  VIDEO-EXTRACTED PARTICLE DATA — DISABLED
    //  Rocket uses pure math geometry. Video/binary loader
    //  is permanently disabled so it cannot overwrite the rocket.
    // ============================================================
    let rocketGLBLoaded = true;

    function loadVideoRocketData() {
        console.log('[Hero] Video rocket loader disabled — using math geometry.');
    }

    function applyVideoParticles(srcPos, srcCol, srcCount) {
        // intentionally no-op
    }


    // ============================================================
    //  CUSTOM SHADER MATERIAL (GPU MORPHING & EXTREME DISPERSION)
    // ============================================================
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uProgress: { value: 0.0 }, // 0.0 -> 1.0 (Shape 1 -> 2), 1.0 -> 2.0 (Shape 2 -> 3)
            uNoiseScale: { value: 2.0 }, // Tight noise scale
            uDispersionScale: { value: 4.5 }, // Tight dispersion scale
            uOpacity: { value: 0.95 },
            uSizeScale: { value: 1.0 }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uProgress;
            uniform float uNoiseScale;
            uniform float uDispersionScale;
            uniform float uSizeScale;
            
            attribute vec3 aTarget1;
            attribute vec3 aTarget2;
            attribute vec3 aColor;
            attribute float aSize;
            
            varying vec3 vColor;
            varying float vDepth;

            // Simple high-frequency sine-based pseudo-random noise generator
            float hash(vec3 p) {
                p = fract(p * 0.3183099 + vec3(0.1));
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            void main() {
                vColor = aColor;
                
                // 1. Linearly morph coordinates in GPU
                vec3 pos = vec3(0.0);
                if (uProgress <= 1.0) {
                    pos = mix(position, aTarget1, uProgress);
                } else {
                    pos = mix(aTarget1, aTarget2, uProgress - 1.0);
                }
                
                // 2. Shockwave explosion dispersion strictly active between sub-progress 0.3 and 0.7
                float subProgress = (uProgress <= 1.0) ? uProgress : (uProgress - 1.0);
                float dispersion = 0.0;
                if (subProgress > 0.3 && subProgress < 0.7) {
                    // Create a smooth bell curve that rises from 0.0 at 0.3, peaks at 1.0 at 0.5, and drops to 0.0 at 0.7
                    float normalizedP = (subProgress - 0.3) / 0.4;
                    dispersion = sin(normalizedP * 3.14159265);
                }
                
                // Normal direction from center for radial explosion
                vec3 dir = normalize(pos + vec3(0.001));
                
                // Wild noise vector based on positions and time
                vec3 noiseVec = vec3(
                    sin(pos.y * 6.0 + uTime * 4.0) * 0.3,
                    cos(pos.z * 5.5 + uTime * 3.6) * 0.3,
                    sin(pos.x * 6.5 + uTime * 4.4) * 0.3
                );
                
                // Apply radial explosion displacement + fluid turbulence
                pos += dir * dispersion * uDispersionScale + noiseVec * dispersion * uNoiseScale;
                
                // 3. Rotation — STOPS for Scene 2 (Bullseye) to keep it static
                // isBullseye = 1.0 during scene 2, 0.0 otherwise
                float isBullseye = smoothstep(0.6, 1.0, uProgress) * (1.0 - smoothstep(1.0, 1.4, uProgress));
                float angle = uTime * 0.05 * (1.0 - isBullseye) + uProgress * 0.8 * (1.0 - isBullseye);
                float cosA = cos(angle);
                float sinA = sin(angle);
                vec3 rotatedPos = pos;
                rotatedPos.x = pos.x * cosA - pos.z * sinA;
                rotatedPos.z = pos.x * sinA + pos.z * cosA;
                
                // 4. Apply diagonal tilt (-38 deg) specifically for Shape 1 (Rocket)
                // The tilt fades out as uProgress goes from 0.0 to 1.0
                float tiltAngle = -0.663 * (1.0 - smoothstep(0.0, 1.0, uProgress));
                float cosT = cos(tiltAngle);
                float sinT = sin(tiltAngle);
                float tiltedX = rotatedPos.x * cosT - rotatedPos.y * sinT;
                float tiltedY = rotatedPos.x * sinT + rotatedPos.y * cosT;
                rotatedPos.x = tiltedX;
                rotatedPos.y = tiltedY;
                
                // Project position to view space
                vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
                
                // Size pulse — OFF for Scene 2 (Bullseye) = no blink
                float sizePulse = 1.0 + (0.18 * (1.0 - isBullseye)) * sin(uTime * 1.8 + pos.x * 0.7 + pos.y * 0.5);
                // aSize is pre-baked random (40–175) — drives the rich size variation
                gl_PointSize = (aSize / -mvPosition.z) * sizePulse * uSizeScale;
                gl_Position = projectionMatrix * mvPosition;
                
                vDepth = -mvPosition.z;
            }
        `,
        fragmentShader: `
            uniform float uOpacity;
            varying vec3 vColor;
            varying float vDepth;

            void main() {
                // Glowing soft round point
                vec2 uv = gl_PointCoord - vec2(0.5);
                float dist = length(uv);
                
                // Discard outer bounds of point box
                if (dist > 0.5) discard;
                
                // Soft gradient circular falloff — wider core glow for volumetric fill
                float intensity = smoothstep(0.5, 0.0, dist);
                
                // Bright white hot core in center — larger and brighter for dense look
                float core = smoothstep(0.20, 0.0, dist) * 1.0;
                
                vec3 finalColor = mix(vColor, vColor + vec3(core), 0.85);
                gl_FragColor = vec4(finalColor, intensity * uOpacity);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ============================================================
    //  ATMOSPHERIC PARTICLE SYSTEM (ENVIRONMENTAL SPACE DUST)
    // ============================================================
    const atmosphereGeometry = new THREE.BufferGeometry();
    const atmosphereCount = IS_MOBILE ? 450 : 1200;
    
    const atmospherePositions = new Float32Array(atmosphereCount * 3);
    const atmosphereSpeeds = new Float32Array(atmosphereCount);
    const atmosphereSizes = new Float32Array(atmosphereCount);
    const atmosphereOpacities = new Float32Array(atmosphereCount);
    const atmosphereOffsets = new Float32Array(atmosphereCount * 3);
    const atmosphereColors = new Float32Array(atmosphereCount * 3);
    
    // Palette: warm orange, golden yellow, electric blue, soft cyan, occasional white
    const palette = [
        new THREE.Color(0xf97316), // warm orange
        new THREE.Color(0xeab308), // golden yellow
        new THREE.Color(0x2563eb), // electric blue
        new THREE.Color(0x38bdf8), // soft cyan
        new THREE.Color(0xffffff)  // white highlight
    ];
    
    for (let i = 0; i < atmosphereCount; i++) {
        // Distribute across the entire viewport (depth from -50 to 25, camera is at 22-30)
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 44;
        const z = (Math.random() - 0.5) * 75 - 12.5; // range: [-50, 25]
        
        atmospherePositions[i * 3] = x;
        atmospherePositions[i * 3 + 1] = y;
        atmospherePositions[i * 3 + 2] = z;
        
        // Random offsets for individual noise paths
        atmosphereOffsets[i * 3] = Math.random() * 100;
        atmosphereOffsets[i * 3 + 1] = Math.random() * 100;
        atmosphereOffsets[i * 3 + 2] = Math.random() * 100;
        
        // Multi-layered depth properties
        if (z > 10) {
            // Foreground: closer, larger, slower, higher base opacity
            atmosphereSizes[i] = Math.random() * 5.0 + 8.0; // 8.0 to 13.0
            atmosphereSpeeds[i] = Math.random() * 0.4 + 0.3; // 0.3 to 0.7
            atmosphereOpacities[i] = Math.random() * 0.25 + 0.45; // 0.45 to 0.70
        } else if (z > -15) {
            // Midground
            atmosphereSizes[i] = Math.random() * 3.0 + 4.0; // 4.0 to 7.0
            atmosphereSpeeds[i] = Math.random() * 0.4 + 0.7; // 0.7 to 1.1
            atmosphereOpacities[i] = Math.random() * 0.25 + 0.35; // 0.35 to 0.60
        } else {
            // Background: deeper, smaller, faster, reduced opacity
            atmosphereSizes[i] = Math.random() * 2.0 + 2.0; // 2.0 to 4.0
            atmosphereSpeeds[i] = Math.random() * 0.8 + 1.2; // 1.2 to 2.0
            atmosphereOpacities[i] = Math.random() * 0.2 + 0.15; // 0.15 to 0.35
        }
        
        // Color distribution: 30% orange, 15% gold, 25% blue, 25% cyan, 5% white
        const rVal = Math.random();
        let color = palette[4]; // default white
        if (rVal < 0.30) color = palette[0];
        else if (rVal < 0.45) color = palette[1];
        else if (rVal < 0.70) color = palette[2];
        else if (rVal < 0.95) color = palette[3];
        
        atmosphereColors[i * 3] = color.r;
        atmosphereColors[i * 3 + 1] = color.g;
        atmosphereColors[i * 3 + 2] = color.b;
    }
    
    atmosphereGeometry.setAttribute('position', new THREE.BufferAttribute(atmospherePositions, 3));
    atmosphereGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(atmosphereSpeeds, 1));
    atmosphereGeometry.setAttribute('aSize', new THREE.BufferAttribute(atmosphereSizes, 1));
    atmosphereGeometry.setAttribute('aOpacity', new THREE.BufferAttribute(atmosphereOpacities, 1));
    atmosphereGeometry.setAttribute('aOffset', new THREE.BufferAttribute(atmosphereOffsets, 3));
    atmosphereGeometry.setAttribute('aColor', new THREE.BufferAttribute(atmosphereColors, 3));
    
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uScrollVelocity: { value: 0.0 },
            uMouse: { value: new THREE.Vector2(0.0, 0.0) }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uScrollVelocity;
            uniform vec2 uMouse;
            
            attribute float aSpeed;
            attribute float aSize;
            attribute float aOpacity;
            attribute vec3 aOffset;
            attribute vec3 aColor;
            
            varying vec3 vColor;
            varying float vOpacity;
            
            void main() {
                vColor = aColor;
                
                // Animate time factor with custom speed and scroll speed enhancement
                float time = uTime * 0.06 * aSpeed + uScrollVelocity * 0.6;
                
                // Apply floating space-dust drift
                vec3 pos = position;
                pos.x += sin(time + aOffset.x) * 2.2;
                pos.y += cos(time * 0.8 + aOffset.y) * 1.8;
                pos.z += sin(time * 0.5 + aOffset.z) * 1.5;
                
                // Depth-based mouse parallax (foreground moves more, background moves less)
                // pos.z is in [-50, 25]. Translate to normalized range [0, 1]
                float depthFactor = (pos.z + 50.0) / 75.0; 
                pos.x += uMouse.x * 2.8 * depthFactor;
                pos.y += uMouse.y * 2.2 * depthFactor;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                
                // GPU Size attenuation
                gl_PointSize = (aSize * 32.0) / -mvPosition.z;
                gl_Position = projectionMatrix * mvPosition;
                
                // Opacity breathing (frequency based on speed)
                float breathe = 0.35 + 0.65 * sin(uTime * 0.15 * aSpeed + aOffset.x * 2.0);
                vOpacity = aOpacity * breathe;
                
                // Softly fade out near/far boundaries
                float distToCam = -mvPosition.z;
                if (distToCam < 2.0) {
                    vOpacity *= smoothstep(0.2, 2.0, distToCam); // Fade near lens
                }
                if (distToCam > 45.0) {
                    vOpacity *= smoothstep(55.0, 45.0, distToCam); // Fade far background
                }
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vOpacity;
            
            void main() {
                // Circular points with smooth feathered edge
                vec2 uv = gl_PointCoord - vec2(0.5);
                float dist = length(uv);
                if (dist > 0.5) discard;
                
                // Soft radial gradient falloff
                float intensity = smoothstep(0.5, 0.05, dist);
                
                // Tiny hot bright center for sparkle effect
                float core = smoothstep(0.12, 0.0, dist) * 0.45;
                
                gl_FragColor = vec4(vColor + vec3(core), intensity * vOpacity);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const atmosphereParticles = new THREE.Points(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereParticles);

    // ============================================================
    //  BACKGROUND STAR FIELD — bright small twinkling stars
    // ============================================================
    const starGeometry = new THREE.BufferGeometry();
    const starCount = IS_MOBILE ? 1500 : 4000;

    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);
    const starTwinkleOffsets = new Float32Array(starCount);

    const starPalette = [
        new THREE.Color(0xffffff), // bright white
        new THREE.Color(0xe0e7ff), // ice blue-white
        new THREE.Color(0xc7d2fe), // soft lavender
        new THREE.Color(0xbfdbfe), // light blue
        new THREE.Color(0xfde68a), // warm yellow
    ];

    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3]     = (Math.random() - 0.5) * 80;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;

        const depth = (starPositions[i * 3 + 2] + 50) / 80;
        starSizes[i] = (Math.random() < 0.85)
            ? 1.0 + Math.random() * 2.0   // 85% tiny pinpoints
            : 2.5 + Math.random() * 3.5;  // 15% slightly larger bright stars

        const c = starPalette[Math.floor(Math.random() * starPalette.length)];
        starColors[i * 3]     = c.r;
        starColors[i * 3 + 1] = c.g;
        starColors[i * 3 + 2] = c.b;

        starTwinkleOffsets[i] = Math.random() * 6.28;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('aTwinkle', new THREE.BufferAttribute(starTwinkleOffsets, 1));

    const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 }
        },
        vertexShader: `
            uniform float uTime;
            attribute float aSize;
            attribute vec3 aColor;
            attribute float aTwinkle;
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vColor = aColor;
                float twinkle = 0.55 + 0.45 * sin(uTime * 1.8 + aTwinkle * 6.28);
                vAlpha = twinkle;
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = (aSize * 28.0) / -mv.z;
                gl_Position = projectionMatrix * mv;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vec2 uv = gl_PointCoord - vec2(0.5);
                float d = length(uv);
                if (d > 0.5) discard;
                float glow = smoothstep(0.5, 0.0, d);
                float core  = smoothstep(0.15, 0.0, d) * 0.6;
                vec3 col = vColor + vec3(core);
                gl_FragColor = vec4(col, (glow + core) * vAlpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Dynamic layout offset positioning
    const adjustLayout = () => {
        const isDesktop = window.innerWidth >= 768;
        const progressVal = material.uniforms.uProgress.value;

        if (isDesktop) {
            if (progressVal < 0.5) {
                particles.position.x = 5.5;
            } else {
                particles.position.x = 0;
            }
        } else {
            particles.position.x = 0;
        }
        particles.position.y = isDesktop ? -1.0 : -0.5;
    };
    adjustLayout();

    // ============================================================
    //  ASYNC GLTF MODEL LOADER & SAMPLER
    // ============================================================
    const gltfLoader = new THREE.GLTFLoader();

    // Helper to traverse loaded GLB structure and extract raw vertex vectors
    function extractPositions(gltf) {
        const tempPositions = [];
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const posAttr = child.geometry.attributes.position;
                if (posAttr) {
                    for (let j = 0; j < posAttr.count; j++) {
                        tempPositions.push(new THREE.Vector3(
                            posAttr.getX(j),
                            posAttr.getY(j),
                            posAttr.getZ(j)
                        ));
                    }
                }
            }
        });
        return tempPositions;
    }

    // Centering and normalizing utility to scale external models uniformly
    function centerAndNormalizeVertices(positionsArray) {
        if (positionsArray.length === 0) return;
        
        const box = new THREE.Box3().setFromPoints(positionsArray);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Normalize coordinates to fit in a unit scale (max bounding box dimension = 11.0)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 11.0 / maxDim : 1.0;
        
        for (let i = 0; i < positionsArray.length; i++) {
            positionsArray[i].sub(center).multiplyScalar(scale);
        }
    }

    // Samples the arbitrary vertices list to match our target PARTICLE_COUNT
    function sampleVertices(positionsArray, targetCount) {
        const sampled = new Float32Array(targetCount * 3);
        const length = positionsArray.length;
        
        if (length === 0) {
            // Safe fallback if extraction was empty
            for (let i = 0; i < targetCount; i++) {
                sampled[i * 3] = (Math.random() - 0.5) * 5.0;
                sampled[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
                sampled[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
            }
            return sampled;
        }
        
        for (let i = 0; i < targetCount; i++) {
            let index;
            if (length >= targetCount) {
                // Downsample evenly
                index = Math.floor((i / targetCount) * length);
            } else {
                // Random upsampling with slight jitter
                index = Math.floor(Math.random() * length);
            }
            
            const v = positionsArray[index];
            const noise = length < targetCount ? (Math.random() - 0.5) * 0.04 : 0;
            sampled[i * 3] = v.x + noise;
            sampled[i * 3 + 1] = v.y + noise;
            sampled[i * 3 + 2] = v.z + noise;
        }
        return sampled;
    }

    // Loader method that overlays coordinates once external files are placed
    function loadGLBModel(path, attributeName) {
        gltfLoader.load(path, (gltf) => {
            const rawPositions = extractPositions(gltf);
            if (rawPositions.length > 0) {
                centerAndNormalizeVertices(rawPositions);
                const sampled = sampleVertices(rawPositions, PARTICLE_COUNT);
                
                const attr = geometry.getAttribute(attributeName);
                if (attr) {
                    attr.array.set(sampled);
                    attr.needsUpdate = true;
                    console.log(`[Hero] Loaded model ${path} into attribute ${attributeName} successfully (${rawPositions.length} vertices sampled).`);
                }
            } else {
                console.warn(`[Hero] No mesh geometries detected inside GLTF: ${path}`);
            }
        }, undefined, (error) => {
            console.warn(`[Hero] 3D Model file not found at: '${path}'. Using mathematical shape generator fallback.`, error);
        });
    }

    // ============================================================
    //  LOADING COORDINATION — load GLB models for Shape 2 & 3
    // ============================================================
    let modelsLoaded = 0;
    const MODELS_TOTAL = 2;
    let animationStarted = false;
    let loadingFailed = false;

    function loadGLBModelTracked(path, attributeName) {
        return new Promise((resolve) => {
            gltfLoader.load(path, (gltf) => {
                const rawPositions = extractPositions(gltf);
                if (rawPositions.length > 0) {
                    centerAndNormalizeVertices(rawPositions);
                    const sampled = sampleVertices(rawPositions, PARTICLE_COUNT);

                    const attr = geometry.getAttribute(attributeName);
                    if (attr) {
                        attr.array.set(sampled);
                        attr.needsUpdate = true;
                        console.log(`[Hero] Loaded model ${path} into attribute ${attributeName} (${rawPositions.length} vertices sampled).`);
                    }
                } else {
                    console.warn(`[Hero] No mesh geometries inside GLTF: ${path}`);
                }
                resolve(true);
            }, undefined, (error) => {
                console.warn(`[Hero] 3D Model not found at '${path}'. Using math fallback.`, error);
                resolve(false);
            });
        });
    }

    // Load bar chart + globe models (Shape 2 & 3 only)
    // Shape 1 (Rocket) is pure math
    async function loadAllModels() {
        const results = await Promise.all([
            loadGLBModelTracked('assets/barchart.glb', 'aTarget1'),
            loadGLBModelTracked('assets/globe.glb', 'aTarget2')
        ]);

        modelsLoaded = MODELS_TOTAL;
        loadingFailed = results.every(r => r === false);
        console.log(`[Hero] Model loading complete. ${results.filter(r => r).length}/${MODELS_TOTAL} models loaded.`);
    }

    loadAllModels();

    // ============================================================
    //  MOUSE PARALLAX INTERACTION
    // ============================================================
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ============================================================
    //  GSAP SCROLLTRIGGER TIMELINE
    // ============================================================
    gsap.registerPlugin(ScrollTrigger);

    // Set initial layout states
    gsap.set('#hero-overlay-s1', { opacity: 1, y: 0 });
    gsap.set('#hero-overlay-s2', { opacity: 0, y: 0 });
    gsap.set('#hero-overlay-s3', { opacity: 0, y: 0 });

    const scrollTL = gsap.timeline({
        scrollTrigger: {
            trigger: WRAPPER,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            pin: HERO,
            pinSpacing: false,
            onUpdate(self) {
                const p = self.progress;
                // Active scene dot indicators
                const activeIdx = p < 0.35 ? 0 : (p < 0.75 ? 1 : 2);
                if (window.updateHeroSceneDots) {
                    window.updateHeroSceneDots(activeIdx);
                }
                // Capture scroll velocity
                targetScrollVelocity = Math.abs(self.getVelocity()) * 0.001;
            }
        }
    });

    // Scroll trigger drives the uProgress uniform from 0.0 to 2.0
    scrollTL.to(material.uniforms.uProgress, {
        value: 2.0,
        ease: 'none',
        duration: 2.0
    }, 0);

    // Particle object scale animation (Scene 3 scale restricted to 1.05 so it stays balanced)
    scrollTL.to(particles.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        ease: 'power1.inOut',
        duration: 1.0
    }, 1.0);

    // Rocket tilts forward as it launches — constrained to Scene 1 only
    scrollTL.to(particles.rotation, {
        z: particles.rotation.z - (10 * Math.PI / 180),
        ease: 'power1.in',
        duration: 0.6
    }, 0);

    // Rocket scales slightly as it launches — constrained to Scene 1 only
    scrollTL.to(particles.scale, {
        x: 1.2, y: 1.2, z: 1.2,
        ease: 'power1.out',
        duration: 0.6
    }, 0.2);

    // Reset rotation back to flat for Scene 2/3
    scrollTL.to(particles.rotation, {
        z: 0,
        ease: 'none',
        duration: 0.3
    }, 0.7);

    // Reset scale back to 1.0 for Scene 2/3
    scrollTL.to(particles.scale, {
        x: 1.0, y: 1.0, z: 1.0,
        ease: 'none',
        duration: 0.3
    }, 0.7);

    // Timeline transitions for text overlays
    // Slide 1 Fades Out
    scrollTL.to('#hero-overlay-s1', {
        opacity: 0,
        duration: 0.4,
        ease: 'none'
    }, 0.1);

    // Slide 2 Fades In
    scrollTL.to('#hero-overlay-s2', {
        opacity: 1,
        duration: 0.4,
        ease: 'none'
    }, 0.7);

    // Slide 2 Fades Out
    scrollTL.to('#hero-overlay-s2', {
        opacity: 0,
        duration: 0.4,
        ease: 'none'
    }, 1.3);

    // Slide 3 Fades In
    scrollTL.to('#hero-overlay-s3', {
        opacity: 1,
        duration: 0.4,
        ease: 'none'
    }, 1.7);

    // Fade out Scroll Cue indicator on first scroll
    ScrollTrigger.create({
        trigger: WRAPPER,
        start: 'top+=50 top',
        end: 'top+=200 top',
        scrub: true,
        onUpdate(self) {
            const cue = document.getElementById('scroll-cue');
            if (cue) cue.style.opacity = (1 - self.progress).toString();
        }
    });

    // ============================================================
    //  ANIMATION RENDER LOOP
    // ============================================================
    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsed;

        // Update atmosphere uniforms
        atmosphereMaterial.uniforms.uTime.value = elapsed;
        atmosphereMaterial.uniforms.uMouse.value.set(mouseX, mouseY);
        
        // Update star field
        starMaterial.uniforms.uTime.value = elapsed;
        
        // Decay target scroll velocity over time for inertia
        targetScrollVelocity *= 0.94;
        currentScrollVelocity += (targetScrollVelocity - currentScrollVelocity) * 0.08;
        atmosphereMaterial.uniforms.uScrollVelocity.value = currentScrollVelocity;

        // Smooth mouse parallax lerping
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        const baseZ = getCamZ();
        camera.position.z += (baseZ - camera.position.z) * 0.05;
        
        // Sway camera slightly based on cursor coords
        const targetCamX = mouseX * 1.5;
        const targetCamY = mouseY * 1.1;
        
        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    // Start rendering with slight delay to ensure first paint stabilizes
    setTimeout(() => {
        animate();
    }, 150);

    // ============================================================
    //  WINDOW RESIZE HANDLER
    // ============================================================
    const onResize = () => {
        camera.aspect = W() / H();
        camera.updateProjectionMatrix();
        renderer.setSize(W(), H());
        adjustLayout();
    };
    window.addEventListener('resize', onResize);

    // ============================================================
    //  INITIAL ENTRANCE ANIMATION (SCENE 1 TEXT)
    // ============================================================
    setTimeout(() => {
        const overlay1 = document.getElementById('hero-overlay-s1');
        if (overlay1) {
            gsap.fromTo(overlay1.querySelectorAll('.outline-title, .fill-title, p, a'),
                { opacity: 0, y: 35 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out' }
            );
        }
    }, 450);

})();