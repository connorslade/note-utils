import * as vscode from "vscode";
import { ID, NAME } from "./extension";

export class Logger {
  static handle: vscode.OutputChannel;

  public static register(context: vscode.ExtensionContext) {
    if (Logger.handle) return;
    Logger.handle = vscode.window.createOutputChannel(NAME, ID);
    Logger.handle.show();
  }

  static log(message: any) {
    if (typeof message === "object") message = JSON.stringify(message, null, 2);
    else if (typeof message !== "string") message = message.toString();
    Logger.handle.appendLine(message);
  }

  public static info(message: any) {
    Logger.log(`[INFO] ${message}`);
  }

  public static warn(message: any) {
    Logger.log(`[WARN] ${message}`);
  }

  public static error(message: any) {
    Logger.log(`[ERROR] ${message}`);
  }
}
