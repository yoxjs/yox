
import execute from 'yox-common/function/execute'
import toNumber from 'yox-common/function/toNumber'

import Store from 'yox-common/util/Store'
import Event from 'yox-common/util/Event'
import Emitter from 'yox-common/util/Emitter'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as char from 'yox-common/util/char'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'
import * as logger from 'yox-common/util/logger'
import * as nextTask from 'yox-common/util/nextTask'
import * as keypathUtil from 'yox-common/util/keypath'

import * as viewEnginer from 'yox-template-compiler'
import * as viewSyntax from 'yox-template-compiler/src/syntax'

import * as expressionEnginer from 'yox-expression-compiler'
import * as expressionNodeType from 'yox-expression-compiler/src/nodeType'

import * as pattern from './config/pattern'
import * as lifecycle from './config/lifecycle'

import api from './platform/web/api'
import * as vdom from './platform/web/vdom'

export default class Yox {

  constructor(options) {

    let instance = this

    // 如果不绑着，其他方法调不到钩子
    instance.$options = options

    execute(options[ lifecycle.BEFORE_CREATE ], instance, options)

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
      propTypes,
      extensions,
    } = options

    object.extend(instance, extensions)

    let source = props

    // 检查 props
    if (is.object(source)) {
      if (is.object(propTypes)) {
        source = Yox.validate(source, propTypes)
      }
      // 如果传了 props，则 data 应该是个 function
      if (data && !is.func(data)) {
        logger.warn('"data" option should be a function.')
      }
    }
    else {
      source = { }
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$data = source

    // 后放 data
    let extend = is.func(data) ? execute(data, instance) : data
    if (is.object(extend)) {
      object.each(
        extend,
        function (value, key) {
          if (object.has(source, key)) {
            logger.warn(`"${key}" is already defined as a prop. Use prop default value instead.`)
          }
          else {
            source[ key ] = value
          }
        }
      )
    }

    // 计算属性也是数据
    if (is.object(computed)) {

      // 把计算属性拆为 getter 和 setter
      instance.$computedGetters = { }
      instance.$computedSetters = { }

      // 辅助获取计算属性的依赖
      instance.$computedStack = [ ]
      instance.$computedDeps = { }

      // 计算属性的缓存
      instance.$computedCache = { }

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
              let $computedCache = instance.$computedCache
              if (!getter.$dirty) {
                if (cache && object.has($computedCache, keypath)) {
                  return $computedCache[ keypath ]
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
              let oldDeps = instance.$computedDeps[ keypath ]
              if (newDeps !== oldDeps) {
                updateDeps(instance, newDeps, oldDeps, watcher)
              }

              instance.$computedDeps[ keypath ] = newDeps
              if (cache) {
                $computedCache[ keypath ] = result
              }

              return result
            }
            getter.toString = getter
            instance.$computedGetters[ keypath ] = getter
          }

          if (set) {
            instance.$computedSetters[ keypath ] = set
          }

        }
      )
    }

    // 监听各种事件
    instance.$eventEmitter = new Emitter()
    events && instance.on(events)

    instance.$watchCache = { }
    instance.$watchEmitter = new Emitter()

    watchers && instance.watch(watchers)

    execute(options[ lifecycle.AFTER_CREATE ], instance)

    // 检查 template
    if (is.string(template)) {
      if (pattern.selector.test(template)) {
        template = api.html(
          api.find(template)
        )
      }
      if (!pattern.tag.test(template)) {
        logger.error('"template" option must have a root element.')
      }
    }
    else {
      template = env.NULL
    }

    // 检查 el
    if (is.string(el)) {
      if (pattern.selector.test(el)) {
        el = api.find(el)
      }
    }
    if (el) {
      if (api.isElement(el)) {
        if (!replace) {
          api.html(el, '<div></div>')
          el = api.children(el)[ 0 ]
        }
      }
      else {
        logger.error('"el" option must be a html element.')
      }
    }

    if (parent) {
      instance.$parent = parent
    }

    if (methods) {
      object.each(
        methods,
        function (fn, name) {
          if (object.has(prototype, name)) {
            logger.error(`"${name}" method is conflicted with built-in methods.`)
          }
          instance[ name ] = fn
        }
      )
    }

    components && instance.component(components)
    directives && instance.directive(directives)
    filters && instance.filter(filters)
    partials && instance.partial(partials)

    if (template) {
      instance.$viewWatcher = function () {
        instance.$dirty = env.TRUE
      }
      execute(options[ lifecycle.BEFORE_MOUNT ], instance)
      instance.$template = Yox.compile(template)
      instance.updateView(el || api.createElement('div'))
    }

  }

  /**
   * 取值
   *
   * @param {string} keypath
   * @param {?string} context
   * @return {*}
   */
  get(keypath, context) {

    let {
      $data,
      $computedStack,
      $computedGetters,
    } = this

    let getValue = function (keypath) {

      if ($computedStack) {
        let list = array.last($computedStack)
        if (list) {
          array.push(list, keypath)
        }
      }

      if ($computedGetters) {

        let value

        let keys = keypathUtil.parse(keypath)
        array.each(
          keys,
          function (key, index) {
            keypath = keypathUtil.stringify(
              keys.slice(0, index + 1)
            )
            value = $computedGetters[ keypath ]
            if (value) {
              keypath = keypathUtil.stringify(
                keys.slice(index + 1)
              )
              return env.FALSE
            }
          }
        )

        if (value) {
          value = value()
          if (value && keypath) {
            value = object.get(value, keypath)
          }
          return {
            value,
          }
        }

      }

      return object.get($data, keypath)

    }

    let result
    let suffixes = keypathUtil.parse(keypath)

    if (is.string(context)) {
      let prefixes = keypathUtil.parse(context)
      if (suffixes.length > 1 && suffixes[ 0 ] === 'this') {
        keypath = keypathUtil.stringify(
          array.merge(
            prefixes,
            suffixes.slice(1)
          )
        )
        // 传了 this 就要确保有结果，即使是 undefined
        result = getValue(keypath) || { }
      }
      else {
        while (env.TRUE) {
          keypath = keypathUtil.stringify(
            array.merge(
              prefixes,
              suffixes
            )
          )
          result = getValue(keypath)
          if (result || !prefixes.length) {
            break
          }
          else {
            prefixes.pop()
          }
        }
      }
      if (result) {
        result.keypath = keypath
        return result
      }
    }
    else {
      keypath = keypathUtil.stringify(suffixes)
      result = getValue(keypath)
      if (result) {
        return result.value
      }
    }

  }

  set(keypath, value) {

    let model, immediate
    if (is.string(keypath)) {
      model = { }
      model[ keypath ] = value
    }
    else if (is.object(keypath)) {
      model = object.copy(keypath)
      immediate = value === env.TRUE
    }
    else {
      return
    }

    this.updateModel(model, immediate)

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
   */
  fire(type, data) {

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
    if (done && $parent) {
      done = $parent.fire(type, event)
    }

    return done

  }

  /**
   * 监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   */
  watch(keypath, watcher, sync) {

    let watchers = keypath
    if (is.string(keypath)) {
      watchers = { }
      watchers[ keypath ] = {
        sync,
        watcher,
      }
    }

    let instance = this
    let { $watchEmitter, $watchCache } = instance

    object.each(
      watchers,
      function (value, keypath) {
        let newValue = instance.get(keypath)
        if (is.func(value)) {
          $watchEmitter.on(keypath, value)
        }
        else if (is.object(value)) {
          $watchEmitter.on(keypath, value.watcher)
          if (value.sync === env.TRUE) {
            execute(
              value.watcher,
              instance,
              [ newValue, $watchCache[ keypath ], keypath ]
            )
          }
        }
        $watchCache[ keypath ] = newValue
      }
    )

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
   * 取消监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   */
  unwatch(keypath, watcher) {
    this.$watchEmitter.off(keypath, watcher)
  }

  /**
   * 只更新数据，不更新视图
   *
   * @param {Object} model
   */
  updateModel(model) {

    let instance = this

    let {
      $data,
      $computedSetters,
      $watchEmitter,
      $watchCache,
    } = instance

    let data = { }
    object.each(
      model,
      function (newValue, key) {
        data[ keypathUtil.normalize(key) ] = newValue
      }
    )

    object.each(
      data,
      function (value, keypath) {
        if ($watchEmitter.has(keypath) && !object.has($watchCache, keypath)) {
          $watchCache[ keypath ] = instance.get(keypath)
        }
        if ($computedSetters) {
          let setter = $computedSetters[ keypath ]
          if (setter) {
            setter.call(instance, value)
            return
          }
        }
        object.set($data, keypath, value)
      }
    )

    let args = arguments, immediate
    if (args.length === 1) {
      immediate =
      instance.$dirtyIgnore = env.TRUE
    }
    else if (args.length === 2) {
      immediate = args[ 1 ]
    }

    if (immediate) {
      diff(instance)
    }
    else if (!instance.$diffing) {
      instance.$diffing = env.TRUE
      nextTask.add(
        function () {
          delete instance.$diffing
          diff(instance)
        }
      )
    }

  }

  /**
   * 更新视图
   */
  updateView() {

    let instance = this

    let {
      $viewDeps,
      $viewWatcher,
      $data,
      $options,
      $filters,
      $template,
      $currentNode,
      $computedGetters,
    } = instance

    if ($currentNode) {
      execute($options[ lifecycle.BEFORE_UPDATE ], instance)
    }

    let context = { }
    let { filter } = registry

    object.extend(
      context,
      // 全局过滤器
      filter && filter.data,
      // 本地过滤器
      $filters && $filters.data
    )

    object.each(
      context,
      function (value, key) {
        if (is.func(value)) {
          context[ key ] = value.bind(instance)
        }
      }
    )

    // data 中的函数不需要强制绑定 this
    // 不是不想管，是没法管，因为每层级都可能出现函数，但不可能每层都绑定
    // 而且让 data 中的函数完全动态化说不定还是一个好设计呢
    object.extend(context, $data, $computedGetters)

    let { node, deps } = vdom.create($template, context, instance)

    instance.$viewDeps = object.keys(deps)
    updateDeps(
      instance,
      instance.$viewDeps,
      $viewDeps,
      $viewWatcher
    )

    let afterHook
    if ($currentNode) {
      afterHook = lifecycle.AFTER_UPDATE
      $currentNode = vdom.patch($currentNode, node)
    }
    else {
      afterHook = lifecycle.AFTER_MOUNT
      $currentNode = vdom.patch(arguments[ 0 ], node)
      instance.$el = $currentNode.el
    }

    instance.$currentNode = $currentNode
    execute($options[ afterHook ], instance)

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
    array.push(
      this.$children || (this.$children = [ ]),
      child
    )
    return child
  }

  compileValue(keypath, value) {

    if (string.falsy(value)) {
      return
    }

    let instance = this
    if (string.indexOf(value, char.CHAR_OPAREN) > 0) {
      let ast = expressionEnginer.compile(value)
      if (ast.type === expressionNodeType.CALL) {
        return function (event) {
          let isEvent = event instanceof Event
          let args = object.copy(ast.args)
          if (!args.length) {
            if (isEvent) {
              array.push(args, event)
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
                  if (name === viewSyntax.SPECIAL_EVENT) {
                    if (isEvent) {
                      return event
                    }
                  }
                  else if (name === viewSyntax.SPECIAL_KEYPATH) {
                    return keypath
                  }
                  else if (name === 'this') {
                    return instance.get(keypath)
                  }
                }
                else if (type === expressionNodeType.MEMBER) {
                  name = expressionEnginer.stringify(node)
                }

                let result = instance.get(name, keypath)
                if (result) {
                  return result.value
                }
              }
            )
          }
          let name = expressionEnginer.stringify(ast.callee)
          let fn = instance[ name ]
          if (!fn) {
            let result = instance.get(name, keypath)
            if (result) {
              fn = result.value
            }
          }
          execute(fn, instance, args)
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
   * 销毁组件
   */
  destroy() {

    let instance = this

    let {
      $options,
      $parent,
      $children,
      $currentNode,
      $watchEmitter,
      $eventEmitter,
    } = instance

    execute($options[ lifecycle.BEFORE_DESTROY ], instance)

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
      if (arguments[ 0 ] !== env.TRUE) {
        vdom.patch($currentNode, { text: char.CHAR_BLANK })
      }
    }

    $watchEmitter.off()
    $eventEmitter.off()

    object.each(
      instance,
      function (value, key) {
        delete instance[ key ]
      }
    )

    execute($options[ lifecycle.AFTER_DESTROY ], instance)

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

  /**
   * 拷贝任意数据，支持深拷贝
   *
   * @param {*} data
   * @param {?boolean} deep 是否深拷贝
   * @return {*}
   */
  copy(data, deep) {
    return object.copy(data, deep)
  }

}


/**
 * 版本
 *
 * @type {string}
 */
Yox.version = '0.29.6'

/**
 * 工具，便于扩展、插件使用
 */
Yox.is = is
Yox.dom = api
Yox.array = array
Yox.object = object
Yox.string = string
Yox.logger = logger
Yox.Event = Event
Yox.Emitter = Emitter

let { prototype } = Yox

// 全局注册
let registry = { }

// 支持异步注册
const supportRegisterAsync = [ 'component' ]

// 解析注册参数
function parseRegisterArguments(type, args) {
  let id = args[ 0 ]
  let value = args[ 1 ]
  let callback
  if (array.has(supportRegisterAsync, type)
    && is.func(value)
  ) {
    callback = value
    value = env.UNDEFINED
  }
  return {
    callback,
    args: value === env.UNDEFINED ? [ id ] : [ id, value ],
  }
}

/**
 * 全局/本地注册
 *
 * @param {Object|string} id
 * @param {?Object} value
 */
array.each(
  array.merge(
    supportRegisterAsync,
    [ 'directive', 'filter', 'partial' ]
  ),
  function (type) {
    prototype[ type ] = function () {
      let prop = `$${type}s`
      let store = this[ prop ] || (this[ prop ] = new Store())
      let { args, callback } = parseRegisterArguments(type, arguments)
      return magic({
        args,
        get(id) {
          if (callback) {
            store.getAsync(
              id,
              function (value) {
                if (value) {
                  callback(value)
                }
                else {
                  Yox[ type ](id, callback)
                }
              }
            )
          }
          else {
            return store.get(id) || Yox[ type ](id)
          }
        },
        set(id, value) {
          store.set(id, value)
        }
      })

    }
    Yox[ type ] = function () {
      let store = registry[ type ] || (registry[ type ] = new Store())
      let { args, callback } = parseRegisterArguments(type, arguments)
      return magic({
        args,
        get(id) {
          if (callback) {
            store.getAsync(id, callback)
          }
          else {
            return store.get(id)
          }
        },
        set(id, value) {
          store.set(id, value)
        }
      })
    }
  }
)

/**
 * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
 *
 * @param {Function} fn
 */
Yox.nextTick = nextTask.add

/**
 * 编译模板，暴露出来是为了打包阶段的模板预编译
 *
 * @param {string} template
 * @return {Object}
 */
Yox.compile = function (template) {
  return viewEnginer.compile(template)[ 0 ]
}

/**
 * 验证 props
 *
 * @param {Object} props 传递的数据
 * @param {Object} schema 数据格式
 * @return {Object} 验证通过的数据
 */
Yox.validate = function (props, schema) {
  let result = { }
  object.each(
    schema,
    function (rule, key) {
      let { type, value, required } = rule

      required = required === env.TRUE
        || (is.func(required) && required(props))

      if (object.has(props, key)) {
        // 如果不写 type 或 type 不是 字符串 或 数组
        // 就当做此规则无效，和没写一样
        if (type) {
          let target = props[ key ], matched
          // 比较类型
          if (!string.falsy(type)) {
            matched = is.is(target, type)
          }
          else if (!array.falsy(type)) {
            array.each(
              type,
              function (t) {
                if (is.is(target, t)) {
                  matched = env.TRUE
                  return env.FALSE
                }
              }
            )
          }
          else if (is.func(type)) {
            // 有时候做判断需要参考其他数据
            // 比如当 a 有值时，b 可以为空之类的
            matched = type(target, props)
          }
          if (matched === env.TRUE) {
            result[ key ] = target
          }
          else if (required) {
            logger.warn(`"${key}" prop is not matched.`)
          }
        }
      }
      else if (required) {
        logger.warn(`"${key}" prop is not found.`)
      }
      else if (object.has(rule, 'value')) {
        result[ key ] = is.func(value) ? value(props) : value
      }
    }
  )
  return result
}

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

function magic(options) {

  let { args, get, set } = options
  args = array.toArray(args)

  let key = args[ 0 ], value = args[ 1 ]
  if (is.object(key)) {
    execute(set, env.NULL, key)
  }
  else if (is.string(key)) {
    let { length } = args
    if (length === 2) {
      execute(set, env.NULL, args)
    }
    else if (length === 1) {
      return execute(get, env.NULL, key)
    }
  }
}

function updateDeps(instance, newDeps, oldDeps, watcher) {

  oldDeps = oldDeps || [ ]

  array.each(
    newDeps,
    function (dep) {
      if (!array.has(oldDeps, dep)) {
        instance.watch(dep, watcher)
      }
    }
  )

  array.each(
    oldDeps,
    function (dep) {
      if (!array.has(newDeps, dep)) {
        instance.unwatch(dep, watcher)
      }
    }
  )

}

function diff(instance) {

  let {
    $children,
    $watchCache,
    $watchEmitter,
    $computedDeps,
  } = instance

  // 排序，把依赖最少的放前面
  let keys = [ ]
  let addKey = function (key, push) {
    if (!array.has(keys, key)) {
      if (push) {
        keys.push(key)
      }
      else {
        keys.unshift(key)
      }
    }
  }

  let pickDeps = function (key) {
    if ($computedDeps && !array.falsy($computedDeps[ key ])) {
      array.each(
        $computedDeps[ key ],
        pickDeps
      )
      addKey(key, env.TRUE)
    }
    else {
      addKey(key)
    }
  }

  object.each(
    $watchCache,
    function (value, key) {
      pickDeps(key)
    }
  )

  array.each(
    keys,
    function (key) {
      let newValue = instance.get(key)
      let oldValue = $watchCache[ key ]
      if (newValue !== oldValue) {
        $watchCache[ key ] = newValue
        $watchEmitter.fire(key, [ newValue, oldValue, key ], instance)
      }
    }
  )

  let {
    $dirty,
    $dirtyIgnore,
  } = instance

  if ($dirty) {
    delete instance.$dirty
  }
  if ($dirtyIgnore) {
    delete instance.$dirtyIgnore
    return
  }

  if ($dirty) {
    instance.updateView()
  }
  else if ($children) {
    array.each(
      $children,
      function (child) {
        diff(child)
      }
    )
  }

}

import ref from './directive/ref'
import event from './directive/event'
import model from './directive/model'

// 全局注册内置指令
Yox.directive({ ref, event, model })
