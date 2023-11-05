import * as vscode from 'vscode';

import { register as dailyNote } from "./dailyNote";

export function register(context: vscode.ExtensionContext) {
    dailyNote(context);
}