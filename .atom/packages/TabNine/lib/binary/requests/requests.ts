import Binary from "../Binary";

const DEFAULT_SNIPPET_TIMEOUT = 5000;

export const tabNineProcess = new Binary();

export type MarkdownStringSpec = {
  kind: string;
  value: string;
};

export enum CompletionKind {
  Classic = "Classic",
  Line = "Line",
}

export type ResultEntry = {
  new_prefix: string;
  old_suffix: string;
  new_suffix: string;

  kind?: unknown;
  origin?: unknown;
  detail?: string;
  documentation?: string | MarkdownStringSpec;
  deprecated?: boolean;
  completion_kind?: CompletionKind;
};

export type AutocompleteResult = {
  old_prefix: string;
  results: ResultEntry[];
  user_message: string[];
  is_locked: boolean;
};

export function initBinary(): Promise<void> {
  return tabNineProcess.init();
}



export type AutocompleteParams = {
  filename: string;
  before: string;
  after: string;
  region_includes_beginning: boolean;
  region_includes_end: boolean;
  max_num_results: number;
  offset: number;
  line: number;
  character: number;
};

export function autocomplete(
  requestData: AutocompleteParams
): Promise<AutocompleteResult | undefined | null> {
  return tabNineProcess.request<AutocompleteResult | undefined | null>({
    Autocomplete: requestData,
  });
}

export function autocompleteSnippet(
  requestData: AutocompleteParams
): Promise<AutocompleteResult | undefined | null> {
  return tabNineProcess.request<AutocompleteResult | undefined | null>(
    {
      AutocompleteSnippet: requestData,
    },
    DEFAULT_SNIPPET_TIMEOUT
  );
}

export function configuration(body: {
  quiet?: boolean;
  source: unknown;
}): Promise<{ message: string } | null | undefined> {
  return tabNineProcess.request(
    {
      Configuration: body,
    },
    5000
  );
}

interface Event extends Record<string, unknown> {
  name: string;
}

type EventResponse = Record<string, never>;

export function fireEvent(
  content: Event
): Promise<EventResponse | null | undefined> {
  return tabNineProcess.request<EventResponse>({
    Event: content,
  });
}

export function deactivate(): Promise<unknown> {
  if (tabNineProcess) {
    return tabNineProcess.request({ Deactivate: {} });
  }

  console.error("No TabNine process");

  return Promise.resolve(null);
}

export function uninstalling(): Promise<unknown> {
  return tabNineProcess.request({ Uninstalling: {} });
}

export type CapabilitiesResponse = {
  enabled_features: string[];
};

export async function getCapabilities(): Promise<
  CapabilitiesResponse | undefined | null
> {
  try {
    const result = await tabNineProcess.request<CapabilitiesResponse>(
      { Features: {} },
      7000
    );

    if (!Array.isArray(result?.enabled_features)) {
      throw new Error("Could not get enabled capabilities");
    }

    return result;
  } catch (error) {
    console.error(error);

    return { enabled_features: [] };
  }
}
