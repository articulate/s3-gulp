require('dotenv').load();

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var clean = require('gulp-rimraf');
var webserver = require('gulp-webserver');
var awspublish = require('gulp-awspublish');

gulp.task('styles', function() {
  return gulp.src('src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./src/assets/css'));
});

gulp.task('js', function(){
  js_asset_order = [
    'src/javascript/vendors/jquery.js',
    'src/javascript/vendors/wistia.js',
    'src/javascript/vendors/visualNav.js',
    'src/javascript/application.js'
  ]

  return gulp.src(js_asset_order)
    .pipe(uglify('application.js', {
        outSourceMap: true
      }))
    .pipe(gulp.dest('./src/assets/js'));
});

gulp.task('clean', function(cb){
  gulp.src('./dist', { read: false })
    .pipe(clean());
  cb();
});

//compile our STYLES and JS and move it all to DIST
gulp.task('package', ['clean', 'styles', 'js'], function(){
  return gulp.src(['./src/**/*.html', './src/assets/**/*' ], { base: 'src'})
    .pipe(gulp.dest('./dist'));
});


//watch task
gulp.task('watch', function() {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/javascript/**/*.js', ['js']);
});

//default task
gulp.task('default', ['styles', 'js']);

//local webserver
gulp.task('webserver', function() {
  // set to src for active dev, change to dist to test packaged build
  gulp.src('src')
  .pipe(webserver({
      livereload: true,
      directoryListing: false,
      fallback: 'index.html',
      open: true
  }));
});

gulp.task('publish', function() {
  var publisher = awspublish.create({
    params: {
      Bucket: process.env.S3_BUCKET
    }
  });

  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src('./dist/**/*')
    .pipe(publisher.publish(headers))
    .pipe(publisher.sync())
    .pipe(awspublish.reporter());
});
