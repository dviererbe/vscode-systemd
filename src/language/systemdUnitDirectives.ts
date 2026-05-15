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

export interface DirectiveInfo
{
    section: string;
    description: string;
}

export const systemdUnitDirectives: Readonly<Record<string, DirectiveInfo>> = {
    // [Unit] section
    Requires: {
        section: "Unit",
        description:
            "A space-separated list of units this unit **requires**. If any listed unit fails to start or is stopped, " +
            "this unit will also be stopped.\n\n" +
            "Unlike `Wants=`, a failed dependency causes this unit to fail as well. " +
            "Does not imply ordering — combine with `After=` if the dependency must also start first.",
    },
    After: {
        section: "Unit",
        description:
            "A space-separated list of units that must be **fully started** before this unit is started. " +
            "This is a pure ordering constraint and does not imply a dependency — combine with `Requires=` or `Wants=` if the dependency must also be present.\n\n" +
            "The inverse of `Before=`.",
    },
    Description: {
        section: "Unit",
        description:
            "A short human-readable title of this unit. This string may be used by `systemctl status` and other tools to identify the unit.\n\n" +
            "Unlike `Documentation=`, this is not used as a URL or man page reference — it is a free-form description string.",
    },

    // [Service] section
    TimeoutStartSec: {
        section: "Service",
        description:
            "Configures the time to wait for start-up. If the service does not signal start-up completion within this time, " +
            "it will be considered failed and shut down again.\n\n" +
            "Takes a unit-less value in seconds or a time span such as `5min 20s`. " +
            "Set to `0` to disable the timeout entirely.",
    },
    Restart: {
        section: "Service",
        description:
            "Configures whether the service shall be restarted when the service process exits, is killed, or a timeout is reached.\n\n" +
            "| Value | Restarts when |\n" +
            "|---|---|\n" +
            "| `no` | Never (default) |\n" +
            "| `on-success` | Clean exit (code 0) or clean signal |\n" +
            "| `on-failure` | Non-zero exit, signal, timeout, watchdog |\n" +
            "| `on-abnormal` | Signal, timeout, or watchdog |\n" +
            "| `on-abort` | Uncaught signal only |\n" +
            "| `always` | Unconditionally |",
    },
    RestartSec: {
        section: "Service",
        description:
            "Configures the time to sleep before restarting a service after `Restart=` triggers a restart.\n\n" +
            "Takes a unit-less value in seconds or a time span such as `30s` or `1min`. Defaults to `100ms`.",
    },
    ExecStartPre: {
        section: "Service",
        description:
            "Additional commands that are executed **before** the command in `ExecStart=`.\n\n" +
            "If any `ExecStartPre=` command (without a `-` prefix) fails, the remaining commands are skipped and the unit transitions to a failure state.\n\n" +
            "Prefix the path with `-` (e.g. `-/bin/cmd`) to allow a non-zero exit code without failing the unit.",
    },
    ExecStart: {
        section: "Service",
        description:
            "The command (with arguments) to execute when the service is started.\n\n" +
            "For `Type=oneshot` services, multiple commands may be listed. For all other types, only one `ExecStart=` is allowed.\n\n" +
            "Prefix with `-` to ignore a non-zero exit code. Use `\\\\` at the end of a line to continue arguments on the next line.",
    },
    ExecStop: {
        section: "Service",
        description:
            "Commands to execute to stop the service started via `ExecStart=`.\n\n" +
            "If not specified, the process is killed with `SIGTERM` (and then `SIGKILL` after `TimeoutStopSec=`).\n\n" +
            "Prefix with `-` to allow a non-zero exit code without failing the stop operation.",
    },

    // [Install] section
    WantedBy: {
        section: "Install",
        description:
            "A space-separated list of unit names. When this unit is **enabled** (via `systemctl enable`), " +
            "a `Wants=` dependency pointing to this unit is added to each of the listed units.\n\n" +
            "Most services use `multi-user.target` (non-graphical multi-user system) or `graphical.target`.",
    },
};
