const gulp = require('gulp')
const path = require('path')
const ts = require('gulp-typescript')
const argv = require('minimist')(process.argv.slice(2))

const dotenv = require('@microprogram/plugin-dotenv')
const alias = require('@microprogram/plugin-alias')
const { error } = require('@microprogram/shared-utils')
const unlink = require('../util/unlink')
const tsProject = ts.createProject('./tsconfig.json')

function compress(config, src, target) {
  target = target || config.path.dist

  return gulp
    .src(src)
    .pipe(tsProject())
    .pipe(alias(config.alias || {}))
    .pipe(dotenv(argv.mode))
    .on('error', (err) => {
      error(`${err}`, `gulp-task-ts`)
    })
    .pipe(gulp.dest(target))
}

exports.build = function (config) {
  return function () {
    return compress(config, `./${config.path.src}/**/*.ts`)
  }
}

exports.watch = function (config) {
  const { path: configPath } = config
  return function (cb) {
    gulp
      .watch(`./${configPath.src}/**/*.ts`, {
        delay: 1000
      })
      .on('change', function (file) {
        return compress(
          config,
          [`${path.dirname(file)}/*${path.extname(file)}`],
          path.dirname(
            file
              .replace(configPath.src, configPath.dist)
              .replace(/\.\w*$/, 'js')
          )
        )
      })
      .on('add', function (file) {
        return compress(
          config,
          [`${path.dirname(file)}/*${path.extname(file)}`],
          path.dirname(
            file
              .replace(configPath.src, configPath.dist)
              .replace(/\.\w*$/, 'js')
          )
        )
      })
      .on('unlink', function (file) {
        return unlink({
          file,
          fromPath: configPath.src,
          toPath: configPath.dist,
          tag: 'ts',
          extname: `.js`
        })
      })
    cb && cb()
  }
}
