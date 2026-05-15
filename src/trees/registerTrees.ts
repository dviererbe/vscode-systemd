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
import { ExTreeDataProvider, ExTreeItem, IActionContext, registerCommand } from "@dviererbe/vscode-utils";
import { HelpTreeItem } from "./help/HelpTreeItem";
import { ExtensionVariables } from "../extensionVariables";
import { UnitsTreeItem } from "./units/UnitsTreeItem";

export function registerTrees(): void
{
    ExtensionVariables.systemUnitsRoot = new UnitsTreeItem(undefined, "system");
    const loadMoreSystemUnitsCommandId = 'vscode-systemd.units.system.loadMore';
    ExtensionVariables.systemUnitsTree = new ExTreeDataProvider(ExtensionVariables.systemUnitsRoot, loadMoreSystemUnitsCommandId);
    ExtensionVariables.systemUnitsTreeView = vscode.window.createTreeView("vscode-systemd.views.units.system", { treeDataProvider: ExtensionVariables.systemUnitsTree, canSelectMany: false });
    ExtensionVariables.context.subscriptions.push(ExtensionVariables.systemUnitsTreeView);
    registerCommand({
        commandId: loadMoreSystemUnitsCommandId,
        callback: (context: IActionContext, node: ExTreeItem) => ExtensionVariables.systemUnitsTree.loadMore(node, context),
    });

    ExtensionVariables.userUnitsRoot = new UnitsTreeItem(undefined, "user");
    const loadMoreUserUnitsCommandId = 'vscode-systemd.units.user.loadMore';
    ExtensionVariables.userUnitsTree = new ExTreeDataProvider(ExtensionVariables.userUnitsRoot, loadMoreUserUnitsCommandId);
    ExtensionVariables.userUnitsTreeView = vscode.window.createTreeView("vscode-systemd.views.units.user", { treeDataProvider: ExtensionVariables.userUnitsTree, canSelectMany: false });
    ExtensionVariables.context.subscriptions.push(ExtensionVariables.userUnitsTreeView);
    registerCommand({
        commandId: loadMoreUserUnitsCommandId,
        callback: (context: IActionContext, node: ExTreeItem) => ExtensionVariables.userUnitsTree.loadMore(node, context),
    });

    const helpRoot = new HelpTreeItem(undefined);
    const helpTreeDataProvider = new ExTreeDataProvider(helpRoot, "vscode-systemd.help.loadMore");
    const helpTreeView = vscode.window.createTreeView("vscode-systemd.views.help", { treeDataProvider: helpTreeDataProvider, canSelectMany: false });
    ExtensionVariables.context.subscriptions.push(helpTreeView);
}
