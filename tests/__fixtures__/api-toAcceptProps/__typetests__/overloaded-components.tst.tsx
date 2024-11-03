import type React from "react";
import { describe, expect, test } from "tstyche";

type FirstProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  one: string;
  two: number | undefined;
  three?: boolean;
};

type SecondProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  one?: undefined;
};

interface Overload {
  (props: FirstProps): React.JSX.Element;
  (props: SecondProps): React.JSX.Element;
}

function OverloadFunction(props: FirstProps): React.JSX.Element;
function OverloadFunction(props: SecondProps): React.JSX.Element;
function OverloadFunction(props: FirstProps | SecondProps): React.JSX.Element {
  const hasOne = (props: FirstProps | SecondProps): props is FirstProps => "one" in props;

  if (hasOne(props)) {
    return <a {...props} />;
  }

  return <button {...props} />;
}

describe("when target is a function component", () => {
  test("accepts props of the given type", () => {
    expect(OverloadFunction).type.toAcceptProps({});
    expect(OverloadFunction).type.not.toAcceptProps({}); // fail

    expect(OverloadFunction).type.toAcceptProps({ one: "sample", two: 123 });
    expect(OverloadFunction).type.not.toAcceptProps({ one: "sample", two: 123 }); // fail
  });

  test("property does not exist in props type", () => {
    expect(OverloadFunction).type.not.toAcceptProps({ enable: true });
    expect(OverloadFunction).type.toAcceptProps({ enable: true }); // fail
  });

  test("property type is not assignable to prop type", () => {
    expect(OverloadFunction).type.not.toAcceptProps({ one: true });
    expect(OverloadFunction).type.toAcceptProps({ one: true }); // fail
  });
});

describe("when target is a type", () => {
  test("accepts props of the given type", () => {
    expect<Overload>().type.toAcceptProps<{}>();
    expect<Overload>().type.not.toAcceptProps<{}>(); // fail

    expect<Overload>().type.toAcceptProps<{ one: string; two: number }>();
    expect<Overload>().type.not.toAcceptProps<{ one: string; two: number }>(); // fail
  });

  test("property is required in props type", () => {
    expect<Overload>().type.not.toAcceptProps<{ three?: boolean }>();
    expect<Overload>().type.toAcceptProps<{ three?: boolean }>(); // fail
  });

  test("property does not exist in props type", () => {
    expect<Overload>().type.not.toAcceptProps<{ enable: boolean }>();
    expect<Overload>().type.toAcceptProps<{ enable: boolean }>(); // fail
  });

  test("property type is not assignable to prop type", () => {
    expect<Overload>().type.not.toAcceptProps<{ one: boolean }>();
    expect<Overload>().type.toAcceptProps<{ one: boolean }>(); // fail
  });
});
