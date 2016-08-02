'use strict';

import path from 'path';

export default function(gulp, plugins, config, taskTarget) {
    let dirs = config.directories;
    let dest = path.join(taskTarget);

    // Copy
    gulp.task('copy', () => {
        return gulp.src([
                path.join(dirs.source, '**/*'),
                '!' + path.join(dirs.source, '**/*.js'),
                path.join(dirs.source, '../node_modules/bootstrap/dist/css/bootstrap.css')
            ])
            .pipe(plugins.changed(dest))
            .pipe(gulp.dest(dest));
    });
}
