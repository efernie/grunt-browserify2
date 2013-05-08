module.exports = function(grunt) {
  this.initConfig({
    browserify2: {
      dev: {
        entry: './test/file.js',
        mount: '/application.js',
        debug: true,
        compile: './build/application.js',
        beforeHook: function(bundle) {
          return console.log('in before hook');
        }
      }
    }
  });
  this.loadTasks('tasks');
  return this.registerTask('default', ['browserify2']);
};
