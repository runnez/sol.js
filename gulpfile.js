var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var connect = require('gulp-connect');
var slim = require("gulp-slim");

gulp.task('html', function () {
  gulp.src('slim/*.html')
    .pipe(connect.reload());
});

gulp.task('js', function () {
  browserify({
    entries: 'app/assets/javascripts/application.jsx',
    debug: true
  })
  .transform(babelify)
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('public'));
});

gulp.task('connect', function() {
  connect.server({
    root: 'tmp',
    livereload: true
  });
});

gulp.task('connect', function() {
  connect.server();
});

gulp.task('slim', function(){
  gulp.src("slim/*.slim")
    .pipe(slim({
      pretty: false
    }))
    .pipe(gulp.dest("./"));
});

gulp.task('watch', function() {
  gulp.watch('app/assets/javascripts/**', ['js']);
  gulp.watch(['./slim/*.slim'], ['slim']);
  //gulp.watch(paths.images, ['images']);
});

gulp.task('default', ['connect', 'watch']);
