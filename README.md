grunt-vendor
============

Use NPM to managed browser dependencies, then use grunt-vendor to harvest the modules into a web-friendly vendor library tree.

Configuration:
--------------

    vendor: {
      stage: {
        options: {
          "requirejs": {
            webFiles: ["require.js"]
          }
        },
        src: ["package.json"],
        dest: "static/vendor"
      }
    },

The files for the vendor task are package.json files to be processed.
For each package.json, its 'dependencies' will be deployed to the dest
dir.  The files copied for each dependency resolve as follows:

1 options[moduleName].webFiles
2 modules's package.json's webFiles array
3 modules's package.json's main file.

So, for a browser library like lodash, just lodash.js gets deployed
to the dest dir.  For something like requirejs, you'll want to 
override the 'main', because r.js isn't what you want browser-side.

TODO:
-----

Full Grunt file syntax for webFiles (with cwd and such).
