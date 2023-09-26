const Generator = require('yeoman-generator');
const path = require('path');
const mkdirp = require('mkdirp');

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
        filter: (input) => {
          return input.toLowerCase(); // Convert the choice to lowercase
        },
      },
    ]);
  }

  writing() {
    const projectName = this.answers.projectName;
    const datasourceType = this.answers.datasourceType.toLowerCase();
    const projectPath = this.destinationPath(`${projectName}-as-${datasourceType}`);

    // Create the 'src' directory and its parent directories if they don't exist
    const srcDir = path.join(projectPath, 'src');
    mkdirp.sync(srcDir);

    // Copy common files
    this.fs.copyTpl(
      this.templatePath('gitignore.txt'),
      this.destinationPath(`${projectName}-as-${datasourceType}/.gitignore`)
    );
    this.fs.copyTpl(
      this.templatePath('npmignore.txt'),
      this.destinationPath(`${projectName}-as-${datasourceType}/.npmignore`)
    );
    this.fs.copyTpl(
      this.templatePath('Package.txt'),
      this.destinationPath(`${projectName}-as-${datasourceType}/package.json`),{ projectName, datasourceType }
    );
    this.fs.copyTpl(
      this.templatePath('readme.txt'),
      this.destinationPath(`${projectName}-as-${datasourceType}/README.md`)
    );
    this.fs.copyTpl(
      this.templatePath('tsconfig.txt'),
      this.destinationPath(`${projectName}-as-${datasourceType}/tsconfig.json`)
    );

    // Copy type-specific files
    switch (datasourceType) {
      case 'datasource':
        this.fs.copyTpl(
          this.templatePath('Datasource.txt'),
          this.destinationPath(`${projectName}-as-${datasourceType}/src/index.ts`),
          { projectName }
        );
        break;
      case 'eventsource':
        this.fs.copyTpl(
          this.templatePath('Eventsource.txt'),
          this.destinationPath(`${projectName}-as-${datasourceType}/src/index.ts`),
          { projectName }
        );
        break;
      case 'datasource-as-eventsource':
        this.fs.copyTpl(
          this.templatePath('DatasourceAsEventsource.txt'),
          this.destinationPath(`${projectName}-as-${datasourceType}/src/index.ts`),
          { projectName }
        );
        break;
      default:
        console.log('Invalid type...'); // This should not be reached due to the list choices.
    }
  }
};
