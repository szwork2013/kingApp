'use strict';

/**
 * 项目配置环境包依赖.
 * glob获取目录下的文件
 */
var _ = require('lodash'),
  chalk = require('chalk'),
  glob = require('glob'),
  fs = require('fs'),
  path = require('path');

/**
 * 使用glob模式获取文件
 */
var getGlobbedPaths = function (globPatterns, excludes) {
  // URL paths regex
  var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

  // The output array
  var output = [];

  // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
  if (_.isArray(globPatterns)) {
    globPatterns.forEach(function (globPattern) {
      output = _.union(output, getGlobbedPaths(globPattern, excludes));
    });
  } else if (_.isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);
    } else {
      var files = glob.sync(globPatterns);
      if (excludes) {
        files = files.map(function (file) {
          if (_.isArray(excludes)) {
            for (var i in excludes) {
              if (excludes.hasOwnProperty(i)) {
                file = file.replace(excludes[i], '');
              }
            }
          } else {
            file = file.replace(excludes, '');
          }
          return file;
        });
      }
      output = _.union(output, files);
    }
  }

  return output;
};

/**
 * 验证NODE_ENV支持模式
 */
var validateEnvironmentVariable = function () {
  var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
  console.log();
  if (!environmentFiles.length) {
    if (process.env.NODE_ENV) {
      console.error(chalk.red('+ Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
    } else {
      console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
    }
    process.env.NODE_ENV = 'development';
  }
  // Reset console color
  console.log(chalk.white(''));
};

/** 
 * 如果密钥和正视可用，则安全验证参数设置为ture
 */
var validateSecureMode = function (config) {

  if (!config.secure || config.secure.ssl !== true) {
    return true;
  }

  var privateKey = fs.existsSync(path.resolve(config.secure.privateKey));
  var certificate = fs.existsSync(path.resolve(config.secure.certificate));

  if (!privateKey || !certificate) {
    console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
    console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
    console.log();
    config.secure.ssl = false;
  }
};

/** 
 * 不在生产环境设置
 */
var validateSessionSecret = function (config, testing) {

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  if (config.sessionSecret === 'kingApp') {
    if (!testing) {
      console.log(chalk.red('+ WARNING: It is strongly recommended that you change sessionSecret config while running in production!'));
      console.log(chalk.red('  Please add `sessionSecret: process.env.SESSION_SECRET || \'super amazing secret\'` to '));
      console.log(chalk.red('  `config/env/production.js` or `config/env/local.js`'));
      console.log();
    }
    return false;
  } else {
    return true;
  }
};

/**
 * 初始化Glob配置文件夹
 */
var initGlobalConfigFolders = function (config, assets) {
  // 添加文件夹
  config.folders = {
    server: {},
    client: {}
  };

  // 设置Glob客户端路径文件夹
  config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'modules/*/client/'), process.cwd().replace(new RegExp(/\\/g), '/'));
};

/**
 * 初始化Glob配置文件
 */
var initGlobalConfigFiles = function (config, assets) {
  // 添加文件
  config.files = {
    server: {},
    client: {}
  };

  // 设置Glob模型文件
  config.files.server.models = getGlobbedPaths(assets.server.models);

  // 设置Glob路由文件
  config.files.server.routes = getGlobbedPaths(assets.server.routes);

  // 设置Glob配置文件
  config.files.server.configs = getGlobbedPaths(assets.server.config);

  // 设置Glob的socket文件
  config.files.server.sockets = getGlobbedPaths(assets.server.sockets);

  // 设置Glob政策文件
  config.files.server.policies = getGlobbedPaths(assets.server.policies);

  // 设置Glob的JS文件
  config.files.client.js = getGlobbedPaths(assets.client.lib.js, 'public/').concat(getGlobbedPaths(assets.client.js, ['public/']));

  // 设置Glob的css文件
  config.files.client.css = getGlobbedPaths(assets.client.lib.css, 'public/').concat(getGlobbedPaths(assets.client.css, ['public/']));

  // 设置Glob的测试文件
  config.files.client.tests = getGlobbedPaths(assets.client.tests);
};

/**
 * 初始化全局配置
 */
var initGlobalConfig = function () {
  // 验证NODE_ENV模式
  validateEnvironmentVariable();

  // 获取默认资源
  var defaultAssets = require(path.join(process.cwd(), 'config/assets/default'));

  // 获取当前模式资源
  var environmentAssets = require(path.join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {};

  // 合并资源
  var assets = _.merge(defaultAssets, environmentAssets);

  // 获得默认配置
  var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

  // 获得当前模式配置
  var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

  // 合并配置文件
  var config = _.merge(defaultConfig, environmentConfig);

  // 从package.json读取项目信息
  var pkg = require(path.resolve('./package.json'));
  config.kingApp = pkg;

  // Extend the config object with the local-NODE_ENV.js custom/local environment. 
  // 这将覆盖本地配置中的任何设置。
  config = _.merge(config, (fs.existsSync(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js')) && require(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js'))) || {});

  // 初始化全局Glob文件
  initGlobalConfigFiles(config, assets);

  // 初始化全局Glob文件夹
  initGlobalConfigFolders(config, assets);

  // 验证SSL模式是否启用
  validateSecureMode(config);

  // 验证session密钥
  validateSessionSecret(config);

  // 将配置组件化输出
  config.utils = {
    getGlobbedPaths: getGlobbedPaths,
    validateSessionSecret: validateSessionSecret
  };

  return config;
};

/**
 * 设置配置模块对象
 */
module.exports = initGlobalConfig();
