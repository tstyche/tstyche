import { Line, type ScribblerJsx, Text } from "#scribbler";

export function waitingForFileChangesText(): ScribblerJsx.Element {
  return (
    <Text>
      Waiting for file changes.
      <Line />
    </Text>
  );
}
