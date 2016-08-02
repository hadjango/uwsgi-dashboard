/*eslint no-process-exit:0 */

'use strict';

import path from 'path';

export default function(gulp, plugins, config, taskTarget) {
    let dirs = config.directories;

    // ESLint
    gulp.task('eslint', () => {
        gulp.src([
            path.join('gulpfile.js'),
            path.join(dirs.source, '**/*.js'),
            // Ignore all vendor folder files
            '!' + path.join('**/vendor/**', '*')
        ])
        .pipe(plugins.eslint({
            useEslintrc: true
        }))
        .pipe(plugins.eslint.format())
        .on('error', function() {
            process.exit(1);
        });
    });
}
