"Demo of the QuixePlus Map" by Florian Cargoët (in French).
The story headline is "Une démonstration de QuixePlus.".

Part 1 - Configurations & setup

Chapter 1 -Extensions

Include Experimental French Features by Nathanael Marion.

Release along with the "QuixePlus" interpreter, the "QuixePlusSite" website.

Chapter 2 - Properties & attributes

Section 1 - Secret or discovered

[
This attribute is used by:
	- the QuixePlus map (undiscovered doors are not shown)
	- the completion rate at the end of the game (showing the % of found objects)
]

A thing can be discovered or undiscovered. A thing is usually undiscovered.

[boolean to disable discovery in some situations like printing the list of undiscovered things or printing the list of things missing a description]
discovery_enabled is a truth state that varies.
discovery_enabled is true.
Before printing the name of something (called discovery) when discovery_enabled is true : now the discovery is discovered.

[Type "completion" to show completion rate & discovery counters]
Printing game completion is an action applying to nothing.
Understand "completion" as printing game completion.
Carry out printing game completion:
	let discovered be number of discovered things + number of discovered doors + number of visited rooms;
	let total be number of things + number of doors + number of rooms - 1; [exclude self]
	let completionRate be (100.0 * discovered) / total; [Parentheses avoids integer division]
	say "Jeu exploré à [completionRate to 2 decimal places]%.";
	say "Objets découverts : ";
	say "[number of discovered things] / [number of things - 1]."; [exclude self]
	say "Portes découvertes : ";
	say "[number of discovered doors] / [number of doors].";
	say "Lieux découverts : ";
	say "[number of visited rooms] / [number of rooms]."

Chapter 3 - Types

Section 1 - Secret doors

A secret door is a kind of door.
A secret door can be revealed or unrevealed.
A secret door is unrevealed.
A secret door is scenery.
A secret door is closed.
A secret door translates into French as une porte secrète.
The plural of porte secrète is portes secrètes.

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
	now the door is revealed;
	now the door is not scenery. [make it listable]

Section 2 - Stairs

A staircase is a kind of door. A staircase is usually open. A staircase is seldom openable.
A staircase translates into French as un escalier.

Part 2 - Objects and rooms

Chapter 1 - Salon

Le Salon est un endroit. "Un salon dépouillé avec [une table] et deux [chaises]. [Un coffre] est sur la table. Au nord, vous apercevez la chambre, au sud, [une portedelacuisine]. Un [escalier en bois] monte à l'étage."
Une table est une chose décorative dans le Salon.
La description de la table est "Une table en chêne sur laquelle est posé [un coffre]."
Les chaises sont une chose décorative dans le Salon.
La description des chaises est "Vous n'êtes pas là pour vous asseoir sans rien faire, si ?"
Comprendre "chaise", "deux" comme les chaises.

Le coffre est un contenant fermé et ouvrable.
La description du coffre est "C'est un simple coffre en bois vernis, il ne semble pas fermé à clef."
Le coffre est sur la table.
La clef est dans le coffre.
La description de la clef est "Une petite clef en métal".
Comprendre "cle", "petite", "metal" comme la clef.

[Vers la Chambre]
Au nord du salon est la Chambre.

[Vers la Cuisine]
La portedelacuisine est une porte fermée.
La description est "Une porte coulissante pour illustrer les possibilités de la carte."
La portedelacuisine est au sud du Salon et au nord de la Cuisine.
Le printed name de la portedelacuisine est "porte".
Comprendre "porte" comme la portedelacuisine.

[Vers le Grenier]
L' escalier en bois est un escalier.
La description est "Un escalier pour montrer la gestion des niveaux sur la carte."
L' escalier en bois est au-dessus du Salon et en dessous du Grenier.

Chapter 2 - Chambre

La Chambre est un endroit.  "Vous savez que c'est une chambre parce que vous voyez que [la moquette] porte encore la trace profonde des quatre pieds d'un lit mais il n'y a aucun meuble dans cette pièce. [if le machin est dans la chambre][Un machin] traîne par terre. [end if]Une [portefenetre] mène [au Balcon]."
La moquette est une chose décorative dans la Chambre.
La description de la moquette est "La moquette est marquée là où étaient sans aucun doute les quatre pieds d'un lit."
Comprendre "trace", "traces", "sol" , "lit" comme la moquette.
Le machin est dans la Chambre.
La description du machin est "Ce machin est un truc inutile."

[Vers le Balcon]
La portefenetre est une porte fermée verrouillée verrouillable.
La description est "Une porte fenêtre à clef, pourquoi pas."
La portefenetre est à l'est de la Chambre et à l'ouest du Balcon.
Le printed name de la portefenetre est "porte fenêtre".
Comprendre "porte", "fenetre", "porte-fenetre", "balcon" comme la portefenetre.
La clef ouvre la portefenetre.

Chapter 3 - Balcon

Le Balcon est un endroit. "Un balcon au rez-de-chaussée, c'est stupide."

Chapter 4 - Cuisine

La Cuisine est un endroit. "Cette pièce est inutile vu que vous vous faites systématiquement livrer vos repas.[if la trappe is revealed] [La trappe] qui était sous [le tapis] mène à [la cave].[end if] [La portedelacuisine] au nord mène [au salon]."

Un tapis est dans la Cuisine.
La description est "C'est curieux de mettre un tapis dans une cuisine."

[Vers la Cave]
La trappe est une porte secrète.
La description est "Une trappe secrète pour illustrer les possibilités de la carte."
La trappe est en dessous de la Cuisine et au-dessus de la Cave.

After taking le tapis when la trappe est unrevealed:
	reveal la trappe;
	[use the trappe variable so that it's marked as discovered and appears on the map]
	dire "En soulevant [the noun], vous révélez [une trappe].";
	continuer l'action.

Instead of pushing or pulling le tapis when la trappe est unrevealed:
	reveal la trappe;
	dire "En déplaçant [the noun], vous révélez [une trappe]."

Instead of looking under or examining le tapis when la trappe est unrevealed:
	reveal la trappe;
	dire "Sous [the noun], vous trouvez [une trappe]."

Chapter 5 - Cave

La Cave est un endroit. "Pas une seule bouteille de vin dans le coin. [Une trappe] au plafond mène à [la cuisine]."

Chapter 6 - Grenier

Le Grenier est un endroit. "[Des toiles d'araignées], rien de plus."
Les toiles d'araignées sont une chose décorative dans le Grenier.
La description est "Vous n'êtes pas arachnophobe mais regarder de près ces bestioles ne vous dit rien."
Comprendre "toile", "toiles", "araignee", "araignees" comme les toiles d'araignées.

Part 3 - Tests & debugging - Not for release

Chapter 1 - Missing descriptions

When play begins:
	[Do not count this printing action as discovery]
	now discovery_enabled is false ;
	repeat with item running through things:
		if description of the item is "":
			say "[item] has no description." ;
	repeat with item running through rooms:
		if description of the item is "":
			say "[item] has no description." ;
	now discovery_enabled is true.

Chapter 2 - Tests

test completion with "ouvrir coffre / prendre clef / n / ouvrir porte avec clef / ouvrir la porte / e / w / s / haut / bas / s / tirer tapis / bas / completion".
