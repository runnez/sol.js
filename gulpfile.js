var gulp       = require('gulp');
var connect    = require('gulp-connect');
var plumber    = require('gulp-plumber');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  return gulp.src('test/*.js').pipe(mocha({
    reporter: 'nyan'
  }));
});

gulp.task('js', function() {
  return gulp.src('src/js/*.js')
    .pipe(plumber({ errorHandler: console.log }))
    .pipe(eslint())
    .pipe(eslint.formatEach('compact', process.stderr))
    .pipe(gulp.dest('dest/js'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  connect.server({
    root: 'dest',
    livereload: true
  });
});

gulp.task('watch', ['js'], function() {
  gulp.watch(['src/js/**/*.js', 'test/*.js'], ['js', 'test']);
});

gulp.task('default', ['connect', 'watch', 'test']);
