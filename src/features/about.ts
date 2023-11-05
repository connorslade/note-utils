import * as vscode from "vscode";
import { VERSION } from "../extension";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.about", () => {
      vscode.window.showInformationMessage(
        `Note Utils is a collection of utilities for note taking in VS Code - currently in development.\nVersion: ${VERSION}`
      );
    })
  );
}
