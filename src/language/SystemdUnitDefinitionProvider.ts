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

// Matches absolute filesystem paths in a value, stopping at whitespace, backslash, or % specifiers.
const absolutePathPattern = /\/[^\s\\%,;]*/g;

// Matches systemd unit file names (e.g. multi-user.target, sshd.service).
const unitNamePattern = /[\w@.-]+\.(service|socket|device|mount|automount|swap|target|path|timer|slice|scope)\b/g;

// Ordered list of directories systemd uses to resolve unit files.
const systemdUnitDirs = [
    "/etc/systemd/system",
    "/run/systemd/system",
    "/usr/lib/systemd/system",
    "/lib/systemd/system",
];

interface Token
{
    text: string;
    start: number;
    end: number;
}

function findTokensInValue(value: string, pattern: RegExp): Token[]
{
    const tokens: Token[] = [];
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value)) !== null)
    {
        tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
    }

    return tokens;
}

function tokenAtOffset(tokens: Token[], offset: number): Token | undefined
{
    return tokens.find(t => offset >= t.start && offset <= t.end);
}

export class SystemdUnitDefinitionProvider implements vscode.DefinitionProvider
{
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined>
    {
        const lineText = document.lineAt(position).text;
        const equalsIndex = lineText.indexOf("=");

        // Only activate when cursor is on the value side (right of '=')
        if (equalsIndex < 0 || position.character <= equalsIndex)
        {
            return undefined;
        }

        const value = lineText.substring(equalsIndex + 1);
        const cursorInValue = position.character - (equalsIndex + 1);

        // Try to resolve an absolute filesystem path under the cursor.
        const pathToken = tokenAtOffset(findTokensInValue(value, absolutePathPattern), cursorInValue);
        if (pathToken)
        {
            const location = await this.resolveFilePath(pathToken.text);
            if (location)
            {
                return location;
            }
        }

        // Try to resolve a unit file name under the cursor.
        const unitToken = tokenAtOffset(findTokensInValue(value, unitNamePattern), cursorInValue);
        if (unitToken)
        {
            return await this.resolveUnitFile(unitToken.text);
        }

        return undefined;
    }

    private async resolveFilePath(filePath: string): Promise<vscode.Location | undefined>
    {
        const uri = vscode.Uri.file(filePath);
        try
        {
            await vscode.workspace.fs.stat(uri);
            return new vscode.Location(uri, new vscode.Position(0, 0));
        }
        catch
        {
            return undefined;
        }
    }

    private async resolveUnitFile(unitName: string): Promise<vscode.Location | undefined>
    {
        // Prefer files already open in the workspace.
        const workspaceMatches = await vscode.workspace.findFiles(`**/${unitName}`, undefined, 1);
        if (workspaceMatches.length > 0)
        {
            return new vscode.Location(workspaceMatches[0], new vscode.Position(0, 0));
        }

        // Fall back to system-wide unit directories.
        for (const dir of systemdUnitDirs)
        {
            const uri = vscode.Uri.file(`${dir}/${unitName}`);
            try
            {
                await vscode.workspace.fs.stat(uri);
                return new vscode.Location(uri, new vscode.Position(0, 0));
            }
            catch
            {
                // not found in this directory, try next
            }
        }

        return undefined;
    }
}
