// vscode-systemd
// Copyright (C) 2026 Dominik Viererbe <hello@dviererbe.de>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as vscode from "vscode";

const sectionHeaderPattern = /^\[(.+)\]$/;
const directivePattern = /^([A-Za-z][A-Za-z0-9]*)\s*=/;

export class SystemdUnitDocumentSymbolProvider implements vscode.DocumentSymbolProvider
{
    provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[]
    {
        const sectionStarts = this.findSectionStarts(document);
        const symbols: vscode.DocumentSymbol[] = [];

        for (let s = 0; s < sectionStarts.length; s++)
        {
            const { name, line: startLine } = sectionStarts[s];
            const endLine = s + 1 < sectionStarts.length
                ? sectionStarts[s + 1].line - 1
                : document.lineCount - 1;

            const sectionSymbol = this.buildSectionSymbol(document, name, startLine, endLine);
            symbols.push(sectionSymbol);
        }

        return symbols;
    }

    private findSectionStarts(document: vscode.TextDocument): Array<{ name: string; line: number }>
    {
        const sections: Array<{ name: string; line: number }> = [];

        for (let i = 0; i < document.lineCount; i++)
        {
            const match = document.lineAt(i).text.match(sectionHeaderPattern);
            if (match)
            {
                sections.push({ name: match[1], line: i });
            }
        }

        return sections;
    }

    private buildSectionSymbol(
        document: vscode.TextDocument,
        name: string,
        startLine: number,
        endLine: number
    ): vscode.DocumentSymbol
    {
        const headerText = document.lineAt(startLine).text;
        const sectionRange = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
        const sectionSelectionRange = new vscode.Range(startLine, 0, startLine, headerText.length);

        const symbol = new vscode.DocumentSymbol(
            name,
            "",
            vscode.SymbolKind.Module,
            sectionRange,
            sectionSelectionRange,
        );

        symbol.children = this.buildDirectiveSymbols(document, startLine + 1, endLine);

        return symbol;
    }

    private buildDirectiveSymbols(
        document: vscode.TextDocument,
        fromLine: number,
        toLine: number
    ): vscode.DocumentSymbol[]
    {
        const children: vscode.DocumentSymbol[] = [];

        for (let i = fromLine; i <= toLine; i++)
        {
            const lineText = document.lineAt(i).text;
            const match = lineText.match(directivePattern);
            if (!match) continue;

            const key = match[1];
            const equalsIndex = lineText.indexOf("=");
            const rawValue = lineText.substring(equalsIndex + 1).trim();
            const detail = rawValue.length > 50 ? rawValue.substring(0, 50) + "…" : rawValue;

            const keyRange = new vscode.Range(i, 0, i, lineText.length);
            const keySelectionRange = new vscode.Range(i, 0, i, equalsIndex);

            children.push(new vscode.DocumentSymbol(
                key,
                detail,
                vscode.SymbolKind.Property,
                keyRange,
                keySelectionRange,
            ));
        }

        return children;
    }
}
