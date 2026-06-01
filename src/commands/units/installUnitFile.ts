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


import { IActionContext, LocalizedLiterals } from "@dviererbe/vscode-utils";
import { SystemdUnitLanguageId } from "../../language/constants";
import { SystemctlCommand } from "../../clients/SystemctlCommand";
import { UnitScope } from "../../clients/contracts/common";
import * as vscode from "vscode";
import * as path from "node:path";

export async function installUnitFile(
    context: IActionContext,
    resourceUri?: vscode.Uri)
{
    let name: string | undefined = undefined;
    let document: vscode.TextDocument | undefined;

    if (resourceUri === undefined)
    {
        if (!vscode.window.activeTextEditor)
        {
            vscode.window.showWarningMessage(vscode.l10n.t("No active editor found."));
            return;
        }

        if (vscode.window.activeTextEditor.document.isDirty)
        {
            vscode.window.showWarningMessage(vscode.l10n.t("The document has unsaved changes. Please save it first."));
        }

        if (vscode.window.activeTextEditor.document.languageId !== SystemdUnitLanguageId)
        {
            const continueWithDoc = await vscode.window.showQuickPick<vscode.QuickPickItem & { yes: boolean }>(
                [
                    {
                        label: LocalizedLiterals.yes,
                        description: vscode.l10n.t("use this document to create a systemd unit"),
                        yes: true
                    },
                    {
                        label: LocalizedLiterals.no,
                        description: vscode.l10n.t("abort"),
                        yes: false
                    }
                ],
                {
                    title: vscode.l10n.t("Continue?"),
                    prompt: vscode.l10n.t("The document in the active editor is not recognized as a systemd unit. Continue?"),
                    canPickMany: false,
                });

            if (continueWithDoc === undefined || !continueWithDoc.yes) return;
        }

        document = vscode.window.activeTextEditor.document;

        if (!document.isUntitled)
        {
            try
            {
                name = path.basename(document.fileName);
            }
            catch
            {
            }
        }
    }
    else
    {
        document = await vscode.workspace.openTextDocument(resourceUri);

        if (resourceUri.scheme === "file")
        {
            try
            {
                name = path.basename(resourceUri.fsPath);
            }
            catch
            {
            }
        }
    }

    await vscode.window.showTextDocument(document);

    const selection = await vscode.window.showQuickPick<vscode.QuickPickItem & { scope: UnitScope }>(
        [
            {
                label: vscode.l10n.t("System Wide"),
                description: vscode.l10n.t("install unit file system wide"),
                scope: "system",
            },
            {
                label: vscode.l10n.t("Current User"),
                description: vscode.l10n.t("install unit file for current user"),
                scope: "user",
                picked: true,
            },
        ],
        {
            title: vscode.l10n.t("Scope"),
            canPickMany: false,
            prompt: vscode.l10n.t("Where install the unit file to?")
        });

    if (selection === undefined) return;
    const scope: UnitScope = selection.scope;

    name = await vscode.window.showInputBox({
            title: vscode.l10n.t("Unit Name"),
            value: name,
        });

    if (name === undefined)
    {
        return;
    }

    await SystemctlCommand.edit(context,
        {
            unit: name,
            definition: document.getText(),
            runtime: false,
            scope: scope,
        });

    const enableSelection = await vscode.window.showQuickPick<vscode.QuickPickItem & { enable: boolean }>(
        [
            {
                label: LocalizedLiterals.yes,
                picked: true,
                enable: true,
                description: vscode.l10n.t("enable the unit file that was just created", name),
            },
            {
                label: LocalizedLiterals.no,
                picked: false,
                enable: false,
                description: vscode.l10n.t("do nothing"),
            }
        ],
        {
            canPickMany: false,
            title: vscode.l10n.t("Enable Unit File?"),
            prompt: vscode.l10n.t("Enable the unit file '{0}' that was just created?", name),
        });

    if (enableSelection?.enable !== true) return;

    await SystemctlCommand.enable(context,
    {
        unit: name,
        runtime: false,
        scope: scope,
    });

    const startSelection = await vscode.window.showQuickPick<vscode.QuickPickItem & { start: boolean }>(
        [
            {
                label: LocalizedLiterals.yes,
                picked: true,
                start: true,
                description: vscode.l10n.t("start the unit that was just enabled", name),
            },
            {
                label: LocalizedLiterals.no,
                picked: false,
                start: false,
                description: vscode.l10n.t("do nothing"),
            }
        ],
        {
            canPickMany: false,
            title: vscode.l10n.t("Start unit?"),
            prompt: vscode.l10n.t("Start the unit '{0}' that was just enabled?", name),
        });

    if (startSelection?.start !== true) return;

    await SystemctlCommand.start(context,
    {
        unit: name,
        scope: scope,
    });
}
