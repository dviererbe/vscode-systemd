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
import { ExtensionVariables } from "../extensionVariables";
import { callWithErrorHandling, getExtensionInfo } from "@dviererbe/vscode-utils";

const refreshIntervalConfigKey = "refreshInterval";
const defaultRefreshInterval = 5000;
const refreshDebounceDelayMs = 500;

export class RefreshManager implements vscode.Disposable
{
    private readonly configSection: string;
    private currentRefreshInterval?: number;
    private intervalTimer?: NodeJS.Timeout;
    private configChangeWatcher?: vscode.Disposable;
    private lastRefresh: number | undefined;

    public constructor()
    {
        this.configSection = getExtensionInfo().extensionName;
        this.setupRefreshOnInterval();
    }

    private setupRefreshOnInterval(): void
    {
        this.currentRefreshInterval ??= this.readRefreshIntervalFromConfig();

        if (this.currentRefreshInterval > 0)
        {
            this.intervalTimer ??= setInterval(this.refresh.bind(this), this.currentRefreshInterval);
        }

        this.configChangeWatcher ??= vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this);
    }

    private readRefreshIntervalFromConfig(): number
    {
        let refreshInterval =
            vscode.workspace
            .getConfiguration(this.configSection)
            .get<number>(refreshIntervalConfigKey, defaultRefreshInterval);

        if (refreshInterval <= 0) return 0;
        if (refreshInterval <= refreshDebounceDelayMs) return refreshDebounceDelayMs;
        return refreshInterval;
    }

    private onDidChangeConfiguration(event: vscode.ConfigurationChangeEvent)
    {
        if (!event.affectsConfiguration(this.configSection)) return;

        const newRefreshInterval = this.readRefreshIntervalFromConfig();

        if (this.currentRefreshInterval !== newRefreshInterval)
        {
            this.currentRefreshInterval = newRefreshInterval;
            clearInterval(this.intervalTimer);
            this.intervalTimer = undefined;
            this.setupRefreshOnInterval();
        }
    }


    private refresh(): void
    {
        if (this.lastRefresh && this.lastRefresh + refreshDebounceDelayMs > Date.now()) return;
        this.lastRefresh = Date.now();

        callWithErrorHandling("refreshOnInterval", (context) =>
        {
            ExtensionVariables.unitsTree.refresh(context, undefined);
        });
    }

    dispose()
    {
        clearInterval(this.intervalTimer);
        this.configChangeWatcher?.dispose();
    }
}
