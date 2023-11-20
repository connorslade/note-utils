import { Selection, TextEditor } from "vscode";
import * as vscode from "vscode";

import axios from "axios";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "note-utils.citationGenerator",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (
          !editor ||
          editor.selections.length == 0 ||
          (editor.selections.length == 1 && editor.selections[0].isEmpty)
        ) {
          let options = { title: "Web Address" };
          let address = await vscode.window.showInputBox(options);
          if (!address) return;

          let citation = await new CitationJob(address)
            .cite()
            .catch((error) => err(`Failed to generate citation: ${error}`));
          if (!citation) return;

          if (editor) {
            await editor.edit((editBuilder) =>
              editBuilder.insert(editor.selections[0].end, citation!.citation!)
            );
          } else {
            let doc = await vscode.workspace.openTextDocument({
              language: "plaintext",
              content: citation.citation!,
            });
            await vscode.window.showTextDocument(doc, { preview: false });
          }
        } else {
          for (let selection of editor.selections)
            new SelectionCitationJob(editor, selection)
              .cite()
              .then((job) => {
                if (job.citation === null) return;
                editor.edit((editBuilder) => {
                  editBuilder.replace(job.selection, job.citation!);
                });
              })
              .catch((error) => err(`Failed to generate citation: ${error}`));
        }
      }
    )
  );
}

class CitationJob {
  address: string;
  citation: string | null;

  constructor(address: string) {
    this.address = address;
    this.citation = null;
  }

  async cite(): Promise<this> {
    let url = `https://www.mybib.com/api/autocite/search?q=${encodeURIComponent(
      this.address
    )}&sourceId=webpage`;

    let siteLookup = await axios
      .get(url)
      .catch((error) =>
        err(`Failed to search for resource citation: ${error}`)
      );
    if (!siteLookup) return this;
    let siteInfo = siteLookup.data.results[0].metadata;

    // POST /api/autocite/reference
    // {
    //   "metadata": siteInfo,
    //   "sourceId": "webpage",
    //   "styleId": "modern-language-association-8th-edition"
    // }
    let citation = await axios
      .post("https://www.mybib.com/api/autocite/reference", {
        metadata: siteInfo,
        sourceId: "webpage",
        styleId: getFormat(),
      })
      .catch((error) => err(`Failed to generate citation: ${error}`));
    if (!citation) return this;

    let formattedCitation = citation.data.result.formattedReferenceStr;
    this.citation = formattedCitation
      .replace(/<[^>]*>?/gm, "")
      .replace(/[“”]/gm, '"');

    return this;
  }
}

class SelectionCitationJob extends CitationJob {
  editor: TextEditor;
  selection: Selection;

  constructor(editor: TextEditor, selection: Selection) {
    super(editor.document.getText(selection));
    this.editor = editor;
    this.selection = selection;
  }
}

function err(msg: string) {
  vscode.window.showErrorMessage(msg);
}

function getFormat(): string {
  return vscode.workspace
    .getConfiguration()
    .get("note-utils.citationGenerator.citationStyle") as string;
}
