module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            development: {
                src: ['Gruntfile.js', 'jquery.less.js', 'test/*.js']
            },
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        uglify: {
            development: {
                files: {
                    'jquery.less.min.js': ['jquery.less.js']
                }
            },
            options: {
                compress: true,
                mangle: true
            }
        },
        nodeunit: {
            development: ['test/test.js']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    
    grunt.registerTask('default', ['jshint', 'uglify', 'nodeunit']);
};
