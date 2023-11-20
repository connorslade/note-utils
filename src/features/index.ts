import * as vscode from "vscode";

import { register as about } from "./about";
import { register as checklistProgress } from "./checklistProgress";
import { register as citationGenerator } from "./citationGenerator";
import { register as dailyNote } from "./dailyNote";
import { register as wordCount } from "./wordCount";

export function register(context: vscode.ExtensionContext) {
  about(context);
  checklistProgress(context);
  citationGenerator(context);
  dailyNote(context);
  wordCount(context);
}
