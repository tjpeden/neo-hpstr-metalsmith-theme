'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', function() {
  return gulp
  .src('sass/**/*.scss')
  .pipe(sass({
    outputStyle: 'expanded',
  }).on('error', sass.logError))
  .pipe(gulp.dest('assets/stylesheets/'));
});

gulp.task('sass:watch', function() {
  gulp.watch('sass/**/*.scss', ['sass']);
});
