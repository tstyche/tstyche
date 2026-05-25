import type { ReactNode } from "react";
import { describe, expect, test } from "tstyche";

describe("special cases", () => {
  test("when the 'props' is a union", () => {
    type One = { one: string; two?: never };
    type Other = { two: string; one?: never };

    function OneOrTheOther(props: One | Other) {
      if ("one" in props && typeof props.one === "string") {
        return <>{props.one}</>;
      }

      return <>{props.two}</>;
    }

    expect(OneOrTheOther).type.toAcceptProps({ one: "Pass" });
    expect(OneOrTheOther).type.not.toAcceptProps({ one: "Pass" }); // fail

    expect(OneOrTheOther).type.toAcceptProps({ two: "Pass" });
    expect(OneOrTheOther).type.not.toAcceptProps({ two: "Pass" }); // fail

    expect(OneOrTheOther).type.not.toAcceptProps({ one: "Fail", two: "Fail" });
    expect(OneOrTheOther).type.toAcceptProps({ one: "Fail", two: "Fail" }); // fail

    expect(OneOrTheOther).type.not.toAcceptProps({});
    expect(OneOrTheOther).type.toAcceptProps({}); // fail

    expect(OneOrTheOther).type.not.toAcceptProps({ three: false });
    expect(OneOrTheOther).type.toAcceptProps({ three: false }); // fail
  });

  test("when component requires children", () => {
    interface CardProps {
      title: string;
      children: ReactNode;
    }

    function Card({ title, children }: CardProps) {
      return (
        <>
          <h2>{title}</h2>
          {children}
        </>
      );
    }

    expect(Card).type.toAcceptProps({ title: "Hello", children: "Click me" });
    expect(Card).type.not.toAcceptProps({ title: "Hello", children: "Click me" }); //fail

    expect(Card).type.toAcceptProps({ title: "Hello", children: <span>Click me</span> });
    expect(Card).type.not.toAcceptProps({ title: "Hello", children: <span>Click me</span> }); // fail

    expect(Card).type.not.toAcceptProps({ title: "Hello" });
    expect(Card).type.toAcceptProps({ title: "Hello" }); // fail

    expect(Card).type.not.toAcceptProps({});
    expect(Card).type.toAcceptProps({}); // fail
  });

  test("when kebab-case props are provided", () => {
    interface KebabProps {
      "one-one": string;
    }

    function KebabCase(props: KebabProps) {
      return <>{JSON.stringify(props)}</>;
    }

    expect(KebabCase).type.toAcceptProps({ "one-one": "test" });
    expect(KebabCase).type.not.toAcceptProps({ "one-one": "test" }); // fail

    expect(KebabCase).type.not.toAcceptProps({ "one-one": 123 });
    expect(KebabCase).type.toAcceptProps({ "one-one": 123 }); // fail

    expect(KebabCase).type.not.toAcceptProps({ "two-two": "test" });
    expect(KebabCase).type.toAcceptProps({ "two-two": "test" }); // fail
  });
});
