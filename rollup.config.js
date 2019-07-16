// 根据 tsconfig.json 把 ts 转成 js
import typescript from 'rollup-plugin-typescript'
// 替换代码中的变量
import replace from 'rollup-plugin-replace'
// 输出打包后的文件大小
import filesize from 'rollup-plugin-filesize'
// ES6 转 ES5
import buble from 'rollup-plugin-buble'
// 压缩
import { terser } from 'rollup-plugin-terser'
// 本地服务器
import serve from 'rollup-plugin-serve'

import { name, version, author, license } from './package.json'

const banner =
  `${'/**\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2017-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the ${license} License.\n` +
  ` */\n`;

const sourcemap = true

let suffix = '.js'

const env = process.env.NODE_ENV
const release = process.env.NODE_RELEASE
const legacy = process.env.NODE_LEGACY === 'true'
const minify = process.env.NODE_MINIFY === 'true'
const port = process.env.NODE_PORT

const replaces = {
  'process.env.NODE_ENV': JSON.stringify(env),
  'process.env.NODE_VERSION': JSON.stringify(version),
  'process.env.NODE_LEGACY': legacy
}

if (env === 'pure') {
  replaces['public static dom: DomApi = domApi'] = ''
}

let plugins = [
  replace(replaces)
]

if (minify) {
  suffix = '.min' + suffix
}

let dir = (legacy ? 'legacy' : 'standard') + '/' + release

const output = []

if (process.env.NODE_FORMAT === 'es') {
  plugins.push(
    typescript({
      target: 'es6',
      include: []
    })
  )
  output.push({
    file: `dist/${dir}/${name}.esm${suffix}`,
    format: 'es',
    banner,
    sourcemap,
  })
}
else {
  plugins.push(
    // rollup 貌似有 bug，非得加个 include 才行
    typescript({
      include: []
    }),
    buble()
  )
  output.push({
    file: `dist/${dir}/${name}${suffix}`,
    format: 'umd',
    name: 'Yox',
    banner,
    sourcemap,
  })
}

if (minify) {
  plugins.push(
    terser()
  )
}

plugins.push(
  filesize()
)

if (port) {
  plugins.push(
    serve({
      port,
      contentBase: ['']
    })
  )
}

module.exports = [
  {
    input: 'src/Yox.ts',
    output,
    plugins
  }
]