import * as vscode from "vscode";

import { register as dailyNote } from "./dailyNote";
import { register as about } from "./about";

export function register(context: vscode.ExtensionContext) {
  dailyNote(context);
  about(context);
}
