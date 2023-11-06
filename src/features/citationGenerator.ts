import { Selection, TextEditor } from "vscode";
import * as vscode from "vscode";

import axios from "axios";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "note-utils.citationGenerator",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return err("No active editor");
        if (editor.selections.length == 0) return err("No text selected");

        for (let selection of editor.selections)
          new CitationJob(editor, selection)
            .cite()
            .then((job) => {
              if (job.citation === null) return;
              editor.edit((editBuilder) => {
                editBuilder.replace(job.selection, job.citation!);
              });
            })
            .catch((error) => err(`Failed to generate citation: ${error}`));
      }
    )
  );
}

class CitationJob {
  editor: TextEditor;
  selection: Selection;
  address: string;
  citation: string | null;

  constructor(editor: TextEditor, selection: Selection) {
    this.editor = editor;
    this.selection = selection;
    this.address = editor.document.getText(selection);
    this.citation = null;
  }

  async cite(): Promise<CitationJob> {
    let url = `https://www.mybib.com/api/autocite/search?q=${encodeURIComponent(
      this.address
    )}&sourceId=webpage`;

    vscode.window.showInformationMessage("Fetching citation...");

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

function err(msg: string) {
  vscode.window.showErrorMessage(msg);
}

function getFormat(): string {
  return vscode.workspace
    .getConfiguration()
    .get("note-utils.citationGenerator.citationStyle") as string;
}
