/* eslint-env jest */
/* global withStory */
import { query as Q } from "../query.js";

const globalsStory = `"Globals" by Florian.

The test room is a room.

foo is a number that varies.
foo is 7.

bar is a number that varies.
The bar variable translates into I6 as "bar".

Include (-
    Global bar = 6;
-) after "Definitions.i6t".
`;

withStory(globalsStory, () => {
  test("we can access i7 globals by index", () => {
    expect(Q("Global_Vars").at(3, String)).toBe("Florian"); // pre-defined global
    expect(Q("Global_Vars").at(10)).toBe(7); // user global
  });

  test("we cannot access i7 globals by name", () => {
    expect(Q("foo")).toBeNull();
  });

  test("we can access i6 globals by name", () => {
    expect(Q("bar").value).toBe(6);
  });
});
