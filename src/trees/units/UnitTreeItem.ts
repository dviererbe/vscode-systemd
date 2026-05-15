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

import { ExParentTreeItem, GroupChildTreeItem, GroupParentTreeItem } from "@dviererbe/vscode-utils";
import * as vscode from "vscode";
import { UnitInfo } from "./UnitProperties";
import { openUnitDefinitionFileCommandId } from "../../commands/constants";

export class UnitTreeItem extends GroupChildTreeItem<UnitInfo>
{
    public constructor(
        parent: ExParentTreeItem,
        public readonly item: UnitInfo,
        root: GroupParentTreeItem<UnitInfo>)
    {
        super(parent, item, root);
        this.commandId = openUnitDefinitionFileCommandId;
    }

    protected override async resolveTooltipImpl?(_cancellationToken: vscode.CancellationToken): Promise<string | vscode.MarkdownString>
    {
        //simulate some loading time
        await new Promise(resolve => setTimeout(resolve, 500));

        return this.item.description;
    }

    public override get contextValue(): string
    {
        return `${this.item.loaded}${this.item.active}${this.item.status}unit`;
    }
}
