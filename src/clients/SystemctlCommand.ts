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

import { IActionContext, NotImplementedError, UserCancelledError } from "@dviererbe/vscode-utils";
import { ListUnitFilesItem, ListUnitsItem } from "./contracts/systemctlCommand";
import { RuntimeSpecificCommandOptions, ScopedSystemctlCommandOptions, UnitSpecificSystemctlCommandOptions } from "./SystemctlCommandOptions";
import { exec, spawn } from "child_process";
import { ExtensionVariables } from "../extensionVariables";

export class SystemctlCommand
{
    public static async listUnits(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & {pattern?: string})
        : Promise<ListUnitsItem[]>
    {
        let systemdCommand = `list-units --${options.scope} --all --no-pager --output=json`;
        if (options.pattern)
        {
            // TODO: properly escape options.pattern
            systemdCommand += " " + options.pattern;
        }

        const output = await this.runSystemdCommand(context, systemdCommand);

        return JSON.parse(output) as ListUnitsItem[];
    }

    public static async listUnitFiles(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions)
        : Promise<ListUnitFilesItem[]>
    {
        let systemdCommand = `list-unit --${options.scope} --all --no-pager --output=json`;
        const output = await this.runSystemdCommand(context, systemdCommand);

        return JSON.parse(output) as ListUnitFilesItem[];
    }

    public static async listDependencies(
        _context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions)
        : Promise<string>
    {
        throwIfUnitNameIsAPattern(options.unit);
        throw new NotImplementedError("listDependencies", this);
    }

    public static async status(
        _context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions)
        : Promise<string>
    {
        throwIfUnitNameIsAPattern(options.unit);
        throw new NotImplementedError("status", this);
    }

    public static async show(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions)
        : Promise<string>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let systemdCommand = `show --${options.scope} --all --no-pager --output=json`;
        return await this.runSystemdCommand(context, systemdCommand);
    }

    public static async cat(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions)
        : Promise<string>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let systemdCommand = `cat --no-pager --${options.scope} '${options.unit}'`;
        return await this.runSystemdCommand(context, systemdCommand);
    }

    public static async edit(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions
                 & UnitSpecificSystemctlCommandOptions
                 & RuntimeSpecificCommandOptions
                 & { definition: string } )
        : Promise<void>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let args = [ "edit", `--${options.scope}`, "--full", "--force", "--stdin" ];

        if (options.runtime)
        {
            args.push("--runtime");
        }

        args.push(options.unit);

        await this.runSystemdCommandV2(context, {
            args: args,
            requestElevatedPermissions: options.scope === "system",
            stdin: options.definition,
        });
    }

    public static async enable(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions & RuntimeSpecificCommandOptions)
        : Promise<void>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let systemdCommand = `enable --${options.scope} ${runtimeFlag(options)} '${options.unit}'`;
        await this.runSystemdCommand(context, systemdCommand, options.scope === "system");
    }

    public static async disable(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions & RuntimeSpecificCommandOptions)
        : Promise<void>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let systemdCommand = `disable --${options.scope} ${runtimeFlag(options)} '${options.unit}'`;
        await this.runSystemdCommand(context, systemdCommand, options.scope === "system");
    }

    public static async start(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions)
        : Promise<void>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let systemdCommand = `start --${options.scope} '${options.unit}'`;
        await this.runSystemdCommand(context, systemdCommand, options.scope === "system");
    }

    public static async stop(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions)
        : Promise<void>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let systemdCommand = `stop --${options.scope} '${options.unit}'`;
        await this.runSystemdCommand(context, systemdCommand, options.scope === "system");
    }

    public static async restart(
        context: IActionContext,
        options: ScopedSystemctlCommandOptions & UnitSpecificSystemctlCommandOptions)
        : Promise<void>
    {
        throwIfUnitNameIsAPattern(options.unit);
        let systemdCommand = `restart --${options.scope} '${options.unit}'`;
        await this.runSystemdCommand(context, systemdCommand, options.scope === "system");
    }

    public static async daemonReload(context: IActionContext, options: ScopedSystemctlCommandOptions): Promise<void>
    {
        let systemdCommand = `daemon-reload --${options.scope}`;
        await this.runSystemdCommand(context, systemdCommand, options.scope === "system");
    }

    private static async runSystemdCommandV2(
        context: IActionContext,
        options: {
            args?: string[],
            requestElevatedPermissions?: boolean,
            stdin?: string,
        })
        : Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            const startTime: number = Date.now();

            try
            {
                let exit = false;
                const proc =
                    options.requestElevatedPermissions
                    ? spawn("pkexec", [ "systemctl", ...options.args ?? [] ], { shell: true })
                    : spawn("systemctl", options.args ?? [], { shell: true });

                const chunks: Buffer[] = [];

                proc.on('close', (code: number | null) =>
                {
                    exit = true;
                    const durationMs: number = Date.now() - startTime;

                    let logMessage = "$ ";
                    if (options.requestElevatedPermissions)
                    {
                        logMessage += "pkexec ";
                    }
                    else
                    {
                        logMessage += "systemctl";
                    }

                    if (options.args)
                    {
                        logMessage += " " + options.args.join(" ");
                    }

                    logMessage += ` [${durationMs}ms}]`;
                    logMessage += ` (Exit Code: ${code})`;

                    try
                    {
                        const output = Buffer.concat(chunks).toString();
                        logMessage += "\n" + output;

                        if (code === 0)
                        {
                            resolve(output);
                            return;
                        }
                        if (output.includes("Request dismissed"))
                        {
                            reject(new UserCancelledError(context.callbackId));
                            return;
                        }

                        reject(new Error(output));
                    }
                    catch (error)
                    {
                        reject(error);
                        ExtensionVariables.defaultLogOutputChannel.warn(logMessage);
                        return;
                    }

                    ExtensionVariables.defaultLogOutputChannel.debug(logMessage);
                });
                proc.stdout.on('data', chunk =>
                {
                    chunks.push(chunk);
                });
                proc.stderr.on('data', chunk =>
                {
                    chunks.push(chunk);
                });

                if (options.stdin && !exit)
                {
                    proc.stdin.write(options.stdin);
                    proc.stdin.end();
                }
            }
            catch (error)
            {
                ExtensionVariables.defaultLogOutputChannel.warn("Failed to spawn systemctl command: ", Object.assign(options, {error: Error}));
                reject(error);
            }
        });
    }

    private static runSystemdCommand(
        context: IActionContext,
        command:string,
        requestElevatedPermissions: boolean = false)
        : Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            let cmd = `systemctl ${command}`;

            if (requestElevatedPermissions)
            {
                cmd = `pkexec ${cmd}`;
            }

            const startTime: number = Date.now();
            exec(cmd, (error, stdout, _stderr) =>
            {
                const durationMs: number = Date.now() - startTime;

                if (error)
                {
                    if (error !== null && error.message.includes("Request dismissed"))
                    {
                        throw new UserCancelledError(context.callbackId);
                    }

                    reject(error);

                    let message = `$ ${cmd} [${durationMs}ms}]`;

                    if (error.code)
                    {
                        message += ` (Exit Code: ${error.code})`;
                    }
                    if (error.stdout)
                    {
                        message += "\nstdout: " + error.stdout;
                    }
                    if (error.stderr)
                    {
                        message += "\nstderr: " + error.stderr;
                    }

                    ExtensionVariables.defaultLogOutputChannel.warn(message);
                }
                else
                {
                    resolve(stdout);
                    ExtensionVariables.defaultLogOutputChannel.debug(`$ ${cmd} [${durationMs}ms]`);
                }
            });
        });
    }
}

function runtimeFlag(options: RuntimeSpecificCommandOptions)
{
    return options.runtime ? "--runtime" : "";
}

const systemdPattern = /[*?[\]]/g;
function throwIfUnitNameIsAPattern(unitName: string): void
{
    if (systemdPattern.test(unitName))
    {
        throw new Error(`Unit name "${unitName}" contains systemd pattern symbols (*, ?, [, ]), which is not yet supported.`);
    }
}
