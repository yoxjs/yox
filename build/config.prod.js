process.env.NODE_ENV = 'production'

import uglify from 'rollup-plugin-uglify'
import * as common from './config'

common.configList.map(config => {

  config.output.sourcemap = false

  config.plugins.push(
    uglify.uglify()
  )

})

export default common.configList
