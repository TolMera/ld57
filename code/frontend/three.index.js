import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export class threeController {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas;
    /**
     * @type {THREE.Scene}
     */
    scene;
    /**
     * @type {THREE.PerspectiveCamera}
     */
    camera;

    /**
     * Setup Canvas
     */
    initCanvas() {
        this.canvas = document.querySelector('canvas');
        const canvas = this.canvas;
        // Make canvas fill its container
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        // Match rendering resolution to display size
        // TODO: Fix device picel ratio if we think this is actually useful/valuable later
        const dpr = /*  window.devicePixelRatio ||  */ 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;

        this.scene = new THREE.Scene();
        const scene = this.scene;

        this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        const camera = this.camera;
        camera.position.z = 5;

        const hemiLight = new THREE.HemisphereLight(
            0xffe9b3, // skyColor
            0xff6633, // groundColor
            1.5         // intensity
        );
        scene.add(hemiLight);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10, 0);
        light.castShadow = true;
        scene.add(light);

        this.initSky();
        this.initFog();
        this.initClouds();

        this.renderer = new THREE.WebGLRenderer({ canvas });
        const renderer = this.renderer;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optional: softer shadows        
        renderer.setPixelRatio(dpr);
        renderer.setSize(canvas.width, canvas.height);
        renderer.setAnimationLoop(this.animateLoop.bind(this));

        canvas.addEventListener('click', this.parseMouseClick.bind(this));

        return this;
    }

    parseMouseClick(event) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();        
        const camera = this.camera;
        const rect = this.canvas.getBoundingClientRect();
    
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
    
        const intersects = raycaster.intersectObject(this.target);
    
        if (intersects.length > 0) {
            const hit = intersects[0];
    
            const worldPoint = hit.point; // World coordinates
            const localPoint = this.target.worldToLocal(worldPoint.clone()); // Local to sphere
    
            console.log('World hit:', worldPoint);
            console.log('Local hit:', localPoint);
        }
    }

    initFog() {
        this.scene.fog = new THREE.FogExp2(0xffbb66, 0.1);
    }

    initSky() {
        /* const sky = new Sky();
        sky.scale.setScalar(450000); // big ol' sky dome
        this.scene.add(sky);
        
        // Set up sun position and tint
        const sun = new THREE.Vector3();
        const elevation = 70; // degrees above horizon
        const azimuth = 90; // direction of light
        
        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);
        sun.setFromSphericalCoords(1, phi, theta);
        
        sky.material.uniforms.sunPosition.value.copy(sun);
        sky.material.uniforms.turbidity.value = 0.2;
        sky.material.uniforms.rayleigh.value = 0.1;
        sky.material.uniforms.mieCoefficient.value = 0.02;
        sky.material.uniforms.mieDirectionalG.value = 0.8; */
        const skyGeo = new THREE.SphereGeometry(50, 32, 32);
        const skyMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            side: THREE.BackSide,
            fog: true // 👈 this makes it react to fog
        });
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(skyDome);
    }

    /**
     * Create the game world
     */
    initWorld() { }

    initClouds() {
        function createCloudLayer(count, color, size, speed, opacity) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                positions[i * 3 + 0] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const texture = new THREE.TextureLoader().load('media/cloud1.png');

            const material = new THREE.PointsMaterial({
                color,
                size,
                transparent: true,
                opacity,
                sizeAttenuation: true,
                depthWrite: false,
                blending: THREE.NormalBlending,
                map: texture,
                alphaTest: 0.01, // helps discard fully transparent pixels
            });

            const points = new THREE.Points(geometry, material);
            points.userData.speed = speed; // attach speed for animation

            return points;
        }

        function updateCloudLayer(layer, delta) {
            const positions = layer.geometry.attributes.position.array;
            const speed = layer.userData.speed;
            const bounds = 15;
        
            for (let i = 0; i < positions.length; i += 3) {
                positions[i]     += speed.x * delta; // X
                positions[i + 1] += speed.y * delta; // Y
                positions[i + 2] += speed.z * delta; // Z
        
                // Wrap X
                if (positions[i] > bounds) positions[i] -= bounds * 2;
                if (positions[i] < -bounds) positions[i] += bounds * 2;
        
                // Wrap Y
                if (positions[i + 1] > bounds) positions[i + 1] -= bounds * 2;
                if (positions[i + 1] < -bounds) positions[i + 1] += bounds * 2;
        
                // Wrap Z
                if (positions[i + 2] > bounds) positions[i + 2] -= bounds * 2;
                if (positions[i + 2] < -bounds) positions[i + 2] += bounds * 2;
            }
        
            layer.geometry.attributes.position.needsUpdate = true;
        }

        const clouds = [
            createCloudLayer(200, 0xfff5b3, 2.5, new THREE.Vector3(
                0.001*Math.random(),
                0.001*Math.random(),
                0.001*Math.random()
            ), 0.5),
            createCloudLayer(200, 0xff4630, 2, new THREE.Vector3(
                0.002*Math.random(),
                0.002*Math.random(),
                0.002*Math.random()
            ), 0.45),
            createCloudLayer(200, 0xfff8b5, 1.5, new THREE.Vector3(
                0.003*Math.random(),
                0.003*Math.random(),
                0.003*Math.random()
            ), 0.4),
            createCloudLayer(200, 0xffff30, 1, new THREE.Vector3(
                0.004*Math.random(),
                0.004*Math.random(),
                0.004*Math.random()
            ), 0.35),
            createCloudLayer(200, 0xff5030, 0.5, new THREE.Vector3(
                0.005*Math.random(),
                0.005*Math.random(),
                0.005*Math.random()
            ), 0.3)
        ];

        clouds.forEach(layer => this.scene.add(layer));

        this.animations.push({
            id: "cloud-drift",
            desc: "Follow camera and animate drifting clouds",
            fn: (delta) => {
                clouds.forEach(layer => {
                    updateCloudLayer(layer, delta)

                    const cameraDirection = new THREE.Vector3();
                    this.camera.getWorldDirection(cameraDirection); // gives the camera's look direction (normalized)
                    const offset = cameraDirection.clone().multiplyScalar(20);
                    layer.position.copy(this.camera.position).add(offset);
                });
            }
        });
    }


    /**
     * Point the camera at the play focus
     */
    configureCamera(targetObject) {
        // const distance = 25;
        // const dir = new THREE.Vector3();

        // Get direction *from* target to camera
        // dir.subVectors(this.camera.position, targetObject.position).normalize();

        // Recalculate camera position at desired distance
        // this.camera.position.copy(targetObject.position).add(dir.multiplyScalar(distance));

        // Always look at the target
        this.camera.lookAt(targetObject.position);
    }

    /**
     * @type {{id: string, desc: string, fn: Function}[]}
     */
    animations = [];
    animationsLastTime;
    animateLoop(nowTime) {
        this.animationsLastTime ??= nowTime;
        const delta = this.animationsLastTime - nowTime;
        this.animationsLastTime = nowTime;
        for (const anim of this.animations) anim.fn(delta);
        this.renderer.render(this.scene, this.camera);
    }

    /***
     * Create the Sphere that players will play on.
     */
    createBaseSphere(diameter, tessellation) {
        // Geometry stays the same
        const geometry = new THREE.IcosahedronGeometry(diameter, tessellation);

        // Use a light-reactive material
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.6,
            metalness: 0.5,
            flatShading: false,
        });

        const sphere = new THREE.Mesh(geometry, material);

        // Enable shadows
        sphere.castShadow = true;
        sphere.receiveShadow = true;

        this.scene.add(sphere);

        return sphere;
    }


    /**
     */
    demoCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        this.animations.push({
            id: `2EB0DB7A-58E6-41DF-A554-3161E88E0091`,
            desc: `This is the rotating cube`,
            fn: function animate() {
                cube.rotation.x += 0.015;
                // cube.rotation.y += 0.0;
            }.bind(this)
        })

        return cube;
    }
}
