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

import { IActionContext } from "@dviererbe/vscode-utils";
import { SystemdAnalyzeCommand } from "../../clients/SystemdAnalyzeCommand";
import * as vscode from "vscode";

export async function showPlotView(context: IActionContext): Promise<void>
{
    context.errorHandling.suppressDisplay = false;

    const blameSvg = await SystemdAnalyzeCommand.plot();

    const webViewPanel = await vscode.window.createWebviewPanel(
        "vscode-systemd.plot",
        "systemd-analyze plot",
        vscode.ViewColumn.Active,
        {
            enableScripts: false,
            enableForms: false,
            enableCommandUris: false,
            enableFindWidget: false,
            localResourceRoots: [],
            retainContextWhenHidden: false
        });

    webViewPanel.webview.html = blameSvg;
}
