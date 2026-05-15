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

const filterKey = "filter";
const filterText = vscode.l10n.t("Filter");

export class UnitsTreeItem extends GroupParentTreeItem<UnitInfo>
{
    public readonly treePrefix: string;
    public readonly scope: "system" | "user";

    protected readonly defaultLabelProperty = unitNameProperty;
    protected readonly defaultDescriptionProperties = [ unitLoadedProperty, unitActiveProperty, unitStatusProperty ];
    protected readonly defaultIconProperty = unitActiveProperty;
    protected readonly defaultSortByProperty = unitFileNameProperty;
    protected readonly defaultGroupByProperty = unitTypeProperty;

    private _filter: string | undefined;

    public constructor(parent: ExParentTreeItem | undefined, scope: "system" | "user")
    {
        super(parent);
        this.scope = scope;
        this.treePrefix="units." + scope;
        this.description = this.treePrefix;
    }

    public get label(): string
    {
        // this should never be called, because this class will be the root of treeview
        return this.treePrefix;
    }

    public get filter(): string | undefined
    {
        return this._filter;
    }

    protected set filter(value: string | undefined)
    {
        if (value === "")
        {
            this._filter = undefined;
            return;
        }

        this._filter = value;
    }

    protected async getItems(context: IActionContext): Promise<UnitInfo[]>
    {
        this.filter = await this.config.get<string>(filterKey);
        const units = await SystemctlCommand.listUnits(context, { scope: this.scope, pattern: this._filter });

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

    protected createChildTreeItem(
        item: UnitInfo,
        parent: ExParentTreeItem,
        root: GroupParentTreeItem<UnitInfo>): GroupChildTreeItem<UnitInfo>
    {
        return new UnitTreeItem(parent, item, root);
    }

    protected override onDidChangeConfigSection(context: IActionContext, childSettingChanged?: boolean): void
    {
        const oldValue = this.filter;
        this.filter = this.config.get<string>(filterKey);
        let changed = this.filter !== oldValue;

        super.onDidChangeConfigSection(context, changed || childSettingChanged);
    }

    protected override get settings(): ISettingInfo<UnitInfo>[]
    {
        const settings = super.settings;
        settings.push({
            label: filterText,
            description: vscode.l10n.t("Only units mathing the pattern are shown."),
            currentValueDisplayString: this._filter ?? "",
            isCustom: true,
            callback: async () =>
            {

            },
            reset: this.resetFilter.bind(this),
        });

        return settings;
    }

    public async configureFilter(): Promise<void>
    {
        const input = await vscode.window.showInputBox({
            title: filterText,
            placeHolder: vscode.l10n.t("e.g. {0}", "*.docker.service"),
            value: this._filter,
        });

        if (input === undefined || input === "")
        {
            await this.config.update(filterKey, undefined);
        }
        else
        {
            await this.config.update(filterKey, input);
        }
    }

    public async resetFilter(): Promise<void>
    {
        await this.config.update(filterKey, undefined);
    }
}
