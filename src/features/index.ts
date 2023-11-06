import * as vscode from "vscode";

import { register as about } from "./about";
import { register as citationGenerator } from "./citationGenerator";
import { register as dailyNote } from "./dailyNote";

export function register(context: vscode.ExtensionContext) {
  about(context);
  citationGenerator(context);
  dailyNote(context);
}
