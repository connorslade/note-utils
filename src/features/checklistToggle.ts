import * as vscode from "vscode";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.checklistToggle", () => {
      let editor = vscode.window.activeTextEditor;
      editor?.edit((editBuilder) => {
        for (let selection of editor?.selections ?? []) {
          let line = selection.active.line;
          let text = editor?.document.lineAt(line).text ?? "";
          let match = text.match(/- \[([ x])\]/);
          if (!match) continue;

          let checked = match[1] === "x";
          let newText = text.replace(
            /- \[([ x])\]/,
            `- [${checked ? " " : "x"}]`
          );
          editBuilder.replace(
            new vscode.Range(line, 0, line, text.length),
            newText
          );
        }
      });
    })
  );
}
