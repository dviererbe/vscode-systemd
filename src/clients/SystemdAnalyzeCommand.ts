import { exec } from "child_process";
import { ExtensionVariables } from "../extensionVariables";

export class SystemdAnalyzeCommand
{
    public static plot(): Promise<string>
    {
        return this.runSystemdCommand("plot");
    }

    public async verify(): Promise<string>
    {
        return "";
    }

    private static runSystemdCommand(command:string): Promise<string>
        {
            return new Promise((resolve, reject) =>
            {
                const cmd = `systemd-analyze ${command}`;
                const startTime: number = Date.now();
                exec(cmd, (error, stdout, _stderr) =>
                {
                    const durationMs: number = Date.now() - startTime;

                    if (error)
                    {
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
