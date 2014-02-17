var path = require("path"),
  _ = require("lodash");

module.exports = function(grunt){
  grunt.registerMultiTask("vendor", "Build a vendor directory out of Node modules", function(){
    var done = this.async(),
      options = this.options({
      });

    function resolveModule(name, currentDir){
      grunt.log.write("resolving module " + name);
      var attempt = path.join(currentDir, "node_modules", name);
      if(grunt.file.isDir(attempt) && grunt.file.isFile(attempt, "package.json")){
        return attempt;
      } else {
        var parentDir = path.dirname(currentDir);
        if(parentDir == currentDir){
          grunt.warn("Could not find module " + name);
        }
        grunt.log.ok();
        return resolveModule(name, parentDir);
      }
    }

    function processVendorPackage(pkgName, dirPath, dest){
      var pkgInfoFile = path.join(dirPath, "package.json");
      if(!grunt.file.isFile(pkgInfoFile)){
        grunt.warn("missing package.json in " + dirPath);
      }
      var pkgInfo = grunt.file.readJSON(pkgInfoFile),
        expandDest = dest,
        expandOpts = {
          cwd: dirPath
        },
        fileSet;

      if(options[pkgName] && options[pkgName].webFiles){
        //use package-specific option overrides
        fileSet = grunt.file.expandMapping(options[pkgName].webFiles, expandDest, expandOpts);
      } else if(pkgInfo.webFiles){
        //use package.json webFiles
        fileSet = grunt.file.expandMapping(pkgInfo.webFiles, expandDest, expandOpts);
      } else if(pkgInfo.main){
        //use main
        fileSet = grunt.file.expandMapping([pkgInfo.main], expandDest, _.extend({}, expandOpts, {flatten: true}));
      } else {
        grunt.warn("No main file in package " + pkgName);
      }

      //do the copy
      if(!fileSet.length){
        grunt.warn("nothing to copy for " + pkgName);
      }
      _.each(fileSet, function(fileMapping){
        grunt.log.write("Copying " + fileMapping.src + " to " + fileMapping.dest);
        grunt.file.copy(fileMapping.src, fileMapping.dest);
        grunt.log.ok();
      });
    }

    function processDependencyPackage(file){
      var pkgJson = file.src.filter(function(fn){
        return grunt.file.isFile(fn);
      });
      if(!pkgJson.length){
        grunt.warn("no source files found");
      }
      pkgJson.forEach(function(pkgPath){
        var pkgInfo = grunt.file.readJSON(pkgPath);
        if(!_.isObject(pkgInfo.dependencies)){
          grunt.warn(pkgPath + " is missing dependencies");
        } else {
          _.each(pkgInfo.dependencies, function(version, name){
            var dirPath = resolveModule(name, path.dirname(pkgPath));
            processVendorPackage(name, dirPath, file.dest);
          });
        }
      });
    }
    
    //Each file is a package.json whose runtime dependencies are to be packaged into the dest dir.
    this.files.forEach(processDependencyPackage);
    done();
  });
};
