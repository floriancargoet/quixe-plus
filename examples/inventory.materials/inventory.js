/* global QuixePlus, $ */

$(() => {
    const $inventory = $("<div>").appendTo("#quixeplus-pane");

    // Build list of things recursively
    function buildList(obj) {
        const children = obj.children;
        if (children.length === 0) {
            return;
        }
        const $list = $("<ul>");
        children.forEach(child => {
            let str = child.getProperty("short_name", String);
            if (child.is("worn")) {
                str += " (being worn)";
            }
            if (child.is("container")) {
                str += child.is("closed") ? " (closed)" : " (open)";
            }
            const $item = $("<li>").text(str);
            // include children if open (you could handle transparent containers here)
            if (child.is("container") && child.is("open")) {
                $item.append(buildList(child));
            }
            $item.appendTo($list);
        });
        return $list;
    }

    const updater = new QuixePlus.Updater({
        "selfobj": (player) => {
            $inventory.html("");
            $inventory.append(buildList(player));
        }
    });
})
