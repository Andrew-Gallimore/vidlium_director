// Global vars
const { src, dest, series, parallel, watch } = require('gulp');
const connect = require('gulp-connect');

var desitnationFold = 'director';



// General Javascript
const jsMinify = require('gulp-terser');

function scripts() {
    return src('src/js/**/*.js')
        .pipe(jsMinify())
        .pipe(dest(desitnationFold + '/js/'))
        .pipe(connect.reload());
}



// General CSS
const autoPrefixer = require('gulp-autoprefixer');
const cssMinify = require('gulp-clean-css');

function styles() {
    return src('src/css/*.css')
    .pipe(autoPrefixer('last 2 versions'))
    .pipe(cssMinify())
    .pipe(dest(desitnationFold + '/css/'))
    .pipe(connect.reload());
}



// Concatinating/merging css files into one
// const concat = require('gulp-concat-css');

// function mergeCSS() {
//     return src(desitnationFold + '/css/landing-imgs.css')
//         .pipe(concat("btn-styles.css"))
//         .pipe(dest(desitnationFold + '/css/'))
// }



// Optimize and move images to dest
const imagemin = require('gulp-imagemin');

function imageMinify() {
    return src('src/img/*.{jpg,png}')
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 80, progressive: true }),
            imagemin.optipng({ optimizationLevel: 2 }),
        ]))
        .pipe(dest(desitnationFold + '/img')) // change to your final/public directory
}



// HTML Files
function pages() {
    // place code for your default task here
    return src('src/*.html')
        .pipe(dest(desitnationFold + '/'))
        .pipe(connect.reload());
}



// Sets up server which the watch tasks call it to reload (For the live-reload functionality)
function serverConnect() {
    connect.server({
        root: '',
        livereload: true
    });
}



// Watch task
function watchTask() {    
    watch('src/css/*.css', series(styles, ));
    watch('src/js/**/*.js', scripts);
    watch('src/*.html', pages);
    // watch('src/images/*', optimizeimg);
    // watch('dist/images/*.{jpg,png}', webpImage);
}





// Full build
exports.default = series(parallel(scripts, styles, imageMinify, pages));

// Build + a watchTask
exports.dev = series(parallel(scripts, styles, imageMinify, pages), parallel(watchTask, serverConnect));