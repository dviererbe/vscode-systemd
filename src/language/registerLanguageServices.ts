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

import { ExtensionVariables } from "../extensionVariables";
import * as vscode from "vscode";
import { SystemdUnitFoldingRangeProvider } from "./SystemdUnitFoldingRangeProvider";
import { SystemdUnitHoverProvider } from "./SystemdUnitHoverProvider";
import { SystemdUnitDefinitionProvider } from "./SystemdUnitDefinitionProvider";
import { SystemdUnitDocumentSymbolProvider } from "./SystemdUnitDocumentSymbolProvider";
import { SystemdUnitLanguageId } from "./constants";

export function registerLanguageServices(): void
{
    const selector = { language: SystemdUnitLanguageId };

    ExtensionVariables.context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(selector, new SystemdUnitFoldingRangeProvider()),
        vscode.languages.registerHoverProvider(selector, new SystemdUnitHoverProvider()),
        vscode.languages.registerDefinitionProvider(selector, new SystemdUnitDefinitionProvider()),
        vscode.languages.registerDocumentSymbolProvider(selector, new SystemdUnitDocumentSymbolProvider()),
    );
}
