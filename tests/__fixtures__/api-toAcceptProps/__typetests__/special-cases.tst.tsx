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
});
