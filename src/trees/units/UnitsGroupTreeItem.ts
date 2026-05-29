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

import { ExParentTreeItem, GroupChildTreeItem, GroupParentTreeItem, IActionContext, IItemPropertyInfo, ISettingInfo } from "@dviererbe/vscode-utils";
import { SystemctlCommand } from "../../clients/SystemctlCommand";
import { unitActiveProperty, unitDescriptionProperty, unitFileNameProperty, UnitInfo, unitLoadedProperty, unitNameProperty, unitStatusProperty, unitTypeProperty } from "./UnitProperties";
import { UnitTreeItem } from "./UnitTreeItem";
import * as vscode from "vscode";
import { UnitsGroupsRootTreeItem } from "./UnitsGroupsRootTreeItem";
import { throwIfUnitScopeIsInvalid, UnitScope } from "../../clients/contracts/common";

export class UnitsGroupTreeItem extends GroupParentTreeItem<UnitInfo>
{
    public readonly treePrefix: string;
    public readonly scope: UnitScope;
    public readonly label: string;

    public declare readonly parent: UnitsGroupsRootTreeItem;
    public override readonly initialCollapsibleState: vscode.TreeItemCollapsibleState | undefined = vscode.TreeItemCollapsibleState.Expanded;

    protected readonly defaultLabelProperty = unitNameProperty;
    protected readonly defaultDescriptionProperties = [ unitLoadedProperty, unitActiveProperty, unitStatusProperty ];
    protected readonly defaultIconProperty = unitActiveProperty;
    protected readonly defaultSortByProperty = unitFileNameProperty;
    protected readonly defaultGroupByProperty = unitTypeProperty;

    public constructor(parent: UnitsGroupsRootTreeItem, scope: UnitScope)
    {
        throwIfUnitScopeIsInvalid(scope);

        // Because all unit group tree items read from the same config, we want to
        // avoid refreshing multiple times and therefore unnecessary reads/UI updates.
        super(parent, { refreshOnConfigurationChanges: false });
        this.scope = scope;
        this.treePrefix="units." + scope;
        this.label = scope;
        this.description = getUnitScopeDescription(scope);
        this.iconPath = getUnitScopeIcon(scope);
    }

    // We override this so that all unit group tree items read from the same config section.
    protected override get configSection(): string
    {
        return this.parent.configSection;
    }

    protected async getItems(context: IActionContext): Promise<UnitInfo[]>
    {
        this.parent.refreshFilterValue();
        const units = await SystemctlCommand.listUnits(context, { scope: this.scope, pattern: this.parent.filter });

        return units.map((unit) =>
            {
                const dotIndex = unit.unit.lastIndexOf(".");
                const name = dotIndex ? unit.unit.slice(0, dotIndex) : unit.unit;
                const type  = dotIndex ? unit.unit.slice(dotIndex + 1) : "<unknown>";

                return {
                    unitFileName: unit.unit,
                    unitName: name,
                    unitType: type,
                    loaded: unit.load,
                    active: unit.active,
                    status: unit.sub,
                    description: unit.description,
                    scope: this.scope,
                };
            });
    }

    protected readonly itemProperties: IItemPropertyInfo<UnitInfo>[] = [
        unitFileNameProperty,
        unitNameProperty,
        unitTypeProperty,
        unitLoadedProperty,
        unitActiveProperty,
        unitStatusProperty,
        unitDescriptionProperty,
    ];

    protected override createChildTreeItem(
        item: UnitInfo,
        parent: ExParentTreeItem,
        root: GroupParentTreeItem<UnitInfo>): GroupChildTreeItem<UnitInfo>
    {
        return new UnitTreeItem(parent, item, root);
    }

    protected override readSettingsValues(): void
    {
        super.readSettingsValues();
        this.parent.refreshFilterValue();
    }

    protected override get settings(): ISettingInfo<UnitInfo>[]
    {
        const settings = super.settings;
        settings.push(this.parent.filerSetting);

        return settings;
    }
}

function getUnitScopeDescription(scope: UnitScope) : string
{
    switch (scope)
    {
        case "system":
            return vscode.l10n.t("System Units");
        case "user":
            return vscode.l10n.t("Current User Units");
    }
}

function getUnitScopeIcon(scope: UnitScope) : vscode.ThemeIcon
{
    switch (scope)
    {
        case "system":
            return new vscode.ThemeIcon("vm");
        case "user":
            return new vscode.ThemeIcon("account");
    }
}
