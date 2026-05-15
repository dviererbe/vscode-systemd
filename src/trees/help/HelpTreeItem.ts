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
    ExParentTreeItem,
    ExTreeItem,
    GenericTreeItem,
    getExtensionInfo,
    IActionContext, OpenUrlTreeItem, ReportIssueTreeItem
} from "@dviererbe/vscode-utils";
import vscode from "vscode";

export class HelpTreeItem extends ExParentTreeItem
{
    public readonly label: string = vscode.l10n.t("Help and Feedback");
    public readonly contextValue: string = "help";

    public override compareChildrenImpl(item1: ExTreeItem, item2: ExTreeItem): number
    {
        // default sorting is based on the label which is being displayed to user.
        // use id to control the order being displayed
        return Number(item1.id!) - Number(item2.id!);
    }

    private items: GenericTreeItem[] | undefined;
    public override async loadMoreChildrenImpl(_context: IActionContext, _clearCache: boolean): Promise<ExTreeItem[]>
    {
        if (!this.items)
        {
            let id: number = 0;
            this.items = [
                new OpenUrlTreeItem(this, {
                    id: String(id++),
                    label: vscode.l10n.t("systemd documentation"),
                    url: "https://systemd.io/",
                    iconPath: new vscode.ThemeIcon("remote-explorer-documentation"),
                }),
                new OpenUrlTreeItem(this, {
                    id: String(id++),
                    label: vscode.l10n.t("systemd man pages"),
                    url: "https://www.freedesktop.org/software/systemd/man/latest/index.html",
                    iconPath: new vscode.ThemeIcon("remote-explorer-documentation"),
                }),
                new OpenUrlTreeItem(this, {
                    id: String(id++),
                    label: vscode.l10n.t("Review existing issues of the systemd extension"),
                    url: getExtensionInfo().bugsUrl!,
                    iconPath: new vscode.ThemeIcon("remote-explorer-review-issues"),
                }),
                new ReportIssueTreeItem(this, {
                    id: String(id++),
                })
            ];
        }

        return this.items;
    }

    protected override hasMoreChildrenImpl(): boolean
    {
        return false;
    }
}
