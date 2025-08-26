import { Player } from "./Player.js";
import { queryAll } from "./query.js";

const instances = [];

if (globalThis.game_options) {
  globalThis.game_options.before_select_hook = function () {
    instances.forEach((instance) => instance.handleNewTurn());
  };
}

export class Updater {
  player = new Player();

  constructor(spec) {
    this.spec = spec;
    instances.push(this);
    this.update();
  }

  handleNewTurn() {
    this.update();
  }

  update() {
    const context = {
      player: this.player,
      location: this.player.location, // cache getter
    };

    Object.keys(this.spec).forEach((query) => {
      queryAll(query).forEach((obj) => this.spec[query](obj, context));
    });
  }
}
