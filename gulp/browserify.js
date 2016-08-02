'use strict';

import path from 'path';
import glob from 'glob';
import browserify from 'browserify';
import envify from 'envify';
import babelify from 'babelify';
import _ from 'lodash';
import vsource from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

export default function(gulp, plugins, config, taskTarget) {
    let dirs = config.directories;
    let entries = config.entries;

    let browserifyTask = (files) => {
        return files.map((entry) => {
            let dest = path.resolve(taskTarget);

            // Options
            let customOpts = {
                entries: [entry],
                debug: true,
                transform: [
                    babelify, // Enable ES6 features
                    envify // Sets NODE_ENV for better optimization of npm packages
                ]
            };

            let bundler = browserify(customOpts);

            let rebundle = function() {
                let startTime = new Date().getTime();
                bundler.bundle()
                    .on('error', function(err) {
                        plugins.util.log(
                            plugins.util.colors.red('Browserify compile error:'),
                            '\n',
                            err,
                            '\n'
                        );
                        this.emit('end');
                    })
                    .pipe(vsource(entry))
                    .pipe(buffer())
                    .pipe(plugins.sourcemaps.init({loadMaps: true}))
                        .pipe(plugins.uglify())
                        .on('error', plugins.util.log)
                    .pipe(plugins.rename(function(filepath) {
                        // Remove 'source' directory
                        // Ex: 'src/' --> '/'
                        filepath.dirname = filepath.dirname.replace(dirs.source, '').replace('_', '');
                    }))
                    .pipe(plugins.sourcemaps.write('./'))
                    .pipe(gulp.dest(dest))
                    // Show which file was bundled and how long it took
                    .on('end', function() {
                        let time = (new Date().getTime() - startTime) / 1000;
                        console.log(
                            plugins.util.colors.cyan(entry)
                            + ' was browserified: '
                            + plugins.util.colors.magenta(time + 's'));
                    });
            };

            return rebundle();
        });
    };

    // Browserify Task
    gulp.task('browserify', (done) => {
        return glob('./' + path.join(dirs.source, entries.js), function(err, files) {
            if (err) {
                done(err);
            }

            return browserifyTask(files);
        });
    });
}
