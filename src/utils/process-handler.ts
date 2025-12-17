import { ChildProcess, spawn } from "node:child_process";
import logger from "./logger";
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
  logger.debug(`startProcess:  ${command}`);
  try {
    const backgroundProcess: ChildProcess = spawn(command, [], {
      cwd: path,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    processID = backgroundProcess.pid;
    logger.debug(`Process PID: ${processID}`);

    backgroundProcess.stdout?.on("data", (chunk: Buffer) => {
      const nextMessage = chunk.toString().trim();
      logger.debug(nextMessage);
    });

    backgroundProcess.stderr?.on("data", (chunk: Buffer) => {
      const errorMessage = chunk.toString().trim();
      logger.error(errorMessage);
    });

    // listend for exit event
    backgroundProcess.on("exit", (code: number | null) => {
      logger.debug(`Background process ${processID} exited with code ${code}`);
    });

    await waitSeconds(delaySec);

    //backgroundProcess.unref();
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

// if background process exists, stop it
export function endProcess() {
  logger.debug(`endProcess:  ${processID}`);
  if (processID != null) {
    spawn("taskkill", ["/pid", processID.toString(), "/f", "/t"]);
  }
}
