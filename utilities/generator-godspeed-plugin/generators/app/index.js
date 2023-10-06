import Generator from 'yeoman-generator';
import fs from 'fs-extra';
import colors from 'colors';
import path from 'path';
import AdmZip from 'adm-zip';
import axios from 'axios';
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

      // Install dependencies using npm or yarn
      await  this.spawnCommandSync('npm', ['install', '--quiet', '--no-warnings', '--silent'], { cwd: projectPath });
      
    
      this.log(colors.blue("All dependencies are installed. Happy coding with Godspeed "));

};
}
