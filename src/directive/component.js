
import * as env from '../config/env'

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import * as string from '../util/string'
import * as componentUtil from '../util/component'

function getComponentInfo(node, instance, directives, callback) {
  let { component, attrs } = node
  instance.component(
    component,
    function (options) {
      let props = { }
      array.each(
        attrs,
        function (node) {
          props[string.camelCase(node.name)] = node.getValue()
        }
      )
      if (!object.has(props, 'value')) {
        let { model } = directives
        if (model) {
          node = model.node
          let result = instance.get(node.getValue(), node.keypath)
          if (result) {
            props.value = result.value
          }
        }
      }
      let { propTypes } = options
      if (is.object(propTypes)) {
        props = componentUtil.validate(props, propTypes)
      }
      callback(props, options)
    }
  )
}

export default {

  attach: function ({ el, node, instance, directives }) {
    el.$component = [ ]
    getComponentInfo(
      node,
      instance,
      directives,
      function (props, options) {
        let { $component } = el
        if (is.array($component)) {
          el.$component = instance.create(
            options,
            {
              el,
              props,
              replace: env.TRUE,
            }
          )
          array.each(
            $component,
            function (callback) {
              callback(el.$component)
            }
          )
        }
      }
    )
  },

  update: function ({ el, node, instance, directives }) {
    let { $component } = el
    if (is.object($component)) {
      getComponentInfo(
        node,
        instance,
        directives,
        function (props) {
          $component.set(props, env.TRUE)
        }
      )
    }
  },

  detach: function ({ el }) {
    let { $component } = el
    if ($component) {
      if (is.object($component)) {
        $component.destroy(env.TRUE)
      }
      el.$component = env.NULL
    }
  }

}
