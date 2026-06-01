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
import { SystemctlCommand } from "../../clients/SystemctlCommand";
import { UnitScope } from "../../clients/contracts/common";
import * as vscode from "vscode";

export async function reloadDaemon(context: IActionContext): Promise<void>
{
    context.errorHandling.suppressDisplay = false;

    const selections = await vscode.window.showQuickPick<vscode.QuickPickItem & { scope: UnitScope }>(
    [
        {
            label: vscode.l10n.t("System"),
            description: vscode.l10n.t("reload the system-wide systemd manager configuration"),
            scope: "system",
            picked: true,
        },
        {
            label: vscode.l10n.t("Current User"),
            description: vscode.l10n.t("reload the current user's systemd manager configuration"),
            scope: "user",
            picked: true,
        },
    ],
    {
        title: vscode.l10n.t("Reload the systemd manager configuration"),
        prompt: vscode.l10n.t("Select which systemd manager configuration should be reloaded:"),
        canPickMany: true,
    });

    if (!selections) return;

    const tasks: Promise<void>[] = [];
    for (const selection of selections)
    {
        tasks.push(SystemctlCommand.daemonReload(context, { scope: selection.scope}));
    }
    await Promise.all(tasks);
}
