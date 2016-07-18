var gulp         = require('gulp'),
    gutil        = require('gulp-util'),
    compass      = require('gulp-compass'),
    sass         = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    jshint       = require('gulp-jshint'),
    uglify       = require('gulp-uglify'),
    imagemin     = require('gulp-imagemin'),
    svgmin       = require('gulp-svgmin'),
    rename       = require('gulp-rename'),
    // replace   = require('gulp-replace'),
    clean        = require('gulp-clean'),
    concat       = require('gulp-concat'),
    notify       = require('gulp-notify'),
    domSrc       = require('gulp-dom-src'),
    cheerio      = require('gulp-cheerio'),
    plumber      = require('gulp-plumber'),
    //cache      = require('gulp-cache'),
    livereload   = require('gulp-livereload'),
    lr           = require('tiny-lr'),
    server       = lr();

var src = {
    base:    './app',
    sass:    './app/sass',
    styles:  './app/css',
    data:  './app/data',
    scripts: './app/js',
    assets:  './app/assets'
}
var dist = {
    base:    './dist',
    styles:  './dist/css',
    data:  './dist/data',
    scripts: './dist/js',
    assets:  './dist/assets'
}


// Watch
// ~~~~~

gulp.task('styles', function() {
    return gulp.src( src.sass + '/style.sass' )
        .pipe(plumber())
        .pipe( compass({
            css: 'app/css',
            sass: 'app/sass'
        }))
        .pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest( src.base + '/css'))
        .pipe(livereload(server))
});

gulp.task('jshint', function(){
    return gulp.src(src.scripts + '/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
})

gulp.task('watch', function() {
    server.listen(35729, function(err){
        if(err) { return console.log(err) }

        gulp.watch(src.sass + '/**/*.sass', ['styles']);
        // gulp.watch(src.assets + '/img/**/*', ['images']);
    });    
});


// Build
// ~~~~~

var buildStyles = function() {
    return gulp.src(src.sass + '/style.sass')
        .pipe(plumber())
        .pipe(sass({ style: 'expanded', compass: true }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest( dist.base + '/css' ))
}

// https://github.com/cgross/gulp-dom-src#end-to-end-concatenation-and-minification
var buildScripts = function() {
    return domSrc({
            file:      src.base + '/index.html',
            selector:  'script',
            attribute: 'src'
        })
        .pipe(concat('app.full.min.js'))
        .pipe(gulp.dest(dist.scripts))
}

var buildIndex = function(){
    return gulp.src( src.base + '/index.html' )
        .pipe(cheerio(function($){
            $('#scripts').remove();
            $('body').append('<script src="js/app.full.min.js"></script>');
        }))
        .pipe( gulp.dest( dist.base + '/' ) )
}


var buildImg = function() {
    return gulp.src(src.assets + '/img/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest(dist.assets + '/img'))
        //.pipe(livereload(server))
        // .pipe(notify({ message: 'Images compressed and moved.' }));
};

var buildSVG = function() {
    return gulp.src(src.assets + '/svg/**/*')
        .pipe(gulp.dest(dist.assets + '/svg'))
        .pipe(svgmin())
        // .pipe(notify({ message: 'SVGs compressed and moved.' }));
}

var moveFiles = function() {
    gulp.src([
        src.assets  + '/**/*',
        src.styles  + '/*',
        src.base    + '/*.json',
        src.data    + '/**/*',
        src.scripts + '/lib/*',
        src.base    + '/partials/***/**/*'
    ], {base: src.base})
        .pipe(gulp.dest(dist.base))
}

gulp.task('clean', function() {
    return gulp.src([ dist.base + '/**/*' ], {read: false})
        .pipe(clean());
});

gulp.task('scripts', function(){
    buildScripts()
    buildIndex()
})

gulp.task('build', ['clean'], function() {
    buildStyles();
    buildScripts();
    buildIndex();
    buildImg();
    moveFiles();
});

gulp.task('buildfast', ['clean'], function() {
    buildStyles();
    buildScripts();
    buildIndex();
    // moveFiles();
})

gulp.task('move', function(){
    moveFiles();
})

