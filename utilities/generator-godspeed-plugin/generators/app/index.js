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
        type: 'input',
        name: 'datasourcename',
        message: 'Enter type of plugin [DataSource/EventSource/DataSourceAsEventSource]:',
      },
    ]);
  }

  writing() {
    const projectName = this.answers.projectName;
    const type = this.answers.datasourcename;
    const projectPath = this.destinationPath(projectName);

    // Create the 'src' directory and its parent directories if they don't exist
    const srcDir = path.join(projectPath, 'src');
    mkdirp.sync(srcDir);

    const packagejsonContent = `{
        "name": "@godspeedsystems/plugin-${projectName}-as-${type}",
        "types": "dist/index.d.js",
        "scripts": {
          "dev": "tsc --watch",
          "build": "tsc",
          "prepublishOnly": "npm run build"
        },
        "license": "ISC",
        "devDependencies": {
          "typescript": "^4.9.5"
        },
        "dependencies": {
          "@godspeedsystems/core": "^2.0.0-beta.2",
          "pino-pretty": "^10.2.0"
        }
      }
    `;

    const tsconfigContent = `{
        "compilerOptions": {
          "target": "es6",
          "module": "commonjs",
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "declaration": true,
          "moduleResolution": "node",
          "sourceMap": true,
          "esModuleInterop": true
        },
        "exclude":[
          "./node_modules"
        ]
      }
    `;

    this.fs.write(this.destinationPath(`${projectName}/package.json`), packagejsonContent);
    this.fs.write(this.destinationPath(`${projectName}/tsconfig.json`), tsconfigContent);

    this.fs.copyTpl(
      this.templatePath('gitignore.txt'),
      this.destinationPath(`${projectName}/.gitignore`)
    );
    this.fs.copyTpl(
      this.templatePath('npmignore.txt'),
      this.destinationPath(`${projectName}/.npmignore`)
    );

    // Create 'index.ts' in the 'src' directory
    
    if (type === "DataSource") {
      this.fs.copyTpl(
        this.templatePath('Datasource.txt'),
        this.destinationPath(`${projectName}/src/index.ts`),
        {projectName}
      );
    } else if (type === "EventSource") {
      this.fs.copyTpl(
        this.templatePath('Eventsource.txt'),
        this.destinationPath(`${projectName}/src/index.ts`),
        {projectName}
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('DatasourceAsEventsource.txt'),
        this.destinationPath(`${projectName}/src/index.ts`),
        {projectName}
      );
    }
  }
};
