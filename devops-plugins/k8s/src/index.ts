#!/usr/bin/env node
import path from "path";
import { spawnSync } from "child_process";
import fs from "fs";
import fsExtras from "fs-extra";
import os from "os";

const helmChartsName = "godspeedsystems"
const helmChartsUrl = "https://godspeedsystems.github.io/helm-charts"

export async function repo(
  command: string
) {
  try {
    if (command == 'add') {
      spawnSync('helm', ['repo', command, helmChartsName, helmChartsUrl], { stdio: 'inherit' })
    } else if (command == 'update') {
      spawnSync('helm', ['repo', command, helmChartsName], { stdio: 'inherit' })
    } else if (command == 'remove') {
      spawnSync('helm', ['repo', command, helmChartsName], { stdio: 'inherit' })
    } else {
      throw new Error('Unsupported argument');
    }
  } catch (error: any) {
    throw error;
  }
}

export async function create_config(
  componentName: string,
  configDirPath?: string
) {
  try {
    const fileName = `${componentName}.yaml`
    const srcPath = path.resolve(os.homedir(), `.godspeed/devops-plugins/node_modules/k8s/${componentName}/${fileName}`);
    
    // check if devops-plugin k8s is added or not.
    if (!fsExtras.existsSync(srcPath)) {
      throw new Error(`${srcPath} does not exist`);
    }

    // Copy the config file in current directory if path is not provided else copy it to the provided directory.
    if (!configDirPath) {
      fs.copyFileSync(
        srcPath,
        path.resolve(process.cwd(), fileName)
      );
    } else {
      const isDirExist = fsExtras.existsSync(configDirPath);
      const destPath = path.resolve(configDirPath, fileName);

      // check if provided path exists or not. If it exists then copy the config file else create the directory then copy the config file.
      if (isDirExist) {
        fs.copyFileSync(
          srcPath,
          destPath
        );  
      } else {
        fsExtras.mkdirSync(path.resolve(configDirPath));
        fs.copyFileSync(
          srcPath,
          destPath
        );  
      }
    }

  } catch (error: any) {
    throw error;
  }
}

(async function main() {
create_config("argo-cd", "./abc");
})();