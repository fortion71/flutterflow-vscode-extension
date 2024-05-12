"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProjectConfig = exports.getProjectWorkingDir = void 0;
const os = require("os");
const vscode = require("vscode");
// import path = require("path");
// require("dotenv").config({
//   path: path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, "ff.env"),
// });
// const projectId =
//   process.env.FLUTTERFLOW_ACTIVE_PROJECT_ID ||
//   (vscode.workspace
//     .getConfiguration("flutterflow")
//     .get("activeProject") as string);
// const baseDir =
//   process.env.FLUTTERFLOW_BASE_DIR ||
//   (vscode.workspace
//     .getConfiguration("flutterflow")
//     .get("baseDirectory") as string) ||
//   path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, "..");
function validateProjectConfig(projectId) {
    if (projectId === "" || projectId === undefined) {
        vscode.window.showErrorMessage("Your flutterflow project ID not set. Please set Please set in vscode settings.");
        return false;
    }
    return true;
}
exports.validateProjectConfig = validateProjectConfig;
function getProjectWorkingDir(projectId, baseDir) {
    if (!validateProjectConfig(projectId)) {
        return undefined;
    }
    if (baseDir === "" || baseDir === undefined) {
        baseDir = ".";
    }
    if (os.platform() === "win32") {
        console.log(`getProjectWorkingDir : ${baseDir}`);
        return `${baseDir}`;
    }
    else {
        console.log(`getProjectWorkingDir : ${baseDir}`);
        return `${baseDir}`;
    }
}
exports.getProjectWorkingDir = getProjectWorkingDir;
//# sourceMappingURL=pathHelpers.js.map