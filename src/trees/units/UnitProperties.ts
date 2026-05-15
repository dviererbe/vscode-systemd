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

import { IItemPropertyInfo } from "@dviererbe/vscode-utils";

import * as vscode from "vscode";

export interface UnitInfo
{
    unitFileName: string;
    unitName: string;
    unitType: string;
    loaded: string;
    active: string;
    status: string;
    description: string;
    scope: "system" | "user";
};

export const unitFileNameProperty: IItemPropertyInfo<UnitInfo> =
{
    propertyKey: "UnitFileName",
    displayName: vscode.l10n.t("Unit File-Name"),
    description: vscode.l10n.t("The full name of the unit."),
    exampleValue: "cron.service",
    isGroupable: false,
    isSortable: true,

    getValue: function (item: UnitInfo): string
    {
        return item.unitName;
    }
};

export const unitNameProperty: IItemPropertyInfo<UnitInfo> =
{
    propertyKey: "UnitName",
    displayName: vscode.l10n.t("Unit Name"),
    description: vscode.l10n.t("Name of the unit without the unit type."),
    exampleValue: "cron",
    isGroupable: true,
    isSortable: false,

    getValue: function (item: UnitInfo): string
    {
        return item.unitName;
    }
};

function unitTypeIcon(value: string): vscode.ThemeIcon | undefined
{
    switch (value)
    {
        case "service":   return new vscode.ThemeIcon("gear");
        case "socket":    return new vscode.ThemeIcon("plug");
        case "device":    return new vscode.ThemeIcon("chip");
        case "mount":     return new vscode.ThemeIcon("database");
        case "automount": return new vscode.ThemeIcon("folder-opened");
        case "swap":      return new vscode.ThemeIcon("arrow-swap");
        case "target":    return new vscode.ThemeIcon("milestone");
        case "path":      return new vscode.ThemeIcon("file-directory");
        case "timer":     return new vscode.ThemeIcon("clock");
        case "slice":     return new vscode.ThemeIcon("layers");
        case "scope":     return new vscode.ThemeIcon("symbol-namespace");
        case "snapshot":  return new vscode.ThemeIcon("history");
        default:          return undefined;
    }
}

export const unitTypeProperty: IItemPropertyInfo<UnitInfo> =
{
    propertyKey: "UnitType",
    displayName: vscode.l10n.t("Unit Type"),
    description: vscode.l10n.t("The type of the unit."),
    exampleValue: "service",
    isGroupable: true,
    isSortable: false,

    getValue: function (item: UnitInfo): string
    {
        return item.unitType;
    },
    getIcon: function (item: UnitInfo): vscode.ThemeIcon | undefined
    {
        return unitTypeIcon(item.unitType);
    },
    getGroupIcon: unitTypeIcon,
};

function unitActiveIcon(value: string): vscode.ThemeIcon | undefined
{
    // these are all possible values according to man systemctl(1)
    switch (value)
    {
        case "active":
            return new vscode.ThemeIcon("circle-filled", new vscode.ThemeColor("charts.green"));
        case "activating":
            return new vscode.ThemeIcon("circle-outline", new vscode.ThemeColor("charts.green"));
        case "inactive":
            return new vscode.ThemeIcon("debug-stop", new vscode.ThemeColor("charts.red"));
        case "deactivating":
            return new vscode.ThemeIcon("testing-failed-icon", new vscode.ThemeColor("charts.red"));
        case "failed":
            return new vscode.ThemeIcon("circle-outline", new vscode.ThemeColor("charts.red"));
        case "maintenance":
            return new vscode.ThemeIcon("wrench", new vscode.ThemeColor("charts.foreground"));
        case "reloading":
            return new vscode.ThemeIcon("debug-restart", new vscode.ThemeColor("charts.foreground"));
        case "refreshing":
            return new vscode.ThemeIcon("debug-restart-frame", new vscode.ThemeColor("charts.foreground"));
        default:
            return undefined;
    }
}

export const unitActiveProperty: IItemPropertyInfo<UnitInfo> =
{
    propertyKey: "Active",
    displayName: vscode.l10n.t("Active"),
    description: vscode.l10n.t("The high-level unit activation state, a generalization of Status."),
    exampleValue: "active",
    isGroupable: true,
    isSortable: false,

    getValue: function (item: UnitInfo): string
    {
        return item.active;
    },
    getIcon: function (item: UnitInfo): vscode.ThemeIcon | undefined
    {
        return unitActiveIcon(item.active);
    },
    getGroupIcon: unitActiveIcon,
};

export const unitStatusProperty: IItemPropertyInfo<UnitInfo> =
{
    propertyKey: "Status",
    displayName: vscode.l10n.t("Status"),
    description: vscode.l10n.t("The low-level unit activation state, values depend on unit type."),
    exampleValue: "running",
    isGroupable: true,
    isSortable: false,

    getValue: function (item: UnitInfo): string
    {
        return item.status;
    }
};

export const unitLoadedProperty: IItemPropertyInfo<UnitInfo> =
{
    propertyKey: "Loaded",
    displayName: vscode.l10n.t("Loaded"),
    description: vscode.l10n.t("Reflects whether the unit definition was properly loaded."),
    exampleValue: "loaded",
    isGroupable: true,
    isSortable: false,

    getValue: function (item: UnitInfo): string
    {
        return item.loaded;
    }
};

export const unitDescriptionProperty: IItemPropertyInfo<UnitInfo> =
{
    propertyKey: "Description",
    displayName: vscode.l10n.t("Description"),
    description: vscode.l10n.t("The description provided by the unit definition."),
    exampleValue: "Regular background program processing daemon",
    isGroupable: false,
    isSortable: true,

    getValue: function (item: UnitInfo): string
    {
        return item.description;
    }
};
