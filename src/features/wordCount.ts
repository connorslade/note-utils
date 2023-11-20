import * as vscode from "vscode";
import { Logger } from "../logging";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.wordCount", () => {
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
        `Characters: ${counter.chars}`,
      ]);
    })
  );
}

class Counter {
  words: number = 0;
  chars: number = 0;

  process(text: string) {
    // TODO: do a better job
    this.words += text.split(" ").filter((x) => x.length != 0).length;
    this.chars += text.length;
  }
}

function nothingSelected(editor: vscode.TextEditor): boolean {
  if (editor.selections.length != 1) return false;
  const selection = editor.selections[0];
  return selection.isEmpty;
}
