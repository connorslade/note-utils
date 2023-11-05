import * as vscode from "vscode";

import { register } from "./features/mod";

export function activate(context: vscode.ExtensionContext) {
  register(context);
}

export function deactivate() {}
