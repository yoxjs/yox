
import execute from 'yox-common/function/execute'
import toNumber from 'yox-common/function/toNumber'

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

import compileTemplate from 'yox-template-compiler/compile'
import * as templateSyntax from 'yox-template-compiler/src/syntax'

import executeExpression from 'yox-expression-compiler/execute'
import * as expressionNodeType from 'yox-expression-compiler/src/nodeType'

import Observer from 'yox-observer'

import * as pattern from './config/pattern'
import * as lifecycle from './config/lifecycle'

import api from './platform/web/api'
import * as vdom from './platform/web/vdom'

const TEMPLATE_KEY = '_template_'

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
      components,
      directives,
      partials,
      filters,
      events,
      watchers,
      methods,
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

    computed = computed ? object.copy(computed) : { }

    let counter = 0
    computed[ TEMPLATE_KEY ] = {
      deps: env.TRUE,
      get: function () {
        return counter++
      }
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$observer = new Observer({
      context: instance,
      data: source,
      computed
    })

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

    // 等数据准备好之后，再触发 watchers
    watchers && instance.$observer.watch(watchers)

    // 监听各种事件
    instance.$emitter = new Emitter()
    events && instance.on(events)

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
    partials && instance.partial(partials)
    filters && instance.filter(filters)

    if (template) {
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
   * @return {?*}
   */
  get(keypath, context) {
    return this.$observer.get(keypath, context)
  }

  /**
   * 设值
   *
   * @param {string|Object} keypath
   * @param {?*} value
   */
  set(keypath, value) {

    let model, sync
    if (is.string(keypath)) {
      model = { }
      model[ keypath ] = value
    }
    else if (is.object(keypath)) {
      model = keypath
      sync = value === env.TRUE
    }
    else {
      return
    }

    this.updateModel(model, sync)

  }

  /**
   * 监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   */
  on(type, listener) {
    this.$emitter.on(type, listener)
  }

  /**
   * 监听一次事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   */
  once(type, listener) {
    this.$emitter.once(type, listener)
  }

  /**
   * 取消监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   */
  off(type, listener) {
    this.$emitter.off(type, listener)
  }

  /**
   * 触发事件
   *
   * @param {string} type
   * @param {?*} data
   * @return {boolean} 是否正常结束
   */
  fire(type, data) {

    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件
    let event = type
    if (is.string(type)) {
      event = new Event(type)
    }

    let instance = this
    if (!event.target) {
      event.target = instance
    }

    let args = [ event ]
    if (is.object(data)) {
      array.push(args, data)
    }

    let { $parent, $emitter } = instance
    let isComplete = $emitter.fire(event.type, args, instance)
    if (isComplete && $parent) {
      isComplete = $parent.fire(event, data)
    }

    return isComplete

  }

  /**
   * 监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   */
  watch(keypath, watcher, sync) {
    this.$observer.watch(keypath, watcher, sync)
  }

  /**
   * 监听一次数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   */
  watchOnce(keypath, watcher, sync) {
    this.$observer.watchOnce(keypath, watcher, sync)
  }

  /**
   * 取消监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   */
  unwatch(keypath, watcher) {
    this.$observer.unwatch(keypath, watcher)
  }

  /**
   * 只更新数据，不更新视图
   *
   * @param {Object} model
   */
  updateModel(model) {

    let instance = this, $observer = instance.$observer, args = arguments

    let oldValue = instance.get(TEMPLATE_KEY)

    $observer.set(model)

    if (oldValue === instance.get(TEMPLATE_KEY)
      || args.length === 1
    ) {
      return
    }

    if (args.length === 2 && args[ 1 ]) {
      instance.updateView()
    }
    else if (!instance.$pending) {
      instance.$pending = env.TRUE
      nextTask.append(
        function () {
          if (instance.$pending) {
            delete instance.$pending
            instance.updateView()
          }
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
      $observer,
      $options,
      $filters,
      $node,
    } = instance

    let isUpdate = $node

    // 对于静态组件，可在 beforeUpdate 钩子函数返回 false
    if (isUpdate
      && execute($options[ lifecycle.BEFORE_UPDATE ], instance) === env.FALSE
    ) {
      return
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
    object.extend(context, $observer.data, $observer.computedGetters)

    // 新的虚拟节点和依赖关系
    let map = { },
    deps = [ ],
    nodes = vdom.create(
      instance.$template,
      context,
      instance,
      function (key, value) {
        if (!map[ key ]) {
          map[ key ] = env.TRUE
          array.push(deps, key)
        }
        $observer.setCache(key, value)
      }
    )

    nextTask.prepend(
      function () {
        if (instance.$emitter) {
          $observer.setDeps(
            TEMPLATE_KEY,
            deps
          )
          execute($options[ isUpdate ? lifecycle.AFTER_UPDATE : lifecycle.AFTER_MOUNT ], instance)
        }
      }
    )

    if (isUpdate) {
      instance.$node = vdom.patch($node, nodes[ 0 ])
    }
    else {
      $node = vdom.patch(arguments[ 0 ], nodes[ 0 ])
      instance.$el = $node.el
      instance.$node = $node
    }

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

  /**
   * 把指令中的表达式编译成函数
   *
   * @param {Directive} directive
   * @return {Function}
   */
  compileDirective(directive) {

    let instance = this
    let { value, expr, keypath, context } = directive

    if (expr && expr.type === expressionNodeType.CALL) {
      return function (event) {
        let isEvent = Event.is(event)
        let { callee, args } = expr
        if (!args.length) {
          if (isEvent) {
            args = [ event ]
          }
        }
        else {
          context.set(templateSyntax.SPECIAL_KEYPATH, keypath)
          context.set(templateSyntax.SPECIAL_EVENT, event)
          args = args.map(
            function (node) {
              return executeExpression(node, context)
            }
          )
        }
        let method = instance[ callee.source ] || context.get(callee.source).value
        if (execute(method, instance, args) === env.FALSE && isEvent) {
          event.prevent()
          event.stop()
        }
      }
    }
    else if (value) {
      return function (event, data) {
        if (event.type !== value) {
          event = new Event(event)
          event.type = value
        }
        instance.fire(event, data)
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
      $node,
      $parent,
      $emitter,
      $observer,
    } = instance

    execute($options[ lifecycle.BEFORE_DESTROY ], instance)

    if ($parent && $parent.$children) {
      array.remove($parent.$children, instance)
    }

    if ($node) {
      if (arguments[ 0 ] !== env.TRUE) {
        vdom.patch($node, { text: char.CHAR_BLANK })
      }
    }

    $emitter.off()
    $observer.destroy()

    object.clear(instance)

    execute($options[ lifecycle.AFTER_DESTROY ], instance)

  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   *
   * @param {Function} fn
   */
  nextTick(fn) {
    Yox.nextTick(fn)
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
Yox.version = '0.40.5'

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

class Store {

  constructor() {
    this.data = { }
  }

  /**
   * 异步取值
   *
   * @param {string} key
   * @param {Function} callback
   */
  getAsync(key, callback) {
    let { data } = this
    let value = data[ key ]
    if (is.func(value)) {
      let { $pending } = value
      if (!$pending) {
        $pending = value.$pending = [ callback ]
        value(function (replacement) {
          delete value.$pending
          data[ key ] = replacement
          array.each(
            $pending,
            function (callback) {
              callback(replacement)
            }
          )
        })
      }
      else {
        array.push($pending, callback)
      }
    }
    else {
      callback(value)
    }
  }

  /**
   * 同步取值
   *
   * @param {string} key
   * @return {*}
   */
  get(key) {
    return this.data[ key ]
  }

  set(key, value) {
    let { data } = this
    if (is.object(key)) {
      object.each(
        key,
        function (value, key) {
          data[ key ] = value
        }
      )
    }
    else if (is.string(key)) {
      data[ key ] = value
    }
  }

}

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
    [ 'directive', 'partial', 'filter' ]
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
Yox.nextTick = function (fn) {
  fn.i = 1
  nextTask.append(fn)
}

/**
 * 编译模板，暴露出来是为了打包阶段的模板预编译
 *
 * @param {string} template
 * @return {Object}
 */
Yox.compile = function (template) {
  return compileTemplate(template)[ 0 ]
}

/**
 * 验证 props
 *
 * @param {Object} props 传递的数据
 * @param {Object} propTypes 数据格式
 * @return {Object} 验证通过的数据
 */
Yox.validate = function (props, propTypes) {
  let result = { }
  object.each(
    propTypes,
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
          else {
            logger.warn(`"${key}" prop's type is not matched.`)
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

import ref from './directive/ref'
import event from './directive/event'
import model from './directive/model'

// 全局注册内置指令
Yox.directive({ ref, event, model })
