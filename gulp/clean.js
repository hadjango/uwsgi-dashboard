'use strict';

import path from 'path';
import del from 'del';

export default function(gulp, plugins, config, taskTarget) {
    let dirs = config.directories;

    // Clean
    gulp.task('clean', del.bind(null, [
        path.join(dirs.destination)
    ]));
}
