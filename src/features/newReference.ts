import * as vscode from "vscode";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.newReference", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      let link = await vscode.window.showInputBox({
        title: "New Reference",
        prompt:
          "This reference will be given the next available number and a citation will be inserted at the cursor position.",
      });
      if (!link) return;

      let number = nextReferenceNumber(editor.document);

      await editor.edit((editBuilder) => {
        let citation = `[^${number}]`;
        for (let selection of editor.selections)
          editBuilder.replace(selection, citation);

        let lastLine = editor.document.lineCount;
        while (lastLine > 0) {
          let line = editor.document.lineAt(lastLine - 1);
          if (line.isEmptyOrWhitespace) lastLine--;
          else break;
        }

        let position = new vscode.Position(lastLine, 0);
        editBuilder.insert(position, `\n[^${number}]: ${link}`);
      });
    })
  );
}

function nextReferenceNumber(document: vscode.TextDocument) {
  let text = document.getText();
  let matches = text.matchAll(/\[\^(\d+)\]/g);
  let numbers = Array.from(matches, (match) => parseInt(match[1]));
  let max = Math.max(...numbers);
  if (max === -Infinity) return 1;
  return max + 1;
}
