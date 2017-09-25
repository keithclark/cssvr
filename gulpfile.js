const gulp = require('gulp');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const replace = require('gulp-replace');
const cleancss = require('gulp-clean-css');
const babili = require("gulp-babili");
const rename = require("gulp-rename");
const runSequence = require('run-sequence');
const del = require('del');
const package = require('./package.json');


// Load the config
const config = require(`./config-${process.env.CONFIG || 'dev'}.json`);


gulp.task('minifycss', function() {
  return gulp.src('./src/css/vr.css')
    .pipe(cleancss())
    .pipe(gulp.dest('./build'))
});

gulp.task('inlinecss', function() {
  return gulp.src('./build/cssvr-nocss.js')
    .pipe(replace('/* CSSVR STYLES ARE INJECTED HERE */', function (m) {
      return require('fs').readFileSync('./build/vr.css');
    }))
    .pipe(rename('cssvr.js'))
    .pipe(gulp.dest('./build'))
});

gulp.task('bundlejs', function() {
  return rollup({
    entry: './src/js/vr.js',
    format: 'iife',
    moduleName: 'CSSVR',
  })
  .pipe(source('cssvr-nocss.js'))
  .pipe(gulp.dest('./build'))
});

gulp.task('watch', function() {
  gulp.watch('./src/js/**/*.js', () => runSequence('bundlejs', 'inlinecss'));
  gulp.watch('./src/css/**/*.css', () => runSequence('minifycss', 'inlinecss'));
});

gulp.task('dev', cb => runSequence('build', 'watch', cb));

gulp.task('build', cb => runSequence(['bundlejs', 'minifycss'], 'inlinecss', cb));

gulp.task('dist', cb => runSequence('build', () => {
  gulp.src('./build/cssvr.js')
    .pipe(gulp.dest('./dist'));

  gulp.src("./build/cssvr.js")
    .pipe(babili())
    .pipe(replace(/^/, `/*! ${package.name} v${package.version} - ${package.author} - ${package.license} license */\n`))
    .pipe(rename('cssvr.min.js'))
    .pipe(gulp.dest("./dist"))
    .on('end', cb);
}));

gulp.task('clean', cb => {
  return del([config.siteBuildPath]);
});

gulp.task('publish', cb => runSequence('clean', 'dist', () => {
  // copy everything but HTML files
  gulp.src('./examples/**/!(*.html)')
    .pipe(gulp.dest(config.siteBuildPath));

  // copy the dist version of CSSVR
  gulp.src('./dist/cssvr.min.js')
    .pipe(gulp.dest(`${config.siteBuildPath}/common`));

  // update the path to CSSVR
  gulp.src('./examples/**/*.html')
    .pipe(replace('src="../../dist/cssvr.min.js"', 'src="../common/cssvr.min.js"'))
    .pipe(replace('</body>', config.trackingSnippet + '</body>'))
    .pipe(gulp.dest(config.siteBuildPath))
    .on('end', cb);
}));
