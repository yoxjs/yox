import typescript from 'rollup-plugin-typescript'
// 替换代码中的 process.env.NODE_ENV
import replace from 'rollup-plugin-replace'
// 输出打包后的文件大小
import filesize from 'rollup-plugin-filesize'
// 压缩
import { terser } from 'rollup-plugin-terser'
// 本地服务器
import serve from 'rollup-plugin-serve'

import buble from 'buble'

import { name, version, author, license } from '../package.json'

const banner =
  `${'/**\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2016-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the ${license} License.\n` +
  ` */\n`;

export default function (suffix, version, minify = false, sourcemap = false, port = 0) {

  let plugins = [
    replace({
      'process.env.NODE_ENV': JSON.stringify(version),
      'process.env.NODE_LEGACY': false
    }),
    typescript(),
    {
      name: 'buble',
      transform: function (code, id) {
        try {
          return buble.transform(code, {
            transforms: {
              modules: false
            }
          })
        }
        catch (e) {
          e.plugin = 'buble'
          if (!e.loc) e.loc = {}
          e.loc.file = id
          e.frame = e.snippet
          throw e
        }
      }
    }
  ]

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