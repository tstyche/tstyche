import { describe, expect, test } from "tstyche";

describe("special cases", () => {
  test.todo("when the 'props' argument is optional", () => {
    function Optional(props?: { one: string }) {
      return <>{`${props}`}</>;
    }

    expect(Optional).type.toAcceptProps({}); // TODO Property 'one' is missing
    expect(Optional).type.toAcceptProps({ one: "sample" }); // TODO

    expect(Optional).type.toAcceptProps({ two: false }); // fail
    expect(Optional).type.toAcceptProps({ one: false }); // fail TODO
  });

  test("when the 'props' argument has a default value", () => {
    function Default(props = { one: "sample" }) {
      return <>{`${props}`}</>;
    }

    expect(Default).type.toAcceptProps({ one: "sample" });

    expect(Default).type.toAcceptProps({}); // fail
    expect(Default).type.toAcceptProps({ two: false }); // fail
    expect(Default).type.toAcceptProps({ one: false }); // fail
  });

  test.todo("when the 'props' is a union", () => {
    type Props1 = { foo: string; bar?: never };
    type Props2 = { bar: string; foo?: never };

    const OneOrTheOther = (props: Props1 | Props2) => {
      if ("foo" in props && typeof props.foo === "string") {
        return <>{props.foo}</>;
      }

      return <>{props.bar}</>;
    };

    expect(OneOrTheOther).type.toAcceptProps({ foo: "Send" });
    expect(OneOrTheOther).type.toAcceptProps({ bar: "Send" });

    expect(OneOrTheOther).type.toAcceptProps({ foo: "Download", bar: "button" }); // fail
    expect(OneOrTheOther).type.toAcceptProps({}); // fail
  });
});
