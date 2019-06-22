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

import { name, version, author, license } from '../package.json'

const banner =
  `${'/**\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2017-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the ${license} License.\n` +
  ` */\n`;

const sourcemap = true

let suffix = '.js'

export default function (env, release, minify = false, legacy = false, port = 0) {

  const replaces = {
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.NODE_VERSION': JSON.stringify(version),
    'process.env.NODE_LEGACY': legacy
  }

  if (env === 'pure') {
    replaces['public static dom: DomUtil = domApi'] = ''
  }

  let plugins = [
    replace(replaces),
    typescript(),
    // buble 比 typescript 直接转 ES5 效果更好
    buble()
  ]

  let dir = (legacy ? 'legacy' : 'standard') + '/' + release

  if (minify) {
    suffix = '.min' + suffix
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
        {
          file: `dist/${dir}/${name}${suffix}`,
          format: 'umd',
          name: 'Yox',
          banner,
          sourcemap,
        }
      ],
      plugins
    }
  ]
}