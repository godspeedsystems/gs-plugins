#!/usr/bin/env node
import path from "path";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import yaml from 'yaml';
import { Command } from "commander";
import { readdir } from 'fs/promises';

const helmChartsName = "godspeedsystems"
const helmChartsUrl = "https://godspeedsystems.github.io/helm-charts"

// @ts-ignore
let { name } = require(path.join(__dirname, '../package.json'));
let program: Command;

function isHelmInstalled() {
  try {
    // Run the helm version command
    spawnSync('helm version');
    return true;
  } catch (error) {
    // If an error occurs, Helm is not installed
    return false;
  }
}

function createConfig(
  componentName: string,
  options: PlainObject
) {
  try {
    if (!isHelmInstalled()) {
      console.log("Helm is not installed. Please make sure helm binary is installed.");
      return;
    }

    const fileName = `${componentName}.yaml`
    const pluginPath = path.resolve(os.homedir(), `.godspeed/devops-plugins/node_modules/${name}/`);
    const srcPath = path.resolve(os.homedir(), `.godspeed/devops-plugins/node_modules/${name}/src/${componentName}/${fileName}`);

    // check if devops-plugin k8s is added or not.
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`k8s is not added.`);
    }    

    // check if devops-plugin k8s is added or not.
    if (!fs.existsSync(srcPath)) {
      throw new Error(`${componentName} is not a k8s component.`);
    }

    // Copy the config file in current directory if path is not provided else copy it to the provided directory.
    if (!options.path) {
      fs.copyFileSync(
        srcPath,
        path.resolve(process.cwd(), fileName)
      );
      console.log(`Configuration file is created in ${process.cwd()}`);
    } else {
      const isDirExist = fs.existsSync(options.path);
      const destPath = path.resolve(options.path, fileName);

      // check if provided path exists or not. If it exists then copy the config file else create the directory then copy the config file.
      if (isDirExist) {
        fs.copyFileSync(
          srcPath,
          destPath
        );  
      } else {
        fs.mkdirSync(path.resolve(options.path), { recursive: true });
        fs.copyFileSync(
          srcPath,
          destPath
        );  
      }
      console.log(`Configuration file is created in ${options.path}`);
    }
  } catch (error: any) {
    throw error;
  }
}

function install(
  componentName: string,
  configFilePath: string
) {
  try {
    if (!isHelmInstalled()) {
      console.log("Helm is not installed. Please make sure helm binary is installed.");
      return;
    }

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

function update(
  componentName: string,
  configFilePath: string
) {
  try {
    if (!isHelmInstalled()) {
      console.log("Helm is not installed. Please make sure helm binary is installed.");
      return;
    }

    //console.log(`helm upgrade ${componentName} godspeedsystems/${componentName} -f ${configFilePath}`);
    spawnSync('helm', ['upgrade', componentName, `godspeedsystems/${componentName}`, '-f', configFilePath], { stdio: 'inherit' })
  } catch (error: any) {
    throw error;
  }
}

function remove(
  componentName: string,
  configFilePath: string
) {
  try {
    if (!isHelmInstalled()) {
      console.log("Helm is not installed. Please make sure helm binary is installed.");
      return;
    }

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

function list() {
  try {
    if (!isHelmInstalled()) {
      console.log("Helm is not installed. Please make sure helm binary is installed.");
      return;
    }

    let componentList = [];
    const k8sPath = path.resolve(path.dirname(__filename), `../src`);

    fs.readdir(k8sPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }
    
      // Filter out only directories
      const components = files.filter(file => file.isDirectory()).map(directory => directory.name);
    
      if (components.length > 0) {
        console.log("List of k8s components:");
        components.forEach(element => {
          console.log(`-> ${element}`);
        });
    }
    });

    // for (const component of components) {
    //   if (component.isDirectory()) {
    //     componentList.push(component.name)
    //   }
    // }

    // if (componentList.length > 0) {
    //   console.log("List of k8s components:");
    //   componentList.forEach(element => {
    //     console.log(`-> ${element}`);
    //   });
    // }
  } catch (error: any) {
    throw error;
  }
}

(async function main() {

  program = new Command();
  program.description("k8s manages godspeed components on Kubernetes.");
  program.showHelpAfterError();
  program.showSuggestionAfterError(true);

  program
  .allowUnknownOption(true)
  .action(() => {
    program.help();
  });

  program
  .command("create-config")
  .description("create configuration file for the specified component")
  .argument("<componentName>", "component name")
  .option(
    "--path <path>",
    "directory path to create config file"
  )
  .action(async (componentName, options) => {
    createConfig(componentName, options);
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
  
  program
  .command("list")
  .description("list all the k8s components")
  .action(() => {
    list();
  });    

  program.parse(process.argv);
})();

export { program };
