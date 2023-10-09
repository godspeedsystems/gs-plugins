import Generator from 'yeoman-generator';
import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { execSync } from 'child_process';
import latestVersion from 'latest-version';
import ora from 'ora';

export default class extends Generator {
  initializing() {
    this.log("\n")
    this.log(colors.magenta("       ,_,   ") + colors.red.bold('-------------------------'));
    this.log(colors.bold('      (o') + colors.red.bold(',') + colors.yellow.bold('o') + colors.bold(')  ') + colors.red.bold('|') + colors.yellow.bold('  Welcome to Godspeed  ') + colors.red.bold('|'));
    this.log(colors.blue('      {___}  ') + colors.red.bold('|') + colors.yellow.bold('    Plugin World !!    ') + colors.red.bold('|'));
    this.log(colors.bold('       " "   ') + colors.red.bold('-------------------------'));
    this.log("\n")


    this.log(colors.green.bold('🚀 Kickstart your Godspeed plugin development with ease using Godspeed Plugin Generator! 🚀\n'));
    this.log("This generator sets up a solid foundation for your Godspeed plugin, providing a");
    this.log("clean and organized folder structure.\nIt allows you to focus on what matters");
    this.log("Building awesome features for the Godspeed platform!\n");
    this.log(colors.yellow.bold('⚙️ Getting Started:'));
    this.log("1. Follow the prompts to customize your plugin settings.");
    this.log("2. Start coding! Your plugin is ready to take off.\n");
    this.log(colors.blue.bold('🌟 Features:'));
    this.log("✨ Well-organized folder structure for scalability.");
    this.log("✨ Default configurations for seamless integration with Godspeed.");
    this.log("✨ Customizable templates for plugin files.");
    this.log("✨ Built-in tools to streamline your development process.\n");
    this.log(colors.blue.bold('📚 Documentation:'));
    this.log("For detailed documentation and examples, visit:");
    this.log(colors.cyan('https://github.com/godspeedsystems/gs-plugins/blob/main/README.md') + '\n');

  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter your project name:',
        default: 'my-plugin',
      },
      {
        type: 'list',
        name: 'datasourceType',
        message: 'Select the type of plugin:',
        choices: [
          'DataSource',
          'EventSource',
          'DataSource-As-EventSource',
        ],
        filter: (input) => input.toLowerCase(),
      },
    ]);
  }

  async writing() {
    const { projectName, datasourceType } = this.answers;
    const projectPath = this.destinationPath(`${projectName}-as-${datasourceType}`);
    const tempPath = this.destinationPath('.temp');

  
    fs.ensureDirSync(tempPath);

    const remotePath = 'http://github.com/godspeedsystems/gs-plugins/releases/download/latest/template.zip'

    const body = await axios.get(remotePath, {
      responseType: 'arraybuffer',
    });

    let zip = new AdmZip(body.data, {});

    await new Promise((resolve, reject) => {
      zip.extractAllToAsync(tempPath, true, false, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      });
    })


    this.fs.copyTpl(
      path.join(tempPath, 'templates/gitignore.txt'),
      this.destinationPath(`${projectPath}/.gitignore`)
    );
    this.fs.copyTpl(
      path.join(tempPath, 'templates/npmignore.txt'),
      this.destinationPath(`${projectPath}/.npmignore`)
    );
    this.fs.copyTpl(
      path.join(tempPath, 'templates/Package.txt'),
      this.destinationPath(`${projectPath}/package.json`),
      { projectName, datasourceType }
    );

    this.fs.copyTpl(
      path.join(tempPath, 'templates/tsconfig.txt'),
      this.destinationPath(`${projectPath}/tsconfig.json`)
    );
    this.fs.copyTpl(
      path.join(tempPath, 'templates/readme.txt'),
      this.destinationPath(`${projectPath}/README.md`)
    );

    const formattedType = datasourceType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    const typeSpecificFile = `templates/${formattedType}.txt`;

    this.fs.copyTpl(
      path.join(tempPath, typeSpecificFile),
      this.destinationPath(`${projectPath}/src/index.ts`),
      { projectName }
    );

    
    fs.removeSync(tempPath);
  }

  async install() {
    const { projectName, datasourceType } = this.answers;
    const projectPath = this.destinationPath(`${projectName}-as-${datasourceType}`);
    const spinner = ora({
      text: 'Installing packages... ',
      spinner: {
        frames: ['🌎', '🌍', '🌏'],
        interval: 300, // Optional: Adjust the spinner speed
      },
    }).start();

    try {
      // Run npm install without any console output
      this.spawnCommand('npm', ['install', '--quiet', '--no-warnings', '--silent', '--progress=false'], {
        cwd: projectPath,
        stdio: 'inherit', // Display output in the console
      })
      .on('close', () => {
        spinner.stop(); // Stop the spinner when the installation is complete
        this.log('\nPackages loaded successfully!');
        this.log(colors.cyan.bold('\n Happy coding with Godspeed! 🚀🎉\n'));
      });
    } catch (error) {
      spinner.stop(); // Stop the spinner in case of an error
      console.error('Error during installation:', error.message);
    }
          // Check for updates after package installation
          const currentVersion = execSync('npm list -g generator-godspeed-plugin --json').toString();
          const parsedVersion = JSON.parse(currentVersion);
          const generatorVersion = parsedVersion.dependencies["generator-godspeed-plugin"].version;
          const latestGeneratorVersion = await latestVersion('generator-godspeed-plugin');
    
          if (generatorVersion !== latestGeneratorVersion) {
            this.log(colors.yellow.bold(`\nWarning: A new version of the generator is available (${latestGeneratorVersion}). Update using:`));
            this.log(colors.cyan.bold('  npm install -g generator-godspeed-plugin'));
          }
  }
  
};
