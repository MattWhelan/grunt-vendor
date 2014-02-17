module.exports = function(grunt){
  grunt.initConfig({
    vendor: {
      stage: {
        options: {
          "requirejs": {
            webFiles: ["require.js"]
          }
        },
        src: ["package.json"],
        dest: "vendor"
      }
    },
    clean: ["vendor"]
  });

  grunt.loadTasks("../tasks");
  grunt.loadNpmTasks("grunt-contrib-clean");

  grunt.registerTask("default", ["vendor"]);
};
