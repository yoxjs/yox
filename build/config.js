import path from 'path'
import buble from 'rollup-plugin-buble'
import typescript from 'rollup-plugin-typescript'

export function resolveFile(filePath) {
  return path.join(__dirname, '..', filePath)
}

export const configList = [
  {
    input: resolveFile('src/Yox.ts'),
    output: {
      file: resolveFile('dist/yox.js'),
      format: 'umd',
      name: 'Yox',
    },
    plugins: [
      typescript(),
      buble(),
    ],
  }
]