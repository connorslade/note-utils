import * as vscode from "vscode";

import { register as about } from "./about";
import { register as checklistProgress } from "./checklistProgress";
import { register as checklistToggle } from "./checklistToggle";
import { register as citationGenerator } from "./citationGenerator";
import { register as cleanPaste } from "./cleanPaste";
import { register as dailyNote } from "./dailyNote";
import { register as newReference } from "./newReference";
import { register as wordCount } from "./wordCount";

export function register(context: vscode.ExtensionContext) {
  about(context);
  checklistProgress(context);
  checklistToggle(context);
  citationGenerator(context);
  cleanPaste(context);
  dailyNote(context);
  newReference(context);
  wordCount(context);
}
