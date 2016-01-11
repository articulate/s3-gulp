require('dotenv').load();

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var clean = require('gulp-rimraf');
var s3 = require('gulp-s3-upload')({
                                      accessKeyId: process.env.S3_ACCESS_KEY_ID,
                                      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY 
                                    });

gulp.task('styles', function() {
  return gulp.src('src/sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./src/assets/css'));
});

gulp.task('js', function(){
  return gulp.src('src/javascript/**/*.js')
             .pipe(concat('bundle.js'))
             .pipe(gulp.dest('./src/assets/js'));
});

gulp.task('clean', function(cb){
  gulp.src('./dist', { read: false }).pipe(clean());
  cb();
});

//compile our STYLES and JS and move it all to DIST
gulp.task('package', ['clean', 'styles', 'js'], function(){
  return gulp.src(['./src/*.html', './src/assets/**/*' ], { base: 'src'})
             .pipe(gulp.dest('./dist'));
});

//publish dist dir to s3
gulp.task('publish', ['package'], function(){
  gulp.src('./dist/**/*')
             .pipe(s3({ Bucket: process.env.S3_BUCKET }, { maxRetries: 2 }));
});

//watch task
gulp.task('watch', function() {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/javascription/**/*.js', ['js']);
});

//default task 
gulp.task('default', ['styles', 'js']);

