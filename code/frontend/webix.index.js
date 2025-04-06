import { game } from './game.js';

export class webixController {
    mainpage() {
        webix.ui({
            type: "space",
            rows: [
                {
                    id: "header",
                    type: "header",
                    template: "<h1>The Cloud Cities</h1>",
                    height: 70,
                },
                {
                    id: "mainArea",
                    cols: [
                        {
                            id: "menu",
                            view: "list",
                            template: "#label#",

                            click: this.onListClick.bind(this),
                            data: [
                                { id: "newGame", label: "New Game" },
                                { id: "loadGame", label: "Load Game" },
                                { id: "story", label: "Story" },
                                { id: "options", label: "Options" },
                                { id: "credits", label: "Credits" },
                            ],
                            maxWidth: 300
                        }, {
                            id: "view",
                            view: "template",
                        }
                    ]
                },

            ]
        });
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

        function introVideo() {
            const videos = ["media/1.mp4", "media/2.mp4", "media/3.mp4"]
            return videos[Math.ceil(videos.length * Math.random())]
        }

        console.debug(id);
        switch (id) {
            case "newGame":
                webix.ui({
                    id: "view",
                    view: "video",
                    src: introVideo(),
                    position: "center",
                    autoplay: true,
                    controls: false,
                }, $$("view"));
                setTimeout(() => {
                    document.querySelector('video')
                        .addEventListener('ended', function () {
                            globalThis.instances.game = new game();
                            console.debug('Video has ended!');
                            webix.ui({
                                id: "mainArea",
                                cols: [
                                    {
                                        id: "menu",

                                        view: "tabview",
                                        cells: [
                                            {
                                                //     { id: "tutorial", label: "Tutorial" },
                                                header: "Tutorial",
                                                body: {
                                                    view: `template`,
                                                    template: `<h1>Tutorial</h1>
                                                    <ul>
                                                        <a href="#populationGrowth"><li>Population Growth</li></a>
                                                        <a href="#placingBuildings"><li>Placing Buildings</li></a>
                                                    </ul>
                                                    <h2>populationGrowth</h2>
                                                    <p>
                                                        Population growth (or fall) happens constantly throughout the game.  New people are born all the time, because of the gestation time for tiny humans, we don't control when people can have kids.  We're trying to save the human race, kids are too important to put off until later.
                                                    </p>
                                                    <p>
                                                        The fall of population happens constantly as well, if people are not getting enough Food, Water or Oxygen, the population will begin to fall.  It's your job, to rebuild the human race, and that means don't let them die!
                                                    </p>
                                                    <h2>placingBuildings</h2>
                                                    <p>
                                                        Click on the "build" tab.  You will see a list of all of the available buildings.  I have not had time yet to make this interface more intuitive, but I will explain here how it works.<br />
                                                        The name is the first part of the item, it tells you "what" the building is.  The inputs are what the building uses to make its outputs.<br />
                                                        How much of each input, becomes how much of each output is the "rates" - if the inputs are ["oxygen", "sludge"] and the output is ["organicWaste"], the rates will have 3 numbers [A, B, C] A is how much Oxygen it will use, B is how much Sludge it will use, and C is how much organicWaste it will produce.  
                                                    </p>
                                                    <p>Click on the list item that you want to build, then click on the sphere to build that item.</p>
                                                    <pBe aware that each building you build, will affect the balance of the city, heavy objects may even tip the city over</p>
                                                    <p>----</p>
                                                    <p>Great Scott Batman! It's a the Tutorial!</p>
                                                    <p>I haven't yet written the game, so this is a guess.</p>
                                                    <p>Click "Colony Stats" to view details about the colony, like resources, needs, other details</p>
                                                    <p>Click "Build", from there you're able to select things to place on the cloud city.</p>
                                                    <p>Don't run out of stats, don't sink the city, do provide the people with what they need!</p>
                                                    `,
                                                }
                                            }, {
                                                //     { id: "stats", label: "Colony Stats" },
                                                header: "Colony Stats",
                                                body: {
                                                    id: 'colonyStats',
                                                    view: `template`,
                                                    template: function (obj) {
                                                        return `<h1>Colony Stats</h1>
                                                            <p>Population: ${Math.round(obj.population)}</p>
                                                            </br>
                                                            <h4>Life Support</h4>
                                                            <p>Battery Charge: ${Math.round(obj.batteryCharge)}</p>
                                                            <p>Oxygen: ${Math.round(obj.oxygen)}</p>
                                                            <p>Water: ${Math.round(obj.water)}</p>
                                                            </br>
                                                            <h4>Food</h4>
                                                            <p>Sludge: ${Math.round(obj.sludge)}</p>
                                                            <p>Ration: ${Math.round(obj.ration)}</p>
                                                            <p>Gourmet: ${Math.round(obj.gourmet)}</p>
                                                            </br>
                                                            <h4>Resources</h4>
                                                            <p>Metal: ${Math.round(obj.metal)}</p>
                                                            <p>Hydrogen: ${Math.round(obj.hydrogen)}</p>
                                                            <p>Polymer: ${Math.round(obj.polymer)}</p>
                                                            </br>
                                                            <h4>Waste</h4>
                                                            <p>OrganicWaste: ${Math.round(obj.organicWaste)}</p>
                                                            <p>InorganicWaste: ${Math.round(obj.inorganicWaste)}</p>
                                                        `;
                                                    },
                                                    data: globalThis.instances.game.stats
                                                }
                                            }, {
                                                //     { id: "buildings", label: "Build" },
                                                header: "Build",
                                                body: {
                                                    view: `list`,
                                                    type:{
                                                        autoheight: true,
                                                        height: 128,
                                                    },
                                                    template: function (obj) {
                                                        return `<div>
                                                                <strong>${obj.name}</strong><br />
                                                                inputs: [${obj.input.join(", ")}]<br />
                                                                outputs: [${obj.output.join(", ")}]<br />
                                                                ratios: [${obj.rate.join(", ")}]
                                                            </div>
                                                        `;
                                                    },

                                                    select: true,
                                                    data: globalThis.instances.game.buildings,
                                                    click: function () {
                                                        globalThis.instances.game.onBuildClick
                                                            .bind(globalThis.instances.game)
                                                            (...arguments)
                                                    },
                                                }
                                            }, {
                                                //     { id: "options", label: "Options" },
                                                header: "Options",
                                                body: {
                                                    view: `list`,
                                                    template: `#id# (#date#)`,
                                                    select: true,
                                                    data: [{ id: "1", date: "2025-01-01" }],
                                                    click: (id, event) => {
                                                        globalThis.instances.game.onListClick
                                                            .bind(globalThis.instances.game)
                                                            (id, event)
                                                    },
                                                }
                                            }, {
                                                //     { id: "save", label: "Save" },
                                                header: "Save",
                                                body: {
                                                    view: `list`,
                                                    template: `#id# (#date#)`,
                                                    select: true,
                                                    data: [{ id: "1", date: "2025-01-01" }],
                                                    click: (id, event) => {
                                                        globalThis.instances.game.onListClick
                                                            .bind(globalThis.instances.game)
                                                            (id, event)
                                                    },
                                                }
                                            }, {
                                                header: "New Game",
                                                body: {
                                                    view: `list`,
                                                    template: `#id# (#date#)`,
                                                    select: true,
                                                    data: [{ id: "1", date: "2025-01-01" }],
                                                    click: (id, event) => {
                                                        globalThis.instances.game.onListClick
                                                            .bind(globalThis.instances.game)
                                                            (id, event)
                                                    },
                                                }
                                            },
                                        ],
                                        maxWidth: 500
                                    }, {
                                        id: "view",
                                        view: "template",
                                        template: `<canvas id="canvas"></canvas>`
                                    }
                                ]
                            }, $$("mainArea"));

                            globalThis.instances.game.init();
                        });
                }, 1000);
                break;
            case "loadGame":
                // TODO: This
                webix.ui({
                    id: "view",
                    view: "template",
                    template: `
                    <h1>Load Game</h1>
                    <p>This feature is currently unavailable</p>
                    `
                }, $$("view"));
                break;
            case "options":
                webix.ui({
                    id: "view",
                    rows: [
                        {
                            template: `Volume <output id="value"></output>: <input type="range" step="1" min="0" max="100" value="${globalThis.defaultVolume}" onchange="globalThis.volume=this.value" />`,
                        },
                        {
                            template: `Input sample rate <output id="value"></output>: <input type="range" step="1" min="0" max="100" value="${globalThis.defaultInputRate}" onchange="globalThis.inputRate=this.value" />`,
                        },
                        {
                            template: `TODO: Implement Key remapping here so peoiple can map their keyboard.  If I don't get to this, I apollogize to all those not running a US-International keyboard.`
                        }
                    ]
                }, $$("view"));
                break;
            case "credits":
                webix.ui({
                    id: "view",
                    view: "template",
                    template: `
                        <h1>The Cloud Cities</h1>
                        <p>This game was written by Bjorn "TolMera" Macintosh, I'm a long time developer, and this is I think the 17th game that I've made for Ludum Dare.</p>
                        <p>I really hope you enjoy playing</p>
                        <ul>
                            <li>I used ChatGPT while making this game</li>
                            <li>I used Three.JS for the visual parts of the game</li>
                            <li>I used Webix for the UI</li>
                        </ul>
    
                        <p>
                            <a href="https://ldjam.com/events/ludum-dare/57/$407129">If you enjoyed the game, please rate and write me a message on LDJam.com</a>
                        </p>
                        `
                }, $$("view"));
                break;
            case "story":
                webix.ui({
                    id: "view",
                    view: "template",
                    template: `
                            <h1>The Cloud Cities</h1>
                            <p>In 2027, the world ended.</p>

                            <p>Or at least, that's how it felt. It wasn't the same Earth from the 2010s — back when humanity was blindly stumbling toward catastrophe with a smile and a latte.</p>

                            <p>
                            No one expected it. Just before being shut down, NISA (the last serious space agency) launched the Near-Earth Object Initiative. Ironically, it wasn't them who spotted the problem. It was backyard scientists who discovered asteroid 2024 YR4 — originally predicted to miss us and hit the Moon in 2036.
                            </p>

                            <p>
                            They were wrong. It clipped the Moon. Millions of fragments rained down on Earth. Not all at once — but enough to break the world. Infrastructure collapsed. Oceans rose. And what didn't burn, froze. Extinction-level. And you were probably just having a cup of coffee when the first rock hit Earth.
                            </p>

                            <p>
                            We've always been good at imagining the end — just not believing it. Like the movie "Don't Look Directly At It". People joked it was prophetic. Turns out, ignoring inconvenient truths doesn't make them less real.
                            </p>

                            <p>
                            Enter Savage — influencer and accidental savior. He rallied the maker movements: hobbyists, coders, machinists, dreamers. Together, they built *The Ark* — a ship designed to survive the descent to Venus. Why Venus? Closest. Easiest. Less time in deep space.
                            </p>

                            <p>
                            Choosing who would go was hard. You needed the best. The brightest. The bravest. You got... the available. Congratulations — it's you.
                            </p>

                            <p>
                            The Ark can float in Venus's atmosphere for 12 months. After that, systems fail. If you haven't built something sustainable by then — it's over. All of it.</p>

                            <p>
                            Venus is death below. Pressure 90 times Earth's, hotter than an oven, acidic rain. The only way to live is to float — a cloud city, like something out of a golden-age sci-fi novel. Except this time, it's not fiction.
                            </p>

                            <p>Twelve months. One ship. One chance.</p>
                            <p>Your objective: survive.</p>
                            `
                }, $$("view"));
                break;
        }
    }

}

