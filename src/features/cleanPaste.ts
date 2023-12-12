import * as vscode from "vscode";

interface Replacement {
  replace(replace: string): string;
}

class BasicReplacement implements Replacement {
  constructor(private readonly from: string[], private readonly to: string) {}

  replace(replace: string): string {
    for (let i = 0; i < this.from.length; i++)
      replace = replace.split(this.from[i]).join(this.to);
    return replace;
  }
}

const REPLACEMENTS = [
  new BasicReplacement(["“", "”"], '"'),
  new BasicReplacement(["‘", "’"], "'"),
];

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("note-utils.cleanPaste", async () => {
      let editor = vscode.window.activeTextEditor;
      if (editor === undefined) return;

      let clip = await vscode.env.clipboard.readText();
      for (const replacement of REPLACEMENTS) clip = replacement.replace(clip);

      await editor.edit((edit) => {
        edit.insert(editor!.selection.active, clip);
      });
    })
  );
}
