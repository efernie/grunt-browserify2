var expose, helper, path,
  _this = this;

path = require('path');

helper = {
  require: function(_path) {
    return require(path.resolve(process.cwd(), _path));
  }
};

expose = function(grunt, bundle, key, val) {
  var file, fileOpts, files, _i, _len, _results;
  if (key !== 'files') {
    return bundle.require(val, {
      expose: key
    });
  } else {
    _results = [];
    for (_i = 0, _len = val.length; _i < _len; _i++) {
      fileOpts = val[_i];
      fileOpts.expand = true;
      fileOpts.flatten = true;
      fileOpts.dest = fileOpts.dest || '';
      files = grunt.file.expandMapping(fileOpts.src, fileOpts.dest, fileOpts);
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
          file = files[_j];
          _results1.push(bundle.require('./' + file.src, {
            expose: file.dest.substr(0, file.dest.indexOf('.'))
          }));
        }
        return _results1;
      })());
    }
    return _results;
  }
};

module.exports = function(grunt) {
  return this.registerMultiTask('browserify2', 'commonjs modules in the browser', function() {
    var afterHook, beforeHook, browserify, bundle, compile, config, debug, done, entry, exposeOpts, key, mount, opt, options, server, targetConfig, val, _i, _len, _ref, _ref1, _ref2, _ref3;
    done = this.async();
    browserify = require('browserify');
    config = grunt.config.get(this.name);
    targetConfig = config[this.target];
    options = this.options(this.data);
    entry = options.entry, mount = options.mount, server = options.server, debug = options.debug, compile = options.compile, beforeHook = options.beforeHook, afterHook = options.afterHook;
    bundle = browserify(entry);
    exposeOpts = [];
    if ((_ref = targetConfig.options) != null ? _ref.expose : void 0) {
      exposeOpts.push((_ref1 = targetConfig.options) != null ? _ref1.expose : void 0);
    }
    if ((_ref2 = config.options) != null ? _ref2.expose : void 0) {
      exposeOpts.push((_ref3 = config.options) != null ? _ref3.expose : void 0);
    }
    for (_i = 0, _len = exposeOpts.length; _i < _len; _i++) {
      opt = exposeOpts[_i];
      for (key in opt) {
        val = opt[key];
        expose(grunt, bundle, key, val);
      }
    }
    if (beforeHook) {
      beforeHook.call(this, bundle);
    }
    return bundle.bundle({
      debug: debug
    }, function(err, src) {
      var app, express_plugin, msg, time;
      if (err) {
        grunt.log.error(err);
      }
      if (!server && !compile) {
        grunt.log.error('either server or compile options must be defined.');
        done();
      }
      if (afterHook) {
        src = afterHook.call(this, src);
      }
      if (server) {
        time = new Date();
        express_plugin = function(req, res, next) {
          if (req.url.split('?')[0] === mount) {
            res.statusCode = 200;
            res.setHeader('last-modified', time);
            res.setHeader('content-type', 'text/javascript');
            return res.end(src);
          } else {
            return next();
          }
        };
        app = helper.require(server);
        app.use(express_plugin);
      }
      if (compile) {
        grunt.file.write(path.resolve(process.cwd(), compile), src);
        msg = "File written to: " + (grunt.log.wordlist([compile], {
          color: 'cyan'
        }));
        grunt.log.writeln(msg);
        return done();
      }
    });
  });
};