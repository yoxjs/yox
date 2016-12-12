
import * as env from '../config/env'
import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import * as validator from '../util/validator'

function getComponentInfo(node, instance, callback) {
  let { component, attrs } = node
  instance.component(
    component,
    function (options) {
      let props = { }
      array.each(
        attrs,
        function (node) {
          props[node.name] = node.getValue()
        }
      )
      if (object.has(options, 'propTypes')) {
        validator.validate(props, options.propTypes)
      }
      callback(props, options)
    }
  )
}

export default {

  attach: function ({ el, node, instance }) {
    getComponentInfo(
      node,
      instance,
      function (props, options) {
        if (el.$component === env.NULL) {
          return
        }
        el.$component = instance.create(
          options,
          {
            el,
            props,
            replace: env.TRUE,
          }
        )
      }
    )
  },

  update: function ({ el, node, instance}) {
    getComponentInfo(
      node,
      instance,
      function (props) {
        el.$component.set(props, env.TRUE)
      }
    )
  },

  detach: function ({ el }) {
    if (el.$component) {
      el.$component.destroy(env.TRUE)
      el.$component = env.NULL
    }
  }

}
