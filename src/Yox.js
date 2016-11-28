
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

import * as vdom from './platform/web/vdom'
import * as native from './platform/web/native'

import toNumber from './function/toNumber'

import refDt from './directive/ref'
import eventDt from './directive/event'
import modelDt from './directive/model'
import componentDt from './directive/component'

import Store from './util/Store'
import Event from './util/Event'
import Emitter from './util/Emitter'

registry.directive.set({
  ref: refDt,
  event: eventDt,
  model: modelDt,
  component: componentDt,
})

export default class Yox {

  /**
   * 配置项
   *
   * @constructor
   * @param {Object} options
   */
  constructor(options) {

    let instance = this

    object.each(
      lifecycle,
      function (name) {
        if (is.func(options[name])) {
          instance[name] = options[name]
        }
      }
    )

    object.call(instance, lifecycle.INIT, [ options ])

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

    if (is.string(template) && pattern.selector.test(template)) {
      template = native.find(template).innerHTML
    }

    if (is.string(el) && pattern.selector.test(el)) {
      el = native.find(el)
    }

    if (el && el.nodeType !== 1) {
      logger.error('Passing a `el` option must be a html element.')
    }
    if (props && (is.object(data) || is.array(data))) {
      logger.warn('Passing a `data` option with object and array to component is discouraged.')
    }

    if (el && !replace) {
      el.innerHTML = '<div></div>'
      el = el.firstChild
    }

    if (is.object(extensions)) {
      object.extend(instance, extensions)
    }

    if (parent) {
      instance.$parent = parent
    }

    if (is.object(methods)) {
      object.each(
        methods,
        function (value, key) {
          instance[key] = value
        }
      )
    }

    data = is.func(data) ? data.call(instance) : data
    if (is.object(props)) {
      if (!is.object(data)) {
        data = { }
      }
      object.extend(data, props)
    }
    if (data) {
      instance.$data = data
    }

    if (is.object(components)) {
      instance.$children = [ ]
      instance.$components = components
    }
    if (is.object(directives)) {
      instance.$directives = directives
    }
    if (is.object(filters)) {
      instance.$filters = filters
    }
    if (is.object(partials)) {
      instance.$partials = partials
    }

    if (is.object(computed)) {

      // 把计算属性拆为 getter 和 setter
      let $computedGetters =
      instance.$computedGetters = { }

      let $computedSetters =
      instance.$computedSetters = { }

      // 存储计算属性的值，提升性能
      let $computedCache =
      instance.$computedCache = { }

      // 辅助获取计算属性的依赖
      let $computedStack =
      instance.$computedStack = [ ]
      // 计算属性的依赖关系
      // dep => [ computed1, computed2, ... ]
      let $computedWatchers =
      instance.$computedWatchers = { }
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

              if (cache && object.has($computedCache, keypath)) {
                return $computedCache[keypath]
              }

              // 新推一个依赖收集数组
              $computedStack.push([ ])
              let result = get.call(instance)

              // 处理收集好的依赖
              let newDeps = $computedStack.pop()
              let oldDeps = $computedDeps[keypath]
              $computedDeps[keypath] = newDeps

              // 增加了哪些依赖，删除了哪些依赖
              let addedDeps = [ ]
              let removedDeps = [ ]
              if (is.array(oldDeps)) {
                array.each(
                  array.merge(oldDeps, newDeps),
                  function (dep) {
                    let oldExisted = array.hasItem(oldDeps, dep)
                    let newExisted = array.hasItem(newDeps, dep)
                    if (oldExisted && !newExisted) {
                      removedDeps.push(dep)
                    }
                    else if (!oldExisted && newExisted) {
                      addedDeps.push(dep)
                    }
                  }
                )
              }
              else {
                addedDeps = newDeps
              }

              array.each(
                addedDeps,
                function (dep) {
                  if (!is.array($computedWatchers[dep])) {
                    $computedWatchers[dep] = []
                  }
                  $computedWatchers[dep].push(keypath)
                }
              )

              array.each(
                removedDeps,
                function (dep) {
                  array.removeItem($computedWatchers[dep], keypath)
                }
              )

              // 不论是否开启 computed cache，获取 oldValue 时还有用
              // 因此要存一下
              $computedCache[keypath] = result

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

    // 监听各种事件
    instance.$eventEmitter = new Emitter()

    if (is.object(events)) {
      object.each(
        events,
        function (listener, type) {
          if (is.func(listener)) {
            instance.on(type, listener)
          }
        }
      )
    }

    // 监听数据变化
    instance.$watchEmitter = new Emitter()

    if (is.object(watchers)) {
      object.each(
        watchers,
        function (watcher, keypath) {
          instance.watch(keypath, watcher)
        }
      )
    }

    // 准备就绪
    object.call(instance, lifecycle.CREATE)

    // 编译结果
    if (template) {
      instance.$template = mustache.parse(
        template,
        function (name) {
          return instance.getPartial(name)
        },
        function (name, node) {
          component.set(instance, 'partial', name, node)
        }
      )
    }

    object.call(instance, lifecycle.COMPILE)

    // 第一次渲染组件
    instance.updateView(el)

  }

  get(keypath) {

    let {
      $data,
      $computedStack,
      $computedGetters,
    } = this

    if (is.array($computedStack)) {
      let deps = array.lastItem($computedStack)
      if (deps) {
        deps.push(keypath)
      }

      let getter = $computedGetters[keypath]
      if (getter) {
        return getter()
      }
    }

    let result = object.get($data, keypath)
    if (result) {
      return result.value
    }

  }

  set(keypath, value) {
    let model = keypath
    if (is.string(keypath)) {
      model = { }
      model[keypath] = value
    }
    let instance = this
    if (instance.updateModel(model)) {
      if (switcher.sync) {
        instance.updateView()
      }
      else if (!instance.$syncing) {
        instance.$syncing = env.TRUE
        nextTask.add(function () {
          delete instance.$syncing
          instance.updateView()
        })
      }
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
    if (done && !noBubble && $parent) {
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

  updateModel(model) {

    let instance = this

    let {
      $data,
      $watchEmitter,
      $computedCache,
      $computedWatchers,
      $computedSetters,
    } = instance

    let hasComputed = is.object($computedWatchers),
      changes = { },
      setter,
      oldValue

    object.each(
      model,
      function (value, key) {
        oldValue = instance.get(key)
        if (value !== oldValue) {

          changes[key] = [ value, oldValue ]

          if (hasComputed && is.array($computedWatchers[key])) {
            array.each(
              $computedWatchers[key],
              function (watcher) {
                if (object.has($computedCache, watcher)) {
                  delete $computedCache[watcher]
                }
              }
            )
          }

          // 计算属性优先
          if (hasComputed) {
            setter = $computedSetters[key]
            if (setter) {
              setter(value)
              return
            }
          }

          object.set($data, key, value)

        }
      }
    )

    if (object.count(changes)) {
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
      return changes
    }

  }

  updateView(el) {

    let instance = this

    let {
      $data,
      $filters,
      $template,
      $currentNode,
      $computedGetters,
    } = instance

    let context = { }

    // 在 data 中也能写函数
    object.extend(context, registry.filter.data, $data, $filters)
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

    let node = $template && mustache.render($template, context)
    if (!node) {
      return
    }

    let newNode = vdom.create(node, instance)

    if ($currentNode) {
      $currentNode = vdom.patch($currentNode, newNode)
      object.call(instance, lifecycle.UPDATE)
    }
    else {
      $currentNode = vdom.patch(el, newNode)
      instance.$el = $currentNode.elm
      object.call(instance, lifecycle.ATTACH)
      object.call(instance, lifecycle.READY)
    }

    instance.$currentNode = $currentNode

  }

  create(options, extra) {
    options = object.extend({ }, options, extra)
    options.parent = this
    let child = new Yox(options)
    this.$children.push(child)
    return child
  }

  compileAttr(keypath, value) {
    return component.compileAttr(this, keypath, value)
  }

  getComponent(name) {
    return component.get(this, 'component', name)
  }

  getFilter(name) {
    return component.get(this, 'filter', name)
  }

  getDirective(name) {
    return component.get(this, 'directive', name, env.TRUE)
  }

  getPartial(name) {
    return component.get(this, 'partial', name)
  }

  destroy() {

    let instance = this

    object.call(instance, lifecycle.DESTROY)

    let {
      $el,
      $parent,
      $children,
      $currentNode,
      $watchEmitter,
      $eventEmitter,
    } = instance

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
      array.removeItem($parent.$children, instance)
    }

    $watchEmitter.off()
    $eventEmitter.off()

    if (arguments[0] !== env.TRUE && $currentNode) {
      instance.$currentNode = vdom.patch($currentNode, { text: '' })
    }

    if ($el) {
      delete instance.$el
    }

    object.call(instance, lifecycle.DETACH)

  }

}

/**
 * 版本
 *
 * @type {string}
 */
Yox.version = '0.14.1'

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

// 工具，便于扩展、插件使用
Yox.utils = { is, array, object, logger, native, Store, Emitter, Event }

Yox.component = function (id, value) {
  registry.component.set(id, value)
}

Yox.directive = function (id, value) {
  registry.directive.set(id, value)
}

Yox.filter = function (id, value) {
  registry.filter.set(id, value)
}

Yox.partial = function (id, value) {
  registry.partial.set(id, value)
}

Yox.nextTick = function (fn) {
  nextTask.add(fn)
}

Yox.validate = validator.validate

Yox.use = function (plugin) {
  plugin.install(Yox)
}
