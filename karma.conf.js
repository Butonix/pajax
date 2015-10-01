// Karma configuration
// Generated on Mon May 04 2015 09:37:57 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['express-http-server', 'jspm', 'mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [],

    jspm: {
        loadFiles: ['test/browser*.js', 'lib/**/*.js']
    },

    expressHttpServer: {
        port: 3500,
        appVisitor: function (app, log) {
          var server = require('./test/server.js');
          server(app, log);
        }
    },

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'IE'],

    plugins: [
      // Karma will require() these plugins
      'karma-mocha',
      'karma-chai',
      'karma-jspm',
      'karma-express-http-server',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-ie-launcher'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
