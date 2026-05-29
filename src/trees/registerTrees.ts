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
import { UnitsGroupsRootTreeItem } from "./units/UnitsGroupsRootTreeItem";

export function registerTrees(): void
{
    ExtensionVariables.unitsRoot = new UnitsGroupsRootTreeItem();
    const loadMoreUnitsCommandId = 'vscode-systemd.units.loadMore';
    ExtensionVariables.unitsTree = new ExTreeDataProvider(ExtensionVariables.unitsRoot, loadMoreUnitsCommandId);
    ExtensionVariables.unitsTreeView = vscode.window.createTreeView("vscode-systemd.views.units", { treeDataProvider: ExtensionVariables.unitsTree, canSelectMany: false });
    ExtensionVariables.context.subscriptions.push(ExtensionVariables.unitsTreeView);
    registerCommand({
        commandId: loadMoreUnitsCommandId,
        callback: (context: IActionContext, node: ExTreeItem) => ExtensionVariables.unitsTree.loadMore(node, context),
    });

    const helpRoot = new HelpTreeItem(undefined);
    const helpTreeDataProvider = new ExTreeDataProvider(helpRoot, "vscode-systemd.help.loadMore");
    const helpTreeView = vscode.window.createTreeView("vscode-systemd.views.help", { treeDataProvider: helpTreeDataProvider, canSelectMany: false });
    ExtensionVariables.context.subscriptions.push(helpTreeView);
}
