import * as fs from "fs";

import * as vscode from "vscode";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.dailyNote", async () => {
      let workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders == undefined || workspaceFolders.length == 0) {
        vscode.window.showErrorMessage("No workspace is open.");
        return;
      }

      let name = notePath();
      let workspacePath = workspaceFolders[0].uri.fsPath;
      let path = workspacePath.endsWith("/")
        ? `${workspacePath}${name}.md`
        : `${workspacePath}/${name}.md`;

      let uri = vscode.Uri.file(path);
      if (!fs.existsSync(path))
        await vscode.workspace.fs.writeFile(uri, new Uint8Array());

      let document = await vscode.workspace.openTextDocument(path);
      let editor = await vscode.window.showTextDocument(document);
      editor.edit((edit) => {
        edit.insert(new vscode.Position(0, 0), `# ${name}\n\n`);
      });
    })
  );
}

function notePath(): string {
  let date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
