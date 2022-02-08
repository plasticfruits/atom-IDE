
import handleActiveFile from "./activeFileHandler";
import downloadAndExtractBundle from "./bundleDownloader";
import handleExistingVersion from "./existingVersionHandler";

export default async function fetchBinaryPath(): Promise<string> {
  const activeVersionPath = handleActiveFile();
  console.log("activeVersionPath: " + activeVersionPath);
  if (activeVersionPath) {
    return activeVersionPath;
  }
  const existingVersion = await handleExistingVersion();
  console.log("existingVersion: " + existingVersion);
  if (existingVersion) {
    return existingVersion;
  }
  return downloadAndExtractBundle();
}