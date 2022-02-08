import {
  AutocompleteProvider,
  SuggestionsRequestedEvent,
  Suggestions,
  SuggestionInsertedEvent,
} from "atom/autocomplete-plus";
import { RangeCompatible } from "atom";
import { autocomplete } from "./binary/requests/requests";
import { BRAND_NAME, CHAR_LIMIT, LOGO_PATH, MAX_NUM_RESULTS } from "./consts";
import { escapeTabStopSign } from "./utils";

export class CompletionProvider implements AutocompleteProvider {
  constructor() {
    this.selector = "*";
    this.inclusionPriority = 6;
    this.suggestionPriority = 6;
    this.excludeLowerPriority = false;
    this.filterSuggestions = false;
    this.isBinaryReady = false;
  }
  setBinaryIsReady() {
    this.isBinaryReady = true;
  }

  async getSuggestions(
    params: SuggestionsRequestedEvent
  ): Promise<Suggestions> {
    if (!this.isBinaryReady) {
      return [];
    }
    const { editor, bufferPosition } = params;
    const offset = editor.getBuffer().characterIndexForPosition(bufferPosition);
    const beforeStartOffset = editor
      .getBuffer()
      .positionForCharacterIndex(Math.max(0, offset - CHAR_LIMIT));
    const afterEndOffset = editor
      .getBuffer()
      .positionForCharacterIndex(offset + CHAR_LIMIT);
    const beforeStart = editor
      .getBuffer()
      .characterIndexForPosition(beforeStartOffset);

    const before = editor.getTextInBufferRange([
      beforeStartOffset,
      bufferPosition,
    ]);
    const after = editor.getTextInBufferRange([bufferPosition, afterEndOffset]);
    const res = await autocomplete({
      filename: editor.getPath() || "",
      before,
      after,
      region_includes_beginning: beforeStart === 0,
      region_includes_end: after.length > 0,
      max_num_results: MAX_NUM_RESULTS,
      offset,
      line: bufferPosition.row,
      character: bufferPosition.column,
    });

    return (
      res?.results.map((result) => {
        return {
          rightLabel: BRAND_NAME,
          displayText: escapeTabStopSign(result.new_prefix),
          snippet: `${escapeTabStopSign(result.new_prefix)}$0${
            result.new_suffix
          }`,
          replacementPrefix: res?.old_prefix,
          iconHTML: `<img height="16px" width="16px" src=${LOGO_PATH}>`,
          oldSuffix: result.old_suffix,
          checkpoint: editor.createCheckpoint(),
        };
      }) || []
    );
  }
  onDidInsertSuggestion({ editor, suggestion }: SuggestionInsertedEvent): void {
    const oldSuffix = (<any>suggestion).oldSuffix;
    const checkpoint = (<any>suggestion).checkpoint;
    const currentPosition = editor.getCursorBufferPosition();
    const replacementRange: RangeCompatible = [
      currentPosition,
      currentPosition.translate([0, oldSuffix.length]),
    ];
    const existingSuffix = editor.getTextInBufferRange(replacementRange);
    if (oldSuffix.length && existingSuffix === oldSuffix) {
      editor.getBuffer().delete(replacementRange);
      editor.groupChangesSinceCheckpoint(checkpoint);
    }
  }
  dispose() {
    // do not remove it is required for the autocomplete+ package to work properly. 
    // ref: https://github.com/atom/autocomplete-plus/blob/d2a02b1fb7d228b2ea00065d6fe19f96f5731861/lib/provider-manager.js#L271
  }
  isBinaryReady: boolean;
  selector: string;
  disableForSelector?: string | undefined;
  inclusionPriority?: number | undefined;
  excludeLowerPriority?: boolean | undefined;
  suggestionPriority?: number | undefined;
  filterSuggestions?: boolean | undefined;
}
