import * as vscode from "vscode";

import { register } from "./features";
import { Logger } from "./logging";

export const VERSION = "0.0.5";
export const ID = "note-utils";
export const NAME = "Note Utils";

export function activate(context: vscode.ExtensionContext) {
  Logger.register(context);
  Logger.info(`Loading ${ID} v${VERSION}`);
  register(context);
  Logger.info("Loaded :p");
}

export function deactivate() {}
