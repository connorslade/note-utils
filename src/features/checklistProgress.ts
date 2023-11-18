import * as vscode from "vscode";

export function register(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Checklist Progress is active.");
  vscode.languages.registerInlayHintsProvider(
    ["markdown", "md"],
    new (class implements vscode.InlayHintsProvider {
      async provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range
      ): Promise<vscode.InlayHint[]> {
        const result: vscode.InlayHint[] = [];
        const text = document.getText(range);

        let hint: vscode.InlayHint = new vscode.InlayHint(
          new vscode.Position(0, 0),
          [new vscode.InlayHintLabelPart("Checklist")],
          vscode.InlayHintKind.Type
        );
        result.push(hint);

        return result;
      }
    })()
  );
}

class ListItem {
  startPos: vscode.Position;
  endPos: vscode.Position;
  completed: boolean;

  constructor(startPos: vscode.Position, endPos: vscode.Position) {
    this.startPos = startPos;
    this.endPos = endPos;
    this.completed = false;
  }
}
