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
import { systemdUnitDirectives } from "./systemdUnitDirectives";

export class SystemdUnitHoverProvider implements vscode.HoverProvider
{
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined
    {
        const lineText = document.lineAt(position).text;
        const equalsIndex = lineText.indexOf("=");

        // Only activate when cursor is on the key side (left of '=')
        if (equalsIndex < 0 || position.character >= equalsIndex)
        {
            return undefined;
        }

        const key = lineText.substring(0, equalsIndex).trim();
        const directive = systemdUnitDirectives[key];

        if (!directive)
        {
            return undefined;
        }

        const keyRange = new vscode.Range(position.line, 0, position.line, equalsIndex);

        const content = new vscode.MarkdownString();
        content.supportHtml = false;
        content.appendMarkdown(`**\`[${directive.section}]\` ${key}**\n\n`);
        content.appendMarkdown(directive.description);

        return new vscode.Hover(content, keyRange);
    }
}
