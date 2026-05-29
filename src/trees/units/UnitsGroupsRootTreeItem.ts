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

import { callWithErrorHandling, ExParentTreeItem, ExTreeItem, getExtensionInfo, IActionContext, ISettingInfo } from "@dviererbe/vscode-utils";
import { UnitsGroupTreeItem } from "./UnitsGroupTreeItem";
import * as vscode from "vscode";
import { ExtensionVariables } from "../../extensionVariables";
import { UnitInfo } from "./UnitProperties";

const filterKey = "filter";
const filterText = vscode.l10n.t("Filter");

export class UnitsGroupsRootTreeItem extends ExParentTreeItem implements vscode.Disposable
{
    public readonly configSection: string;
    private readonly _configurationChangeListener: vscode.Disposable;

    private _filter: string | undefined;

    public readonly label: string = "units";
    public readonly contextValue: string = "units";

    public readonly systemUnitsTree: UnitsGroupTreeItem;
    public readonly userUnitsTree: UnitsGroupTreeItem;

    public constructor()
    {
        super(undefined);
        this.configSection = `${getExtensionInfo().extensionName}.units`;
        this.systemUnitsTree = new UnitsGroupTreeItem(this, "system");
        this.userUnitsTree = new UnitsGroupTreeItem(this, "user");

        this._configurationChangeListener = vscode.workspace.onDidChangeConfiguration(
            this.onDidChangeConfiguration, this);
    }

    private get config(): vscode.WorkspaceConfiguration
    {
        return vscode.workspace.getConfiguration(this.configSection);
    }

    public get filter(): string | undefined
    {
        return this._filter;
    }

    private set filter(value: string | undefined)
    {
        const oldValue = this._filter;

        if (value === "")
        {
            this._filter = value = undefined;
        }
        else
        {
            this._filter = value;
        }

        if (value !== oldValue)
        {
            if (value !== undefined)
            {
                ExtensionVariables.unitsTreeView.description = vscode.l10n.t("Filter: {0}", value);
            }
            else
            {
                ExtensionVariables.unitsTreeView.description = undefined;
            }

            vscode.commands.executeCommand("setContext", `${getExtensionInfo().extensionName}.views.units.filter`, value);
        }
    }

    public refreshFilterValue(): void
    {
        this.filter = this.config.get<string>(filterKey);
    }

    protected loadMoreChildrenImpl(_context: IActionContext, _clearCache: boolean): Promise<ExTreeItem[]>
    {
        return Promise.resolve([ this.systemUnitsTree, this.userUnitsTree ]);
    }

    protected hasMoreChildrenImpl(): boolean
    {
        return false;
    }

    private onDidChangeConfiguration(event: vscode.ConfigurationChangeEvent)
    {
        if (!event.affectsConfiguration(this.configSection)) return;
        callWithErrorHandling(`refreshUnitsAfterConfigChange`,
            this.refresh.bind(this));
    }

    public configureExplorer(): Promise<void>
    {
        // systemUnitsTree.configureExplorer() and userUnitsTree.configureExplorer()
        // both have the same effect. So we call just one of them.
        return this.systemUnitsTree.configureExplorer();
    }

    public async configureFilter(): Promise<void>
    {
        const input = await vscode.window.showInputBox({
            title: filterText,
            placeHolder: vscode.l10n.t("e.g. {0}", "*.docker.service"),
            value: this.filter,
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

    public get filerSetting(): ISettingInfo<UnitInfo>
    {
        return {
            label: filterText,
            description: vscode.l10n.t("Only units matching the pattern are shown."),
            currentValueDisplayString: this.filter ?? "",
            isCustom: true,
            configure: this.configureFilter.bind(this),
            reset: this.resetFilter.bind(this),
        };
    }

    public async resetFilter(): Promise<void>
    {
        await this.config.update(filterKey, undefined);
    }

    public dispose()
    {
        this.systemUnitsTree.dispose();
        this.userUnitsTree.dispose();
        this._configurationChangeListener.dispose();
    }
}
