import { setBinaryRootPath } from "./binary/paths";
import { initBinary } from "./binary/requests/requests";
import { CompletionProvider } from "./completion-provider";
import { StatusBar } from "atom/status-bar";
import { Disposable } from "atom";
import { StatusItem } from "./status-item";
import { GRAMMAR_SELECTOR_STATUS } from "./consts";

let statusBarDisposable: Disposable | undefined;
let completionProvider: CompletionProvider | undefined;

export default {
  getProvider() {
    return completionProvider;
  },
  async activate(state: unknown) {
    completionProvider = new CompletionProvider();
    try {
      await setBinaryRootPath();
      await initBinary();
      completionProvider.setBinaryIsReady();
    } catch (err) {
      console.error("failed to init the binary", err);
    }
  },
  consumeStatusBar(statusBar: StatusBar) {
    let statusPriority = 100;

    for (const panel of statusBar.getRightTiles()) {
      if (
        atom.views.getView(panel.getItem()).tagName === GRAMMAR_SELECTOR_STATUS
      ) {
        statusPriority = panel.getPriority() - 1;
      }
    }
    const statusItem = new StatusItem();
    const tile = statusBar.addRightTile({
      item: statusItem,
      priority: statusPriority,
    });
    statusBarDisposable = new Disposable(() => {
      tile.destroy();
      statusItem.destroy();
    });
  },
  deactivate() {
    statusBarDisposable?.dispose();
    completionProvider?.dispose();
    completionProvider = undefined;
  },
};
