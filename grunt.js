module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    preprocess: {
      html: {
        src: 'views/src/stat.html',
        dest: 'views/stat.html'
      },
      js: {
        src: 'test/test.js',
        dest: 'test/test.processed.js'
      }
    },
    recess: {
      dist: {
        src: ['public/css/less/styles.less'],
        dest: 'public/css/stat.css',
        options: {
          compile: true,
          //compress: true
        }
      }
    },
    // compress js 
    min: {
      'dist': {
        'src': ['public/js/vendor/prefixfree.min.js', 'public/js/vendor/angular.min.js', 'public/js/src/*.js'],
        'dest': 'public/js/stat.min.js'
      }
    },

    cssmin: {
      'dist': {
        'src': ['public/css/stat.css'],
        'dest': 'public/css/stat.min.css'
      }
    }


  });


  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-yui-compressor');
  // Default task.
  grunt.registerTask('default', 'preprocess recess min cssmin');
};