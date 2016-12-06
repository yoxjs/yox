
import * as env from '../config/env'
import * as object from '../util/object'
import * as validator from '../util/validator'

export default {

  attach: function ({ el, node, instance }) {
    let options = instance.getComponent(node.component)
    let props = node.getAttributes()
    if (object.has(options, 'propTypes')) {
      validator.validate(props, options.propTypes)
    }
    el.$component = instance.create(
      options,
      {
        el,
        props,
        replace: env.TRUE,
        extensions: {
          propDeps: node.deps,
        }
      }
    )
  },

  detach: function ({ el }) {
    el.$component.destroy(env.TRUE)
    el.$component = env.NULL
  }

}
