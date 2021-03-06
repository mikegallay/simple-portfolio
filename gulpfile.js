// ** BEFORE RUNNING MAKE SURE GULP.JS IS INSTALLED https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md

// in terminal cd to the current directory
// $ sudo npm install gulp
// $ sudo npm install gulp-uglify gulp-concat gulp-compass gulp-minify-css gulp-concat-css gulp-cache gulp-notify gulp-livereload gulp-rename gulp-autoprefixer gulp-imagemin del gulp-util path gulp-svg-sprite gulp-svg2png gulp-plumber gulp-jsoncombine --save-dev
// npm install to install packages below

//processScripts
//Error: spawn /usr/bin/compass ENOENT was resolved with
//sudo gem install -n /usr/local/bin compass

var gulp = require('gulp'),
	uglify = require('gulp-uglify'), // minify .js files
	concat = require('gulp-concat'), // concat .js files
	// compass = require('gulp-compass'), // require .sass compass
	minifyCSS = require('gulp-minify-css'), // minify .css files gulp-minify-css deprecated
	concatCSS = require('gulp-concat-css'), // concat .css files
	cache = require('gulp-cache'),
	notify = require('gulp-notify'),
	connect = require('gulp-connect-php'),
	livereload = require('gulp-livereload'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	del = require('del'),
	gutil = require('gulp-util'),
	path = require('path'),
	sass = require('gulp-sass'),
	svgSprite = require('gulp-svg-sprite'),
	svg2png = require('gulp-svg2png'),
	plumber = require('gulp-plumber');
	jsoncombine = require("gulp-jsoncombine");

// add all javascript files dependent here
// append other files to the end of the list
var concatScripts = [
	// 'src/js/lib/jquery-1.11.2.min.js',
	'src/js/plugins/plugin.base.js',
	'src/js/plugins/player.min.js',
	//'src/js/plugins/jquery.waypoints.min.js',
	// 'src/js/plugins/waypoints.inview.min.js',
	//'src/js/plugins/slick.min.js',
	'src/js/plugins/lazysizes.min.js',
	'src/js/plugins/jquery.fitvids.js',
	//'src/js/lib/TweenMax.min.js',
	// 'src/js/lib/EasePack.min.js',
	// 'src/js/lib/CSSPlugin.min.js',
	//'src/js/lib/DrawSVGPlugin.min.js',
	'src/js/main.js'
];


/*****************************
Tasks to be completed by gulp
******************************/


gulp.task('processScripts', function() {

	return gulp.src(concatScripts)
		.pipe(concat('main.js'))
		.pipe(gulp.dest('assets/js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js'))
		.pipe(notify({ message: '**** Javascript file processing complete! ****' }));
});


gulp.task('processStyles', function() {

	return gulp.src('./src/sass/*.scss')
	  .pipe(plumber())
	  /*.pipe(compass({
	  	style: 'expanded',
	  	css: 'assets/css',
	    sass: 'src/sass',
	    sourcemap: false
	  }))*/
		.pipe(sass())
		// .pipe(autoprefixer('last 1 version', '&gt; 1%', 'ie 8'))
	  .pipe(autoprefixer('last 2 versions', 'ie 8', 'ie 9', 'iOS', 'Android'))
	  .pipe(concat('main.css'))
	  .pipe(gulp.dest('assets/css'))
	  .pipe(rename({ suffix: '.min' }))
	  .pipe(minifyCSS())
	  .pipe(gulp.dest('assets/css'))
	  .pipe(notify({ message: '**** CSS file processing complete! ****' }));
});



/* ------------ Optional SVG processing -------------- */

svg_config                  = {
    mode                : {
        view            : {         // Activate the «view» mode
            bust        : false,
			sprite		: 'icon-sprite.svg',
			dest		: '.'
        },
        symbol            : {         // Activate the «view» mode
            bust        : false,
            render      : {
                scss    : true,      // Activate Sass output (with default options)
				css     : true
            },
			sprite		: 'icon-sprite-def.svg',
			dest		: '.',
			svg                     : {                         // General options for created SVG files
			        xmlDeclaration      : false,                     // Add XML declaration to SVG sprite
			        doctypeDeclaration  : false,                     // Add DOCTYPE declaration to SVG sprite
			        namespaceIDs        : true,                     // Add namespace token to all IDs in SVG shapes
			        dimensionAttributes : true                      // Width and height attributes on the sprite
			    }
        }
    }
};

gulp.task('svg-sprite', function() {
    return gulp.src('src/svg/*.svg')
   .pipe(svgSprite(svg_config))
   .pipe(gulp.dest('assets/img/svg'));

});

gulp.task('svg2png', function() {

    return gulp.src('src/svg/*.svg')
        .pipe(svg2png())
        .pipe(gulp.dest('assets/img/svg/ie8-fallback'));
});

gulp.task('processSVG', ['svg-sprite','svg2png']);

/* -------------------------------------------------- */
gulp.task('connect', function(){
  connect.server({
    root: '.',
    livereload: true
  });
});

gulp.task('livereload', function (){
  gulp.src('.')
  .pipe(connect.reload());
});

gulp.task('processImages', function() {

	return gulp.src(['src/img/**'])
		.pipe(plumber())
		//.pipe(cache(imagemin({ optimazationLevel: 3, progressive: true, interlaced: true })))
		.pipe(gulp.dest('assets/img/'))
		.pipe(notify({ message: '**** Image processing complete! ****' }));
});


gulp.task('clean', function() {
    return del(['assets/**/*'/*,'assets/css', 'assets/js', 'assets/img', 'assets/fonts'*/]);
});

gulp.task('default', ['processScripts', 'processStyles', 'processImages','processSVG','copyVideos','copyFonts','copyLibJS']);

gulp.task('copyFonts', function() {

	return gulp.src(['src/fonts/**','!src/fonts/.DS_Store'])
	.pipe(plumber())
	.pipe(gulp.dest('assets/fonts'));

});

gulp.task('copyLibJS', function() {

	return gulp.src(['src/js/lib/*','!src/js/lib/.DS_Store'])
	.pipe(plumber())
	.pipe(gulp.dest('assets/js/lib'));
});

gulp.task('copyVideos', function() {

	return gulp.src(['src/videos/*','!src/videos/.DS_Store'])
	.pipe(plumber())
	.pipe(gulp.dest('assets/videos'));
});

gulp.task('clear', function(done){
	return cache.clearAll(done);
});

gulp.task('processData', function() {
	gulp.src("content/data/raw/*.json")
	.pipe(jsoncombine("merged.json",function(data){return new Buffer(JSON.stringify(data));}))
	.pipe(gulp.dest("content/data"))
	.pipe(notify({ message: '**** Data processing complete! ****' }));
});

// Watch
gulp.task('watch', function() {

	// Watch .scss files
	gulp.watch('src/sass/**/*.scss', ['processStyles']);

	// Code hinting for script files
	gulp.watch('src/js/**/*', ['processScripts']);

	// Specifically watch SVG image files
	gulp.watch('src/svg/*.svg', ['processSVG']);

	// Watch image files
	gulp.watch('src/img/**', ['processImages']);

	// Watch data files
	gulp.watch('content/data/raw/*.json', ['processData']);

	// Create LiveReload server
	livereload.listen();

	// Watch any files in dist/, reload on change
	gulp.watch('/', ['livereload']);
	// gulp.watch(['assets/**']).on('change', livereload.changed);
});

gulp.task('start', ['connect', 'watch']);
