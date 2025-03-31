import { expect, test } from "tstyche";

interface Bird {
  fly: () => void;
}

interface Fish {
  swim: () => void;
}

type Pet = Bird | Fish;

function isFish(pet: Pet): pet is Fish {
  return "swim" in pet;
}

declare const pet: Pet;

test("isFish()", () => {
  if (isFish(pet)) {
    expect(pet).type.toBe<Fish>();
  } else {
    expect(pet).type.toBe<Bird>();
  }
});
