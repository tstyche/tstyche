import { describe, expect, test } from "tstyche";

interface ButtonProps {
  text: string;
  type?: "reset" | "submit";
}

function Button({ text, type }: ButtonProps) {
  return <button type={type}>{text}</button>;
}

describe("when target is a function component", () => {
  test("accepts props", () => {
    expect(Button).type.toAcceptProps({ text: "Send" });
    expect(Button).type.toAcceptProps({ text: true }); // fail

    expect(Button).type.toAcceptProps({ text: "Clear", type: "reset" as const });
    expect(Button).type.toAcceptProps({ text: "Send", type: "submit" as const });
    expect(Button).type.toAcceptProps({ text: "Send", type: "button" as const }); // fail
  });

  test("requires props", () => {
    expect(Button).type.not.toAcceptProps();
    expect(Button).type.toAcceptProps(); // fail

    expect(Button).type.not.toAcceptProps({});
    expect(Button).type.toAcceptProps({}); // fail
  });

  test("does not accept excess props", () => {
    expect(Button).type.not.toAcceptProps({ text: "Reset", disabled: true });
    expect(Button).type.toAcceptProps({ text: "Reset", disabled: true }); // fail

    expect(Button).type.not.toAcceptProps({ text: "Download", type: "button" as const });
    expect(Button).type.toAcceptProps({ text: "Send", type: "button" as const }); // fail
  });

  test("when a reference is passed", () => {
    const skip = "all";
    expect(Button).type.toAcceptProps({ text: "Reset", disabled: true, skip }); // fail

    const sampleProps = { text: "Reset", disabled: true, skip: "all" };
    expect(Button).type.toAcceptProps(sampleProps); // fail
  });
});

// describe("when target is a type", () => {
//   //
// });
