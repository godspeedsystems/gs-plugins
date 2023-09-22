#!/usr/bin/env node
import path from "path";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import yaml from 'yaml';
import { Command } from "commander";

const helmChartsName = "godspeedsystems"
const helmChartsUrl = "https://godspeedsystems.github.io/helm-charts"

export async function create_config(
  componentName: string,
  configDirPath?: string
) {
  try {
    const fileName = `${componentName}.yaml`
    const srcPath = path.resolve(os.homedir(), `.godspeed/devops-plugins/node_modules/k8s/${componentName}/${fileName}`);
    
    // check if devops-plugin k8s is added or not.
    if (!fs.existsSync(srcPath)) {
      throw new Error(`${srcPath} does not exist`);
    }

    // Copy the config file in current directory if path is not provided else copy it to the provided directory.
    if (!configDirPath) {
      fs.copyFileSync(
        srcPath,
        path.resolve(process.cwd(), fileName)
      );
    } else {
      const isDirExist = fs.existsSync(configDirPath);
      const destPath = path.resolve(configDirPath, fileName);

      // check if provided path exists or not. If it exists then copy the config file else create the directory then copy the config file.
      if (isDirExist) {
        fs.copyFileSync(
          srcPath,
          destPath
        );  
      } else {
        fs.mkdirSync(path.resolve(configDirPath), { recursive: true });
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

export async function install(
  componentName: string,
  configFilePath: string
) {
  try {
    // check if configFilePath exists or not
    if (!fs.existsSync(configFilePath)) {
      throw new Error(`${configFilePath} does not exist`);
    }

    const configFileYaml = yaml.parse(fs.readFileSync(configFilePath, { encoding: 'utf-8' }));

    console.log(`helm install ${componentName} godspeedsystems/${componentName} -f ${configFilePath} --create-namespace -n ${configFileYaml.namespace}`);
    spawnSync('helm', ['repo', 'add', helmChartsName, helmChartsUrl], { stdio: 'inherit' })
    //spawnSync('helm', ['install', componentName, `godspeedsystems/${componentName}`, '-f', configFilePath], { stdio: 'inherit' })
    spawnSync('helm', ['install', componentName, `godspeedsystems/${componentName}`, '-f', configFilePath, '--create-namespace', '-n', configFileYaml.namespace], { stdio: 'inherit' })
  } catch (error: any) {
    throw error;
  }
}

export async function update(
  componentName: string,
  configFilePath: string
) {
  try {
    //console.log(`helm upgrade ${componentName} godspeedsystems/${componentName} -f ${configFilePath}`);
    spawnSync('helm', ['upgrade', componentName, `godspeedsystems/${componentName}`, '-f', configFilePath], { stdio: 'inherit' })
  } catch (error: any) {
    throw error;
  }
}

export async function remove(
  componentName: string,
  configFilePath: string
) {
  try {
    // check if configFilePath exists or not
    if (!fs.existsSync(configFilePath)) {
      throw new Error(`${configFilePath} does not exist`);
    }

    const configFileYaml = yaml.parse(fs.readFileSync(configFilePath, { encoding: 'utf-8' }));
    //console.log(`helm upgrade ${componentName} godspeedsystems/${componentName} -f ${configFilePath}`);
    spawnSync('helm', ['delete', componentName, '-n', configFileYaml.namespace], { stdio: 'inherit' })
  } catch (error: any) {
    throw error;
  }
}

(async function main() {

  const program = new Command();
  program.showHelpAfterError();
  program.showSuggestionAfterError(true);

  program
  .command("create-config")
  .description("create configuration file for the specified component")
  .argument("<componentName>", "component name")
  .action((componentName) => {
    create_config(componentName);
  });

  program
  .command("install")
  .description("install the specified component on kubernetes")
  .argument("<componentName>", "component name")
  .argument("<configFilePath>", "path to the configuration file")
  .action((componentName, configFilePath) => {
    install(componentName, configFilePath);
  });  

  program
  .command("update")
  .description("update the specified component on kubernetes")
  .argument("<componentName>", "component name")
  .argument("<configFilePath>", "path to the configuration file")
  .action((componentName, configFilePath) => {
    update(componentName, configFilePath);
  });  

  program
  .command("remove")
  .description("remove the specified component on kubernetes")
  .argument("<componentName>", "component name")
  .argument("<configFilePath>", "path to the configuration file")
  .action((componentName, configFilePath) => {
    remove(componentName, configFilePath);
  });   
  
  
  //create_config("argo-cd");
  //install("argo-cd", "./argo-cd.yaml");
  //update("argo-cd", "./argo-cd.yaml");
  //remove("argo-cd", "./argo-cd.yaml");

  program.parse();
})();