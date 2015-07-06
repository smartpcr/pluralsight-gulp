var gulp = require('gulp');
var args = require('yargs').argv;
var $ = require('gulp-load-plugins')({lazy: true});
var config = require('./gulp.config')();
var del = require('del');

gulp.task('vet', function() {
    'use strict';
    log('Analyzing source with JSHint nad JSCS');

    gulp.src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function() {
    '"use strict';
    log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        //.on('error', errorLogger)
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function(done) {
    "use strict";
    var files = config.temp + '**/*.css';
    clean(files, done);
});

gulp.task('less-watcher', function() {
    "use strict";
    gulp.watch([config.less], ['styles']);
});

gulp.task('wiredep', function() {
    "use strict";
    log('Wire up the bower css js and our app js into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles'], function() {
    "use strict";
    log('Wire up css into the html, after files are ready');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

// util function

function clean(path, done) {
    "use strict";
    log('Cleaning files in ' + $.util.colors.blue(path));
    del(path, done);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function errorLogger(error) {
    "use strict";
    log('*** Start of Error ***');
    log(error);
    log('*** End of Error ***');
    this.emit('end');
}
