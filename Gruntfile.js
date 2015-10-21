module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            development: {
                src: ['Gruntfile.js', 'jquery.less.js']
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
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default', ['jshint', 'uglify']);
};
