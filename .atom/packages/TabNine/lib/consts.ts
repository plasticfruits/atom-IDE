import { version } from "../package.json";
export const API_VERSION = "3.5.34";
export const BINARY_UPDATE_URL = "https://update.tabnine.com/bundles";
export const BINARY_UPDATE_VERSION_FILE_URL = `${BINARY_UPDATE_URL}/version`;
export const BRAND_NAME = "tabnine";
export const LOGO_PATH = "atom://TabNine/small_logo.png";

export const CHAR_LIMIT = 100_000;
export const MAX_NUM_RESULTS = 5;
export const CONSECUTIVE_RESTART_THRESHOLD = 100;
export const REQUEST_FAILURES_THRESHOLD = 20;

const SLEEP_TIME_BETWEEN_ATTEMPTS = 1000; // 1 second
const MAX_SLEEP_TIME_BETWEEN_ATTEMPTS = 60 * 60 * 1000; // 1 hour

export function restartBackoff(attempt: number): number {
  return Math.min(
    SLEEP_TIME_BETWEEN_ATTEMPTS * 2 ** Math.min(attempt, 10),
    MAX_SLEEP_TIME_BETWEEN_ATTEMPTS
  );
}
export const GRAMMAR_SELECTOR_STATUS = "GRAMMAR-SELECTOR-STATUS";
export const CURRENT_VERSION = version;
