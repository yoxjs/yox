
import * as env from '../config/env'
import * as object from '../util/object'

export default {

  attach: function ({ el, node, instance }) {
    el.$component = instance.create(
      instance.getComponent(node.custom),
      {
        el,
        props: object.copy(node.getAttributes(), true),
        replace: env.TRUE,
      }
    )
  },

  update: function ({ el, node }) {
    el.$component.set(
      object.copy(node.getAttributes(), true)
    )
  },

  detach: function ({ el }) {
    el.$component.dispose()
    el.$component = env.NULL
  }

}
