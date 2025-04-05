import {webixController} from "./webix.index";


globalThis.instances ??= {};
// @ts-ignore
globalThis.options ??= {};
globalThis.defaultVolume = 50;
globalThis.volume ??= globalThis.defaultVolume;
globalThis.defaultInputRate = 50;
globalThis.inputRate ??= globalThis.defaultInputRate;
function pageload() {
    globalThis.instances.mainpage = new mainpage();
}

class mainpage {
    constructor() {
        globalThis.instances.webixController = new webixController;
        globalThis.instances.webixController.mainpage();
    }
}

pageload();

globalThis.options.volume = console.log;