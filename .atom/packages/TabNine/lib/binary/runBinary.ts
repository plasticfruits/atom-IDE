
import { CURRENT_VERSION } from "../consts";
import fetchBinaryPath from "./binaryFetcher";
import { BinaryProcessRun, runProcess } from "./runProcess";

export default async function runBinary(
  additionalArgs: string[] = [],
  inheritStdio = false
): Promise<BinaryProcessRun> {
  const command = await fetchBinaryPath();
  console.log(`Running binary: ${command} ${additionalArgs.join(" ")}`);

  
  const args: string[] = [
    "--client=atom",
    "--no-lsp=true",
    "--client-metadata",
    `clientVersion=${atom.getVersion()}`,
    `pluginVersion=${CURRENT_VERSION}`,
    ...additionalArgs,
  ].filter((i): i is string => i !== null);

  return runProcess(command, args, {
    stdio: inheritStdio ? "inherit" : "pipe",
  });
}
