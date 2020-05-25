/* eslint-env jest */
/* global withStory */
const { Q } = require("../QQ.js");
const { Player } = require("../Player.js");

withStory("inventory", () => {
  let player;
  beforeEach(() => {
    player = new Player();
  });

  test("the player doesn't have the screwdriver", () => {
    expect(Q("screwdriver")).not.toBeNull();
    expect(player.has("screwdriver")).toBe(false);
  });

  test("the player has the hammer", () => {
    expect(Q("hammer")).not.toBeNull();
    expect(player.has("hammer")).toBe(true);
  });

  test("the player has the silver coin in the wallet in the jacket", () => {
    expect(Q("silver_coin")).not.toBeNull();
    expect(player.has("silver_coin")).toBe(true);
  });
});
