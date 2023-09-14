// Global vars
const { src, dest, series, parallel, watch } = require('gulp');
const connect = require('gulp-connect');

// Custom defined variables
var desitnationFold = 'director';



// General Javascript
const jsMinify = require('gulp-terser');

function scripts() {
    return src('src/js/**/*.js')
        // .pipe(jsMinify())
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
        .pipe(dest(desitnationFold + '/img'))
}



// HTML Files
function pages() {
    // place code for your default task here
    return src('src/*.html')
        .pipe(dest(desitnationFold + '/'))
        .pipe(connect.reload());
}



// Generates SSL used in the serverConnect function
const devcert = require('devcert')
var ssl, ssl2;

async function genCert() {
    ssl = await devcert.certificateFor('teststatic.vdo.ninja');
    ssl2 = await devcert.certificateFor('test.vdo.ninja');
}

// Sets up servers which the watch tasks call to reload (For the live-reload functionality)
function serverConnect() {
    connect.server({
        name: 'Dev App',
        root: '',
        host: '127.0.0.1',
        https: ssl,
        port: 8443,
        livereload: false
    });
    connect.server({
        name: 'Dev App Reloadable',
        root: '',
        https: ssl2,
        port: 443,
        livereload: true
    });
}



// Watch task
function watchTask() {    
    watch('src/css/*.css', styles);
    watch('src/js/**/*.js', scripts);
    watch('src/*.html', pages);
    // watch('src/images/*', optimizeimg);
    // watch('dist/images/*.{jpg,png}', webpImage);
}





// Full build
exports.default = series(parallel(scripts, styles, imageMinify, pages));

// Build + a watchTask
exports.dev = series(parallel(scripts, styles, imageMinify, pages),
                    genCert,
                    parallel(watchTask, serverConnect));

// Genrates the certs needed
exports.genCert = genCert;