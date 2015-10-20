var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var connect = require('gulp-connect');
var slim = require("gulp-slim");
var source = require("source");

gulp.task('js', function () {
  browserify({
    entries: './component.js',
    debug: true
  })
  .transform(babelify)
  .bundle()
  .pipe(source('component.js.js'))
  .pipe(gulp.dest('./example/'))
});

gulp.task('connect', function() {
  connect.server({
    root: 'example',
    livereload: true
  });
});

gulp.task('slim', function(){
  gulp.src("src/slim/*.slim")
    .pipe(slim({
      pretty: false
    }))
    .pipe(gulp.dest("./example/"))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.run('js')
  gulp.watch('component.js', ['js']);
  gulp.watch(['./src/slim/*.slim'], ['slim']);
  //gulp.watch(paths.images, ['images']);
});

gulp.task('default', ['connect', 'watch']);
