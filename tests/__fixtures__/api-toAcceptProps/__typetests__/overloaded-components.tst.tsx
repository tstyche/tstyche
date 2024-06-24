import type React from "react";
import { describe, expect, test } from "tstyche";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
};

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

interface Overload {
  (props: ButtonProps): React.JSX.Element;
  (props: AnchorProps): React.JSX.Element;
}

function Button(props: ButtonProps): React.JSX.Element;
function Button(props: AnchorProps): React.JSX.Element;
function Button(props: ButtonProps | AnchorProps): React.JSX.Element {
  const hasHref = (props: ButtonProps | AnchorProps): props is AnchorProps => "href" in props;

  if (hasHref(props)) {
    return <a {...props} />;
  }

  return <button {...props} />;
}

describe("when target is a function component", () => {
  test("accepts props of the given type", () => {
    expect(Button).type.toAcceptProps();
    expect(Button).type.not.toAcceptProps(); // fail

    expect(Button).type.toAcceptProps({});
    expect(Button).type.not.toAcceptProps({}); // fail

    // expect(Button).type.toAcceptProps({ href: "sample" });
    // expect(Button).type.not.toAcceptProps({ href: "sample" }); // fail
  });

  test.todo("property is required in props type", () => {
    //
  });

  test("property does not exist in props type", () => {
    expect(Button).type.not.toAcceptProps({ enable: true });
    expect(Button).type.toAcceptProps({ enable: true }); // fail
  });

  test.todo("property type is not assignable to prop type", () => {
    //
  });
});

describe("when target is a type", () => {
  test("accepts props of the given type", () => {
    expect<Overload>().type.toAcceptProps();
    expect<Overload>().type.not.toAcceptProps(); // fail

    expect<Overload>().type.toAcceptProps<{}>();
    expect<Overload>().type.not.toAcceptProps<{}>(); // fail

    // expect<Overload>().type.toAcceptProps({ href: "sample" });
    // expect<Overload>().type.not.toAcceptProps({ href: "sample" });
  });

  test.todo("property is required in props type", () => {
    //
  });

  test("property does not exist in props type", () => {
    expect<Overload>().type.not.toAcceptProps({ enable: true });
    expect<Overload>().type.toAcceptProps({ enable: true }); // fail
  });

  test.todo("property type is not assignable to prop type", () => {
    //
  });
});
