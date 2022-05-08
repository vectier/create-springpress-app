'use strict';

const packageJson = require('./package.json');

const fs = require('fs');
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const commander = require('commander');
const prompts = require('prompts');
const validateProjectName = require('validate-npm-package-name');

const init = () => {
  new commander.Command(packageJson.name)
    .version(packageJson.version)
    .argument('[app-directory]', 'a directory to create the application', null)
    .usage(`${chalk.green('[app-directory]')}`)
    .action(async (directory) => {
      if (directory) {
        createApp(directory);
      } else {
        const response = await askQuestions();
        createApp(response.directory);
      }
    })
    .parse(process.argv);

  // if (typeof projectName === 'undefined') {
  //   console.error('Please specify the project directory:');
  //   console.log(program.name());
  // }
};

const askQuestions = async () => {
  const questions = [
    {
      type: 'text',
      name: 'directory',
      message: 'What is your project named?'
    },
  ];
  return prompts(questions);
};

const createApp = (name) => {
  const root = path.resolve(name);
  const appName = path.basename(root);

  checkAppName(appName);
  ensureDirectory(root);

  console.log(`Creating a new Springpress app in ${chalk.green(root)}.`);

  const packageJson = {
    name: appName,
    version: '1.0.0',
    private: true,
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );
};

const checkAppName = (name) => {
  const validationResult = validateProjectName(name);
  if (!validationResult.validForNewPackages) {
    console.error(
      chalk.red(`Cannot create a project named ${chalk.green(name)} because of npm naming rules:\n`),
    );

    [
      ...(validationResult.errors || []),
      ...(validationResult.warnings || []),
    ].forEach((error) => {
      console.error(chalk.red(` - ${error}`));
    });
  
    console.error('\nPlease choose a different project name.');
    process.exit(1);
  }
};

const ensureDirectory = (directory) => {
  if (fs.existsSync(directory)) {
    console.error('This application already exists in this directory.');
    process.exit(1);
  } else {
    fs.mkdirSync(directory);
  }
};

module.exports = init;
