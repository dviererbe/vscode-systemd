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

import {
    registerCommand,
    registerOpenUrlCommand,
    registerReportIssueCommand,
} from "@dviererbe/vscode-utils";
import { openUnitDefinitionFile } from "./units/openUnitDefinitionFile";
import { showPlotView } from "./general/showPlotView";
import { refershUnitsExplorer } from "./units/refershUnitsExplorer";
import { copyUnitFileNameToClipboard } from "./units/copyUnitFileNameToClipboard";
import { copyUnitNameToClipboard } from "./units/copyUnitNameToClipboard";
import { startUnit } from "./units/startUnit";
import { stopUnit } from "./units/stopUnit";
import { disableUnit } from "./units/disableUnit";
import { disableUnitUntilRestart } from "./units/disableUnitUntilRestart";
import { enableUnitUntilRestart } from "./units/enableUnitUntilRestart";
import { enableUnit } from "./units/enableUnit";
import { restartUnit } from "./units/restartUnit";
import { throwError } from "./general/throwError";
import { configureUnitsExplorer } from "./units/configureUnitsExplorer";
import { installUnitFile } from "./units/installUnitFile";
import { showJournal } from "./units/showJournal";
import { configureUnitsFilter } from "./units/configureUnitsFilter";
import { resetUnitsFilter } from "./units/resetUnitsFilter";
import { reloadDaemon } from "./general/reloadDaemon";
import { reloadSystemDaemon } from "./general/reloadSystemDaemon";
import { reloadUserDaemon } from "./general/reloadUserDaemon";

export function registerCommands(): void
{
    registerOpenUrlCommand();
    registerReportIssueCommand();

    const defaultCommandDebounceInMs = 600;

    registerCommand({
        commandId: "vscode-systemd.plot",
        callback: showPlotView,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.reloadDaemon",
        callback: reloadDaemon,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.reloadSystemDaemon",
        callback: reloadSystemDaemon,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.reloadUserDaemon",
        callback: reloadUserDaemon,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.refresh",
        callback: (context) => refershUnitsExplorer(context),
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.configureExplorer",
        callback: (context) => configureUnitsExplorer(context),
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.configureFilter",
        callback: (context) => configureUnitsFilter(context),
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.resetFilter",
        callback: (context) => resetUnitsFilter(context),
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.openDefinitionFile",
        callback: openUnitDefinitionFile,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.copyUnitFileName",
        callback: copyUnitFileNameToClipboard,
        // this is a very cheap operation, no debounce needed
    });
    registerCommand({
        commandId: "vscode-systemd.units.copyUnitName",
        callback: copyUnitNameToClipboard,
        // this is a very cheap operation, no debounce needed
    });
    registerCommand({
        commandId: "vscode-systemd.units.disableUnit",
        callback: disableUnit,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.disableUnitUntilRestart",
        callback: disableUnitUntilRestart,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.enableUnit",
        callback: enableUnit,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.enableUnitUntilRestart",
        callback: enableUnitUntilRestart,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.startUnit",
        callback: startUnit,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.stopUnit",
        callback: stopUnit,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.restartUnit",
        callback: restartUnit,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.installUnitFile",
        callback: installUnitFile,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.units.showJournal",
        callback: showJournal,
        debounce: defaultCommandDebounceInMs,
    });
    registerCommand({
        commandId: "vscode-systemd.throwError",
        callback: throwError,
    });
}
