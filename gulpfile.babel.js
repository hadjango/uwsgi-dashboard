'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import pjson from './package.json';
import wrench from 'wrench';

// Load all gulp plugins based on their names
// EX: gulp-copy -> copy
const plugins = gulpLoadPlugins();

let config = pjson.config;
let dirs = config.directories;
let taskTarget = dirs.destination;

// This will grab all js in the `gulp` directory
// in order to load all gulp tasks
wrench.readdirSyncRecursive('./gulp').filter((file) => {
    return (/\.(js)$/i).test(file);
}).map(function(file) {
    require('./gulp/' + file)(gulp, plugins, config, taskTarget);
});

// Default task
gulp.task('default', ['clean'], () => {
    gulp.start('build');
});

// Build production-ready code
gulp.task('build', [
    'copy',
    'browserify'
]);

// Testing
gulp.task('test', ['eslint']);
