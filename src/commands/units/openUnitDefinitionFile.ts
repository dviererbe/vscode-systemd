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
import { UnitTreeItem } from "../../trees/units/UnitTreeItem";
import { SystemctlCommand } from "../../clients/SystemctlCommand";
import * as vscode from "vscode";

export async function openUnitDefinitionFile(context: IActionContext, unitTreeItem: UnitTreeItem): Promise<void>
{
    const unit = unitTreeItem.item;
    const unitDefinition = await SystemctlCommand.cat(context, { scope: unit.scope, unit: unit.unitName });

    const path = unitDefinition.substring(2, unitDefinition.indexOf('\n'));
    const doc = await vscode.workspace.openTextDocument(path);
    await vscode.window.showTextDocument(doc);
}
