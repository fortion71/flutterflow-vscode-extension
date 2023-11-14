import * as os from "os";
import * as vscode from "vscode";
import path = require("path");
require("dotenv").config({
  path: path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, "ff.env"),
});

const projectId =
  process.env.FLUTTERFLOW_ACTIVE_PROJECT_ID ||
  (vscode.workspace
    .getConfiguration("flutterflow")
    .get("activeProject") as string);

const baseDir =
  process.env.FLUTTERFLOW_BASE_DIR ||
  (vscode.workspace
    .getConfiguration("flutterflow")
    .get("baseDirectory") as string) ||
  path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, "..");

function validatePathConfig(): boolean {
  if (projectId === "" || projectId === undefined) {
    vscode.window.showErrorMessage(
      "Your flutterflow project ID not set. Please set Please set in vscode settings."
    );
    return false;
  }
  if (baseDir === "" || baseDir === undefined) {
    vscode.window.showErrorMessage(
      "Your flutterflow working directory is not set. Please set in vscode settings."
    );
    return false;
  }
  return true;
}

function getProjectWorkingDir(): string | undefined {
  if (!validatePathConfig()) {
    return undefined;
  }

  if (os.platform() === "win32") {
    console.log(`getProjectWorkingDir : ${baseDir}\\${getProjectFolder()} `);
    return `${baseDir}\\${getProjectFolder()}`;
  } else {
    console.log(`getProjectWorkingDir : ${baseDir}/${getProjectFolder()} `);
    return `${baseDir}/${getProjectFolder()}`;
  }
}

function tmpDownloadFolder(): string {
  if (os.platform() === "win32") {
    return `%TMP%\\flutterflow`;
  } else {
    return `${os.tmpdir()}/flutterflow`;
  }
}

function getProjectFolder(): string | undefined {
  if (!validatePathConfig()) {
    return undefined;
  }

  if (process.env.FLUTTERFLOW_PROJECT_NAME) {
    // convert a string like "RecommendSocialMedia" to "recommend_social_media"
    const re = /([A-Z])/g;
    const folderName = process.env.FLUTTERFLOW_PROJECT_NAME.replace(re, "_$1")
      .toLowerCase()
      .slice(1);

    return folderName;
  }

  const re = /-/gi;
  return projectId // TODO: Need to fix bug where this doesn't work if the project name is changed after initial creation (project id is static, so doesn't get updated). For now, just allowing FLUTTERFLOW_PROJECT_NAME to override projectId
    .replace(re, "_")
    .slice(0, projectId.lastIndexOf("-"));
  // return folderName;
}

export {
  getProjectWorkingDir,
  validatePathConfig,
  getProjectFolder,
  tmpDownloadFolder,
};
