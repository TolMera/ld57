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
                            console.debug('Video has ended!');
                            webix.ui({
                                id: "mainArea",
                                cols: [
                                    {
                                        id: "menu",
            
                                        view: "tabview",
                                        cells: [
                                            {
                                                header: "New Game",
                                                body: {
                                                    view: `list`,
                                                    template: `#gameId# (#gameDate#)`,
                                                    select: true,
                                                    data: [{id: "1", date: "2025-01-01"}],
                                                    click: (id, event) => {
                                                        globalThis.instances.game.onListClick
                                                        .bind(globalThis.instances.game)
                                                        (id, event)
                                                    },
                                                }
                                            },
                                        ],
            
                                        // data: [
                                        //     { id: "tutorial", label: "Tutorial" },
                                        //     { id: "stats", label: "Colony Stats" },
                                        //     { id: "buildings", label: "Build" },
                                        //     { id: "options", label: "Options" },
                                        //     { id: "save", label: "Save" },
                                        // ],
                                        maxWidth: 300
                                    }, {
                                        id: "view",
                                        view: "template",
                                        template: `<canvas id="canvas"></canvas>`
                                    }
                                ]
                            }, $$("mainArea"));
                            globalThis.instances.game = new game();
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

