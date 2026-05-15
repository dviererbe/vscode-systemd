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

export async function disableUnitUntilRestart(context: IActionContext, unitTreeItem: UnitTreeItem): Promise<void>
{
    context.errorHandling.suppressDisplay = false;
    const unit = unitTreeItem.item;
    await SystemctlCommand.disable(context, { scope: unit.scope, runtime: true, unit: unit.unitFileName });
}
