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

function Second({ one, two }: SecondProps) {
  return <>{`${one} ${two}`}</>;
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

    expect(Second).type.not.toAcceptProps({});
    expect(Second).type.toAcceptProps({}); // fail

    expect(Second).type.toAcceptProps({ one: "sample" });
    expect(Second).type.not.toAcceptProps({ one: "sample" }); // fail

    const secondProps1 = { one: "sample" };
    expect(Second).type.toAcceptProps(secondProps1);
    expect(Second).type.not.toAcceptProps(secondProps1); // fail

    expect(Second).type.toAcceptProps({ one: "sample", two: true });
    expect(Second).type.not.toAcceptProps({ one: "sample", two: true }); // fail

    const secondProps2 = { one: "sample", two: true };
    expect(Second).type.toAcceptProps(secondProps2);
    expect(Second).type.not.toAcceptProps(secondProps2); // fail
  });

  // test("requires props", () => {
  //   expect(Second).type.not.toAcceptProps();
  //   expect(Second).type.toAcceptProps(); // fail

  //   expect(Second).type.not.toAcceptProps({});
  //   expect(Second).type.toAcceptProps({}); // fail

  // expect(Second).type.toAcceptProps({ one: "sample", two: true });
  // expect(Second).type.not.toAcceptProps({ two: true });
  // expect(Second).type.toAcceptProps({ two: true }); // fail

  // });

  // test("does not accept excess props", () => {
  //   expect(Second).type.not.toAcceptProps({ text: "Reset", disabled: true });
  //   expect(Second).type.toAcceptProps({ text: "Reset", disabled: true }); // fail

  //   expect(Second).type.not.toAcceptProps({ text: "Download", type: "button" as const });
  //   expect(Second).type.toAcceptProps({ text: "Send", type: "button" as const }); // fail
  // });

  // test("when a reference is passed", () => {
  //   const skip = "all";
  //   expect(Second).type.toAcceptProps({ text: "Reset", disabled: true, skip }); // fail

  //   const sampleProps = { text: "Reset", disabled: true, skip: "all" };
  //   expect(Second).type.toAcceptProps(sampleProps); // fail
  // });
});

// describe("when target is a type", () => {
//   //
// });
