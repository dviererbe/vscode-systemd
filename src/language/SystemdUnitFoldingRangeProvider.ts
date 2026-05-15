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

const sectionHeader = /^\[/;
const multilineIndicator = /\\\s*$/;

export class SystemdUnitFoldingRangeProvider implements vscode.FoldingRangeProvider
{
    provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[]
    {
        const ranges: vscode.FoldingRange[] = [];
        let sectionStart = -1;
        let multilineStart: number | undefined = undefined;

        for (let i = 0; i < document.lineCount; i++)
        {
            if (sectionHeader.test(document.lineAt(i).text))
            {
                if (sectionStart >= 0)
                {
                    ranges.push(new vscode.FoldingRange(sectionStart, i - 1));

                    if (multilineStart)
                    {
                        ranges.push(new vscode.FoldingRange(multilineStart, i - 1));
                        multilineStart = undefined;
                    }
                }

                sectionStart = i;
            }
            else if (multilineIndicator.test((document.lineAt(i).text)))
            {
                if (multilineStart === undefined)
                {
                    multilineStart = i;
                }
            }
            else if (multilineStart)
            {
                ranges.push(new vscode.FoldingRange(multilineStart, i));
                multilineStart = undefined;
            }
        }

        if (sectionStart >= 0)
        {
            ranges.push(new vscode.FoldingRange(sectionStart, document.lineCount - 1));
        }
        if (multilineStart)
        {
            ranges.push(new vscode.FoldingRange(multilineStart, document.lineCount - 1));
        }

        return ranges;
    }
}
