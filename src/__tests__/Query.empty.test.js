/* eslint-env jest */
/* global withStory */
import { query as Q, queryAll as QQ } from "../query.js";

const emptyStory = `"Empty" by Florian.

The empty room is a room. "Nothing here."
`;

withStory(emptyStory, () => {
  test("**", () => {
    const results = QQ("**");
    expect(results).toBeTruthy();
    expect(results).toHaveLength(
      1 + // nothing
        1 + // compass
        1 + // the dark
        2 + // InformParser, InformLibrary
        3 + // internal stuff (property_numberspace_forcer, ValuePropertyHolder_*)
        12 + // directions
        1 + // player
        1 // the empty_room
    );
  });

  test("*", () => {
    const results = QQ("*");
    expect(results).toBeTruthy();
    expect(results).toHaveLength(1); // the empty_room
  });

  test("empty_room", () => {
    expect(Q("empty_room")).toBeTruthy();
  });

  test("inexistant object", () => {
    expect(Q("i_do_not_exist")).toBeNull();
  });
});
