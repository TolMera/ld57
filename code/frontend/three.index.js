import * as THREE from 'three';

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

        this.renderer = new THREE.WebGLRenderer({ canvas });
        const renderer = this.renderer;
        renderer.setPixelRatio(dpr);
        renderer.setSize(canvas.width, canvas.height);
        renderer.setAnimationLoop(this.animateLoop.bind(this));

        return this;
    }

    /**
     * Create the game world
     */
    initWorld() { }

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
    animateLoop() {
        for (const anim of this.animations) anim.fn();
    }

    /**
     */
    demoCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        this.camera.position.z = 5;

        this.animations.push({
            id: `2EB0DB7A-58E6-41DF-A554-3161E88E0091`,
            desc: `This is the rotating cube`,
            fn: function animate() {
                cube.rotation.x += 0.015;
                // cube.rotation.y += 0.0;
                this.renderer.render(this.scene, this.camera);
            }.bind(this)
        })

        return cube;
    }
}