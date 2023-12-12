import * as fs from "fs";

import * as vscode from "vscode";
import { Logger } from "../logging";
import { Formatter } from "../lib/format";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.dailyNote", async () => {
      let workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders === undefined || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("No workspace is open.");
        return;
      }

      let date = new Date();
      let args = {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString(),
        day: date.getDate().toString(),
      };

      let path = makePath(notePath(args));
      Logger.info(`Opening \`${path}\``);

      fs.mkdirSync(vscode.Uri.joinPath(path, "..").fsPath, { recursive: true });
      let isNew = !fs.existsSync(path.fsPath);
      if (isNew) {
        let contents = new TextEncoder().encode(await getContents(args));
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

function notePath(args: { [key: string]: string }): string {
  let format = vscode.workspace
    .getConfiguration()
    .get("note-utils.dailyNote.location") as string;
  Logger.info(`Note path formatter: ${format}`);

  let formatter = new Formatter(format);
  Logger.info(`Formatter: ${JSON.stringify(formatter)}`);
  let path = formatter.format(args);
  Logger.info(`Note path: ${path}`);

  return path;
}

async function getContents(args: { [key: string]: string }): Promise<string> {
  let isFile = vscode.workspace
    .getConfiguration()
    .get("note-utils.dailyNote.template") as boolean;

  if (!isFile) return "";

  let templatePath = vscode.workspace
    .getConfiguration()
    .get("note-utils.dailyNote.templateLocation") as string;
  let template = await vscode.workspace.fs.readFile(makePath(templatePath));
  let formatter = new Formatter(new TextDecoder("utf-8").decode(template));

  return formatter.format(args);
}

function makePath(str: string): vscode.Uri {
  let workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) throw Error("No open workspace");
  let workspacePath = workspaceFolders[0].uri;
  return vscode.Uri.joinPath(workspacePath, str);
}
