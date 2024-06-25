import type React from "react";
import { describe, expect, test } from "tstyche";

type AaProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  one: string;
  two: boolean | undefined;
};

type BbProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  one?: undefined;
};

interface FirstOverload {
  (props: BbProps): React.JSX.Element;
  (props: AaProps): React.JSX.Element;
}

function First(props: BbProps): React.JSX.Element;
function First(props: AaProps): React.JSX.Element;
function First(props: BbProps | AaProps): React.JSX.Element {
  const hasOne = (props: BbProps | AaProps): props is AaProps => "one" in props;

  if (hasOne(props)) {
    return <a {...props} />;
  }

  return <button {...props} />;
}

describe("when target is a function component", () => {
  test("accepts props of the given type", () => {
    expect(First).type.toAcceptProps();
    expect(First).type.not.toAcceptProps(); // fail

    expect(First).type.toAcceptProps({});
    expect(First).type.not.toAcceptProps({}); // fail

    expect(First).type.toAcceptProps({ one: "sample" });
    expect(First).type.not.toAcceptProps({ one: "sample" }); // fail
  });

  test("property does not exist in props type", () => {
    expect(First).type.not.toAcceptProps({ enable: true });
    expect(First).type.toAcceptProps({ enable: true }); // fail
  });

  test("property type is not assignable to prop type", () => {
    expect(First).type.not.toAcceptProps({ one: true });
    expect(First).type.toAcceptProps({ one: true }); // fail
  });
});

describe("when target is a type", () => {
  test("accepts props of the given type", () => {
    expect<FirstOverload>().type.toAcceptProps();
    expect<FirstOverload>().type.not.toAcceptProps(); // fail

    expect<FirstOverload>().type.toAcceptProps<{}>();
    expect<FirstOverload>().type.not.toAcceptProps<{}>(); // fail

    expect<FirstOverload>().type.toAcceptProps<{ one: string }>();
    expect<FirstOverload>().type.not.toAcceptProps<{ one: string }>(); // fail
  });

  test("property is required in props type", () => {
    expect<FirstOverload>().type.not.toAcceptProps<{ two?: boolean }>();
    expect<FirstOverload>().type.toAcceptProps<{ two?: boolean }>(); // fail
  });

  test("property does not exist in props type", () => {
    expect<FirstOverload>().type.not.toAcceptProps<{ enable: boolean }>();
    expect<FirstOverload>().type.toAcceptProps<{ enable: boolean }>(); // fail
  });

  test("property type is not assignable to prop type", () => {
    expect<FirstOverload>().type.not.toAcceptProps<{ one: boolean }>();
    expect<FirstOverload>().type.toAcceptProps<{ one: boolean }>(); // fail
  });
});
