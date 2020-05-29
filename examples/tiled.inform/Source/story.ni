"Demo of the QuixePlus Tilemap feature" by Florian

Release along with the "QuixePlus" interpreter, the "QuixePlusSite" website.

A secret door is a kind of door.
A secret door can be revealed or unrevealed.
A secret door is unrevealed.
A secret door is scenery.
A secret door is closed.

To print the you can't go message:
	say "[text of can't go that way rule response (A)][line break]"

To print the you can't see message:
	say "[text of parser error internal rule response (E)][line break]"

Before going through a secret door which is unrevealed:
	print the you can't go message instead.

Before doing something to a secret door which is unrevealed:
	print the you can't see message instead.

Before doing something when a secret door is the second noun and the second noun is unrevealed:
	print the you can't see message instead.

To reveal (door - a secret door):
	now the door is revealed.

The Main room is a room. "You see two doors, a wooden one, leading north to [the Library], and an iron one, leading south to [the Kitchen]."

The wooden door is a locked scenery door.
The wooden door is north of the Main room and south of the Library.
The library key unlocks the wooden door.
The player carries the library key.

The iron door is a closed openable scenery door. 
The iron door is south of the Main room and north of the Kitchen.

The Library is a room. "You see [the wooden door], leading back to [the Main room][if the secret passage is open] and [a secret passage] to the east[end if]. A library should have books but this is just a demo so it's depressingly empty. The walls are as boring as the rest of the room[if secret passage is closed] but something feels wrong about them[end if]."

The walls are a scenery in the Library. The description is "[if the secret passage is closed]A close inspection reveals small cracks in the east wall. Could there be a secret passage here?[otherwise]One secret passage is enough.[end if]".
Understand "wall" or "walls"  as the walls.

The secret passage is a secret door.
The secret passage is east of the Library and west of the Secret room.
Understand "secret" or "passage" as the secret passage.

Instead of attacking the walls, try attacking the secret passage.
[override the secret door rule]
Before attacking the secret passage:
	if the secret passage is unrevealed:
		reveal the secret passage;
		now the secret passage is open;
		say "A large chunk of the wall crumbles onto the floor, revealing a passage.";
	else:
		say "You already broke the wall, do you just like violence?";
	stop the action.

[override the secret door rule]
Before examining the unrevealed secret passage, say "You are convinced there something behind this wall, perhaps you could hit it?" instead.

The Secret room is a room. "You found a secret room! Alas, it is empty… To the west, you see the passage you came from."

The Kitchen is a room. "You see [the iron door], leading back to [the Main room]."

test me with "unlock wooden door / n / x wall / x passage / hit passage / hit wall / e / w"