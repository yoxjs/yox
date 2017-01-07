
import magic from 'yox-common/function/magic'
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

import * as vdom from './platform/web/vdom'
import * as native from './platform/web/native'

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
      logger.warn('Passing a "data" option should be a function.')
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$data = props || { }

    // 后放 data
    object.extend(
      instance.$data,
      is.func(data) ? execute(data, instance) : data
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
                updateDeps(instance, newDeps, oldDeps, watcher)
              }

              instance.$computedDeps[keypath] = newDeps
              $watchCache[keypath] = result

              return result
            }
            getter.toString = getter
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
      afterAdd(added) {
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
      afterRemove(removed) {
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
        logger.error('Passing a "template" option must have a root element.')
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
          el = native.create('div', el)
        }
      }
      else {
        logger.error('Passing a "el" option must be a html element.')
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
            logger.error(`Passing a "${name}" method is conflicted with built-in methods.`)
          }
          instance[name] = fn
        }
      )
    }
    object.extend(instance, extensions)

    instance.component(components)
    instance.directive(directives)
    instance.filter(filters)
    instance.partial(partials)

    if (template) {
      instance.$viewWatcher = function () {
        instance.$dirty = env.TRUE
      }
      execute(options[lifecycle.BEFORE_MOUNT], instance)
      instance.$template = Yox.compile(template)
      instance.updateView(el || native.create('div'))
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

    let result

    let getValue = function (keypath) {
      if ($computedGetters) {
        result = $computedGetters[keypath]
        if (result) {
          return {
            value: result(),
          }
        }
      }
      return object.get($data, keypath)
    }

    keypath = keypathUtil.normalize(keypath)

    if (is.string(context)) {
      let keys = keypathUtil.parse(context)
      while (env.TRUE) {
        array.push(keys, keypath)
        context = keypathUtil.stringify(keys)
        result = getValue(context)
        if (result || keys.length <= 1) {
          if (result) {
            result.keypath = context
          }
          return result
        }
        else {
          keys.splice(-2)
        }
      }
    }
    else {
      if ($computedStack) {
        result = array.last($computedStack)
        if (result) {
          array.push(result, keypath)
        }
      }
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
      model[keypath] = value
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
   * 只更新数据，不更新视图
   *
   * @param {Object} model
   */
  updateModel(model) {

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

    let args = arguments, immediate
    if (args.length === 1) {
      immediate =
      instance.$dirtyIgnore = env.TRUE
    }
    else if (args.length === 2) {
      immediate = args[1]
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
      execute($options[lifecycle.BEFORE_UPDATE], instance)
    }

    let context = { }
    let { filter } = registry

    object.extend(
      context,
      // 全局过滤器
      filter && filter.data,
      // 本地过滤器
      $filters.data
    )

    object.each(
      context,
      function (value, key) {
        if (is.func(value)) {
          context[key] = value.bind(instance)
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
      $currentNode = vdom.patch(arguments[0], node)
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
    let { props, propTypes } = options
    if (is.object(props) && is.object(propTypes)) {
      options.props = Yox.validate(props, propTypes)
    }
    options.parent = this
    let child = new Yox(options)
    let children = this.$children || (this.$children = [ ])
    array.push(children, child)
    return child
  }

  compileValue(keypath, value) {

    if (string.falsy(value)) {
      return
    }

    let instance = this
    if (value.indexOf(char.CHAR_OPAREN) > 0) {
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
          let fn = instance[name]
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
      if (arguments[0] !== env.TRUE) {
        vdom.patch($currentNode, { text: char.CHAR_BLANK })
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

  unshift(keypath, item) {
    handleArray(
      this,
      keypath,
      function (list) {
        list.unshift(item)
      }
    )
  }

  shift(keypath) {
    return handleArray(
      this,
      keypath,
      function (list) {
        return list.shift()
      }
    )
  }

  push(keypath, item) {
    handleArray(
      this,
      keypath,
      function (list) {
        list.push(item)
      }
    )
  }

  pop(keypath) {
    return handleArray(
      this,
      keypath,
      function (list) {
        return list.pop()
      }
    )
  }

  remove(keypath, item) {
    handleArray(
      this,
      keypath,
      function (list) {
        array.remove(list, item)
      }
    )
  }

  removeAt(keypath, index) {
    handleArray(
      this,
      keypath,
      function (list) {
        list.splice(index, 1)
      }
    )
  }

  log(msg) {
    logger.log(msg)
  }

  warn(msg) {
    logger.warn(msg)
  }

}


/**
 * 版本
 *
 * @type {string}
 */
Yox.version = '0.22.8'

/**
 * 工具，便于扩展、插件使用
 *
 * @type {Object}
 */
Yox.utils = { is, array, object, string, native, Emitter, Event }

let { prototype } = Yox

// 全局注册
let registry = { }

// 支持异步注册
const supportRegisterAsync = [ 'component' ]

// 解析注册参数
function parseRegisterArguments(type, args) {
  let id = args[0]
  let value = args[1]
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
    prototype[type] = function () {
      let prop = `$${type}s`
      let store = this[prop] || (this[prop] = new Store())
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
                  Yox[type](id, callback)
                }
              }
            )
          }
          else {
            return store.get(id) || Yox[type](id)
          }
        },
        set(id, value) {
          store.set(id, value)
        }
      })

    }
    Yox[type] = function () {
      let store = registry[type] || (registry[type] = new Store())
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
  return is.string(template)
    ? viewEnginer.compile(template)
    : template
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
          let target = props[key], matched
          // 比较类型
          if (is.string(type)) {
            matched = is.is(target, type)
          }
          else if (is.array(type)) {
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
            result[key] = target
          }
          else if (required) {
            logger.warn(`Passing a "${key}" prop is not matched.`)
          }
        }
      }
      else if (required) {
        logger.warn(`Passing a "${key}" prop is not found.`)
      }
      else if (object.has(rule, 'value')) {
        result[key] = is.func(value) ? value(props) : value
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

function updateDeps(instance, newDeps, oldDeps, watcher) {

  let addedDeps, removedDeps
  if (is.array(oldDeps)) {
    addedDeps = array.diff(oldDeps, newDeps)
    removedDeps = array.diff(newDeps, oldDeps)
  }
  else {
    addedDeps = newDeps
  }

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
        instance.$watchEmitter.off(dep, watcher)
      }
    )
  }

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
    if ($computedDeps && !array.falsy($computedDeps[key])) {
      array.each(
        $computedDeps[key],
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
      let oldValue = $watchCache[key]
      let newValue = instance.get(key)
      if (newValue !== oldValue) {
        $watchCache[key] = newValue
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

function handleArray(instance, keypath, handler) {
  let array = instance.get(keypath)
  array = is.array(array)
    ? object.copy(array)
    : [ ]
  let result = handler(array)
  instance.set(keypath, array)
  return result
}

import ref from './directive/ref'
import event from './directive/event'
import model from './directive/model'

// 全局注册内置指令
Yox.directive({ ref, event, model })
