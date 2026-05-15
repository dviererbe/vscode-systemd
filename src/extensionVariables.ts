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
import { ExTreeDataProvider, ExTreeItem } from "@dviererbe/vscode-utils";
import { UnitsTreeItem } from "./trees/units/UnitsTreeItem";

export namespace ExtensionVariables
{
    export let context: vscode.ExtensionContext;
    export let defaultLogOutputChannel: vscode.LogOutputChannel;

    export let systemUnitsTree: ExTreeDataProvider;
    export let systemUnitsTreeView: vscode.TreeView<ExTreeItem>;
    export let systemUnitsRoot: UnitsTreeItem;

    export let userUnitsTree: ExTreeDataProvider;
    export let userUnitsTreeView: vscode.TreeView<ExTreeItem>;
    export let userUnitsRoot: UnitsTreeItem;
}
