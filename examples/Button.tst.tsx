import { expect, test } from "tstyche";

interface ButtonProps {
  text: string;
  type?: "reset" | "submit";
}

function Button({ text, type }: ButtonProps) {
  return <button type={type}>{text}</button>;
}

test("accepts props?", () => {
  expect(Button).type.toAcceptProps({ text: "Send" });
  expect(Button).type.toAcceptProps({ text: "Clear", type: "reset" as const });

  expect(Button).type.not.toAcceptProps({ text: "Download", type: "button" as const });
  expect(Button).type.not.toAcceptProps();
});
