
import {
  TRUE,
  NULL,
} from '../config/env'

import {
  copy,
} from '../util/object'

module.exports = {

  attach: function ({ el, node, instance }) {
    el.$component = instance.create(
      instance.getComponent(node.custom),
      {
        el,
        props: copy(node.getAttributes(), true),
        replace: TRUE,
      }
    )
  },

  update: function ({ el, node }) {
    el.$component.set(
      copy(node.getAttributes(), true)
    )
  },

  detach: function ({ el }) {
    el.$component.dispose()
    el.$component = NULL
  }

}
