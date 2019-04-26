/**
 * @author Lee Stemkoski
 *
 * Usage: 
 * (1) create a global variable:
 *      var keyboard = new KeyboardState();
 * (2) during main loop:
 *       keyboard.update();
 * (3) check state of keys:
 *       keyboard.down("A")    -- true for one update cycle after key is pressed
 *       keyboard.pressed("A") -- true as long as key is being pressed
 *       keyboard.up("A")      -- true for one update cycle after key is released
 * 
 *  See this.keys object data below for names of keys whose state can be polled
 */

// initialization
export class KeyboardState {

    constructor(domElement) {
        this.domElement = domElement || document;
        this.status = {};
        this.keys = {
            8: "backspace", 9: "tab", 13: "enter", 16: "shift",
            17: "ctrl", 18: "alt", 27: "esc", 32: "space",
            33: "pageup", 34: "pagedown", 35: "end", 36: "home",
            37: "left", 38: "up", 39: "right", 40: "down",
            45: "insert", 46: "delete", 186: ";", 187: "=",
            188: ",", 189: "-", 190: ".", 191: "/",
            219: "[", 220: "\\", 221: "]", 222: "'"
        };
        // bind keyEvents
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    }

    keyName (keyCode) {
        return (this.keys[keyCode] != null) ?
            this.keys[keyCode] :
            String.fromCharCode(keyCode);
    }

    onKeyUp (event) {
        var key = this.keyName(event.keyCode);
        if (this.status[key])
            this.status[key].pressed = false;
    }

    onKeyDown (event) {
        var key = this.keyName(event.keyCode);
        if (!this.status[key])
            this.status[key] = { down: false, pressed: false, up: false, updatedPreviously: false };
    }

    update () {
        for (var key in this.status) {
            // insure that every keypress has "down" status exactly once
            if (!this.status[key].updatedPreviously) {
                this.status[key].down = true;
                this.status[key].pressed = true;
                this.status[key].updatedPreviously = true;
                // updated previously
            }else {
                this.status[key].down = false;
            }
            // key has been flagged as "up" since last update
            if (this.status[key].up) {
                delete this.status[key];
                continue; // move on to next key
            }
            if (!this.status[key].pressed) // key released
                this.status[key].up = true;
        }
    }

    down (keyName) {
        return (this.status[keyName] && this.status[keyName].down);
    }

    pressed (keyName) {
        return (this.status[keyName] && this.status[keyName].pressed);
    }

    up (keyName) {
        return (this.status[keyName] && this.status[keyName].up);
    }

    debug () {
        var list = "Keys active: ";
        for (var arg in this.status)
            list += " " + arg
        console.log(list);
    }


}






