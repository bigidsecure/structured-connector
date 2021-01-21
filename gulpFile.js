/* gulpFile.js
Gulp is a build system for NodeJS and web applications. This File
contains the code to build the project into a Docker image and 
NodeJS-executable project.

To build the project use:
gulp

To run the project use:
gulp develop
*/

var gulp = require('gulp');
var del = require('del');
var ts = require('gulp-typescript');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('nodemon');

/* Since we're using Typescript, 
we need to transpile it to JavaScript 
before Node can execute */
gulp.task('transpile', () => {
  tsProject = ts.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .js
    .pipe(sourcemaps.write({
      sourceRoot: function (file) {
        var sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }))
    .pipe(gulp.dest('build'));
});


/* Copy the dependecy files over to the build folder */
gulp.task('copy-package.json', function () {
  return gulp.src(['package.json']).pipe(gulp.dest('build'));
});

/* Clean the project */
gulp.task('clean', () => {
  return del('build', { force: true });
});

/* 
This task will start the application and run Nodemon.
Nodemon is an application that will automatically reload
the application when changes are made.
*/
gulp.task("start", function(cb) {
  var options = {
    watch: ["build/"],
    script: "build/index.js",
    debug: true
  }
  nodemon(options);
  nodemon.on("start", cb);
});

/* This task will recompile the project if there are changes */
gulp.task("watch", function() {
  gulp.watch("./src/**/*", gulp.series(["transpile"]));
});


gulp.task("develop", gulp.series('clean', 'transpile', 'copy-package.json',gulp.parallel(["watch","start"])));


gulp.task('default', gulp.series(['clean', 'transpile', 'copy-package.json']));
