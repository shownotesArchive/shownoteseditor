module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      components: {
        src: [ 'js/app/main.js', 'js/app/**/*.js' ],
        dest: 'dest/app.min.js'
      },
      lib: {
        src: [ 'js/lib/**/*.js', '!js/lib/audiojs/audio.min.js' ],
        dest: 'dest/lib.min.js'
      }
    },
    copy: {
      audiojs: {
        files: [
          {
            expand: true,
            src: 'js/lib/audiojs/*',
            dest: 'dest/audiojs/',
            flatten: true,
            filter: 'isFile'
          }
        ]
      }
    },
    less: {
      app: {
        options: {
          yuicompress: true
        },
        files: {
          "css/app/editors/inline.css": "css/app/editors/inline.less",
          "css/app/lists/standard.css": "css/app/lists/standard.less",
          "demo/demo.css": "demo/demo.less",
        }
      }
    },
    cssmin: {
      app: {
        files: {
          'dest/app.min.css': [ 'css/app/**/*.css' ],
          'dest/lib.min.css': [ 'css/lib/**/*.css' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', [ 'uglify', 'copy', 'less', 'cssmin' ]);
};
