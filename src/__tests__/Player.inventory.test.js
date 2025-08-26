/* eslint-env jest */
/* global withStory */
import { query as Q } from "../query.js";
import { Player } from "../Player.js";

const inventoryStory = `"Inventory" by Florian.

The test room is a room.
The screwdriver is in the test room.

[Inventory]
The player wears a jacket.
The wallet is in the jacket.
The gold coin is in the wallet.
The silver coin is in the wallet.
The player carries a hammer.
The player wears a hat.
`;

withStory(inventoryStory, () => {
  let player;
  beforeEach(() => {
    player = new Player();
  });

  test("the player doesn't have the screwdriver", () => {
    expect(Q("screwdriver")).toBeTruthy();
    expect(player.has("screwdriver")).toBe(false);
  });

  test("the player has the hammer", () => {
    expect(Q("hammer")).toBeTruthy();
    expect(player.has("hammer")).toBe(true);
  });

  test("the player has the silver coin in the wallet in the jacket", () => {
    expect(Q("silver_coin")).toBeTruthy();
    expect(player.has("silver_coin")).toBe(true);
  });
});
