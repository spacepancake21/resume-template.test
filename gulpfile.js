"use strict";

var gulp = require('gulp'),

	jade = require('gulp-jade'),
	prettify = require('gulp-prettify'),

	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	minifyCSS = require('gulp-minify-css'),

	uglify = require('gulp-uglify'),

	browserSync = require('browser-sync'),
	reload = browserSync.reload,

	wiredep = require('wiredep').stream,
	filter = require('gulp-filter'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	imagemin = require('gulp-imagemin'),
	size = require('gulp-size'),
	clean = require('gulp-clean');

/*
 PATHS
*/

var src = {
	html: 'app/*.html',
	jade: 'app/templates/*/*.jade',
	jadeMain: 'app/templates/pages/*.jade',

	css:  'app/css/*.css',
	sass: 'app/sass/*.sass',
	sassMain: 'app/sass/main.sass'
};

/*
	TASKS
*/

// Удаляет папки Dist
gulp.task('clean', function () {
	return gulp.src(['dist.prod', 'dist.dev'], {read: false})
		.pipe(clean());
});

// Сборка и вывод размера содержимого папки Dev
gulp.task('dist-dev', ['build-dev', 'images-dev', 'extras-dev'], function () {
	return gulp.src('dist.dev/**/*').pipe(size({title: 'build'}));
});

// Сборка и вывод размера содержимого папки Prod
gulp.task('dist-prod', ['build-prod', 'images-prod', 'extras-prod'], function () {
	return gulp.src('dist.prod/**/*').pipe(size({title: 'build'}));
});

// Перенос html, css, js в Dev
gulp.task('build-dev', function () {

	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulp.dest('dist.dev'));
});

// Перенос html, css, js в Prod
gulp.task('build-prod', function () {

	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpif('*.css', minifyCSS()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulp.dest('dist.prod'));
});

// Перенос шрифтов Dev
gulp.task('fonts-dev', function() {
	return gulp.src('app/fonts/*')
		.pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
		.pipe(gulp.dest('dist.dev/fonts/'))
});

// Перенос шрифтов Prod
gulp.task('fonts-prod', function() {
	return gulp.src('app/fonts/*')
		.pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
		.pipe(gulp.dest('dist.prod/fonts/'))
});

// Сжатие и перенос картинок Dev
gulp.task('images-dev', function () {
	return gulp.src('app/img/**/*')
		.pipe(gulp.dest('dist.dev/img'));
});

// Сжатие и перенос картинок Prod
gulp.task('images-prod', function () {
	return gulp.src('app/img/**/*')
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('dist.prod/img'));
});

// Перенос других файлов как favicon.ico Dev
gulp.task('extras-dev', function () {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	]).pipe(gulp.dest('dist.dev'));
});

// Перенос других файлов как favicon.ico Prod
gulp.task('extras-prod', function () {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	]).pipe(gulp.dest('dist.prod'));
});

// Компиляция jade в html
gulp.task('jade', function() {
	gulp.src(src.jadeMain)
		.pipe(jade())
		.pipe(prettify({indent_size: 2}))
		.on('error', log)
		.pipe(gulp.dest('app/'))
		.pipe(reload({stream: true}))
});

// Prettify html
gulp.task('html', function() {
	gulp.src(src.html)
		.pipe(prettify({indent_size: 2}))
		.on('error', log)
		.pipe(gulp.dest('app/'))
		.pipe(reload({stream: true}))
});

// Компиляция sass в css
gulp.task('sass', function() {
	gulp.src([src.sassMain, 'app/sass/ie.sass'])
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(autoprefixer({
			browsers: ['last 2 version','ie 8', 'ie 9', 'ie 10'],
			cascade: true
		}))
		.pipe(sourcemaps.write('./maps'))
		.on('error', log)
		.pipe(gulp.dest('app/css/'))
		.pipe(reload({stream: true}));
});

// Запускает локальный сервер с browserSync
gulp.task('server', function () {
	browserSync({
		server: "./app"
	});
});

// Подключаем ссылки из bower
gulp.task('bower', function () {
	return gulp.src('app/templates/common/*.jade')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\.\//,
			exclude: 'bower/modernizr/'
		}))
		.pipe(gulp.dest('app/templates/common'))
});

// Watch
gulp.task('watch', function() {
	gulp.watch(src.jade, ['jade']);
	gulp.watch(src.sass, ['sass']);

	gulp.watch([src.html, src.css]).on('change', reload);
});

// Default
gulp.task('default', ['server', 'watch']);

/*
 ERRORS LOG
*/

var log = function (error) {
	console.log([
		'',
		"-------------ERROR MESSAGE START-------------",
		("[" + error.name + " in " + error.plugin + "]"),
		error.message,
		"-------------ERROR MESSAGE END-------------",
		''
	].join('\n'));
	this.end();
};