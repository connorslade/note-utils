import * as vscode from "vscode";
import { Logger } from "../logging";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.wordCount", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return vscode.window.showErrorMessage("No active editor");
      Logger.info(`Document has ${editor.selections.length} selections`);

      let counter = new Counter();
      if (editor.selections.length == 0 || nothingSelected(editor)) {
        counter.process(editor.document.getText());
      } else {
        for (let selection of editor.selections)
          counter.process(editor.document.getText(selection));
      }

      vscode.window.showQuickPick([
        `Words: ${counter.words}`,
        `Paragraphs: ${counter.paragraphs}`,
        `Characters: ${counter.chars}`,
        `Characters (with whitespace): ${counter.chars_space}`,
      ]);
    })
  );
}

class Counter {
  words: number = 0;
  chars: number = 0;
  chars_space: number = 0;
  paragraphs: number = 0;

  process(text: string) {
    this.words += text.split(" ").filter((x) => x.length != 0).length;
    this.chars_space += text.length;
    this.chars += text.split("").filter((x) => x.trim() != "").length;
    this.paragraphs += paragraphs(text);
  }
}

function paragraphs(text: string): number {
  const lines = text.split("\n");
  let blocks = 1;
  let idx = 0;

  while (idx < lines.length) {
    if (lines[idx].trim() == "") blocks++;
    idx++;
  }

  return blocks;
}

function nothingSelected(editor: vscode.TextEditor): boolean {
  if (editor.selections.length != 1) return false;
  const selection = editor.selections[0];
  return selection.isEmpty;
}
