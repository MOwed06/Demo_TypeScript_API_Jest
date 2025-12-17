import { ChildProcess, spawn } from "node:child_process";
import Logger from "./logger";
import { waitSeconds } from "./time-helper";

let processID: number | undefined = undefined;

// execute command from path as background task
// wait for delay (seconds) before returning
// return false if error
export async function startProcess(
  command: string,
  path: string,
  delaySec: number
): Promise<boolean> {
  Logger.debug(`startProcess:  ${command}`);
  try {
    const backgroundProcess: ChildProcess = spawn(command, [], {
      cwd: path,
      detached: true,
      stdio: ["ignore", "ignore", "pipe"],
      shell: true,
    });

    processID = backgroundProcess.pid;
    Logger.debug(`Process PID: ${processID}`);

    backgroundProcess.stderr?.on("data", (chunk: Buffer) => {
      const errorMessage = chunk.toString().trim();
      Logger.error(errorMessage);
    });

    // listen for exit event
    backgroundProcess.on("exit", (code: number | null) => {
      Logger.info(`Background process ${processID} exited with code ${code}`);
    });

    await waitSeconds(delaySec);

    backgroundProcess.unref();
    return true;
  } catch (err) {
    Logger.error(err);
    return false;
  }
}

// if background process exists, stop it
export function endProcess() {
  Logger.debug(`endProcess:  ${processID}`);
  if (processID) {
    spawn("taskkill", ["/pid", processID.toString(), "/f", "/t"]);
  }
}
