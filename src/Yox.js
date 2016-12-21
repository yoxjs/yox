
import * as env from './config/env'
import * as cache from './config/cache'
import * as syntax from './config/syntax'
import * as pattern from './config/pattern'
import * as registry from './config/registry'
import * as switcher from './config/switcher'
import * as lifecycle from './config/lifecycle'

import * as view from './view/index'

import * as is from './util/is'
import * as array from './util/array'
import * as object from './util/object'
import * as string from './util/string'
import * as logger from './util/logger'
import * as nextTask from './util/nextTask'
import * as component from './util/component'
import * as validator from './util/validator'
import * as keypathUtil from './util/keypath'

import * as expression from './expression/index'
import * as expressionNodeType from './expression/nodeType'

import * as vdom from './platform/web/vdom'
import * as native from './platform/web/native'

import magic from './function/magic'
import execute from './function/execute'
import toNumber from './function/toNumber'

import Store from './util/Store'
import Event from './util/Event'
import Emitter from './util/Emitter'

export default class Yox {

  constructor(options) {

    let instance = this

    execute(options[lifecycle.BEFORE_CREATE], instance, options)

    let {
      el,
      data,
      props,
      parent,
      replace,
      computed,
      template,
      watchers,
      components,
      directives,
      events,
      filters,
      methods,
      partials,
      extensions,
    } = options

    // 如果不绑着，其他方法调不到钩子
    instance.$options = options

    // 检查 props
    if (props && !is.object(props)) {
      props = env.NULL
    }
    // 如果传了 props，则 data 应该是个 function
    if (props && data && !is.func(data)) {
      logger.warn('Passing a `data` option should be a function.')
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$data = props || { }

    // 后放 data
    object.extend(
      instance.$data,
      is.func(data) ? data.call(instance) : data
    )

    // 计算属性也是数据
    if (is.object(computed)) {

      // 把计算属性拆为 getter 和 setter
      instance.$computedGetters = { }
      instance.$computedSetters = { }

      // 辅助获取计算属性的依赖
      instance.$computedStack = [ ]
      instance.$computedDeps = { }

      object.each(
        computed,
        function (item, keypath) {
          let get, set, deps, cache = env.TRUE
          if (is.func(item)) {
            get = item
          }
          else if (is.object(item)) {
            if (is.boolean(item.cache)) {
              cache = item.cache
            }
            if (is.array(item.deps)) {
              deps = item.deps
            }
            if (is.func(item.get)) {
              get = item.get
            }
            if (is.func(item.set)) {
              set = item.set
            }
          }

          if (get) {

            let watcher = function () {
              getter.$dirty = env.TRUE
            }

            let getter = function () {
              if (!getter.$dirty) {
                if (cache && object.has($watchCache, keypath)) {
                  return $watchCache[keypath]
                }
              }
              else {
                delete getter.$dirty
              }

              if (!deps) {
                instance.$computedStack.push([ ])
              }
              let result = execute(get, instance)

              let newDeps = deps || instance.$computedStack.pop()
              let oldDeps = instance.$computedDeps[keypath]
              if (newDeps !== oldDeps) {
                component.updateDeps(
                  instance,
                  newDeps,
                  oldDeps,
                  watcher
                )
              }

              instance.$computedDeps[keypath] = newDeps
              $watchCache[keypath] = result

              return result
            }
            getter.$binded =
            getter.$computed = env.TRUE
            instance.$computedGetters[keypath] = getter
          }

          if (set) {
            instance.$computedSetters[keypath] = set
          }

        }
      )
    }

    // 监听各种事件
    instance.$eventEmitter = new Emitter()
    instance.on(events)

    let $watchCache =
    instance.$watchCache = { }
    instance.$watchEmitter = new Emitter({
      onAdd: function (added) {
        array.each(
          added,
          function (keypath) {
            if (keypath.indexOf('*') < 0
              && !object.has($watchCache, keypath)
            ) {
              $watchCache[keypath] = instance.get(keypath)
            }
          }
        )
      },
      onRemove: function (removed) {
        array.each(
          removed,
          function (keypath) {
            if (object.has($watchCache, keypath)) {
              delete $watchCache[keypath]
            }
          }
        )
      }
    })
    instance.watch(watchers)

    execute(options[lifecycle.AFTER_CREATE], instance)

    // 检查 template
    if (is.string(template)) {
      if (pattern.selector.test(template)) {
        template = native.getContent(template)
      }
      if (!pattern.tag.test(template)) {
        logger.error('Passing a `template` option must have a root element.')
      }
    }
    else {
      template = env.NULL
    }

    // 检查 el
    if (is.string(el)) {
      if (pattern.selector.test(el)) {
        el = native.find(el)
      }
    }
    if (el) {
      if (native.isElement(el)) {
        if (!replace) {
          el = native.create(el, 'div')
        }
      }
      else {
        logger.error('Passing a `el` option must be a html element.')
      }
    }

    if (parent) {
      instance.$parent = parent
    }

    object.extend(instance, methods)
    object.extend(instance, extensions)

    instance.component(components)
    instance.directive(directives)
    instance.filter(filters)
    instance.partial(partials)

    if (el && template) {
      instance.$viewWatcher = function () {
        instance.$dirty = env.TRUE
      }
      execute(options[lifecycle.BEFORE_MOUNT], instance)
      instance.$template = instance.compileTemplate(template)
      instance.update(el)
    }

  }

  /**
   * 取值
   *
   * @param {string} keypath
   * @param {?boolean} trim 在提交数据时，这个选项很有用
   * @return {*}
   */
  get(keypath, trim) {

    let {
      $data,
      $computedStack,
      $computedGetters,
    } = this

    keypath = keypathUtil.normalize(keypath)

    if ($computedStack) {
      let deps = array.last($computedStack)
      if (deps) {
        deps.push(keypath)
      }
    }

    let value, hasValue
    if ($computedGetters) {
      let getter = $computedGetters[keypath]
      if (getter) {
        value = getter()
        hasValue = env.TRUE
      }
    }

    if (!hasValue) {
      let result = object.get($data, keypath)
      if (result) {
        value = result.value
      }
    }

    if (trim === env.TRUE && is.string(value)) {
      value = value.trim()
    }

    return value

  }

  set(keypath, value) {

    let model, immediate
    if (is.string(keypath)) {
      model = { }
      model[keypath] = value
    }
    else if (is.object(keypath)) {
      model = object.copy(keypath)
      immediate = value === env.TRUE
    }
    else {
      return
    }

    let instance = this

    let {
      $data,
      $computedSetters,
    } = instance

    object.each(
      model,
      function (newValue, key) {
        // 格式化 Keypath
        let keypath = keypathUtil.normalize(key)
        if (keypath !== key) {
          delete model[key]
          model[keypath] = newValue
        }
      }
    )

    object.each(
      model,
      function (value, keypath) {
        if ($computedSetters) {
          let setter = $computedSetters[keypath]
          if (setter) {
            setter.call(instance, value)
            return
          }
        }
        object.set($data, keypath, value)
      }
    )

    component.refresh(instance, immediate)

  }

  /**
   * 监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   */
  on(type, listener) {
    this.$eventEmitter.on(type, listener)
  }

  /**
   * 监听一次事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   */
  once(type, listener) {
    this.$eventEmitter.once(type, listener)
  }

  /**
   * 取消监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   */
  off(type, listener) {
    this.$eventEmitter.off(type, listener)
  }

  /**
   * 触发事件
   *
   * @param {string} type
   * @param {?*} data
   * @param {?boolean} noBubble 事件默认冒泡，不冒泡请传 true
   */
  fire(type, data, noBubble) {

    if (data === env.TRUE) {
      noBubble = data
      data = env.NULL
    }

    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件
    let event = data
    if (!(event instanceof Event)) {
      event = new Event(type)
      if (data) {
        event.data = data
      }
    }

    // 事件名称经过了转换
    if (event.type !== type) {
      data = event.data
      event = new Event(event)
      event.type = type
      // data 不能换位置，否则事件处理函数获取数据很蛋疼
      if (data) {
        event.data = data
      }
    }

    let instance = this
    let { $parent, $eventEmitter } = instance

    if (!event.target) {
      event.target = instance
    }

    let done = $eventEmitter.fire(type, event, instance)
    if (done && $parent && !noBubble) {
      done = $parent.fire(type, event)
    }

    return done

  }

  /**
   * 监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   */
  watch(keypath, watcher) {
    this.$watchEmitter.on(keypath, watcher)
  }

  /**
   * 监听一次数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   */
  watchOnce(keypath, watcher) {
    this.$watchEmitter.once(keypath, watcher)
  }

  /**
   * 更新视图
   */
  update(el) {

    let instance = this

    let {
      $viewDeps,
      $viewWatcher,
      $dirty,
      $data,
      $options,
      $filters,
      $template,
      $currentNode,
      $computedGetters,
    } = instance

    if ($currentNode) {
      execute($options[lifecycle.BEFORE_UPDATE], instance)
    }
    if ($dirty) {
      delete instance.$dirty
    }

    let context = { }

    object.extend(
      context,
      // 全局过滤器
      registry.filter.data,
      // 本地数据，这意味着 data 也能写函数，只是用 filter 来隔离过滤器
      $data,
      // 本地过滤器
      $filters.data,
      // 本地计算属性
      $computedGetters
    )

    object.each(
      context,
      function (value, key) {
        if (is.func(value) && !value.$binded) {
          context[key] = value.bind(instance)
        }
      }
    )

    let { root, deps } = view.render($template, context)
    instance.$viewDeps = object.keys(deps)
    component.updateDeps(
      instance,
      instance.$viewDeps,
      $viewDeps,
      $viewWatcher
    )

    let newNode = vdom.create(root, instance), afterHook
    if ($currentNode) {
      afterHook = lifecycle.AFTER_UPDATE
      $currentNode = vdom.patch($currentNode, newNode)
    }
    else {
      afterHook = lifecycle.AFTER_MOUNT
      $currentNode = vdom.patch(el, newNode)
      instance.$el = $currentNode.elm
    }

    instance.$currentNode = $currentNode
    execute($options[afterHook], instance)

  }

  /**
   * 创建子组件
   *
   * @param {Object} options 组件配置
   * @param {?Object} extra 添加进组件配置，但不修改配置的数据，比如 el、props 等
   * @return {Yox} 子组件实例
   */
  create(options, extra) {
    options = object.extend({ }, options, extra)
    options.parent = this
    let child = new Yox(options)
    let children = this.$children || (this.$children = [ ])
    children.push(child)
    return child
  }

  /**
   * 把模板编译成 Yox 独有的 virtual dom
   *
   * @param {string} template
   * @return {Object}
   */
  compileTemplate(template) {
    let instance = this
    if (is.string(template)) {
      return view.parse(
        template,
        function (id) {
          let partial = instance.partial(id)
          return is.string(partial) ? instance.compileTemplate(partial) : partial
        },
        function (id, node) {
          instance.partial(id, node)
        }
      )
    }
    return template
  }

  compileValue(keypath, value) {

    if (!value || !is.string(value)) {
      return
    }

    let instance = this
    if (value.indexOf('(') > 0) {
      let ast = expression.parse(value)
      if (ast.type === expressionNodeType.CALL) {
        return function (e) {
          let isEvent = e instanceof Event
          let args = object.copy(ast.args)
          if (!args.length) {
            if (isEvent) {
              args.push(e)
            }
          }
          else {
            args = args.map(
              function (node) {
                let { name, type } = node
                if (type === expressionNodeType.LITERAL) {
                  return node.value
                }
                if (type === expressionNodeType.IDENTIFIER) {
                  if (name === syntax.SPECIAL_EVENT) {
                    if (isEvent) {
                      return e
                    }
                  }
                  else if (name === syntax.SPECIAL_KEYPATH) {
                    return keypath
                  }
                }
                else if (type === expressionNodeType.MEMBER) {
                  name = node.stringify()
                }

                let result = component.testKeypath(instance, keypath, name)
                if (result) {
                  return result.value
                }
              }
            )
          }
          execute(
            instance[ast.callee.name],
            instance,
            args
          )
        }
      }
    }
    else {
      return function (event) {
        instance.fire(value, event)
      }
    }
  }

  /**
   * 本地组件的 getter/setter
   *
   * @param {string|Object} id
   * @param {?string|Function} value
   */
  component(id, value) {

    let callback
    if (is.func(value)) {
      callback = value
      value = env.NULL
    }

    let store = this.$components || (this.$components = new Store())
    magic({
      args: value ? [ id, value ] : [ id ],
      get: function (id) {

        let options = store.get(id), fromGlobal
        if (!options) {
          options = Yox.component(id)
          fromGlobal = env.TRUE
        }

        if (is.func(options)) {
          let { $pending } = options
          if (!$pending) {
            $pending = options.$pending = [ callback ]
            options(function (replacement) {
              delete options.$pending
              if (fromGlobal) {
                Yox.component(id, replacement)
              }
              else {
                store.set(id, replacement)
              }
              array.each(
                $pending,
                function (callback) {
                  callback(replacement)
                }
              )
            })
          }
          else {
            $pending.push(callback)
          }
        }
        else if (is.object(options)) {
          callback(options)
        }
      },
      set: function (id, value) {
        store.set(id, value)
      }
    })

  }

  /**
   * 本地过滤器的 getter/setter
   *
   * @param {string|Object} id
   * @param {?string} value
   * @return {?string}
   */
  filter() {
    let store = this.$filters || (this.$filters = new Store())
    return magic({
      args: arguments,
      get: function (id) {
        return store.get(id) || Yox.filter(id)
      },
      set: function (id, value) {
        store.set(id, value)
      }
    })
  }

  /**
   * 本地指令的 getter/setter
   *
   * @param {string|Object} id
   * @param {?string} value
   * @return {?string}
   */
  directive() {
    let store = this.$directives || (this.$directives = new Store())
    return magic({
      args: arguments,
      get: function (id) {
        return store.get(id) || Yox.directive(id)
      },
      set: function (id, value) {
        store.set(id, value)
      }
    })
  }

  /**
   * 本地子模板的 getter/setter
   *
   * @param {string|Object} id
   * @param {?string} value
   * @return {?string}
   */
  partial() {
    let store = this.$partials || (this.$partials = new Store())
    return magic({
      args: arguments,
      get: function (id) {
        return store.get(id) || Yox.partial(id)
      },
      set: function (id, value) {
        store.set(id, value)
      }
    })
  }

  /**
   * 销毁组件
   */
  destroy(removed) {

    let instance = this

    let {
      $options,
      $parent,
      $children,
      $currentNode,
      $watchEmitter,
      $eventEmitter,
    } = instance

    execute($options[lifecycle.BEFORE_DESTROY], instance)

    if ($children) {
      array.each(
        $children,
        function (child) {
          child.destroy()
        },
        env.TRUE
      )
    }

    if ($parent && $parent.$children) {
      array.remove($parent.$children, instance)
    }

    if ($currentNode) {
      if (removed !== env.TRUE) {
        vdom.patch($currentNode, { text: '' })
      }
    }

    $watchEmitter.off()
    $eventEmitter.off()

    object.each(
      instance,
      function (value, key) {
        delete instance[key]
      }
    )

    execute($options[lifecycle.AFTER_DESTROY], instance)

  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   *
   * @param {Function} fn
   */
  nextTick(fn) {
    nextTask.add(fn)
  }

  /**
   * 取反 keypath 对应的数据
   *
   * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
   *
   * @param {boolean} keypath
   * @return {boolean} 取反后的布尔值
   */
  toggle(keypath) {
    let value = !this.get(keypath)
    this.set(keypath, value)
    return value
  }

  /**
   * 递增 keypath 对应的数据
   *
   * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
   *
   * @param {string} keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
   * @param {?number} step 步进值，默认是 1
   * @param {?number} min 可以递增到的最小值，默认不限制
   * @return {number} 返回递增后的值
   */
  increase(keypath, step, max) {
    let value = toNumber(this.get(keypath), 0) + (is.numeric(step) ? step : 1)
    if (!is.numeric(max) || value <= max) {
      this.set(keypath, value)
    }
    return value
  }

  /**
   * 递减 keypath 对应的数据
   *
   * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
   *
   * @param {string} keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
   * @param {?number} step 步进值，默认是 1
   * @param {?number} min 可以递减到的最小值，默认不限制
   * @return {number} 返回递减后的值
   */
  decrease(keypath, step, min) {
    let value = toNumber(this.get(keypath), 0) - (is.numeric(step) ? step : 1)
    if (!is.numeric(min) || value >= min) {
      this.set(keypath, value)
    }
    return value
  }

}

/**
 * 版本
 *
 * @type {string}
 */
Yox.version = '0.18.6'

/**
 * 开关配置
 *
 * @type {Object}
 */
Yox.switcher = switcher

/**
 * 模板语法配置
 *
 * @type {Object}
 */
Yox.syntax = syntax

/**
 * 工具，便于扩展、插件使用
 *
 * @type {Object}
 */
Yox.utils = { is, array, object, string, logger, native, expression, Store, Emitter, Event }

/**
 * 全局注册
 *
 * @param {Object|string} id
 * @param {?Object} value
 */
array.each(
  ['component', 'directive', 'filter', 'partial'],
  function (type) {
    Yox[type] = function () {
      return magic({
        args: arguments,
        get: function (id) {
          return registry[type].get(id)
        },
        set: function (id, value) {
          registry[type].set(id, value)
        }
      })
    }
  }
)

/**
 * 验证 props
 *
 * @param {Object} props 传递的数据
 * @param {Object} schema 数据格式
 */
Yox.validate = validator.validate

/**
 * 安装插件
 *
 * 插件必须暴露 install 方法
 *
 * @param {Object} plugin
 */
Yox.use = function (plugin) {
  plugin.install(Yox)
}


import refDt from './directive/ref'
import eventDt from './directive/event'
import modelDt from './directive/model'
import componentDt from './directive/component'

// 全局注册内置指令
Yox.directive({
  ref: refDt,
  event: eventDt,
  model: modelDt,
  component: componentDt,
})
