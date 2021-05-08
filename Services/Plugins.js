const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const BasePlugin = require('./Plugins.base');

module.exports = class PluginService extends EventEmitter {
  constructor() {
    super();
    this._installed = {};
    this._uninstalled = {};

    const userSettingsFile = global.settings;
    fs.ensureFile(userSettingsFile, (error) => {
      const settings = fs.readFileSync(userSettingsFile).toString();
      if (settings === '') {
        fs.writeJsonSync(userSettingsFile, {});
      }

      this.loadPlugins();
    });
  }

  get installed() {
    return Object.keys(this._installed);
  }

  get pluginsPath() {
    return global.pluginDir ? path.resolve(global.pluginDir) : path.resolve(global.appRoot, '..')
  }

  has(pluginName) {
    return this._installed.hasOwnProperty(pluginName);
  }

  async loadPlugins() {
    const plugins = await this.getPlugins();
    plugins.filter(name => global.activePlugins ? global.activePlugins.includes(name) : true).forEach((name) => {
      const plugin = require(path.resolve(this.pluginsPath, name));
      Object.appendChain(plugin.prototype, new BasePlugin());
      this._uninstalled[plugin.name] = plugin;
    });
    this.emit('plugins.loaded', this._uninstalled);
  }

  getPlugins() {
    return new Promise((resolve, reject) => {
      let plugins = fs.readdirSync(this.pluginsPath);
      plugins = plugins.filter(
        (pkg) => pkg.match(/ninjakatt-plugin-/) && !pkg.match('base')
      );

      return resolve(plugins);
    });
  }

  installLoadedPlugins() {
    Object.keys(this._uninstalled).forEach((plugin) => {
      this.install(this._uninstalled[plugin]);
    });
    this.emit('plugins.installed', this._installed);
  }

  install(Plugin) {
    if (typeof Plugin === 'object') {
      return;
    }
    const instance = new Plugin();

    if (instance.installable === false) {
      return;
    }

    instance.setup();

    if (instance.subscriptionsExist) {
      instance.subscriptions();
    }

    if (instance.routesExist) {
      setTimeout(() => {
        if (global.Ninjakatt.plugins.has('Webserver')) {
          instance.routes();
        }
      }, 0);
    }

    this._installed[Plugin.name] = instance;
    delete this._uninstalled[Plugin.name];
  }
};
