import * as vscode from "vscode";

import { register } from "./features";

export const VERSION = "0.0.1";

export function activate(context: vscode.ExtensionContext) {
  register(context);
}

export function deactivate() {}
