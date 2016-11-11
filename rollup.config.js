import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify';

var minify = process.env.NODE_ENV === 'release'

export default {
  entry: 'src/Yox.js',
  format: 'umd',
  moduleName: 'Yox',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    babel({
      presets: ['es2015-rollup'],
      runtimeHelpers: true,
      babelrc: false,
    }),
    (minify && uglify()),
  ],
  dest: minify ? 'dist/yox.min.js' : 'dist/yox.js'
}
