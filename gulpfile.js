/**
 * Watch and handle workflow automation tasks.
 *
 * @author Louis Young
 * @version 1.2.0
 * @licence MIT
 */

// Dependencies
const gulp = require("gulp");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const eslint = require("gulp-eslint");
const sassLint = require("gulp-sass-lint");
const htmlLint = require("gulp-html-lint");
const plumber = require("gulp-plumber");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const sourcemaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const del = require("del");
const zip = require("gulp-zip");
const log = require("fancy-log");
const colour = require("ansi-colors");
const browserSync = require("browser-sync").create();

// Directory paths.
const paths = {
  src: "public_html/src/",
  dist: "public_html/dist/"
};

// Logger icons.
const icons = {
  success: "✓",
  warn: "⚠",
  info: "ℹ"
};

// Production mode.
let production = false;

/**
 * Compile Sass.
 *
 * @param callback
 */

function compileStyles(callback) {
  gulp
    .src(`${paths.src}stylesheets/**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(
      sassLint({
        configFile: ".sass-lint.json"
      })
    )
    .pipe(sassLint.format())
    .pipe(
      sass({
        outputStyle: "compressed",
        errLogToConsole: true,
        includePaths: `${paths.src}stylesheets`
      })
    )
    .on("error", sass.logError)
    .pipe(autoprefixer())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}stylesheets/`))
    .pipe(browserSync.stream());

  log.info(colour.blue(`${icons.info} Styles compiled`));
  if (callback) {
    callback();
  }
  return;
}

gulp.task("compileStyles", compileStyles);

/**
 * Compile scripts.
 *
 * @param callback
 */

function compileScripts(callback) {
  let stream = gulp.src(`${paths.src}scripts/*.js`);
  stream
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(eslint())
    .pipe(eslint.format());

  if (production) {
    stream.pipe(terser());
    stream.pipe(
      babel({
        presets: ["@babel/env"]
      })
    );
  }

  stream
    .pipe(concat("main.js"))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}scripts/`));

  let vendorStream = gulp.src(`${paths.src}scripts/vendor/*.js`);
  vendorStream.pipe(plumber()).pipe(sourcemaps.init());

  if (production) {
    vendorStream.pipe(terser());
  }

  vendorStream
    .pipe(concat("vendor.js"))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}scripts/vendor/`));

  browserSync.reload();

  log.info(colour.blue(`${icons.info} Scripts compiled`));
  if (callback) {
    callback();
  }
  return;
}

gulp.task("compileScripts", compileScripts);

/**
 * Compile HTML.
 *
 * @param callback
 */

function compileMarkup(callback) {
  gulp
    .src(`${paths.src}*.html`)
    .pipe(plumber())
    .pipe(
      htmlLint({
        htmllintrc: ".html-lintrc.json"
      })
    )
    .pipe(htmlLint.format())
    .pipe(gulp.dest(`${paths.dist}`));
  browserSync.reload();

  log.info(colour.blue(`${icons.info} Markup compiled`));
  if (callback) {
    callback();
  }
  return;
}

gulp.task("compileMarkup", compileMarkup);

/**
 * Optimize static assets.
 *
 * @param callback
 */

function compressAssets(callback) {
  gulp
    .src(`${paths.src}assets/**/*`)
    .pipe(plumber())
    .pipe(
      imagemin([
        imagemin.jpegtran({
          progressive: true
        }),
        imagemin.optipng({
          optimizationLevel: 5
        }),
        imagemin.gifsicle({
          interlaced: true
        }),
        imagemin.svgo({
          plugins: [
            {
              cleanupAttrs: true
            },
            {
              removeComments: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(`${paths.dist}assets/`));

  browserSync.reload();

  log.info(colour.blue(`${icons.info} Assets optimised`));

  if (callback) {
    callback();
  }
  return;
}

gulp.task("compressAssets", compressAssets);

/**
 * Lint Sass.
 *
 * @param callback
 */

function lintStyles(callback) {
  gulp
    .src(`${paths.src}stylesheets/**/*.scss`)
    .pipe(plumber())
    .pipe(
      sassLint({
        configFile: ".sass-lint.json"
      })
    )
    .pipe(sassLint.format());
  if (callback) {
    callback();
  }
  return;
}

gulp.task("lintStyles", lintStyles);

/**
 * Lint scripts.
 *
 * @param callback
 */

function lintScripts(callback) {
  gulp
    .src(`${paths.src}scripts/*.js`)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
  if (callback) {
    callback();
  }
  return;
}

gulp.task("lintScripts", lintScripts);

/**
 * Lint HTML.
 *
 * @param callback
 */

function lintMarkup(callback) {
  gulp
    .src(`${paths.src}*.html`)
    .pipe(
      htmlLint({
        htmllintrc: ".html-lintrc.json"
      })
    )
    .pipe(htmlLint.format());
  if (callback) {
    callback();
  }
  return;
}

gulp.task("lintMarkup", lintMarkup);

/**
 * Clean the distributable directory.
 *
 * @param callback
 */

function clean(callback) {
  del(`${paths.dist}**`, {
    force: true
  });
  if (callback) {
    callback();
  }
  log.info(colour.green(`${icons.success} Build directory cleaned`));
  return;
}

gulp.task("clean", clean);

/**
 * Launch a development server.
 *
 * @param callback
 */

function server(callback) {
  browserSync.init({
    server: paths.dist,
    notify: false,
    scrollProportionally: false,
    logLevel: "silent"
  });

  log.info(colour.green(`${icons.success} Starting the development server...`));
  log("");

  if (callback) {
    callback();
  }
  return;
}

gulp.task("server", server);

/**
 * Compile all files.
 *
 * @param callback
 */

function compile(callback) {
  compileMarkup();
  compileStyles();
  compileScripts();
  compressAssets();
  if (production) {
    log("");
    log.info(colour.green(`${icons.success} Production version built`));
  }
  if (callback) {
    callback();
  }
  return;
}

gulp.task("compile", compile);

/**
 * Build all files for production.
 *
 * @param callback
 */

function build(callback) {
  production = true;
  compile();
  if (callback) {
    callback();
  }
  return;
}

gulp.task("build", build);

/**
 * Lint all JavaScript, Sass and HTML.
 *
 * @param callback
 */

function lint(callback) {
  lintStyles();
  lintScripts();
  lintMarkup();

  log.info(colour.green(`${icons.success} Linted`));

  if (callback) {
    callback();
  }
  return;
}

gulp.task("lint", lint);

/**
 * Create an archive of production build files.
 *
 * @param callback
 */

function compress(callback) {
  gulp
    .src(`${paths.dist}**`)
    .pipe(plumber())
    .pipe(zip("build.zip"))
    .pipe(gulp.dest("."));

  log.info(colour.green(`${icons.success} Production build packaged`));

  if (callback) {
    callback();
  }
  return;
}

gulp.task("compress", compress);

gulp.task("package", gulp.series(["clean", "build", "compress"]));

/**
 * Watch source files & static assets for changes.
 *
 * @param callback
 */

function watch(callback) {
  gulp.watch(`${paths.src}*.html`, compileMarkup);
  gulp.watch(`${paths.src}stylesheets/**/*.scss`, compileStyles);
  gulp.watch(`${paths.src}scripts/**`, compileScripts);
  gulp.watch(`${paths.src}assets/**`, compressAssets);

  if (!production) {
    log.info(
      colour.yellow(
        `${icons.warn} Note that the development build is not optimised`
      )
    );
    log("");
  }
  log.info(colour.green(`${icons.success} Watching changes...`));
  log("");

  if (callback) {
    callback();
  }
  return;
}

gulp.task("watch", watch);

gulp.task("start", gulp.parallel("server", "watch", "compile"));
