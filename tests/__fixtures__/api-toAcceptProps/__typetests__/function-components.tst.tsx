import { describe, expect, test } from "tstyche";

function None() {
  return <>{"none"}</>;
}

interface FirstProps {
  one?: string;
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

    const secondProps = { one: "sample" };
    expect(Second).type.toAcceptProps(secondProps);
    expect(Second).type.not.toAcceptProps(secondProps); // fail

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

    expect(Second).type.not.toAcceptProps({ two: true });
    expect(Second).type.toAcceptProps({ two: true }); // fail

    const secondProps = { two: true };
    expect(Second).type.not.toAcceptProps(secondProps);
    expect(Second).type.toAcceptProps(secondProps); // fail

    const two = true;
    expect(Second).type.not.toAcceptProps({ two });
    expect(Second).type.toAcceptProps({ two }); // fail

    // TODO initializers
    // TODO overloads
  });

  test("property does not exist in props type", () => {
    expect(First).type.not.toAcceptProps({ one: "sample", two: false });
    expect(First).type.toAcceptProps({ one: "sample", two: false }); // fail

    const firstProps = { one: "sample", two: false };
    expect(First).type.not.toAcceptProps(firstProps);
    expect(First).type.toAcceptProps(firstProps); // fail

    expect(Second).type.not.toAcceptProps({ three: 123 });
    expect(Second).type.toAcceptProps({ three: 123 }); // fail

    const secondProps = { three: 123 };
    expect(Second).type.not.toAcceptProps(secondProps);
    expect(Second).type.toAcceptProps(secondProps); // fail

    const three = 123;
    expect(Second).type.not.toAcceptProps({ one: "sample", two: three });
    expect(Second).type.toAcceptProps({ one: "sample", two: three }); // fail

    expect(Second).type.not.toAcceptProps({ one: "sample", two: true, three });
    expect(Second).type.toAcceptProps({ one: "sample", two: true, three }); // fail

    // TODO initializers
    // TODO overloads
  });

  test.todo("property type is not assignable to prop type", () => {
    //
  });
});

describe.todo("when target is a type", () => {
  //
});
