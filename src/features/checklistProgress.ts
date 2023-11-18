import * as vscode from "vscode";

export function register(context: vscode.ExtensionContext) {
  let provider = vscode.languages.registerCodeLensProvider(
    {
      language: "markdown",
      scheme: "file",
    },
    new ChecklistLenseProvider()
  );

  context.subscriptions.push(provider);
}
class ChecklistLenseProvider implements vscode.CodeLensProvider {
  async provideCodeLenses(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    const lists = findChecklists(document);
    let codeLenses: vscode.CodeLens[] = [];

    for (let list of lists) {
      let message = `${list.completed()}/${list.count()} (${Math.round(
        list.percent() * 100
      )}%)`;

      const pos = list.items[0].startPos;
      const range = new vscode.Range(pos, pos);
      let codeLens = new vscode.CodeLens(range, {
        title: message,
        command: "",
      });
      codeLenses.push(codeLens);
    }

    return codeLenses;
  }
}

class ListItem {
  startPos: vscode.Position;
  endPos: vscode.Position;
  completed: boolean;

  constructor(
    startPos: vscode.Position,
    endPos: vscode.Position,
    completed: boolean
  ) {
    this.startPos = startPos;
    this.endPos = endPos;
    this.completed = completed;
  }
}

class List {
  items: ListItem[];

  constructor(items: ListItem[]) {
    this.items = items;
  }

  completed(): number {
    let completed = 0;

    for (let item of this.items) {
      if (item.completed) completed++;
    }

    return completed;
  }

  count(): number {
    return this.items.length;
  }

  percent(): number {
    return this.completed() / this.count();
  }
}

function findChecklists(document: vscode.TextDocument): List[] {
  let lists: List[] = [];
  let working: ListItem[] = [];

  const text = document.getText();
  const lines = text.split("\n");
  let line = 0;

  while (line < lines.length) {
    const currentLine = lines[line];

    if (currentLine.startsWith("- [ ]")) {
      const startPos = new vscode.Position(line, 0);
      const endPos = new vscode.Position(line, currentLine.length);
      working.push(new ListItem(startPos, endPos, false));
    } else if (currentLine.startsWith("- [x]")) {
      const startPos = new vscode.Position(line, 0);
      const endPos = new vscode.Position(line, currentLine.length);
      working.push(new ListItem(startPos, endPos, true));
    } else {
      if (working.length > 0) {
        lists.push(new List(working));
        working = [];
      }
    }

    line++;
  }

  return lists;
}
