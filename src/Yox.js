
import * as env from './config/env'
import * as cache from './config/cache'
import * as syntax from './config/syntax'
import * as pattern from './config/pattern'
import * as registry from './config/registry'
import * as switcher from './config/switcher'
import * as lifecycle from './config/lifecycle'

import * as mustache from './compiler/parser/mustache'

import * as is from './util/is'
import * as array from './util/array'
import * as object from './util/object'
import * as logger from './util/logger'
import * as keypath from './util/keypath'
import * as nextTask from './util/nextTask'
import * as component from './util/component'
import * as validator from './util/validator'

import * as expression from './expression/index'

import * as vdom from './platform/web/vdom'
import * as native from './platform/web/native'

import execute from './function/execute'
import toNumber from './function/toNumber'

import Store from './util/Store'
import Event from './util/Event'
import Emitter from './util/Emitter'

export default class Yox {

  /**
   * 配置项
   *
   * @constructor
   * @param {Object} options
   */
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

    // 检查 props
    if (props && !is.object(props)) {
      props = env.NULL
    }
    // 如果传了 props，则 data 应该是个 function
    if (props && data && !is.func(data)) {
      logger.warn('Passing a `data` option should be a function.')
    }

    // 先把外部数据的放进去，这样当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$data = props || { }

    // 后放 data
    object.extend(
      instance.$data,
      is.func(data) ? data.call(instance) : data
    )

    // 如果不绑着，其他方法调不到钩子
    instance.$options = options

    // 监听各种事件
    instance.$eventEmitter = new Emitter()
    instance.on(events)

    instance.$viewUpdater = function () {
      if (instance.$sync) {
        instance.update()
      }
      else if (!instance.$syncing) {
        instance.$syncing = env.TRUE
        nextTask.add(
          function () {
            delete instance.$syncing
            instance.update()
          }
        )
      }
    }

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

    if (is.object(computed)) {

      instance.$cacheCleaner = function (newValue, oldValue, keypath) {
        if (object.has($watchCache, keypath)) {
          delete $watchCache[keypath]
        }
      }

      // 把计算属性拆为 getter 和 setter
      let $computedGetters =
      instance.$computedGetters = { }

      let $computedSetters =
      instance.$computedSetters = { }

      // 辅助获取计算属性的依赖
      let $computedStack =
      instance.$computedStack = [ ]
      // computed => [ dep1, dep2, ... ]
      let $computedDeps =
      instance.$computedDeps = { }

      object.each(
        computed,
        function (item, keypath) {
          let get, set, cache = env.TRUE
          if (is.func(item)) {
            get = item
          }
          else if (is.object(item)) {
            if (object.has(item, 'cache')) {
              cache = item.cache
            }
            if (is.func(item.get)) {
              get = item.get
            }
            if (is.func(item.set)) {
              set = item.set
            }
          }

          if (get) {
            let getter = function () {

              if (cache && object.has($watchCache, keypath)) {
                return $watchCache[keypath]
              }

              // 新推一个依赖收集数组
              $computedStack.push([ ])
              let result = get.call(instance)

              // 处理收集好的依赖
              let newDeps = $computedStack.pop()
              let oldDeps = $computedDeps[keypath]

              instance.updateWatcher(
                newDeps,
                oldDeps,
                instance.$cacheCleaner
              )

              $computedDeps[keypath] = newDeps
              $watchCache[keypath] = result

              return result
            }
            getter.computed = env.TRUE
            $computedGetters[keypath] = getter
          }

          if (set) {
            $computedSetters[keypath] = set.bind(instance)
          }

        }
      )
    }

    execute(options[lifecycle.AFTER_CREATE], instance)

    // 检查 template
    if (is.string(template)) {
      if (pattern.selector.test(template)) {
        template = native.getContent(template)
      }
      if (!template.trim()) {
        template = env.NULL
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
      execute(options[lifecycle.BEFORE_MOUNT], instance)
      if (is.string(template)) {
        template = instance.compileTemplate(template)
      }
      instance.$template = template
      instance.update(el)
    }

  }

  updateWatcher(newDeps, oldDeps, watcher) {

    let addedDeps, removedDeps
    if (is.array(oldDeps)) {
      addedDeps = array.diff(oldDeps, newDeps)
      removedDeps = array.diff(newDeps, oldDeps)
    }
    else {
      addedDeps = newDeps
    }

    let instance = this

    array.each(
      addedDeps,
      function (keypath) {
        instance.watch(keypath, watcher)
      }
    )

    if (removedDeps) {
      array.each(
        removedDeps,
        function (dep) {
          instance.unwatch(dep, watcher)
        }
      )
    }

  }

  get(key) {

    let {
      $data,
      $computedStack,
      $computedGetters,
    } = this

    if ($computedStack) {
      let deps = array.last($computedStack)
      if (deps) {
        deps.push(key)
      }
    }

    if ($computedGetters) {
      let getter = $computedGetters[key]
      if (getter) {
        return getter()
      }
    }

    let result = object.get($data, key)
    if (result) {
      return result.value
    }

  }

  set(key, value) {

    let model

    if (is.string(key)) {
      model = { }
      model[key] = value
    }
    else if (is.object(key)) {
      model = key
    }
    else {
      return
    }

    let instance = this, changes = { }

    let {
      $data,
      $children,
      $computedSetters,
      $watchCache,
      $watchEmitter,
    } = instance

    object.each(
      model,
      function (value, key) {
        changes[key] = instance.get(key)
      }
    )

    object.each(
      model,
      function (value, key) {
        if ($computedSetters) {
          let setter = $computedSetters[key]
          if (setter) {
            setter(value)
            return
          }
        }
        object.set($data, key, value)
      }
    )

    object.each(
      model,
      function (value, key) {
        if (value !== changes[key]) {
          changes[key] = [ value, changes[key], key ]
        }
        else {
          delete changes[key]
        }
      }
    )

    object.each(
      $watchCache,
      function (oldValue, key) {
        if (!object.has(changes, key)) {
          let newValue = instance.get(key)
          if (newValue !== oldValue) {
            changes[key] = [ newValue, oldValue, key ]
          }
        }
      }
    )

    object.each(
      changes,
      function (args, key) {
        array.each(
          keypath.getWildcardMatches(key),
          function (wildcardKeypath) {
            $watchEmitter.fire(
              wildcardKeypath,
              array.merge(args, keypath.getWildcardNames(key, wildcardKeypath)),
              instance
            )
          }
        )
      }
    )

    if (!instance.$syncing && $children) {
      array.each(
        $children,
        function (child) {
          let hasChange
          array.each(
            child.$propDeps,
            function (dep) {
              if (!is.primitive(instance.get(dep))) {
                object.each(
                  changes,
                  function (args, keypath) {
                    if (keypath.startsWith(dep)) {
                      hasChange = env.TRUE
                      return env.FALSE
                    }
                  }
                )
              }
              if (hasChange) {
                return env.FALSE
              }
            }
          )
          if (hasChange) {
            child.set({})
          }
        }
      )
    }

  }

  on(type, listener) {
    this.$eventEmitter.on(type, listener)
  }

  once(type, listener) {
    this.$eventEmitter.once(type, listener)
  }

  off(type, listener) {
    this.$eventEmitter.off(type, listener)
  }

  fire(type, data, noBubble) {

    let instance = this

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

    if (!event.target) {
      event.target = instance
    }

    let { $parent, $eventEmitter } = instance
    let done = $eventEmitter.fire(type, event, instance)
    if (done && $parent && !noBubble) {
      done = $parent.fire(type, event)
    }

    return done

  }

  watch(keypath, watcher) {
    this.$watchEmitter.on(keypath, watcher)
  }

  watchOnce(keypath, watcher) {
    this.$watchEmitter.once(keypath, watcher)
  }

  unwatch(keypath, watcher) {
    this.$watchEmitter.off(keypath, watcher)
  }

  update(el) {

    let instance = this

    let {
      $data,
      $viewDeps,
      $viewUpdater,
      $options,
      $filters,
      $template,
      $currentNode,
      $computedGetters,
    } = instance

    if (!el) {
      execute($options[lifecycle.BEFORE_UPDATE], instance)
    }

    let context = { }

    object.extend(
      context,
      // 全局过滤器
      registry.filter.data,
      // 本地数据，这意味着 data 也能写函数，只是用 filter 来区分出过滤器
      $data,
      // 本地过滤器
      $filters
    )

    object.each(
      context,
      function (value, key) {
        if (is.func(value)) {
          context[key] = value.bind(instance)
        }
      }
    )

    if (is.object($computedGetters)) {
      object.extend(context, $computedGetters)
    }

    let { root, deps } = mustache.render($template, context)
    deps = object.keys(deps)
    instance.updateWatcher(
      deps,
      $viewDeps,
      $viewUpdater
    )
    instance.$viewDeps = deps

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

  create(options, extra) {
    options = object.extend({ }, options, extra)
    options.parent = this
    let child = new Yox(options)
    let children = this.$children || (this.$children = [ ])
    children.push(child)
    return child
  }

  compileTemplate(template) {
    let instance = this
    return mustache.parse(
      template,
      function (name) {
        return instance.partial(name)
      },
      function (name, node) {
        instance.partial(name, node)
      }
    )
  }

  compileValue(keypath, value) {
    return component.compileValue(this, keypath, value)
  }

  component(name, value) {
    if (arguments.length === 1 && is.string(name)) {
      return component.get(this, 'component', name)
    }
    component.set(this, 'component', name, value)
  }

  filter(name, value) {
    if (arguments.length === 1 && is.string(name)) {
      return component.get(this, 'filter', name)
    }
    component.set(this, 'filter', name, value)
  }

  directive(name, value) {
    if (arguments.length === 1 && is.string(name)) {
      return component.get(this, 'directive', name, env.TRUE)
    }
    component.set(this, 'directive', name, value)
  }

  partial(name, value) {
    if (arguments.length === 1 && is.string(name)) {
      let partial = component.get(this, 'partial', name)
      return is.string(partial) ? this.compileTemplate(partial) : partial
    }
    component.set(this, 'partial', name, value)
  }

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

  toggle(keypath) {
    this.set(
      keypath,
      !this.get(keypath)
    )
  }

  increase(keypath, step, max) {
    let value = toNumber(this.get(keypath), 0) + (is.numeric(step) ? step : 1)
    if (!is.numeric(max) || value <= max) {
      this.set(keypath, value)
    }
  }

  decrease(keypath, step, min) {
    let value = toNumber(this.get(keypath), 0) - (is.numeric(step) ? step : 1)
    if (!is.numeric(min) || value >= min) {
      this.set(keypath, value)
    }
  }

}

/**
 * 版本
 *
 * @type {string}
 */
Yox.version = '0.17.1'

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
 * 全局缓存，方便外部清缓存
 *
 * @type {Object}
 */
Yox.cache = cache

/**
 * 工具，便于扩展、插件使用
 *
 * @type {Object}
 */
Yox.utils = { is, array, object, logger, native, expression, Store, Emitter, Event }

/**
 * 全局注册组件
 *
 * @param {Object|string} id
 * @param {?Object} value
 */
Yox.component = function (id, value) {
  registry.component.set(id, value)
}

/**
 * 全局注册指令
 *
 * @param {Object|string} id
 * @param {?Object} value
 */
Yox.directive = function (id, value) {
  registry.directive.set(id, value)
}

/**
 * 全局注册过滤器
 *
 * @param {Object|string} id
 * @param {?Function} value
 */
Yox.filter = function (id, value) {
  registry.filter.set(id, value)
}

/**
 * 全局注册子模板
 *
 * @param {Object|string} id
 * @param {?string} value
 */
Yox.partial = function (id, value) {
  registry.partial.set(id, value)
}

/**
 * 注册下一个时间片执行的函数
 *
 * @param {Function} fn
 */
Yox.nextTick = nextTask.add

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
