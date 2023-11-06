import * as vscode from "vscode";

const got = require("got");

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "note-utils.citationGenerator",
      async () => {
        if (!vscode.window.activeTextEditor)
          return vscode.window.showInformationMessage("No active editor");

        let selected = vscode.window.activeTextEditor?.selection;

        if (selected.isEmpty)
          return vscode.window.showInformationMessage("No text selected");

        let text = vscode.window.activeTextEditor?.document.getText(selected);
        let url = `https://www.mybib.com/api/autocite/search?q=${encodeURIComponent(
          text
        )}`;

        vscode.window.showInformationMessage("Fetching citation...");

        let siteLookup: any = await got.get(url).json();
        let siteInfo = siteLookup.results[0];

        // POST /api/autocite/reference
        // {
        //   "metadata": siteInfo,
        //   "sourceId": "webpage",
        //   "styleId": "modern-language-association-8th-edition"
        // }
        let citation: any = await got
          .post("https://www.mybib.com/api/autocite/reference", {
            json: {
              metadata: siteInfo,
              sourceId: "webpage",
              styleId: "modern-language-association-8th-edition",
            },
          })
          .json();

        let formattedCitation = citation.result.formattedReferenceStr;
        let textCitation = formattedCitation.replace(/<[^>]*>?/gm, "");

        vscode.window.activeTextEditor?.edit((editBuilder) => {
          editBuilder.replace(selected, textCitation);
        });
      }
    )
  );
}
