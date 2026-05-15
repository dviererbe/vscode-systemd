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
import {registerExtensionVariables, createLogOutputChanel} from "@dviererbe/vscode-utils";
import {ExtensionVariables} from "./extensionVariables";
import {registerTrees} from "./trees/registerTrees";
import {registerCommands} from "./commands/registerCommands";
import { registerLanguageServices } from "./language/registerLanguageServices";

function initializeExtensionVariables(ctx: vscode.ExtensionContext): void
{
    ExtensionVariables.context = ctx;
    ExtensionVariables.defaultLogOutputChannel = createLogOutputChanel(ctx, "systemd");

    registerExtensionVariables(ExtensionVariables);
}

export async function activate(context: vscode.ExtensionContext)
{
    initializeExtensionVariables(context);

    registerCommands();
    registerTrees();
    registerLanguageServices();

    ExtensionVariables.defaultLogOutputChannel.trace("Extension activated.");
}

export function deactivate()
{
}
