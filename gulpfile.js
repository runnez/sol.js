var gulp       = require('gulp');
var browserify = require('gulp-browserify');
var connect    = require('gulp-connect');
var slim       = require('gulp-slim');
var source     = require('source');

gulp.task('js', function() {
  gulp.src('src/js/app.js')
    .pipe(browserify({
      debug: true,
      // require : { jquery : 'jquery-browserify' }
    }))
    .pipe(gulp.dest('dest/js'))
});

gulp.task('connect', function() {
  connect.server({
    root: 'dest',
    livereload: true
  });
});

gulp.task('slim', function() {
  gulp.src('src/slim/*.slim')
    .pipe(slim({
      pretty: false
    }))
    .pipe(gulp.dest('dest/'))
    .pipe(connect.reload());
});

gulp.task('watch', ['js', 'slim'], function() {

  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/slim/*.slim', ['slim']);

});

gulp.task('default', ['connect', 'watch']);
