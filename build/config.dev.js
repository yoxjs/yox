process.env.NODE_ENV = 'development'

import path from 'path'
import serve from 'rollup-plugin-serve'
import * as common from './config'

const PORT = 3000

const devSite = `http://127.0.0.1:${PORT}`
const devPath = path.join('example', 'index.html')
const devUrl = `${devSite}/${devPath}`

setTimeout(() => {
  console.log(`[dev]: ${devUrl}`)
}, 1000)

common.configList.forEach((config, index) => {

  config.output.sourcemap = true

  if (index === 0) {
    config.plugins.push(
      serve({
        port: PORT,
        contentBase: [common.resolveFile('')]
      })
    )
  }

})

export default common.configList