const Generator = require('yeoman-generator');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

module.exports = class extends Generator {
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

    // Clone the GitHub repository to a temporary folder
    fs.ensureDirSync(tempPath);
    const repoUrl = 'https://github.com/yaswanth-godspeed/gs-plugin-templates.git';
    execSync(`git clone --quiet ${repoUrl} ${tempPath}`);

    // Copy type-specific files from the temporary folder
    this.fs.copyTpl(
      path.join(tempPath,'gitignore.txt'),
      this.destinationPath(`${projectPath}/.gitignore`)
    );
    this.fs.copyTpl(
      path.join(tempPath,'npmignore.txt'),
      this.destinationPath(`${projectPath}/.npmignore`)
    );
    this.fs.copyTpl(
      path.join(tempPath,'Package.txt'),
      this.destinationPath(`${projectPath}/package.json`),
      { projectName, datasourceType }
    );

    this.fs.copyTpl(
      path.join(tempPath,'tsconfig.txt' ),
      this.destinationPath(`${projectPath}/tsconfig.json`)
    );
    this.fs.copyTpl(
      path.join(tempPath,'readme.txt' ),
      this.destinationPath(`${projectPath}/README.md`)
    );
    // Copy type-specific files from the temporary folder
    const formattedType = datasourceType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    const typeSpecificFile = `${formattedType}.txt`;

    this.fs.copyTpl(
      path.join(tempPath, typeSpecificFile),
      this.destinationPath(`${projectPath}/src/index.ts`),
      { projectName }
    );

    // Clean up the temporary folder
    fs.removeSync(tempPath);
  }

  install() {
    const { projectName, datasourceType } = this.answers;
    const projectPath = this.destinationPath(`${projectName}-as-${datasourceType}`);

    // Run npm install without any console output
    this.spawnCommandSync('npm', ['install', '--quiet', '--no-warnings', '--silent'], { cwd: projectPath });

    this.log('Packages loaded successfully!');
  }
};
