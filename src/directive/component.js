
import * as env from '../config/env'
import * as object from '../util/object'
import * as validator from '../util/validator'

function getComponentInfo(node, instance) {
  let options = instance.getComponent(node.custom)
  let props = object.copy(node.getAttributes(), env.TRUE)
  if (object.has(options, 'propTypes')) {
    validator.validate(props, options.propTypes)
  }
  return { options, props }
}

export default {

  onAttach: function ({ el, node, instance }) {
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

  onUpdate: function ({ el, node, instance }) {
    el.$component.set(
      getComponentInfo(node, instance).props
    )
  },

  onDetach: function ({ el }) {
    el.$component.destroy(env.TRUE)
    el.$component = env.NULL
  }

}
