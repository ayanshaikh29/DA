// Premium Animated Background using Three.js and GSAP

(function() {
    // Only initialize if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js is required for the premium background.');
        return;
    }

    // 1. Setup Canvas and Container
    const canvas = document.createElement('canvas');
    canvas.id = 'premium-bg-canvas';
    // Style the canvas to sit fixed in the background
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none'; // Ensure it doesn't block interactions
    canvas.style.opacity = '0'; // Start hidden, fade in
    canvas.style.transition = 'opacity 1.5s ease-in-out';
    document.body.appendChild(canvas);

    // Fade in
    setTimeout(() => { canvas.style.opacity = '1'; }, 100);

    // 2. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Use a subtle fog to blend particles into the distance (matching light theme)
    scene.fog = new THREE.FogExp2(0xffffff, 0.04);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Create Layers (Particles, Connections, Floating Geometries)
    const bgGroup = new THREE.Group();
    scene.add(bgGroup);

    // --- Layer 1: Distant Glowing Dust ---
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 800;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);

    for(let i = 0; i < dustCount * 3; i+=3) {
        dustPositions[i] = (Math.random() - 0.5) * 40;
        dustPositions[i+1] = (Math.random() - 0.5) * 40;
        dustPositions[i+2] = (Math.random() - 0.5) * 20 - 5;
        dustSizes[i/3] = Math.random() * 1.5 + 0.5;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));

    // Custom shader for glowing soft particles
    const dustMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color1: { value: new THREE.Color(0x2563eb) }, // Blue
            color2: { value: new THREE.Color(0xa855f7) }, // Purple
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vPosition;
            uniform float time;
            void main() {
                vPosition = position;
                vec3 pos = position;
                // Subtle wave motion
                pos.y += sin(time * 0.5 + pos.x) * 0.5;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (20.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec3 vPosition;
            void main() {
                // Soft circle
                vec2 xy = gl_PointCoord.xy - vec2(0.5);
                float ll = length(xy);
                if(ll > 0.5) discard;
                
                // Glow falloff
                float glow = smoothstep(0.5, 0.0, ll);
                
                // Mix colors based on position
                vec3 color = mix(color1, color2, (vPosition.x + 20.0) / 40.0);
                
                gl_FragColor = vec4(color, glow * 0.4); // Subtle opacity for light theme
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    bgGroup.add(dustParticles);

    // --- Layer 2: Connecting Network (Nodes and Lines) ---
    const networkGroup = new THREE.Group();
    bgGroup.add(networkGroup);
    
    const nodeCount = 80;
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeData = [];

    for(let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 30;
        const y = (Math.random() - 0.5) * 30;
        const z = (Math.random() - 0.5) * 15;
        nodePositions[i*3] = x;
        nodePositions[i*3+1] = y;
        nodePositions[i*3+2] = z;
        
        nodeData.push({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ),
            numConnections: 0
        });
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMaterial = new THREE.PointsMaterial({
        color: 0x4f46e5, // Indigo
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    networkGroup.add(nodes);

    // Lines for network
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3b82f6, // Blue
        transparent: true,
        opacity: 0.15
    });
    const lineGeometry = new THREE.BufferGeometry();
    // Pre-allocate large buffer for lines
    const maxLines = nodeCount * nodeCount;
    const linePositions = new Float32Array(maxLines * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    networkGroup.add(lines);

    // --- Layer 3: Subtle Grid Base ---
    const gridHelper = new THREE.GridHelper(60, 40, 0xe2e8f0, 0xf1f5f9);
    gridHelper.position.y = -8;
    // Add a slight rotation for dynamic feel
    gridHelper.rotation.x = Math.PI / 2 * 0.1; 
    bgGroup.add(gridHelper);

    // 4. Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // 5. Scroll Parallax integration with GSAP
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Fly camera through the scene
        gsap.to(camera.position, {
            z: 2, // Move camera deeper into the particles
            ease: "none",
            scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5
            }
        });

        // Create a timeline that scrubs with scroll
        gsap.to(bgGroup.position, {
            y: 15, // Large parallax movement
            ease: "none",
            scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5 // Smooth scrubbing
            }
        });

        // Rotate the network group dynamically as we scroll
        gsap.to(networkGroup.rotation, {
            y: Math.PI * 0.5,
            x: Math.PI * 0.2,
            ease: "none",
            scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 2
            }
        });
    }

    // 6. Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        
        // Update custom shader time
        dustMaterial.uniforms.time.value = time;

        targetX = mouseX * 0.002;
        targetY = mouseY * 0.002;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += ((-targetY + 2) - camera.position.y) * 0.05; // Keep base y at 2
        camera.lookAt(scene.position);

        // Update Network nodes
        const positions = nodes.geometry.attributes.position.array;
        
        let vertexpos = 0;
        let colorpos = 0;
        let numConnected = 0;

        for ( let i = 0; i < nodeCount; i++ ) {
            nodeData[i].numConnections = 0;
        }

        for ( let i = 0; i < nodeCount; i++ ) {

            // update positions
            let x = positions[ i * 3 ];
            let y = positions[ i * 3 + 1 ];
            let z = positions[ i * 3 + 2 ];
            
            // Mouse repel logic for nodes
            // Transform mouse to 3D space roughly
            const vector = new THREE.Vector3(
                (mouseX / windowHalfX),
                -(mouseY / windowHalfY),
                0.5
            );
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            const mousePos = camera.position.clone().add(dir.multiplyScalar(distance));

            // Calculate distance to mouse
            const dx = mousePos.x - x;
            const dy = mousePos.y - y;
            const distToMouse = Math.sqrt(dx*dx + dy*dy);
            
            if(distToMouse < 4) {
                // Repel
                nodeData[i].velocity.x -= dx * 0.001;
                nodeData[i].velocity.y -= dy * 0.001;
            }

            nodeData[i].velocity.x += (Math.random() - 0.5) * 0.001;
            nodeData[i].velocity.y += (Math.random() - 0.5) * 0.001;
            nodeData[i].velocity.z += (Math.random() - 0.5) * 0.001;
            
            // Limit velocity
            nodeData[i].velocity.clampLength(0, 0.05);

            x += nodeData[i].velocity.x;
            y += nodeData[i].velocity.y;
            z += nodeData[i].velocity.z;
            
            // Bounds check
            if(x < -15 || x > 15) nodeData[i].velocity.x *= -1;
            if(y < -15 || y > 15) nodeData[i].velocity.y *= -1;
            if(z < -10 || z > 10) nodeData[i].velocity.z *= -1;

            positions[ i * 3 ] = x;
            positions[ i * 3 + 1 ] = y;
            positions[ i * 3 + 2 ] = z;

            // Lines
            for ( let j = i + 1; j < nodeCount; j++ ) {

                let x2 = positions[ j * 3 ];
                let y2 = positions[ j * 3 + 1 ];
                let z2 = positions[ j * 3 + 2 ];

                let dx2 = x - x2;
                let dy2 = y - y2;
                let dz2 = z - z2;
                let dist = Math.sqrt( dx2 * dx2 + dy2 * dy2 + dz2 * dz2 );

                if ( dist < 4.5 ) {
                    nodeData[i].numConnections++;
                    nodeData[j].numConnections++;

                    let alpha = 1.0 - dist / 4.5;

                    linePositions[ vertexpos++ ] = x;
                    linePositions[ vertexpos++ ] = y;
                    linePositions[ vertexpos++ ] = z;

                    linePositions[ vertexpos++ ] = x2;
                    linePositions[ vertexpos++ ] = y2;
                    linePositions[ vertexpos++ ] = z2;
                    numConnected++;
                }
            }
        }

        lines.geometry.setDrawRange( 0, numConnected * 2 );
        lines.geometry.attributes.position.needsUpdate = true;
        nodes.geometry.attributes.position.needsUpdate = true;

        // Slow rotation of entire dust field
        dustParticles.rotation.y = time * 0.02;

        renderer.render(scene, camera);
    }

    animate();

    // 7. Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();
