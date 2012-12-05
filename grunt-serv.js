module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    beautify: {
      tests: '<config:test.files>',
      files: ['lib/*.js']
    },
    beautifier: {
      options: {
        indentSize: 4
      },
      tests: {
        options: {
          indentSize: 4
        }
      }
    },
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      all: ['grunt.js', 'lib/**/*.js', 'routes/**/*.js', 'test/**/*.js']
    },
    jshint: {
      options: {
        browser: true
      }
    }
  });
  grunt.loadNpmTasks('grunt-check-modules');
  grunt.loadNpmTasks('grunt-beautify');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-dox');
  grunt.loadNpmTasks('grunt-docker');
  // Default task.
  grunt.registerTask('default', 'beautify lint');

};

