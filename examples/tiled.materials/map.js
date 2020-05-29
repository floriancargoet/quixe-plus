/* global $, QuixePlus, Phaser */
$(() => {
  class Entity {
    constructor(config) {
      Object.assign(this, config);
      this.baseFrame = this.sprite.frame.name; // a number
      this.name = this.sprite.name;
    }
  }

  class Door extends Entity {
    constructor(config) {
      super(config);
      this.open = false;
      this.locked = false;
    }
    setOpen(open) {
      this.open = open;
      this.updateFrame();
    }
    setLocked(locked) {
      this.locked = locked;
      this.updateFrame();
    }
    updateFrame() {
      // locked = baseFrame
      // closed = baseFrame + 1
      // open   = baseFrame + 2
      const frame = this.baseFrame + (this.open ? 2 : this.locked ? 0 : 1);
      this.sprite.setFrame(frame);
    }
  }

  class SecretPassage extends Door {
    updateFrame() {
      // closed = baseFrame
      // open   = baseFrame + 1
      const frame = this.baseFrame + (this.open ? 1 : 0);
      this.sprite.setFrame(frame);
    }
  }

  class Preloader extends Phaser.Scene {
    constructor() {
      super("Preloader");
    }

    preload() {
      this.setupLoadBar();
      this.load.spritesheet("tiles", "tileset.png", {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.tilemapTiledJSON("map", "map.json");
    }

    setupLoadBar() {
      const { width, height } = this.sys.game.canvas;
      const box = {
        x: 20,
        y: height / 2 - 25,
        width: width - 40,
        height: 50
      };
      const bar = {
        x: box.x + 10,
        y: box.y + 10,
        width: box.width - 20,
        height: box.height - 20
      };

      const progressBar = this.add.graphics();
      const progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(box.x, box.y, box.width, box.height);

      this.load.on("progress", value => {
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(bar.x, bar.y, value * bar.width, bar.height);
      });

      this.load.on("complete", () => {
        progressBar.destroy();
        progressBox.destroy();
      });
    }

    create() {
      this.scene.start("TiledMap");
    }
  }

  class TiledMap extends Phaser.Scene {
    constructor() {
      super("TiledMap");
    }

    preload() {
      // I can't preload it in the Preloader Scene
      // It seems a scene plugin can only be loaded by its scene

      this.load.scenePlugin(
        "AnimatedTiles.min",
        "https://cdn.jsdelivr.net/npm/phaser-animated-tiles@2.0.2/dist/AnimatedTiles.min.js",
        "animatedTiles",
        "animatedTiles"
      );
    }

    create() {
      this.map = this.make.tilemap({ key: "map" });

      this.map.addTilesetImage("tiles");
      this.layers = [];
      this.map.layers.forEach(l => {
        const staticProperty = (l.properties || []).find(
          p => p.name === "static"
        );
        if (staticProperty && staticProperty.value === true) {
          this.layers.push(this.map.createStaticLayer(l.name, "tiles"));
        } else {
          this.layers.push(this.map.createDynamicLayer(l.name, "tiles"));
        }
      });

      this.entities = [];
      this.map.objects.forEach(l => {
        this.createEntitiesFromMapObjects(l.name, "door", Door);
        this.createEntitiesFromMapObjects(l.name, "passage", SecretPassage);
        this.createEntitiesFromMapObjects(l.name, "player", Entity);
      });

      this.animatedTiles.init(this.map);

      this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
      );

      const updater = new QuixePlus.Updater({
        ".door": door => {
          this.entities
            .filter(e => e.name === door.name)
            .forEach(entity => {
              entity.setOpen(door.is("open"));
              entity.setLocked(door.is("locked"));
            });
        },
        ".room": (room, context) => {
          const isCurrent = context.location.id === room.id;
          // Phaser drops group properties during parsing so we try to match the group name instead
          const re = new RegExp(`/${room.name}/`);
          const isVisited = room.is("visited");
          // tile layers from this room
          this.layers
            .filter(l => re.test(l.layer.name))
            .forEach(l => (l.visible = isVisited));
          // objects in room
          this.entities
            .filter(e => re.test(e.layerName))
            .forEach(e => {
              if (e.type === "player") {
                e.sprite.visible = isCurrent;
              } else {
                e.sprite.visible = isVisited;
              }
            });
        }
      });
    }

    createEntitiesFromMapObjects(layerName, type, Class) {
      const sprites = this.createSpritesFromMapObjects(layerName, type, {
        key: "tiles"
      });
      sprites.forEach(sprite => {
        this.entities.push(new Class({ sprite, type, layerName }));
      });
    }

    // forked from Map.createFromObjects()
    // we add support for selecting objects by type and selecting frame by gid
    createSpritesFromMapObjects(name, id, spriteConfig, scene) {
      if (spriteConfig === undefined) {
        spriteConfig = {};
      }
      if (scene === undefined) {
        scene = this.map.scene;
      }

      var objectLayer = this.map.getObjectLayer(name);

      if (!objectLayer) {
        console.warn(
          "Cannot create from object. Invalid objectgroup name given: " + name
        );

        if (typeof layerID === "string") {
          console.warn(
            "Valid objectgroup names:\n\t" +
              this.map.getObjectLayerNames().join(",\n\t")
          );
        }

        return null;
      }

      var objects = objectLayer.objects;
      var sprites = [];

      for (var i = 0; i < objects.length; i++) {
        var found = false;
        var obj = objects[i];

        if (
          (obj.gid !== undefined && typeof id === "number" && obj.gid === id) ||
          (obj.id !== undefined && typeof id === "number" && obj.id === id) ||
          (obj.name !== undefined &&
            typeof id === "string" &&
            obj.name === id) ||
          (obj.type !== undefined && typeof id === "string" && obj.type === id)
        ) {
          found = true;
        }

        if (found) {
          var config = Object.assign({}, spriteConfig, obj.properties);
          if (!config.frame) {
            config.frame = obj.gid - 1;
          }

          config.x = obj.x;
          config.y = obj.y;

          var sprite = scene.make.sprite(config);

          sprite.name = obj.name;

          if (obj.width) {
            sprite.displayWidth = obj.width;
          }
          if (obj.height) {
            sprite.displayHeight = obj.height;
          }

          // Origin is (0, 1) in Tiled, so find the offset that matches the Sprite's origin.
          // Do not offset objects with zero dimensions (e.g. points).
          var offset = {
            x: sprite.originX * obj.width,
            y: (sprite.originY - 1) * obj.height
          };

          // If the object is rotated, then the origin offset also needs to be rotated.
          if (obj.rotation) {
            var angle = Phaser.Math.DegToRad(obj.rotation);
            Phaser.Math.Rotate(offset, angle);
            sprite.rotation = angle;
          }

          sprite.x += offset.x;
          sprite.y += offset.y;

          if (
            obj.flippedHorizontal !== undefined ||
            obj.flippedVertical !== undefined
          ) {
            sprite.setFlip(obj.flippedHorizontal, obj.flippedVertical);
          }

          if (!obj.visible) {
            sprite.visible = false;
          }

          for (var key in obj.properties) {
            if (sprite.hasOwnProperty(key)) {
              continue;
            }

            sprite.setData(key, obj.properties[key]);
          }

          sprites.push(sprite);
        }
      }

      return sprites;
    }

    update(time, delta) {
      //this.controls.update(delta);
    }
  }

  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    scale: {
      parent: "quixeplus-pane",
      mode: Phaser.Scale.FIT,
      width: "100%",
      height: "100%"
    },
    backgroundColor: "#2d2d2d",
    pixelArt: true,
    scene: [Preloader, TiledMap]
  });
});
