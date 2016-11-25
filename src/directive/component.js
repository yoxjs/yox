
import * as env from '../config/env'
import * as object from '../util/object'
import * as validator from '../util/validator'

function getComponentInfo(node, instance) {
  let options = instance.getComponent(node.custom)
  let props = object.copy(node.getAttributes(), env.TRUE)
  if (object.has(options, 'props')) {
    validator.validate(props, options.props)
  }
  return { options, props }
}

export default {

  onattach: function ({ el, node, instance }) {
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

  onupdate: function ({ el, node, instance }) {
    el.$component.set(
      getComponentInfo(node, instance).props
    )
  },

  ondetach: function ({ el }) {
    el.$component.dispose(env.TRUE)
    el.$component = env.NULL
  }

}
