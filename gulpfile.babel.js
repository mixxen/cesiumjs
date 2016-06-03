import gulp from 'gulp';
import babel from 'gulp-babel';
import bump from 'gulp-bump';
import del from 'del';
import util from 'gulp-util';

import esLint from 'gulp-eslint';
import jsHint from 'gulp-jshint';

import replace from 'gulp-replace';
import swagger from 'gulp-swagger';

import swaggerExpress from 'swagger-express-mw';
import expressServer from 'express';

import packageJson from './package.json';

let version = require('./package.json').version;
let paths = require('./package.json').paths;
let ignoreNodeModulesDir = '!**/node_modules/**/*';
let app;
let http;

gulp.task('env:local', () => {
    process.env.build	= 'local';
process.env.server = 'express';
process.env.protocol = 'http';
process.env.host	= 'localhost:3000';
process.env.port = 3000;
process.env.hostname = 'localhost';
process.env.basePath = '/v1/';
process.env.A127_APPROOT = paths.app;
process.env.logLevel = 'debug';
process.env.logConnections = true;
process.env.logFileChanges = true;
});

gulp.task('env:integration', () => {
    process.env.build	= 'integration';
process.env.protocol = 'https';
process.env.hostname = '30908m9045.execute-api.us-east-1.amazonaws.com';
process.env.basePath = '/integration/v1/';
process.env.AWS = {
    regions: ['ap-east-1']
};
});

gulp.task('env:quality', () => {
    process.env.build	= 'quality';
process.env.protocol = 'https';
process.env.hostname = '30908m9045.execute-api.us-east-1.amazonaws.com';
process.env.basePath = '/quality/v1/';
process.env.AWS = {
    regions: ['ap-east-1']
};
});

gulp.task('env:staging', () => {
    process.env.build	= 'staging';
process.env.protocol = 'https';
process.env.host = 'aws.attitude.isstracker.space';
process.env.basePath = '/prod/v1/';
process.env.AWS = {
    regions: ['us-east-1']
};
});

gulp.task('env:prod', () => {
    process.env.build	= 'prod';
process.env.protocol = 'https';
process.env.host = 'aws.attitude.isstracker.space';
process.env.basePath = '/prod/v1/';
process.env.AWS = {
    regions: ['us-east-1']
};
});

gulp.task('aws-deploy', [], () => {
    console.log('TODO: push code to aws deployment');
});

gulp.task('bump:dev', () => {
    gulp.src('./package.json').pipe(bump({type:'patch'})).pipe(gulp.dest('.'));
});

gulp.task('bump:minor', () => {
    gulp.src('./package.json').pipe(bump({type:'minor'})).pipe(gulp.dest('.'));
});

gulp.task('bump:major', () => {
    gulp.src('./package.json').pipe(bump({type:'major'})).pipe(gulp.dest('.'));
});

gulp.task('clean:docs', () => {
    return del(paths.tmp + '/' + paths.docs);
});

gulp.task('clean:libs', () => {
    return del(paths.tmp + '/' + paths.library);
});

gulp.task('clean:lambda', () => {
    return del(paths.tmp + '/' + paths.lambda);
});

gulp.task('npm:delete', () => {
    gulp.src([
    paths.lambda + '/*/node_modules',
    paths.library + '/*/node_modules'
]).pipe(foreach ((stream, file) => {del(file.path);return stream;}));
});

gulp.task('clean:all', () => {
    return del(paths.tmp) && del(paths.deployment + '/' + version);
});

gulp.task('build:docs', ['clean:docs'], () => {
    let buildTo = paths.tmp + '/' + paths.docs;

gulp.src(paths.swaggerYaml)
    .pipe(replace(/^[ ]+x-swagger-router-controller: [\w ]+\n/), '')
    //.pipe(replace('place.holder.host', process.env.host))
    //.pipe(replace('/place/holder/base/path/', process.env.basePath))
    .pipe(gulp.dest(buildTo))
    .pipe(debug())
    .pipe(swagger('swagger.json'))
    .pipe(gulp.dest(buildTo));

merge(
    gulp.src(paths.swaggerYaml).pipe(swagger('swagger.json')),
    gulp.src(paths.swaggerUI + '/**/*.*').pipe(replace('http://petstore.swagger.io/v2/', ''))
)
//  .pipe(replace('PLACEHOLDER_HOST', process.env.host))
//  .pipe(replace('PLACEHOLDER_BASE_PATH', process.env.basePath))
    .pipe(gulp.dest(buildTo))
    .pipe(zip(paths.docs + '_' + version + '.zip'))
    .pipe(gulp.dest(paths.deployment + '/' + version));
});

gulp.task('build:libs', ['clean:libs'], () => {
    let filterBabel = filter('**/*.js', {restore: true});
let filterNpm = filter('**/package.json', {restore: true});

let buildFrom = paths.library + '/**/*.*';
let buildTo = paths.tmp + '/' + paths.library;

gulp.src([buildFrom, ignoreNodeModulesDir])
    .pipe(filterBabel).pipe(babel()).pipe(filterBabel.restore)
    .pipe(gulp.dest(buildTo))
    .pipe(filterNpm).pipe(install({production: true}));
});

gulp.task('build:lambda', ['build:libs'], () => {
    let filterBabel = filter('**/*.js', {restore: true});
let filterNpm = filter('**/package.json', {restore: true});

gulp.src([paths.lambda + '/**/*.*', ignoreNodeModulesDir])
    .pipe(filterBabel)
    .pipe(babel())
    .pipe(filterBabel.restore)
    .pipe(gulp.dest(paths.tmp + '/' + paths.lambda))
    .pipe(filterNpm)
    .pipe(install({production: true}));
});

gulp.task('build', ['build:docs', 'build:lambda'], () => {
    gulp.src([paths.tmp + '/' + paths.lambda + '/*/*'])
    .pipe(foreach ((stream, file) => {
            let info = require(file.path + '/package.json');
//console.log(file.path);
gulp.src([file.path + '/**/*.*'])
    .pipe(zip(info.name + '_' + info.version + '.zip'))
    .pipe(gulp.dest(paths.deployment + '/' + version));

return stream;
})
);
});

gulp.task('build:local', ['env:local', 'build']);

gulp.task('build:dev', ['env:integration', 'build']);

gulp.task('build:qa', ['env:quality', 'build']);

gulp.task('build:prod', ['env:prod', 'build']);

gulp.task('default', ['test', 'build']);

gulp.task('eslint', () => {
    return gulp.src([
        './gulpfile.babel.js',
        packageJson.app + 'api/**/*.js',
        packageJson.lambda + '/**/*.js',
        '!' + packageJson.lambda + '/**/node_modules'
    ])
        .pipe(esLint())
        .pipe(esLint.format())
        .pipe(esLint.failOnError());
});

gulp.task('jshint', () => {
    return gulp.src([
        './gulpfile.babel.js',
        packageJson.app + 'api/**/*.js'//,
        //packageJson.lambda + '/**/*.js'
    ])
        .pipe(jsHint())
        .pipe(jsHint.reporter('jshint-stylish'));
});

gulp.task('serve:init', ['env:local', 'build:docs'], () => {
    app = expressServer();

app.use(paths.docs, expressServer.static(paths.tmp + paths.docs));

http = swaggerExpress.create({appRoot: paths.app}, (err, swagExp) => {
        if (err) {
            throw err;
        }

        // install middleware
        swagExp.register(app);

app.listen(process.env.port);

util.log('try this: curl http://127.0.0.1:' + process.env.port + '/api');
});
});

gulp.task('serve', ['serve:init', 'watch']);

gulp.task('test', ['eslint', 'jshint']);

gulp.task('npm:install', () => {
    gulp.src([
    paths.lambda + '/*/package.json',
    paths.library + '/*/package.json'
]).pipe(install({production: false}));
});

gulp.task('vagrant:api-reload', ['swagger'], () => {
    ssh.shell(['sudo service api_server restart'], {filePath: 'logs/gulpssh.log'})
    .on('ssh2Data', (data) => {
    if (data) {
        console.log(data.toString());
    }
});
});

gulp.task('watch', () => {
    gulp.watch('./gulpfile.babel.js', ['env:local']);
gulp.watch(paths.docs, ['doc-gen']);

});
