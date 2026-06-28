// Revenue Growth Engine — Three.js + GSAP ScrollTrigger Storytelling
// Requires: Three.js, GSAP, ScrollTrigger

(function () {
    'use strict';

    if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Revenue Growth Engine requires Three.js, GSAP, and ScrollTrigger.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById('rge-section');
    const canvas = document.getElementById('rge-canvas');
    if (!section || !canvas) return;

    // ─── Renderer, Scene, Camera ───
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 14);

    // ─── Lights ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x2563eb, 0.8);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x6366f1, 0.5, 30);
    pointLight.position.set(-4, 3, 6);
    scene.add(pointLight);

    // ─── Globe ───
    const globeGeo = new THREE.IcosahedronGeometry(2.2, 6);
    const globeMat = new THREE.MeshPhongMaterial({
        color: 0x2563eb,
        emissive: 0x1e40af,
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
        wireframeLinewidth: 1,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Globe glow shell
    const glowGeo = new THREE.IcosahedronGeometry(2.5, 4);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
    });
    const glowShell = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowShell);

    // ─── Particles (floating dust) ───
    const PARTICLE_COUNT = 600;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pVelocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pPositions[i3] = (Math.random() - 0.5) * 40;
        pPositions[i3 + 1] = (Math.random() - 0.5) * 30;
        pPositions[i3 + 2] = (Math.random() - 0.5) * 20 - 5;
        pVelocities[i3] = (Math.random() - 0.5) * 0.008;
        pVelocities[i3 + 1] = (Math.random() - 0.5) * 0.008;
        pVelocities[i3 + 2] = (Math.random() - 0.5) * 0.004;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.06,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ─── Channel Nodes (Scene 2) ───
    const CHANNELS = ['SEO', 'Google Ads', 'Meta Ads', 'Content', 'Website', 'AI Video'];
    const channelGroup = new THREE.Group();
    channelGroup.visible = false;
    scene.add(channelGroup);

    const channelNodes = [];
    const channelAngles = CHANNELS.map((_, i) => (i / CHANNELS.length) * Math.PI * 2);
    const CHANNEL_RADIUS = 4.5;

    CHANNELS.forEach((name, i) => {
        const angle = channelAngles[i];
        const nodeGeo = new THREE.OctahedronGeometry(0.35, 1);
        const nodeMat = new THREE.MeshPhongMaterial({
            color: 0x2563eb,
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0,
        });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(
            Math.cos(angle) * CHANNEL_RADIUS,
            Math.sin(angle) * CHANNEL_RADIUS * 0.6,
            0
        );
        node.userData = { angle, name, baseX: node.position.x, baseY: node.position.y };
        channelGroup.add(node);
        channelNodes.push(node);
    });

    // Neural connection lines
    const lineGroup = new THREE.Group();
    channelGroup.add(lineGroup);

    function buildConnectionLines() {
        while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0]);

        channelNodes.forEach((nodeA, i) => {
            // Connect to globe center
            const pts = [nodeA.position.clone(), new THREE.Vector3(0, 0, 0)];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.25 });
            lineGroup.add(new THREE.Line(geo, mat));

            // Connect to adjacent node
            const next = channelNodes[(i + 1) % channelNodes.length];
            const pts2 = [nodeA.position.clone(), next.position.clone()];
            const geo2 = new THREE.BufferGeometry().setFromPoints(pts2);
            const mat2 = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.15 });
            lineGroup.add(new THREE.Line(geo2, mat2));
        });
    }

    // ─── Data Stream Particles (Scene 3) ───
    const STREAM_COUNT = 200;
    const streamGeo = new THREE.BufferGeometry();
    const sPositions = new Float32Array(STREAM_COUNT * 3);
    const sTargets = new Float32Array(STREAM_COUNT * 3);

    for (let i = 0; i < STREAM_COUNT; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const r = 2 + Math.random() * 6;
        sPositions[i3] = Math.cos(angle) * r;
        sPositions[i3 + 1] = Math.sin(angle) * r * 0.6;
        sPositions[i3 + 2] = (Math.random() - 0.5) * 4;
        sTargets[i3] = (Math.random() - 0.5) * 0.5;
        sTargets[i3 + 1] = (Math.random() - 0.5) * 0.5;
        sTargets[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    streamGeo.setAttribute('position', new THREE.BufferAttribute(sPositions, 3));

    const streamMat = new THREE.PointsMaterial({
        color: 0x2563eb,
        size: 0.05,
        transparent: true,
        opacity: 0,
        sizeAttenuation: true,
        depthWrite: false,
    });
    const streamParticles = new THREE.Points(streamGeo, streamMat);
    scene.add(streamParticles);

    // ─── Revenue Graph (Scene 3-4) ───
    const revenueGroup = new THREE.Group();
    revenueGroup.visible = false;
    revenueGroup.position.set(5, -1.5, 0);
    scene.add(revenueGroup);

    const graphPoints = [];
    const GRAPH_STEPS = 30;
    for (let i = 0; i <= GRAPH_STEPS; i++) {
        const x = (i / GRAPH_STEPS) * 6 - 3;
        const y = Math.pow(i / GRAPH_STEPS, 2.2) * 4;
        graphPoints.push(new THREE.Vector3(x, y, 0));
    }

    const graphCurve = new THREE.CatmullRomCurve3(graphPoints);
    const graphGeo = new THREE.TubeGeometry(graphCurve, 60, 0.04, 8, false);
    const graphMat = new THREE.MeshPhongMaterial({
        color: 0x2563eb,
        emissive: 0x1e40af,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0,
    });
    const graphMesh = new THREE.Mesh(graphGeo, graphMat);
    revenueGroup.add(graphMesh);

    // Graph glow area fill
    const areaShape = new THREE.Shape();
    areaShape.moveTo(-3, 0);
    graphPoints.forEach(p => areaShape.lineTo(p.x, p.y));
    areaShape.lineTo(3, 0);
    areaShape.lineTo(-3, 0);

    const areaGeo = new THREE.ShapeGeometry(areaShape);
    const areaMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
    });
    const areaMesh = new THREE.Mesh(areaGeo, areaMat);
    revenueGroup.add(areaMesh);

    // ─── Revenue Core (Scene 4) ───
    const coreGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const coreMat = new THREE.MeshPhongMaterial({
        color: 0x2563eb,
        emissive: 0x1e40af,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const coreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0, side: THREE.BackSide })
    );
    scene.add(coreGlow);

    // ─── Mouse Parallax ───
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ─── Scene DOM refs ───
    const scenes = Array.from(document.querySelectorAll('.rge-scene'));
    const progressDots = Array.from(document.querySelectorAll('.rge-progress-dot'));
    const floatingMetrics = Array.from(document.querySelectorAll('.rge-floating-metric'));
    const ctaWrap = document.querySelector('.rge-cta-wrap');
    const logoReveal = document.querySelector('.rge-logo-reveal');
    const bgGlow = document.querySelector('.rge-bg-glow');

    // ─── State ───
    let scrollProgress = 0;
    let particleSpeed = 1;

    // Helper to map values
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
        if (value <= inMin) return outMin;
        if (value >= inMax) return outMax;
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    };

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    // Scene index helper
    function getSceneIndex(progress) {
        if (progress < 0.20) return 0;
        if (progress < 0.40) return 1;
        if (progress < 0.70) return 2;
        if (progress < 0.90) return 3;
        return 4;
    }

    // Scene transition ranges for opacities
    const SCENE_RANGES = [
        { start: 0.0, peakStart: 0.03, peakEnd: 0.15, end: 0.20 }, // Scene 1
        { start: 0.20, peakStart: 0.23, peakEnd: 0.35, end: 0.40 }, // Scene 2
        { start: 0.40, peakStart: 0.43, peakEnd: 0.65, end: 0.70 }, // Scene 3
        { start: 0.70, peakStart: 0.73, peakEnd: 0.85, end: 0.90 }, // Scene 4
        { start: 0.90, peakStart: 0.93, peakEnd: 1.0, end: 1.0 }   // Scene 5
    ];

    function getSceneOpacity(p, index) {
        const r = SCENE_RANGES[index];
        if (p < r.start || p > r.end) return 0;
        if (p >= r.peakStart && p <= r.peakEnd) return 1;
        if (p < r.peakStart) {
            return mapRange(p, r.start, r.peakStart, 0, 1);
        } else {
            return mapRange(p, r.peakEnd, r.end, 1, 0);
        }
    }

    function getSceneTranslation(p, index, startY, endY, delayShift = 0) {
        const r = SCENE_RANGES[index];
        const start = clamp(r.start + delayShift, 0, 1);
        const peakStart = clamp(r.peakStart + delayShift, 0, 1);
        const peakEnd = clamp(r.peakEnd - delayShift, 0, 1);
        const end = clamp(r.end - delayShift, 0, 1);

        if (p < start) return startY;
        if (p > end) return endY;
        if (p >= peakStart && p <= peakEnd) return 0;
        if (p < peakStart) {
            return mapRange(p, start, peakStart, startY, 0);
        } else {
            return mapRange(p, peakEnd, end, 0, endY);
        }
    }

    function updateScenes(p) {
        // 1. Update active dots in navigation
        const activeIndex = getSceneIndex(p);
        progressDots.forEach((d, i) => {
            d.classList.toggle('active', i === activeIndex);
        });

        // 2. Update scene DOM texts (opacities, translations, stagger)
        scenes.forEach((s, i) => {
            const opacity = getSceneOpacity(p, i);
            s.style.opacity = opacity;
            s.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
            s.classList.toggle('active', opacity > 0.5);

            const headline = s.querySelector('.rge-headline');
            const sub = s.querySelector('.rge-subheadline');
            const overline = s.querySelector('.rge-overline');

            if (opacity > 0) {
                const yHeadline = getSceneTranslation(p, i, 30, -30, 0);
                const ySub = getSceneTranslation(p, i, 45, -45, 0.005);
                const yOver = getSceneTranslation(p, i, 15, -15, -0.005);

                if (headline) headline.style.transform = `translate3d(0, ${yHeadline}px, 0)`;
                if (sub) sub.style.transform = `translate3d(0, ${ySub}px, 0)`;
                if (overline) overline.style.transform = `translate3d(0, ${yOver}px, 0)`;
            } else {
                if (headline) headline.style.transform = 'translate3d(0, 30px, 0)';
                if (sub) sub.style.transform = 'translate3d(0, 45px, 0)';
                if (overline) overline.style.transform = 'translate3d(0, 15px, 0)';
            }
        });

        // 3. Globe and Glow Shell (0% -> 20% fade-in; 90% -> 100% fade-out)
        let globeOpacity = 0.35;
        let glowOpacity = 0.06;
        let globeScale = 1.0;

        if (p < 0.20) {
            globeOpacity = mapRange(p, 0, 0.20, 0, 0.35);
            glowOpacity = mapRange(p, 0, 0.20, 0, 0.06);
            globeScale = mapRange(p, 0, 0.20, 0.3, 1.0);
        } else if (p >= 0.90) {
            globeOpacity = mapRange(p, 0.90, 1.0, 0.35, 0.15);
            glowOpacity = mapRange(p, 0.90, 1.0, 0.06, 0.0);
            globeScale = mapRange(p, 0.90, 1.0, 1.0, 0.7);
        }

        globe.material.opacity = globeOpacity;
        glowShell.material.opacity = glowOpacity;
        globe.scale.setScalar(globeScale);
        glowShell.scale.setScalar(globeScale);

        // 4. Camera Z Position
        if (p < 0.20) {
            camera.position.z = mapRange(p, 0, 0.20, 14, 12);
        } else if (p < 0.40) {
            camera.position.z = 12;
        } else if (p < 0.70) {
            camera.position.z = mapRange(p, 0.40, 0.70, 12, 10);
        } else if (p < 0.90) {
            camera.position.z = mapRange(p, 0.70, 0.90, 10, 12);
        } else {
            camera.position.z = mapRange(p, 0.90, 1.0, 12, 16);
        }

        // 5. Channel Group & Nodes Visibility / Opacity / Scale / Position
        channelGroup.visible = (p >= 0.18 && p < 0.92);
        if (channelGroup.visible) {
            let chOpacity = 1.0;
            if (p < 0.25) {
                chOpacity = mapRange(p, 0.18, 0.25, 0, 1.0);
            } else if (p >= 0.75) {
                chOpacity = mapRange(p, 0.75, 0.90, 1.0, 0);
            }

            // Spread (explosion/merge)
            let spread = 1.0;
            if (p >= 0.40 && p < 0.70) {
                spread = mapRange(p, 0.40, 0.70, 1.0, 2.8);
            } else if (p >= 0.70 && p < 0.90) {
                spread = mapRange(p, 0.70, 0.90, 2.8, 0.0);
            } else if (p >= 0.90) {
                spread = 0.0;
            }

            channelNodes.forEach((node, i) => {
                node.material.opacity = chOpacity;
                
                // Entrance scale delay per node
                let nodeScale = 1.0;
                if (p < 0.35) {
                    const startScaleP = 0.20 + i * 0.02;
                    nodeScale = mapRange(p, startScaleP, 0.35, 0.001, 1.0);
                } else if (p >= 0.75) {
                    nodeScale = mapRange(p, 0.75, 0.90, 1.0, 0.001);
                }
                node.scale.setScalar(nodeScale);

                // Set position based on spread
                const ud = node.userData;
                node.position.x = ud.baseX * spread;
                node.position.y = ud.baseY * spread;
            });

            // Connection lines opacity
            let lineOpacity = 0.25;
            if (p < 0.28) {
                lineOpacity = mapRange(p, 0.18, 0.28, 0, 0.25);
            } else if (p >= 0.75) {
                lineOpacity = mapRange(p, 0.75, 0.85, 0.25, 0);
            } else if (p >= 0.85) {
                lineOpacity = 0;
            }
            lineGroup.children.forEach((line, idx) => {
                // Alternating line colors/opacities
                line.material.opacity = lineOpacity * (idx % 2 === 0 ? 1.0 : 0.6);
            });

            if (lineGroup.children.length === 0) {
                buildConnectionLines();
            }
        }

        // 6. Data Stream Particles Opacity & Speed
        let streamOpacity = 0;
        if (p >= 0.40 && p < 0.55) {
            streamOpacity = mapRange(p, 0.40, 0.55, 0, 0.8);
        } else if (p >= 0.55 && p < 0.80) {
            streamOpacity = 0.8;
        } else if (p >= 0.80 && p < 0.90) {
            streamOpacity = mapRange(p, 0.80, 0.90, 0.8, 0);
        }
        streamMat.opacity = streamOpacity;

        if (p < 0.40) {
            particleSpeed = 1.0;
        } else if (p < 0.70) {
            particleSpeed = mapRange(p, 0.40, 0.70, 1.0, 4.0);
        } else if (p < 0.90) {
            particleSpeed = mapRange(p, 0.70, 0.90, 4.0, 10.0);
        } else {
            particleSpeed = 1.0;
        }

        // 7. Revenue Graph & Area
        revenueGroup.visible = (p >= 0.42 && p < 0.95);
        if (revenueGroup.visible) {
            let graphOpacity = 0.8;
            let areaOpacity = 0.12;
            let graphScale = 1.0;

            if (p < 0.60) {
                graphOpacity = mapRange(p, 0.42, 0.60, 0, 0.8);
                areaOpacity = mapRange(p, 0.42, 0.60, 0, 0.12);
                graphScale = mapRange(p, 0.42, 0.60, 0.5, 1.0);
            } else if (p >= 0.70 && p < 0.90) {
                graphScale = mapRange(p, 0.70, 0.90, 1.0, 1.6);
            } else if (p >= 0.90) {
                graphOpacity = mapRange(p, 0.90, 0.95, 0.8, 0);
                areaOpacity = mapRange(p, 0.90, 0.95, 0.12, 0);
                graphScale = 1.6;
            }

            graphMat.opacity = graphOpacity;
            areaMat.opacity = areaOpacity;
            revenueGroup.scale.setScalar(graphScale);
            graphMat.emissiveIntensity = mapRange(p, 0.42, 0.90, 0.4, 0.8);
        }

        // 8. Revenue Core & Glow
        let coreOpacity = 0;
        let coreGlowOpacity = 0;
        let coreScale = 0.01;

        if (p >= 0.70 && p < 0.80) {
            coreOpacity = mapRange(p, 0.70, 0.80, 0, 0.7);
            coreGlowOpacity = mapRange(p, 0.70, 0.80, 0, 0.15);
            coreScale = mapRange(p, 0.70, 0.80, 0.01, 1.2);
        } else if (p >= 0.80 && p < 0.90) {
            coreOpacity = 0.7;
            coreGlowOpacity = 0.15;
            coreScale = 1.2;
        } else if (p >= 0.90 && p < 0.98) {
            coreOpacity = mapRange(p, 0.90, 0.98, 0.7, 0);
            coreGlowOpacity = mapRange(p, 0.90, 0.98, 0.15, 0);
            coreScale = mapRange(p, 0.90, 0.98, 1.2, 0.8);
        }

        coreMat.opacity = coreOpacity;
        coreGlow.material.opacity = coreGlowOpacity;
        core.scale.setScalar(coreScale);
        coreGlow.scale.setScalar(coreScale * 1.5);

        // 9. Floating Metrics (Scene 3 - 40% to 70%)
        floatingMetrics.forEach((m, i) => {
            const mStart = 0.45 + i * 0.05;
            const mEnd = 0.65 + i * 0.05;
            let mOpacity = 0;
            let mY = 20;

            if (p >= mStart && p < mEnd) {
                mOpacity = mapRange(p, mStart, mStart + 0.10, 0, 1.0);
                mY = mapRange(p, mStart, mStart + 0.10, 20, 0);
            } else if (p >= mEnd && p < 0.90) {
                mOpacity = mapRange(p, mEnd, 0.90, 1.0, 0);
                mY = mapRange(p, mEnd, 0.90, 0, -20);
            }

            m.style.opacity = mOpacity;
            m.style.transform = `translate3d(0, ${mY}px, 0)`;
        });

        // 10. Scene 5 Final Reveals (90% -> 100%)
        if (p >= 0.90) {
            const finalP = mapRange(p, 0.90, 1.0, 0, 1.0);
            if (bgGlow) {
                bgGlow.style.opacity = finalP * 0.8;
                bgGlow.style.transform = `translate(-50%, -50%) scale(${0.5 + finalP * 1.5})`;
            }
            if (logoReveal) {
                logoReveal.style.opacity = finalP;
                logoReveal.style.transform = `translate3d(0, ${20 * (1 - finalP)}px, 0)`;
            }
            if (ctaWrap) {
                const ctaP = mapRange(finalP, 0.3, 1.0, 0, 1.0);
                ctaWrap.style.opacity = ctaP;
                ctaWrap.style.transform = `translate3d(0, ${20 * (1 - ctaP)}px, 0)`;
            }
        } else {
            if (bgGlow) {
                bgGlow.style.opacity = 0;
                bgGlow.style.transform = 'translate(-50%, -50%) scale(0.5)';
            }
            if (logoReveal) {
                logoReveal.style.opacity = 0;
                logoReveal.style.transform = 'translate3d(0, 20px, 0)';
            }
            if (ctaWrap) {
                ctaWrap.style.opacity = 0;
                ctaWrap.style.transform = 'translate3d(0, 20px, 0)';
            }
        }
    }

    // ─── Animation Loop ───
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        // Globe rotation
        globe.rotation.y += 0.003;
        globe.rotation.x += 0.001;
        glowShell.rotation.y += 0.002;

        // Channel nodes rotation
        if (channelGroup.visible) {
            channelNodes.forEach((node, i) => {
                node.rotation.y += 0.01;
                node.rotation.z += 0.005;
                node.position.z = Math.sin(time * 0.5 + i) * 0.3;
            });
        }

        // Core pulsing
        if (coreMat.opacity > 0) {
            const pulse = 1 + Math.sin(time * 2) * 0.05;
            core.scale.multiplyScalar(pulse / core.scale.x * core.scale.x);
        }

        // Floating particles drift
        const posArr = particles.geometry.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            posArr[i3] += pVelocities[i3] * particleSpeed;
            posArr[i3 + 1] += pVelocities[i3 + 1] * particleSpeed;
            posArr[i3 + 2] += pVelocities[i3 + 2];

            // Wrap around
            if (posArr[i3] > 20) posArr[i3] = -20;
            if (posArr[i3] < -20) posArr[i3] = 20;
            if (posArr[i3 + 1] > 15) posArr[i3 + 1] = -15;
            if (posArr[i3 + 1] < -15) posArr[i3 + 1] = 15;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Stream particles flow toward center
        if (streamMat.opacity > 0) {
            const sArr = streamParticles.geometry.attributes.position.array;
            for (let i = 0; i < STREAM_COUNT; i++) {
                const i3 = i * 3;
                sArr[i3] += (sTargets[i3] - sArr[i3]) * 0.01 * particleSpeed;
                sArr[i3 + 1] += (sTargets[i3 + 1] - sArr[i3 + 1]) * 0.01 * particleSpeed;
                sArr[i3 + 2] += (sTargets[i3 + 2] - sArr[i3 + 2]) * 0.01;

                // Reset when close to center
                const dist = Math.sqrt(sArr[i3] ** 2 + sArr[i3 + 1] ** 2 + sArr[i3 + 2] ** 2);
                if (dist < 0.8) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 3 + Math.random() * 5;
                    sArr[i3] = Math.cos(angle) * r;
                    sArr[i3 + 1] = Math.sin(angle) * r * 0.6;
                    sArr[i3 + 2] = (Math.random() - 0.5) * 4;
                }
            }
            streamParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Mouse parallax on camera
        camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);

        // Update connection lines geometry
        if (channelGroup.visible && lineGroup.children.length > 0) {
            let lineIdx = 0;
            channelNodes.forEach((nodeA, i) => {
                // Line to center
                if (lineIdx < lineGroup.children.length) {
                    const line = lineGroup.children[lineIdx];
                    const positions = line.geometry.attributes.position.array;
                    positions[0] = nodeA.position.x;
                    positions[1] = nodeA.position.y;
                    positions[2] = nodeA.position.z;
                    line.geometry.attributes.position.needsUpdate = true;
                    lineIdx++;
                }
                // Line to next
                const next = channelNodes[(i + 1) % channelNodes.length];
                if (lineIdx < lineGroup.children.length) {
                    const line = lineGroup.children[lineIdx];
                    const positions = line.geometry.attributes.position.array;
                    positions[0] = nodeA.position.x;
                    positions[1] = nodeA.position.y;
                    positions[2] = nodeA.position.z;
                    positions[3] = next.position.x;
                    positions[4] = next.position.y;
                    positions[5] = next.position.z;
                    line.geometry.attributes.position.needsUpdate = true;
                    lineIdx++;
                }
            });
        }

        updateScenes(scrollProgress);

        renderer.render(scene, camera);
    }

    // ─── GSAP ScrollTrigger ───
    const stickyEl = section.querySelector('.rge-sticky');

    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: stickyEl,
        pinSpacing: false,
        scrub: 0.5,
        onUpdate: (self) => {
            scrollProgress = self.progress;
        },
    });

    // ─── Resize Handler ───
    function onResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ─── Start ───
    animate();
})();
