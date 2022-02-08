import * as child_process from "child_process";
import { spawn, SpawnOptions } from "child_process";
import { createInterface, ReadLine, ReadLineOptions } from "readline";

export type BinaryProcessRun = {
  proc: child_process.ChildProcess;
  readLine: ReadLine;
};

export function runProcess(
  command: string,
  args?: ReadonlyArray<string>,
  options: SpawnOptions = {}
): BinaryProcessRun {
  const proc = args ? spawn(command, args, options) : spawn(command, options);

  const input = proc.stdout;
  const readLine = createInterface({
    input,
    output: proc.stdin,
  } as ReadLineOptions);

  return { proc, readLine };
}
