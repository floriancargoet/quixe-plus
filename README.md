# QuixePlus

QuixePlus is a set of tools to extract and present information from a running Quixe interpreter.

It can be used to display a map next to the interpreter. As the player navigates the story, the map reveals rooms and passages.

You could also display the inventory instead of requiring the player to type "inventory", a list of objectives, a score system…

Here's a [demo of the SVG map feature](https://floriancargoet.github.io/quixe-plus/svg-map/play.html).

## Installation

QuixePlus is still under development so the installation process is a bit rough.

1. You'll need NodeJS so go install that first.
2. Download the QuixePlus files or clone the repository
3. Copy or link the templates (`templates/QuixePlus` and `templates/QuixePlusSite`) [where Inform expects them](http://inform7.com/book/WI_25_13.html)
4. Optionnally, put the scripts in your $PATH

## Usage

### Releasing a story with QuixePlus

1. Add the following to your story:
    ```
    Release along with the "QuixePlus" interpreter, the "QuixePlusSite" website.
    ```
2. Release your story with debug information
  - On OSX, the debug file `gameinfo.dbg` is automatically generated, on Windows you need to check "Generate Inform 6 debugging informations" in the Inform preferences.
  - You can use Inform to release the story, as usual
  - Or you can use the `i7-release.js` script (OSX only for now) which fixes some OSX issues and calls step 3 automatically.
3. Extract and convert the debug information
 - Run the `i7-post-release.js` script. If you used `i7-release.js`, this is done automatically for you.
4. Your story is now released with QuixePlus and the much needed `gameinfo.js` file. To release a map with your story, see the [Maps section](#maps).

### Queries and types

#### Queries

 - `QuixePlus(selector)` returns the first object matching the selector.
 - `QuixePlus.all(selector)` returns all of them.
 - `Q()` is an alias for `QuixePlus()` and `QQ()` is an alias for `QuixePlus.all()`. It is inspired by the browser's `$()` and `$$()` which map to `document.querySelector()` and `document.querySelectorAll()`.
 - `QQ("*")` returns all objects (in the future it may only return objects created by the author and exclude default Inform objects)
 - `Q("id")` returns the **value** identified by "id". A value can be an Object, an Array, a String or a Value (which is used when QuixePlus didn't guess what the type is. See the [Types section](#types) and the [Globals section](#globals) for more).
   Inform 7 adds prefixes to the name of your objects to build IDs but you can't guess them without looking at the Inform 6 result. That's why QuixePlus drops the prefixes and allows you to get the black key with `Q("black_key")` instead of `Q("I128_black_key")`. If you don't know the name of your object, use `QQ("*")` and inspect the results.
 - `QQ(".attribute")` returns all objects that have the `attribute` attribute set to **true**.
 - `QQ(".!attribute")` returns all objects that have the `attribute` attribute set to **false**. _Note: QuixePlus cannot differentiate between an attribute set to false and an attribute that doesn't exists_.

 Examples:

 - All the doors: `QQ(".door")`.
 - All the open things (doors and containers): `QQ(".open")`.
 - The current location: `Q("real_location").asObject()`. _Note: QuixePlus doesn't know that real_location is an object so it returns a Value which we can convert to an object because we know it is an object._
 - The player: `Q("selfobj")` or `Q("player").asObject()`.

#### Types

Queries return values which can be:
 - objects (`class InformObject`). This is the most common case.
 - arrays (`class InformArray`). Most probably you'll only use the "Global_Vars" array if any.
 - strings (`class InformString`). A special kind of array which contains a **constant string**.
 - values (`class InformValue`). This is the catch-all type, used when QuixePlus doesn't know what is the type of the value.

##### Objects

The most useful type of QuixePlus. Every Inform thing, room or object is an `InformObject`.
Objects have an `id`, a `name` derived from the `id`.
Objects may have a `parent` object that contains them, a `children` list of contained objects.

###### Attributes (either/or properties)

In Inform, when you say that a thing is `red`, it create a `red` **attribute** with the value `true`. You can get that value on an `InformObject` with `obj.getAttribute("red")`. When you say that a thing can be open or closed, Inform only create the `open` attribute. While `getAttribute()`only works with the real attribute names, QuixePlus provides a `is()` method that allows you to use `"closed"` or `"!open"`. For instance, `Q("red_door").is("closed")` works, `Q("red_door").is("unlocked")` works too, even if `unlocked` is not really an Inform attribute. You can make it work for you own attributes with `QuixePlus.mergeAttrMap({ "red": "!green", "broken": "!intact" })`.

###### Properties (value properties)

In Inform, when you say that a thing has a `length` `18`, it creates a `length` **property** with the value `18`. You can get that value on an `InformObject` with `obj.getProperty("length")`.
By default, `getProperty()` returns raw values (as stored in the Quixe virtual machine) because it doesn't know what they are. `QuixePlus("red_door").getProperty("short_name")` might return something like `493460` which is an identifier for the array that contains and identifier for the string that you want. QuixePlus cannot know that `18` is the value that you want for the `length` and that `493460` is NOT the value that you want for `short_name`. That's why it always returns the raw value.
Fortunately, you generally know the type of the property and you can help QuixePlus: `QuixePlus("red_door").getProperty("short_name", String)` will return "red door".

##### Arrays

TODO!

##### Strings

:warning:
QuixePlus can only retrieve **constant strings**, not computed strings.
If in Inform you write `The carpet description is "A brand new white carpet."`, you can use `Q("carpet").getProperty("description", String)`.
But if you write `The carpet description is "A brand new [color of the carpet] carpet."`, you can't retrieve the description with QuixePlus.

##### Values

TODO!

#### Globals

QuixePlus can retrieve global variables but there's a caveat: you can't access them by name in pure Inform 7.
Inform 7 stores global variables in a global array (named `Global_Vars`) and their name is lost. You can still access them but you need to know their index in the array.

However, you can access Inform6 globals by name, so we can tell Inform7 to translate our I7 variable to an I6 variable instead of putting it into the `Global_Vars` array.

See [this test](https://github.com/floriancargoet/quixe-plus/blob/master/src/__tests__/Global_Vars.test.js) for an example.

#### Player & inventory

TODO!

```
const p = new Player();
p.inventory; // alias for children, the list of contained objects
p.has("something"); // traverses the tree of contained objects to find nested objects.
```

### Maps

With all the information that we can extract with QuixePlus, we can build a visual map of the story world and display it next to the interpreter. As the player navigates the world, we reveal parts of the map. We can also indicate which doors are closed or locked! You can also hide secret doors from the map until the player has discovered them.

This part of QuixePlus is more of a starter kit for writing your own map code than a complete solution.
Your map could be a SVG file with multiple layers or even multiple linked files, a 3D view of your world, a Tiled map…
You may want to animate doors when they open, draw an avatar in the current room, indicate locked doors…
My point is, QuixePlus cannot do all of that but enables you to do it.

QuixePlus provides you with an `Updater` that will give you the state of the game after each turn and a `SVGMap` that's a simple demo of what you can do.

#### Updater

The `Updater` is a class used to run a set of queries after each turn and call your code with the results.

```javascript
// This code assumes that a map object exists

const updater = new QuixePlus.Update({
    ".door": function (door) {
        // this function is called with each door
        if (door.is("locked")) {
            map.showLock(door.name);
        } else {
            map.hideLock(door.name);
        }
    },
    ".room": function (room) {
        if (room.is("visited")) {
            map.revealRoom(room.name);
        }
    },
    "real_location": function (location) {
        map.movePlayerAvatar(location.asObject().name);
    }
});
```

#### Simple SVG map

The `SVGMap` is a simple map implementation that will load a SVG file and allow you to get SVG elements so that you can show/hide them as required.

The following example assumes your SVG map has a specific structure:
 - rooms have a `data-room="room_name"` attribute.
 - rooms are nested in levels (`<g>` elements with the `data-level` attribute)
 - door elements to be shown/hidden have a `data-door="door_name"` attribute and a `data-state` attribute. The data `data-state` attribute specifies which door attributes control the visibility of the element. The `<rect ... data-door="kitchendoor" data-state="locked">` element will only be visible if the kitchendoor has been discovered by the player and if it is locked.

```javascript
// map.js

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
            // Reveal the room if the player has visited it
            .toggle(room.is("visited"))
            // Paint the current room yellow
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
                // context contains the player and the current location
                map.updateRoom(room, context.location.id === room.id);
            },
            ".door": (door) => {
                map.updateDoor(door);
            }
        });
    }
});

```

#### How to release the map

Put your `map.svg` and `map.js` files in your `.materials` folder.
The `i7-post-release.js` script will copy them to the Release folder.

Alternatively you can try to use the Inform instruction: "Release along with a file…" but it is [broken in 6L38 on OSX](http://inform7.com/mantis/view.php?id=1499) and I haven't tried it yet on another version / OS.

