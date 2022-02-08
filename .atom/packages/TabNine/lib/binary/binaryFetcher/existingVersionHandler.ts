import { promises as fs } from "fs";
import isValidBinary from "./binaryValidator";
import { getRootPath, versionPath } from "../paths";
import sortBySemver from "../../semver.utils";
import { asyncFind } from "../../utils";

export default async function handleExistingVersion(): Promise<string | null> {
  try {
    const versionPaths = await fs.readdir(getRootPath());
    const versions = sortBySemver(versionPaths).map(versionPath);
    return await asyncFind(versions, isValidBinary);
  } catch (e) {
    console.error(
      "Error handling existing version. Falling back to downloading",
      e
    );
  }
  return null;
}
