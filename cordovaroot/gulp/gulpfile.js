var gulp = require('gulp');
var cssmin = require('gulp-cssmin');
var uglify= require('gulp-uglify');
var concat= require('gulp-concat');
var rimraf = require('rimraf');

gulp.task('default', function() {
    console.log("Hello World!");
});

gulp.task('build', ["clean", "cssconcat", "jsconcat"], function (cb) {
  console.log("Build!!");
});

gulp.task('clean', function (cb) {
    rimraf('./tmpjscs/*', cb);
});

gulp.task('cssmin', function () {
    gulp.src('./../imhereoriginal_www/css/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('./tmpjscs/'));
});

gulp.task('cssconcat', ["cssmin"], function() {
    gulp.src('./tmpjscs/*.css')
        .pipe(concat('imhere.all.css'))
        .pipe(gulp.dest('./output'));
});

gulp.task('jscompress', function() {
    gulp.src('./../imhereoriginal_www/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./tmpjscs/'));
});

gulp.task('jsconcat', ["jscompress"], function() {
    //gulp.src('./tmpjscs/*.js')
	gulp.src(['./tmpjscs/imhere.js', './tmpjscs/imhere.utils.js', './tmpjscs/imhere.api.indexeddb.js', './tmpjscs/imhere.api.metro.js', './tmpjscs/imhere.api.twitter.js', './tmpjscs/imhere.page.logon.js', './tmpjscs/imhere.page.main.js', './tmpjscs/imhere.page.googlemap.js'])
        .pipe(concat('imhere.all.js'))
        .pipe(gulp.dest('./output'));
});