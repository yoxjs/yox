import typescript from 'rollup-plugin-typescript'
// 替换代码中的 process.env.NODE_ENV
import replace from 'rollup-plugin-replace'
// 输出打包后的文件大小
import filesize from 'rollup-plugin-filesize'
// 压缩
import uglify from 'rollup-plugin-uglify'
// ES6 => ES5
import buble from 'rollup-plugin-buble'
// 本地服务器
import serve from 'rollup-plugin-serve'

import { name, version, author, license } from '../package.json'

const banner =
  `${'/**\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2016-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the ${license} License.\n` +
  ` */`;

export default function (env = 'production', minify = false, sourcemap = false, port = 0) {

  let suffix = minify ? '.min.js' : '.js'

  let plugins = [
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    typescript(),
    buble()
  ]

  if (minify) {
    plugins.push(
      uglify.uglify()
    )
  }

  if (port) {
    plugins.push(
      serve({
        port,
        contentBase: ['']
      })
    )
  }

  plugins.push(
    filesize()
  )

  return [
    {
      input: 'src/Yox.ts',
      output: [
        // umd
        {
          file: `dist/${name}${suffix}`,
          format: 'umd',
          name: 'Yox',
          banner,
          sourcemap,
        },
        // cjs
        {
          file: `dist/${name}.cjs${suffix}`,
          format: 'cjs',
          banner,
          sourcemap,
        },
        // esm
        {
          file: `dist/${name}.esm${suffix}`,
          format: 'es',
          banner,
          sourcemap,
        }
      ],
      plugins
    }
  ]
}