var gulp       = require('gulp');
var plumber    = require('gulp-plumber');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  return gulp.src('test/*.js').pipe(mocha());
});

gulp.task('js', function() {
  return gulp.src('src/*.js')
    .pipe(plumber({ errorHandler: console.log }))
    .pipe(eslint())
    .pipe(eslint.formatEach('compact', process.stderr))
});

gulp.task('watch', ['js'], function() {
  gulp.watch(['src/*.js', 'test/*.js'], ['js', 'test']);
});

gulp.task('default', ['watch', 'test']);
