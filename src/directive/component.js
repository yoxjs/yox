
import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'

function getComponentInfo(node, instance, directives, callback) {
  let { name, attributes } = node
  instance.component(
    name,
    function (options) {
      let props = { }
      array.each(
        attributes,
        function (node) {
          props[string.camelCase(node.name)] = node.value
        }
      )
      if (!object.has(props, 'value')) {
        let { model } = directives
        if (model) {
          let result = instance.get(model.value, model.keypath)
          if (result) {
            props.value = result.value
          }
        }
      }
      callback(props, options)
    }
  )
}

export default {

  attach({ el, node, instance, directives }) {
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
    return function () {
      let { $component } = el
      if ($component) {
        if (is.object($component)) {
          $component.destroy(env.TRUE)
        }
        el.$component = env.NULL
      }
    }
  },

  update({ el, node, instance, directives }) {
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
  }

}
