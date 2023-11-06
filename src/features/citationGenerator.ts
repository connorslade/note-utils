import * as vscode from "vscode";

import axios from "axios";

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "note-utils.citationGenerator",
      async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) return err("No active editor");
        let selected = editor.selection;
        if (selected.isEmpty) return err("No text selected");

        let text = editor.document.getText(selected);
        let url = `https://www.mybib.com/api/autocite/search?q=${encodeURIComponent(
          text
        )}&sourceId=webpage`;

        vscode.window.showInformationMessage("Fetching citation...");

        let siteLookup = await axios
          .get(url)
          .catch((error) =>
            err(`Failed to search for resource citation: ${error}`)
          );
        if (!siteLookup) return;
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
            styleId: "modern-language-association-8th-edition",
          })
          .catch((error) => err(`Failed to generate citation: ${error}`));
        if (!citation) return;

        let formattedCitation = citation.data.result.formattedReferenceStr;
        let textCitation = formattedCitation
          .replace(/<[^>]*>?/gm, "")
          .replace(/“”/gm, '"');

        editor.edit((editBuilder) => {
          editBuilder.replace(selected, textCitation);
        });
      }
    )
  );
}

function err(msg: string) {
  vscode.window.showErrorMessage(msg);
}
