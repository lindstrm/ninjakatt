#! /usr/bin/env node

const path = require('path');
const pkg = require('./package.json');
const args = require('minimist')(process.argv.slice(2))._;
const command = args[0];
const subcommand = args[1];

require('./lib/extensions');

const exec = require('child_process').exec;

global.appRoot = path.resolve(__dirname);
global.settingsPath = path.resolve(process.env.APPDATA, 'ninjakatt');
global.settings = path.resolve(global.settingsPath, 'settings.json');
global.activePlugins = process.env.PLUGINS ? JSON.parse(process.env.PLUGINS) : undefined;

const Ninjakatt = require('./Ninjakatt');
const ninjakatt = new Ninjakatt();
global.Ninjakatt = ninjakatt;

if (process.env.PLUGINDIR) {
  global.pluginDir = path.resolve(process.env.PLUGINDIR);
}

switch (command) {
  case 'plugin': {
    if (subcommand === 'add' && args[2]) {
      const installation = exec(`npm install -g ninjakatt-plugin-${args[2]}`);
      installation.stdout.pipe(process.stdout);
      installation.stderr.pipe(process.stderr);
    }

    if (subcommand === 'list') {
      ninjakatt.plugins.getPlugins().then(plugins => console.log(plugins));
    }
    break;
  }

  case 'config': {
    if (subcommand === 'edit') {
      const launch = require('launch-editor');
      launch(global.settings);
      console.log(`Opening config file.`);
    }
  }
}

if (command === undefined) {
  ninjakatt.on('plugins.loaded', () => {
    ninjakatt.plugins.installLoadedPlugins();
  });

  ninjakatt.on('ready', () => {
    console.log(`Ninjakatt ( ^ , ^)~~~~ version ${pkg.version} loaded.`);
  });

  process.stdin.resume();
}
