import * as vscode from "vscode";
import * as os from "os";
import { execShell } from "./executeShell";
import {
  getProjectFolder,
  getProjectWorkingDir,
  tmpDownloadFolder,
} from "./pathHelpers";
import {
  gitStash,
  initalizeGit,
  isGitinitalized,
  shouldStash,
} from "./gitHelpers";
import path = require("path");

const downloadCode = async (config: { withAssets: boolean }) => {
  vscode.window.showInformationMessage("Starting flutterflow code download...");

  const token =
    process.env.FLUTTERFLOW_API_TOKEN ||
    vscode.workspace.getConfiguration("flutterflow").get("userApiToken");
  const projectId =
    process.env.FLUTTERFLOW_ACTIVE_PROJECT_ID ||
    vscode.workspace.getConfiguration("flutterflow").get("activeProject");
  const useGit =
    (process.env.FLUTTERFLOW_USE_GIT as unknown as boolean) ||
    (vscode.workspace.getConfiguration("flutterflow").get("useGit") as boolean);

  const openWindow =
    (process.env.FLUTTERFLOW_OPEN_DIR as unknown as boolean) ||
    (vscode.workspace
      .getConfiguration("flutterflow")
      .get("openDirectory") as boolean);

  let useGitFlag;
  if (useGit === undefined) {
    useGitFlag = false;
  } else {
    useGitFlag = useGit;
  }

  const baseDirPath =
    process.env.FLUTTERFLOW_BASE_DIR ||
    vscode.workspace.getConfiguration("flutterflow").get("baseDirectory") ||
    path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, "..");

  try {
    if (token === "" || token === undefined) {
      vscode.window.showErrorMessage(
        "Your FlutterFlow API token is not set. Please set in vscode settings."
      );
      const err = "FlutterFlow API token not set";
      throw err;
    }
    if (projectId === "" || projectId === undefined) {
      vscode.window.showErrorMessage(
        "Your flutterflow project ID not set. Please set Please set in vscode settings."
      );
      const err = "FlutterFlow project ID not set";
      throw err;
    }
    if (baseDirPath === vscode.workspace.workspaceFolders![0].uri.fsPath) {
      vscode.window.showInformationMessage(
        `Using the current workspace folder (${
          vscode.workspace.workspaceFolders![0].name
        }) as the base directory.`
      );
    }
    if (baseDirPath === "" || baseDirPath === undefined) {
      vscode.window.showErrorMessage(
        "Your flutterflow working directory is not set. Please set in vscode settings."
      );
      const err = "FlutterFlow working directory not set";
      throw err;
    }
    await execShell("dart pub global activate flutterflow_cli");

    const tmpPath = `${tmpDownloadFolder()}/${getProjectFolder()}`;
    try {
      if (os.platform() === "win32") {
        // TODO: Test Win32 code
        // if (config.withAssets) {
        //   await execShell(
        //     `rmdir /s /q ${getProjectWorkingDir()}\\${getProjectFolder()}`
        //   );
        // } else {
        //   await execShell(
        //     `for /d %i in (${getProjectWorkingDir()}\\${getProjectFolder()}\\*) do @if not "%~nxi" == "assets" rd /s /q "%i"`
        //   );
        // }
      } else {
        if (config.withAssets) {
          await execShell(`rm -rf ${tmpPath}`);
        } else {
          await execShell(
            `find ${tmpPath} -mindepth 1 -maxdepth 1 ! -name assets -exec rm -rf {} +`
          );
        }
      }
    } catch (err) {}

    if (config.withAssets === true) {
      await execShell(
        `dart pub global run flutterflow_cli export-code --project ${projectId} --dest ${tmpDownloadFolder()} --include-assets --token ${token}`
      );
    } else {
      await execShell(
        `dart pub global run flutterflow_cli export-code --project ${projectId} --dest ${tmpDownloadFolder()} --no-include-assets --token ${token}`
      );
    }

    if (useGitFlag) {
      try {
        if (await shouldStash()) {
          await gitStash();
        }
      } catch (err) {
        vscode.window.showErrorMessage("Could not stash current files");
        vscode.window.showErrorMessage(err as string);
      }
    }

    if (os.platform() === "win32") {
      await execShell(
        `xcopy /h /i /c /k /e /r /y  ${tmpDownloadFolder()}\\${getProjectFolder()} ${getProjectWorkingDir()}`
      );
      console.log("Copied all files");
    } else {
      await execShell(`cp -rf "${tmpPath}/" "${getProjectWorkingDir()}"`);
    }

    if (useGitFlag) {
      try {
        if (!(await isGitinitalized())) {
          await initalizeGit();
        }
      } catch (err) {
        vscode.window.showErrorMessage(
          "Could initialize git in project directory"
        );
        vscode.window.showErrorMessage(err as string);
      }
    }
    if (openWindow === true) {
      const folderUri = vscode.Uri.file(getProjectWorkingDir()!);
      vscode.commands.executeCommand(`vscode.openFolder`, folderUri);
    }

    vscode.window.showInformationMessage("Code download successful");
  } catch (err) {
    console.error(`
      Could not sync code \n
      ${err}
        `);
    vscode.window.showErrorMessage(`Could not download code \n
      ${err}
        `);
    console.error(err);
  }
};

export { downloadCode };
