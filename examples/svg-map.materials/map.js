/* global QuixePlus, $ */

// This map uses the "discovered" attribute. It's used to handle hidden objects.
// In our case, we don't want to reveal doors and trapdoors on the map until the player has seen them.
// You need to add this in your story:
/*

A thing can be discovered or undiscovered. A thing is usually undiscovered.
Before printing the name of something (called discovery): now the discovery is discovered.

*/

const map = new QuixePlus.SVGMap({
    updateLevel(currentRoom) {
        // Hide all levels
        this.$get("level").hide();
        // Show only the level containing the current room
        this.$get("room", currentRoom.name).parent("[data-level]").show();
    },

    updateRoom(room, isCurrent) {
        this.$get("room", room.name)
            .toggle(room.is("visited"))
            .css({
                fill: isCurrent ? "#ffff99" : "white"
            });
    },

    updateDoor(door) {
        this.$get("door", door.name).each((index, el) => {
            const $el = $(el);
            const states = ($el.data("state") || "").split(" ").filter(Boolean);
            $el.toggle(
                // Show if discovered
                door.is("discovered") &&
                // and if state matches
                states.reduce((visible, stateName) => visible && door.is(stateName), true)
            );
        });
    },

    onReady() {
        this.$svg.css({
            width: "100%",
            height: "100%"
        });
        // Updater will hook into Quixe if game_options is globally defined
        // and run your queries at each turn
        const updater = new QuixePlus.Updater({
            "real_location": (location) => {
                // real_location is a global, it could be anything so it's returned to us as an InformValue.
                // Since we now it's an object, we can cast it.
                map.updateLevel(location.asObject());
            },
            ".room": (room, context) => {
                // a ".attribute" selector can only apply to an object, so "room" is already an InformObject.
                map.updateRoom(room, context.location.id === room.id);
            },
            ".door": (door) => {
                map.updateDoor(door);
            }
        });
    }
});


