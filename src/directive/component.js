
import * as env from '../config/env'
import * as object from '../util/object'
import * as validator from '../util/validator'

function getComponentInfo(node, instance) {
  let options = instance.getComponent(node.component)
  let props = node.getAttributes()
  if (object.has(options, 'propTypes')) {
    validator.validate(props, options.propTypes)
  }
  return { options, props }
}

export default {

  attach: function ({ el, node, instance }) {
    let info = getComponentInfo(node, instance)
    el.$component = instance.create(
      info.options,
      {
        el,
        props: info.props,
        replace: env.TRUE,
      }
    )
  },

  update: function ({ el, node, instance }) {
    el.$component.set(
      getComponentInfo(node, instance).props
    )
  },

  detach: function ({ el }) {
    el.$component.destroy(env.TRUE)
    el.$component = env.NULL
  }

}
