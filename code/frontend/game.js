import { threeController } from './three.index';
import { webixController } from './webix.index';

export class game {
    builtBuildings = [];
    weightDistribution = []

    stats = {
        population: 100,

        oxygen: 100 * 14, // 14 days of oxygen for each person.
        water: 100 * 14,
        sludge: 100 * 14,   // Minimum viable food
        ration: 0,          // Better food (processed from sludge + extras)
        gourmet: 0,         // Luxuries (adds morale, used in events)

        metal: 300, // Some metal resource
        hydrogen: 600, // Use hydrogen as a fuel source?
        polymer: 100, // plastioc and similar, acid resistant

        batteryCharge: 1000, // Will be important for running machines

        organicWaste: 0,
        inorganicWaste: 0,
    }

    buildings = [
        {
            id: "Electrolyzer",
            name: "Electrolyzer",
            input: ["water", "batteryCharge"],
            output: ["oxygen", "hydrogen"],
            weight: [1000, 1100],
            rate: [1, 1, 2, 1],
            sprite: "media/buildings/solarPanel.png", //Electrolyzer.png"
        },
        {
            id: "Condenser",
            name: "Condenser",
            input: ["batteryCharge"],
            output: ["water"],
            weight: [100, 200],
            rate: [1, 1],
            sprite: "media/buildings/solarPanel.png", //Condenser.png"
        },
        {
            id: "Sludge Vat",
            name: "Sludge Vat",
            input: ["organicWaste", "batteryCharge"],
            output: ["sludge"],
            weight: [1000, 2000],
            rate: [1, 1, 1],
            sprite: "media/buildings/solarPanel.png", //Sludge.png"
        },
        {
            id: "Ration Processor",
            name: "Ration Processor",
            input: ["sludge", "metal", "batteryCharge"],
            output: ["ration"],
            weight: [800, 1200],
            rate: [1, 1, 1, 2],
            sprite: "media/buildings/solarPanel.png", //Ration.png"
        },
        {
            id: "Gourmet Synthesizer",
            name: "Gourmet Synthesizer",
            input: ["ration", "metal", "batteryCharge"],
            output: ["gourmet"],
            weight: [1000, 1600],
            rate: [1, 1, 2, 2],
            sprite: "media/buildings/solarPanel.png", //Gourmet.png"
        },
        {
            id: "Recycler",
            name: "Recycler",
            input: ["inorganicWaste", "batteryCharge"],
            output: ["metal", "polymer"],
            weight: [3000, 4000],
            rate: [2, 2, 1, 1],
            sprite: "media/buildings/solarPanel.png", //Recycler.png"
        },
        {
            id: "Polymer Extractor",
            name: "Polymer Extractor",
            input: ["organicWaste", "batteryCharge"],
            output: ["polymer"],
            weight: [500, 700],
            rate: [3, 5, 1],
            sprite: "media/buildings/solarPanel.png", //Polymer.png"
        },
        {
            id: "Solar Panel",
            name: "Solar Panel",
            input: [],
            output: ["batteryCharge"],
            weight: [200, 200],
            rate: [1],
            sprite: "media/buildings/solarPanel.png", //Solar.png"
        },
    ]

    constructor() {
    }

    init() {
        globalThis.instances.threeController = new threeController;
        globalThis.instances.threeController.initCanvas();
        const target = globalThis.instances.threeController.createBaseSphere(3, 9);
        globalThis.instances.threeController.target = target;
        setInterval(() => {
            globalThis.instances.threeController.configureCamera(target);
        }, 10);

        const inputs = this.captureUserInputs();
        const outputs = this.setUserOutputs();

        globalThis.instances.playerMovementController = new movementController(inputs, outputs);

        let startResourceConsumptionLastCalled;
        this.resourceClock = setInterval(
            () => {
                startResourceConsumptionLastCalled ??= performance.now();
                let delta = performance.now() - this.startResourceConsumptionLastCalled;
                if (delta < 15000) return;
                this.startResourceConsumptionLastCalled = performance.now();
                delta /= 60000;

                this.startResourceConsumption(delta);

            },
            60 * 1000  / 4 //once every 1/4th of a minute
        );
    }

    startResourceConsumption(delta) {
        if (isNaN(delta)) delta = 0; 
        const consumption = (delta) => {
            const organicDelta = this.stats.population * 0.1 * delta;
            let demand = organicDelta;
            if (demand > 0) {
                if (this.stats.gourmet > demand) {
                    this.stats.gourmet -= demand;
                    demand = 0;
                } else if (this.stats.gourmet > 0 && this.stats.gourmet < demand) {
                    demand -= this.stats.gourmet;
                    this.stats.gourmet = 0;
                }
            }
            if (demand) {
                if (this.stats.ration > demand) {
                    this.stats.ration -= demand;
                    demand = 0;
                } else if (this.stats.ration > 0 && this.stats.ration < demand) {
                    demand -= this.stats.ration;
                    this.stats.ration = 0;
                }
            }
            if (demand) {
                if (this.stats.sludge > demand) {
                    this.stats.sludge -= demand;
                    demand = 0;;
                } else if (this.stats.sludge > 0 && this.stats.sludge < demand) {
                    demand -= this.stats.sludge;
                    this.stats.sludge = 0;
                }
            }
            if (demand > 0) {
                // TODO: People are starving -- this is dire
            }
            this.stats.organicWaste += organicDelta - demand;
        }

        const respiration = (delta) => {
            const oxygenDelta = this.stats.population * 0.1 * delta;

            let demand = oxygenDelta;
            if (this.stats.oxygen > demand) {
                this.stats.oxygen -= oxygenDelta;
                demand = 0;
            } else if (this.stats.oxygen > 0 && this.stats.oxygen < demand) {
                demand -= this.stats.oxygen;
                this.stats.oxygen = 0;
            }

            if (demand > 0) {
                // TODO: People have no oxygen - this is dire
            }
        }

        const thirst = (delta) => {
            const waterDelta = this.stats.population * 0.1 * delta;

            let demand = waterDelta;
            if (this.stats.water > demand) {
                this.stats.water -= waterDelta;
                demand = 0;
            } else if (this.stats.water > 0 && this.stats.water < demand) {
                demand -= this.stats.water;
                this.stats.water = 0;
            }

            if (demand > 0) {
                // TODO: People have no water - this is dire
            }
            this.stats.organicWaste += waterDelta - demand;
        }

        const buildingsTick = (delta) => {
            for (const building of this.builtBuildings) {
                let flag = true;
                const inputs = building.input;
                const outputs = building.output;
                const rate = building.rate;
                for (const inputIndex in inputs) {
                    const res = inputs[inputIndex];
                    if (this.stats[res] < rate[inputIndex]) flag = false;
                }
                if (flag) {
                    for (const inputIndex in inputs) {
                        const res = inputs[inputIndex];
                        this.stats[res] -= rate[inputIndex] * delta;
                    }
                    for (const outputIndex in outputs) {
                        const res = outputs[outputIndex];
                        this.stats[res] += rate[Number(outputIndex) + inputs.length] * delta;
                    }
                } else {
                    // TODO: We might want to flag a building as 'not active' if we don't have the resources it requires.
                }
            }
        }

        /**
         * Repopulate - it's a % of the population growth.  I think there is a lower bound where under 24~ people, the population can't grow.
         */
        const repopulate = (delta) => {
            // There is always a chance of people being born.
            const babyChange = (
                this.stats.population
                / 2 /* 50% gender X */
                / 4 /* 1/4th of people are of age */
                / 3 /* 1/3rd of people have the time/resources/partner */
                * Math.random() /* There's always a bit of randomness */
                * delta
            );
            this.stats.population += babyChange;
        }

        // Calculate buildings before people - so if we're producing food, people are not starving etc.
        buildingsTick(delta);

        consumption(delta);
        respiration(delta);
        thirst(delta);

        repopulate(delta);

        /*
            for (const index in globalThis.instances.game.stats) {
                globalThis.instances.game.stats[index] = Math.ceil(globalThis.instances.game.stats[index])
            }
        */

        $$("colonyStats").setValues(globalThis.instances.game.stats);
        return delta;
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

        // setInterval(() => console.log(inputs), 10000);

        return inputs;
    }

    onListClickDebounce = false;
    /**
     * Respon to what list item was clicked
     * 
     * @param {string} id The string representing what was clicked
     * @param {MouseEvent} event the Click event
     */
    onListClick(id, event) {
        if (this.onListClickDebounce) return;
        this.onListClickDebounce = true;
        setTimeout(() => {
            this.onListClickDebounce = false;
        }, 2000);

        switch (id) {
            case "tutorial":
                globalThis.instances.webixController;
                break;
            case "stats":
                globalThis.instances.webixController;
                break;
            case "buildings":
                globalThis.instances.webixController;
                break;
        }
    }

    onBuildClick(id, event) {
        this.selectedBuilding = id;
    }

    build(localPoint) {
        const buildingRecord = this.buildings.find(r => r.id == this.selectedBuilding);

        const buildCostMultiplier = 100;

        for (const index in buildingRecord.input) {
            const resource = buildingRecord.input[index];
            const rate = buildingRecord.rate[index];
            if (this.stats[resource] < rate * buildCostMultiplier) {
                this.buildCostError();
                return false;
            }
        }

        this.builtBuildings.push(buildingRecord);
        this.weightDistribution.push({weight: buildingRecord.weight, localPoint});
        return buildingRecord;
    }

    buildCostError() {
        // TODO: Don't use Alert, use a modal.
        alert("Building cost exceeds the available resources");
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
                this.inputs[index].value = 0;
                this.outputs[index](temp);
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}
