import type React from "react";
import { describe, expect, test } from "tstyche";

interface FirstProps {
  one?: string;
}

interface SecondProps {
  one: string | undefined;
  two?: boolean;
}

describe("when source is a function component", () => {
  function None() {
    return <>{"none"}</>;
  }

  function First({ one }: FirstProps) {
    return <>{`${one}`}</>;
  }

  function Second(props: SecondProps) {
    return <>{`${props}`}</>;
  }

  test("accepts props of the given type", () => {
    expect(None).type.toAcceptProps({});
    expect(None).type.not.toAcceptProps({}); // fail

    expect(First).type.toAcceptProps({});
    expect(First).type.not.toAcceptProps({}); // fail

    expect(First).type.toAcceptProps({ one: "sample" });
    expect(First).type.not.toAcceptProps({ one: "sample" }); // fail

    expect(Second).type.toAcceptProps({ one: "sample" });
    expect(Second).type.not.toAcceptProps({ one: "sample" }); // fail

    const oneProp = { one: "sample" };
    expect(Second).type.toAcceptProps({ ...oneProp });
    expect(Second).type.not.toAcceptProps({ ...oneProp }); // fail

    expect(Second).type.toAcceptProps({ one: "sample", two: true });
    expect(Second).type.not.toAcceptProps({ one: "sample", two: true }); // fail

    const twoProps = { one: "sample", two: true };
    expect(Second).type.toAcceptProps({ ...twoProps });
    expect(Second).type.not.toAcceptProps({ ...twoProps }); // fail
  });

  test("does not accept props of the given type", () => {
    expect(None).type.not.toAcceptProps({ one: "sample" });
    expect(None).type.toAcceptProps({ one: "sample" }); // fail: Property 'one' does not exist

    expect(First).type.not.toAcceptProps({ one: 1 });
    expect(First).type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    expect(First).type.not.toAcceptProps({ two: false });
    expect(First).type.toAcceptProps({ two: false }); // fail: Property 'two' does not exist

    expect(First).type.not.toAcceptProps({ one: "sample", two: false });
    expect(First).type.toAcceptProps({ one: "sample", two: false }); // fail: Property 'two' does not exist

    expect(Second).type.not.toAcceptProps({});
    expect(Second).type.toAcceptProps({}); // fail: Property 'one' is missing

    expect(Second).type.not.toAcceptProps({ one: 1 });
    expect(Second).type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    const oneProp = { one: 1 };
    expect(Second).type.not.toAcceptProps({ ...oneProp });
    expect(Second).type.toAcceptProps({ ...oneProp }); // fail: Type 'number' is not assignable

    expect(Second).type.not.toAcceptProps({ one: "sample", two: 2 });
    expect(Second).type.toAcceptProps({ one: "sample", two: 2 }); // fail: Type 'number' is not assignable

    const twoProps = { one: "sample", two: 2 };
    expect(Second).type.not.toAcceptProps({ ...twoProps });
    expect(Second).type.toAcceptProps({ ...twoProps }); // fail: Type 'number' is not assignable

    expect(Second).type.not.toAcceptProps({ two: true });
    expect(Second).type.toAcceptProps({ two: true }); // fail: Property 'one' is missing

    expect(Second).type.not.toAcceptProps({ three: 123 });
    expect(Second).type.toAcceptProps({ three: 123 }); // fail: Property 'three' does not exist

    expect(Second).type.not.toAcceptProps({ one: "sample", two: true, three: 123 });
    expect(Second).type.toAcceptProps({ one: "sample", two: true, three: 123 }); // fail: Property 'three' does not exist
  });
});

describe("when source is a type", () => {
  type None = () => React.JSX.Element;

  type First = ({ one }: FirstProps) => React.JSX.Element;

  type Second = (props: SecondProps) => React.JSX.Element;

  test("accepts props of the given type", () => {
    expect<None>().type.toAcceptProps({});
    expect<None>().type.not.toAcceptProps({}); // fail

    expect<First>().type.toAcceptProps({});
    expect<First>().type.not.toAcceptProps({}); // fail

    expect<First>().type.toAcceptProps({ one: "sample" });
    expect<First>().type.not.toAcceptProps({ one: "sample" }); // fail

    expect<Second>().type.toAcceptProps({ one: "sample" });
    expect<Second>().type.not.toAcceptProps({ one: "sample" }); // fail

    const oneProp = { one: "sample" };
    expect<Second>().type.toAcceptProps({ ...oneProp });
    expect<Second>().type.not.toAcceptProps({ ...oneProp }); // fail

    expect<Second>().type.toAcceptProps({ one: "sample", two: true });
    expect<Second>().type.not.toAcceptProps({ one: "sample", two: true }); // fail

    const twoProps = { one: "sample", two: true };
    expect<Second>().type.toAcceptProps({ ...twoProps });
    expect<Second>().type.not.toAcceptProps({ ...twoProps }); // fail
  });

  test("does not accept props of the given type", () => {
    expect<None>().type.not.toAcceptProps({ one: "sample" });
    expect<None>().type.toAcceptProps({ one: "sample" }); // fail: Property 'one' does not exist

    expect<First>().type.not.toAcceptProps({ one: 1 });
    expect<First>().type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    expect<First>().type.not.toAcceptProps({ two: false });
    expect<First>().type.toAcceptProps({ two: false }); // fail: Property 'two' does not exist

    expect<First>().type.not.toAcceptProps({ one: "sample", two: false });
    expect<First>().type.toAcceptProps({ one: "sample", two: false }); // fail: Property 'two' does not exist

    expect<Second>().type.not.toAcceptProps({});
    expect<Second>().type.toAcceptProps({}); // fail: Property 'one' is missing

    expect<Second>().type.not.toAcceptProps({ one: 1 });
    expect<Second>().type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    const oneProp = { one: 1 };
    expect<Second>().type.not.toAcceptProps({ ...oneProp });
    expect<Second>().type.toAcceptProps({ ...oneProp }); // fail: Type 'number' is not assignable

    expect<Second>().type.not.toAcceptProps({ one: "sample", two: 2 });
    expect<Second>().type.toAcceptProps({ one: "sample", two: 2 }); // fail: Type 'number' is not assignable

    const twoProps = { one: "sample", two: 2 };
    expect<Second>().type.not.toAcceptProps({ ...twoProps });
    expect<Second>().type.toAcceptProps({ ...twoProps }); // fail: Type 'number' is not assignable

    expect<Second>().type.not.toAcceptProps({ two: true });
    expect<Second>().type.toAcceptProps({ two: true }); // fail: Property 'one' is missing

    expect<Second>().type.not.toAcceptProps({ three: 123 });
    expect<Second>().type.toAcceptProps({ three: 123 }); // fail: Property 'three' does not exist

    expect<Second>().type.not.toAcceptProps({ one: "sample", two: true, three: 123 });
    expect<Second>().type.toAcceptProps({ one: "sample", two: true, three: 123 }); // fail: Property 'three' does not exist
  });
});
