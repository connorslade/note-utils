import * as fs from "fs";

import * as vscode from "vscode";
import { Logger } from "../logging";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.dailyNote", async () => {
      let workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders == undefined || workspaceFolders.length == 0) {
        vscode.window.showErrorMessage("No workspace is open.");
        return;
      }

      let name = notePath();
      let workspacePath = workspaceFolders[0].uri;
      let path = vscode.Uri.joinPath(workspacePath, "Daily", `${name}.md`);
      Logger.info(`Opening \`${path}\``);

      fs.mkdirSync(path.fsPath, { recursive: true });
      let isNew = !fs.existsSync(path.fsPath);
      if (isNew) {
        let contents = new TextEncoder().encode(`# ${name}\n\n`);
        await vscode.workspace.fs.writeFile(path, contents);
      }

      let document = await vscode.workspace.openTextDocument(path);
      let editor = await vscode.window.showTextDocument(document);

      editor.document.offsetAt(
        new vscode.Position(editor.document.lineCount - 1, 0)
      );
    })
  );
}

function notePath(): string {
  let date = new Date();

  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
