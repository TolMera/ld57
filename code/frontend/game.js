import { threeController } from './three.index';

export class game {
    constructor() {
        console.debug(`Creating instance of Game`);
        globalThis.instances.threeController = new threeController;
        globalThis.instances.threeController.initCanvas();
        const cube = globalThis.instances.threeController.demoCube();
        globalThis.instances.threeController.target = cube;
        setInterval(() => {
            globalThis.instances.threeController.configureCamera(cube);
        }, 10);


        const inputs = this.captureUserInputs();
        const outputs = this.setUserOutputs();

        globalThis.instances.playerMovementController = new movementController(inputs, outputs);
    }

    captureUserInputs() {
        const inputMap = {
            'r': 'forward',
            'f': 'backward',
            'a': 'left',
            'd': 'right',
            'w': 'up',
            's': 'down',
            'e': 'twistRight',
            'q': 'twistLeft',
            '': 'pitchUp',
            '': 'pitchDown',
            '': 'rollRight',
            '': 'rollLeft',
        }
        const inputs = {
            forward: { value: 0, active: false, start: undefined },
            backward: { value: 0, active: false, start: undefined },
            left: { value: 0, active: false, start: undefined },
            right: { value: 0, active: false, start: undefined },
            up: { value: 0, active: false, start: undefined },
            down: { value: 0, active: false, start: undefined },
            twistRight: { value: 0, active: false, start: undefined },
            twistLeft: { value: 0, active: false, start: undefined },
            pitchUp: { value: 0, active: false, start: undefined },
            pitchDown: { value: 0, active: false, start: undefined },
            rollRight: { value: 0, active: false, start: undefined },
            rollLeft: { value: 0, active: false, start: undefined },
        }
        document.getElementsByTagName('body')[0].onkeydown = (event) => {
            const eventTime = performance.now();
            const index = inputMap[event.key];
            if (index) {
                if (inputs[index].active == true) return;

                inputs[index].active = true;
                inputs[index].start = eventTime;
            }
        };
        document.getElementsByTagName('body')[0].onkeyup = (event) => {
            const eventTime = performance.now();
            const index = inputMap[event.key];
            if (index) {
                inputs[index].active = false;
                inputs[index].value = eventTime - inputs[index].start;
            }
        };

        setInterval(() => console.log(inputs), 10000);

        return inputs;
    }

    setUserOutputs() {
        const slowDown = 0.01;
        return {
            forward: (value) => {
                globalThis.instances.threeController.camera.translateZ
                .bind(globalThis.instances.threeController.camera)
                (-value * slowDown)
            },
            backward: (value) => {
                globalThis.instances.threeController.camera.translateZ
                .bind(globalThis.instances.threeController.camera)
                (value * slowDown)
            },
            left: (value) => {
                globalThis.instances.threeController.camera.translateX
                .bind(globalThis.instances.threeController.camera)
                (-value * slowDown)
            },
            right: (value) => {
                globalThis.instances.threeController.camera.translateX
                .bind(globalThis.instances.threeController.camera)
                (value * slowDown)
            },
            up: (value) => {
                globalThis.instances.threeController.camera.translateY
                .bind(globalThis.instances.threeController.camera)
                (value * slowDown)
            },
            down: (value) => {
                globalThis.instances.threeController.camera.translateY
                .bind(globalThis.instances.threeController.camera)
                (-value * slowDown)
            },
            twistRight: () => { },
            twistLeft: () => { },
            pitchUp: () => { },
            pitchDown: () => { },
            rollRight: () => { },
            rollLeft: () => { },
        }
    }
}


export class movementController {
    /** types
     * @type {{
     * forward: { value: number },
     * backward: { value: number },
     * left: { value: number },
     * right: { value: number },
     * up: { value: number },
     * down: { value: number },
     * twistRight: { value: number },
     * twistLeft: { value: number },
     * pitchUp: { value: number },
     * pitchDown: { value: number },
     * rollRight: { value: number },
     * rollLeft: { value: number },
     * }}
     */
    inputs;
    /** types
     * @type {{
    * forward: Function,
    * backward: Function,
    * left: Function,
    * right: Function,
    * up: Function,
    * down: Function,
    * twistRight: Function,
    * twistLeft: Function,
    * pitchUp: Function,
    * pitchDown: Function,
    * rollRight: Function,
    * rollLeft: Function,
    * }}
    */
    outputs;

    constructor(
        /** types
         * @type {{
        * forward: { value: number },
        * backward: { value: number },
        * left: { value: number },
        * right: { value: number },
        * up: { value: number },
        * down: { value: number },
        * twistRight: { value: number },
        * twistLeft: { value: number },
        * pitchUp: { value: number },
        * pitchDown: { value: number },
        * rollRight: { value: number },
        * rollLeft: { value: number },
        * }}
        */
        inputs,
        /** types
         * @type {{
        * forward: Function,
        * backward: Function,
        * left: Function,
        * right: Function,
        * up: Function,
        * down: Function,
        * twistRight: Function,
        * twistLeft: Function,
        * pitchUp: Function,
        * pitchDown: Function,
        * rollRight: Function,
        * rollLeft: Function,
        * }}
        */
        outputs
    ) {
        this.inputs = inputs;
        this.outputs = outputs;

        setInterval(this.parseInputs.bind(this), globalThis.inputRate || 30);
    }

    /**
     * Call the input function,  to get the delta since last run, apply delta to output
     */
    parseInputs() {
        const eventTime = performance.now();
        for (const index in this.inputs) {
            try {
                if (this.inputs[index].active) {
                    this.inputs[index].value = eventTime - this.inputs[index].start;
                    this.inputs[index].start = eventTime;
                }
                const temp = this.inputs[index].value;
                if (temp) console.debug(temp, index)
                this.inputs[index].value = 0;
                this.outputs[index](temp);
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}
