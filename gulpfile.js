var gulp = require('gulp');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var pug = require('gulp-pug');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var fs = require('fs');
var data = require('gulp-data');
var watch = require('gulp-watch');

// 画像圧縮系
var changed  = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var imageminJpg = require('imagemin-jpeg-recompress');
var imageminPng = require('imagemin-pngquant');
var imageminGif = require('imagemin-gifsicle');
var svgmin = require('gulp-svgmin');

// Setting: File
var files = {
    'json': './site.json'
}

// Setting: Paths
var paths = {
    'sass': './src/scss/',
    'css': './dist/css/',
    'pug': './src/pug/',
    'html': './dist/',
    'distJs': './dist/js/',
    'js': './src/js/',
    'images': './src/images/',
    'distImages': './dist/images/'
}

// Setting: Sass Options
var sassOptions = {
    outputStyle: 'compressed'
}

// Setting: Pug Options
var pugOptions = {
    pretty: true
}


// Task: Sass
gulp.task('sass', function(){
    gulp.src(paths.sass + '**/*.scss')
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass(sassOptions))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.css))
});

// Task: Pug
gulp.task('pug', function(){
    return gulp.src([paths.pug + '**/*.pug', '!' + paths.pug + '**/_*.pug'])
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(data( file => {
            // return JSON.parse(fs.readFileSync(files.json))
        }))
        .pipe(pug(pugOptions))
        .pipe(gulp.dest(paths.html))
});

// Task: Javascript
gulp.task('js', function() {
    gulp.src(paths.js + '**/*.js')
        .pipe(gulp.dest(paths.distJs))
});

// Task: Optimize Image
gulp.task('imagemin', function() {
    gulp.src(paths.images + '**/*.+(jpg|jpeg|png|gif)')
        .pipe(changed(paths.distImages))
        .pipe(imagemin([
            imageminPng(),
            imageminJpg(),
            imageminGif({
                interlaced: false,
                optimizationLevel: 3,
                colors: 180
            })
        ]))
        .pipe(gulp.dest(paths.distImages))
});

// Task: Optimize SVG Image
gulp.task('svgmin', function() {
    gulp.src(paths.images + '**/*.svg')
        .pipe(changed(paths.distImages))
        .pipe(svgmin())
        .pipe(gulp.dest(paths.distImages))
});

// Task: Browser Sync
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: paths.html,
            serveStaticOptions: {
                extensions: ['html']
            }
        }, 
        middleware: [
            function(req, res, next) {
                    if (/\/regions\/[0-9]+?/.test(req.url)) {
                        res.writeHead(302, {
                            'Location': '/regions/region_id'
                        });
                        res.end();
                    }
                    if (/\/schools\/[0-9]+?/.test(req.url)) {
                        res.writeHead(302, {
                            'Location': '/schools/pref_id'
                        });
                        res.end();
                    }
                    next();
                }
            ],
        },
        function(err, bs) {
            bs.addMiddleware("*", function(req, res) {
                res.writeHead(302, {
                    location: "/404"
                });
                res.end("Redirecting!");
            });
        }
    );
    watch(paths.distImages + '**/*.+(jpg|jpeg|png|gif)', function() {
        gulp.start(['reload']);
    });
    watch(paths.distImages + '**/*.svg', function() {
        gulp.start(['reload']);
    });
    watch(paths.css + '**/*.css', function() {
        gulp.start(['reload']);
    });
    watch(paths.html + '**/*.html', function() {
        gulp.start(['reload']);
    });
    watch(paths.distJs + '**/*.js', function() {
        gulp.start(['reload']);
    });
});
gulp.task('reload', () => {
    browserSync.reload();
});  

// Task: Watch
gulp.task('watch', function() {
    watch(paths.images + '**/*.+(jpg|jpeg|png|gif)', function() {
        gulp.start(['imagemin']);
    });
    watch(paths.images + '**/*.svg', function() {
        gulp.start(['svgmin']);
    });
    watch(paths.sass + '**/*.scss', function() {
        gulp.start(['sass']);
    });
    watch(paths.pug + '**/*.pug', function() {
        gulp.start(['pug']);
    });
    watch(paths.js + '**/*.js', function() {
        gulp.start(['js']);
    });
});


// Default
gulp.task('default', ['pug', 'sass', 'js', 'imagemin', 'svgmin', 'browser-sync', 'watch']);