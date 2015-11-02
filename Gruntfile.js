module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'app/styles/main.css' : 'app/scss/main.scss'
                }
            }
        },
        connect: {
          server: {
            options: {
              port: 8000,
              base: 'app',
              keepalive: true
            }
          }
        },
        watch: {
            css: {
                files: '**/*.scss',
                tasks: ['sass']
            }
        },
        concurrent: {
            target1: ['connect','watch']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('default', ['concurrent:target1']);
    //grunt.registerTask('default',['watch']);
}