import { describe, expect, test } from "tstyche";

function None() {
  return <>{"none"}</>;
}

interface FirstProps {
  one?: number;
}

function First({ one }: FirstProps) {
  return <>{`${one}`}</>;
}

interface SecondProps {
  one: string;
  two?: boolean;
}

function Second(props: SecondProps) {
  return <>{`${props}`}</>;
}

describe("when target is a function component", () => {
  test("accepts props of the given type", () => {
    expect(None).type.toAcceptProps();
    expect(None).type.not.toAcceptProps(); // fail

    expect(None).type.toAcceptProps({});
    expect(None).type.not.toAcceptProps({}); // fail

    const noneProps = {};
    expect(None).type.toAcceptProps(noneProps);
    expect(None).type.not.toAcceptProps(noneProps); // fail

    expect(First).type.toAcceptProps();
    expect(First).type.not.toAcceptProps(); // fail

    expect(First).type.toAcceptProps({});
    expect(First).type.not.toAcceptProps({}); // fail

    expect(Second).type.toAcceptProps({ one: "sample" });
    expect(Second).type.not.toAcceptProps({ one: "sample" }); // fail

    const secondProps1 = { one: "sample" };
    expect(Second).type.toAcceptProps(secondProps1);
    expect(Second).type.not.toAcceptProps(secondProps1); // fail

    expect(Second).type.toAcceptProps({ one: "sample", two: true });
    expect(Second).type.not.toAcceptProps({ one: "sample", two: true }); // fail

    const two = true;
    expect(Second).type.toAcceptProps({ one: "sample", two });
    expect(Second).type.not.toAcceptProps({ one: "sample", two }); // fail

    // TODO initializers
    // TODO overloads
  });

  test("property is required in props type", () => {
    expect(Second).type.not.toAcceptProps();
    expect(Second).type.toAcceptProps(); // fail

    expect(Second).type.not.toAcceptProps({});
    expect(Second).type.toAcceptProps({}); // fail

    const noneProps = {};
    expect(Second).type.not.toAcceptProps(noneProps);
    expect(Second).type.toAcceptProps(noneProps); // fail

    expect(Second).type.not.toAcceptProps({ two: true });
    expect(Second).type.toAcceptProps({ two: true }); // fail

    const two = true;
    expect(Second).type.not.toAcceptProps({ two });
    expect(Second).type.toAcceptProps({ two }); // fail

    // TODO initializers
    // TODO overloads
  });

  test.todo("property does not exist in props type", () => {
    //
  });

  test.todo("property type is not assignable to prop type", () => {
    //
  });

  test.todo("all kinds of problems", () => {
    // TODO combinations of several kinds of problems
  });
});

describe.todo("when target is a type", () => {
  //
});
