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

      let [line, number] = nextReferenceNumber(editor.document);

      await editor.edit((editBuilder) => {
        let citation = `[^${number}]`;
        for (let selection of editor.selections)
          editBuilder.replace(selection, citation);

        let position = new vscode.Position(line, 0);
        editBuilder.insert(position, `[^${number}]: ${link}\n`);
      });
    })
  );
}

function nextReferenceNumber(document: vscode.TextDocument): [number, number] {
  let line = 0;
  let reference_number = 0;

  for (let i = 0; i < document.lineCount; i++) {
    let match = document.lineAt(i).text.match(/\[\^(\d+)\]:/);
    if (match === null) continue;

    let number = parseInt(match[1]);
    if (number > reference_number) {
      line = i;
      reference_number = number;
    }
  }

  return [line + 1, reference_number + 1];
}
