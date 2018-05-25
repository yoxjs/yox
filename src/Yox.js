
import isDef from 'yox-common/function/isDef'
import execute from 'yox-common/function/execute'

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

import * as snabbdom from 'yox-snabbdom'

import * as templateCompiler from 'yox-template-compiler'
import * as expressionCompiler from 'yox-expression-compiler'
import * as expressionNodeType from 'yox-expression-compiler/src/nodeType'

import {
  Computed,
  Observer,
} from 'yox-observer'

import * as config from 'yox-config'

import * as pattern from './config/pattern'

import api from './platform/web/api'

const patch = snabbdom.init(api)

const TEMPLATE = 'template'
const TEMPLATE_COMPUTED = '$' + TEMPLATE

export default class Yox {

  constructor(options) {

    let instance = this

    if (!is.object(options)) {
      options = { }
    }

    // 如果不绑着，其他方法调不到钩子
    instance.$options = options

    execute(options[ config.HOOK_BEFORE_CREATE ], instance, options)

    let {
      el,
      data,
      props,
      parent,
      replace,
      computed,
      template,
      transitions,
      components,
      directives,
      partials,
      filters,
      slots,
      events,
      methods,
      watchers,
      propTypes,
      extensions,
    } = options

    extensions && object.extend(instance, extensions)

    let source
    if (is.object(propTypes)) {
      instance.$propTypes = propTypes
      source = instance.validate(props || { }, propTypes)
    }
    else {
      source = props || { }
    }

    if (slots) {
      object.extend(source, slots)
    }

    // 如果传了 props，则 data 应该是个 function
    if (props && is.object(data)) {
      logger.warn('"data" option expected to be a function.')
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$observer = new Observer({
      context: instance,
      data: source,
      computed,
    })

    // 后放 data
    let extend = is.func(data) ? execute(data, instance, options) : data
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

    // 监听各种事件
    // 支持命名空间
    instance.$emitter = new Emitter(env.TRUE)

    let templateError = `"${TEMPLATE}" option expected to have just one root element.`

    // 检查 template
    if (is.string(template)) {
      if (pattern.selector.test(template)) {
        template = api.html(
          api.find(template)
        )
      }
      // 如果是根组件，必须有一个根元素
      // 如果是子组件，可以是 $children
      if (!pattern.tag.test(template) && !parent) {
        logger.error(templateError)
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
        logger.error('"el" option expected to be a html element.')
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
            logger.fatal(`"${name}" method is conflicted with built-in methods.`)
          }
          instance[ name ] = fn
        }
      )
    }

    // 聪明的 set...
    let smartSet = function (key, value) {
      if (is.func(value)) {
        instance[ key ](execute(value, instance))
      }
      else if (is.object(value)) {
        instance[ key ](value)
      }
    }

    smartSet('transition', transitions)
    smartSet('component', components)
    smartSet('directive', directives)
    smartSet('partial', partials)
    smartSet('filter', filters)

    execute(options[ config.HOOK_AFTER_CREATE ], instance)

    if (template) {

      // 确保组件根元素有且只有一个
      template = Yox.compile(template)
      if (template[ env.RAW_LENGTH ] > 1) {
        logger.fatal(templateError)
      }
      instance.$template = template[ 0 ]

      instance.$observer.addComputed(
        TEMPLATE_COMPUTED,
        function () {
          return instance.render()
        }
      )
      if (watchers) {
        watchers = object.copy(watchers)
      }
      else {
        watchers = { }
      }
      watchers[ TEMPLATE_COMPUTED ] = function (newNode) {
        instance.updateView(newNode, instance.$node)
      }

      instance.updateView(
        instance.get(TEMPLATE_COMPUTED),
        el || api.createElement('div')
      )
    }

    // 确保早于 AFTER_MOUNT 执行
    if (watchers || events) {
      nextTask.prepend(
        function () {
          if (watchers && instance.$observer) {
            instance.watch(watchers)
          }
          if (events && instance.$emitter) {
            instance.on(events)
          }
        }
      )
    }

  }

  validate(props) {
    let { $propTypes } = this
    return $propTypes
      ? Yox.validate(props, $propTypes)
      : props
  }

  /**
   * 添加计算属性
   *
   * @param {string} keypath
   * @param {Function|Object} computed
   */
  addComputed(keypath, computed) {
    return this.$observer.addComputed(keypath, computed)
  }

  /**
   * 取值
   *
   * @param {string} keypath
   * @param {*} defaultValue
   * @return {?*}
   */
  get(keypath, defaultValue) {
    return this.$observer.get(keypath, defaultValue)
  }

  /**
   * 设值
   *
   * @param {string|Object} keypath
   * @param {?*} value
   */
  set(keypath, value) {
    this.$observer.set(keypath, value)
  }

  /**
   * 监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   * @return {Yox} 支持链式
   */
  on(type, listener) {
    this.$emitter.on(type, listener)
    return this
  }

  /**
   * 监听一次事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   * @return {Yox} 支持链式
   */
  once(type, listener) {
    this.$emitter.once(type, listener)
    return this
  }

  /**
   * 取消监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   * @return {Yox} 支持链式
   */
  off(type, listener) {
    this.$emitter.off(type, listener)
    return this
  }

  /**
   * 触发事件
   *
   * @param {string} type
   * @param {?*} data 事件数据
   * @param {?boolean} downward 向下发事件
   * @return {boolean} 是否正常结束
   */
  fire(type, data, downward) {

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

    let { $parent, $children, $emitter } = instance
    let isComplete = $emitter.fire(event.type, args, instance)
    if (isComplete) {
      if (downward) {
        if ($children) {
          array.each(
            $children,
            function (child) {
              return isComplete = child.fire(event, data, env.TRUE)
            }
          )
        }
      }
      else if ($parent) {
        isComplete = $parent.fire(event, data)
      }
    }

    return isComplete

  }

  /**
   * 监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   * @return {Yox} 支持链式
   */
  watch(keypath, watcher, sync) {
    this.$observer.watch(keypath, watcher, sync)
    return this
  }

  /**
   * 监听一次数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   * @return {Yox} 支持链式
   */
  watchOnce(keypath, watcher, sync) {
    this.$observer.watchOnce(keypath, watcher, sync)
    return this
  }

  /**
   * 取消监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @return {Yox} 支持链式
   */
  unwatch(keypath, watcher) {
    this.$observer.unwatch(keypath, watcher)
    return this
  }

  /**
   * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
   * 而你非常确定需要更新模板，强制刷新正是你需要的
   */
  forceUpdate() {

    if (this.$node) {
      let computed = this.$observer.computed[ TEMPLATE_COMPUTED ]
      if (computed.isDirty()) {
        this.$observer.nextRun()
      }
      else {
        this.updateView(
          computed.get(env.TRUE),
          this.$node
        )
      }
    }

  }

  /**
   * 把模板抽象语法树渲染成 virtual dom
   *
   * @return {Object}
   */
  render() {

    let instance = this

    let { $template, $getter } = instance

    if (!$getter) {

      let filters = object.extend({ }, registry.filter, instance.$filters)

      let getValue = function (key, expr, keypathStack) {

        if (keypathStack) {

          let value, absoluteKeypath,
          lookup = expr.lookup !== env.FALSE,
          // keypathStack 的结构是 keypath, scope 作为一组
          index = keypathStack[ env.RAW_LENGTH ] - 2,
          getKeypath = function () {

            let keypathIndex = index

            if (!lookup) {
              let keys = [ ]
              keypathUtil.each(
                key,
                function (key) {
                  if (key === env.KEYPATH_PRIVATE_PARENT) {
                    keypathIndex -= 2
                  }
                  else if (key !== env.KEYPATH_PRIVATE_CURRENT) {
                    array.push(keys, key)
                  }
                }
              )
              key = array.join(keys, env.KEYPATH_SEPARATOR)
            }

            let keypath = keypathUtil.join(keypathStack[ keypathIndex ], key)
            if (!absoluteKeypath) {
              absoluteKeypath = keypath
            }
            let scope = keypathStack[ keypathIndex + 1 ]
            if (object.has(scope, key)) {
              value = scope[ key ]
              return keypath
            }
            value = instance.get(keypath, getKeypath)
            if (value === getKeypath) {
              if (lookup && index > 0) {
                index--
                return getKeypath()
              }
            }
            else {
              return keypath
            }
          },
          keypath = getKeypath()

          if (isDef(keypath)) {
            absoluteKeypath = keypath
          }
          else {
            value = env.UNDEFINED
            if (filters) {
              let result = object.get(filters, key)
              if (result) {
                value = result.value
              }
            }
          }

          expr.absoluteKeypath = absoluteKeypath

          return value

        }
        else {
          return instance.get(key)
        }
      }

      $getter =
      instance.$getter = function (expr, keypathStack, binding) {
        let lastComputed = Observer.computed, value
        if (binding) {
          Observer.computed = env.NULL
        }
        if (is.string(expr)) {
          value = getValue(expr)
        }
        else {
          value = expressionCompiler.execute(
            expr,
            function (key, node) {
              return getValue(key, node, keypathStack)
            },
            instance
          )
        }
        if (binding) {
          Observer.computed = lastComputed
        }
        return value
      }
    }

    return templateCompiler.render(
      $template,
      $getter,
      instance
    )

  }

  /**
   * 更新 virtual dom
   *
   * @param {Vnode} newNode
   * @param {HTMLElement|Vnode} oldNode
   */
  updateView(newNode, oldNode) {

    let instance = this, afterHook

    let {
      $node,
      $options,
    } = instance

    instance.$flags = { }

    if ($node) {
      execute($options[ config.HOOK_BEFORE_UPDATE ], instance)
      instance.$node = patch(oldNode, newNode)
      afterHook = config.HOOK_AFTER_UPDATE
    }
    else {
      execute($options[ config.HOOK_BEFORE_MOUNT ], instance)
      $node = patch(oldNode, newNode)
      instance.$el = $node.el
      instance.$node = $node
      afterHook = config.HOOK_AFTER_MOUNT
    }

    // 跟 nextTask 保持一个节奏
    // 这样可以预留一些优化的余地
    nextTask.append(
      function () {
        if (instance.$node) {
          execute($options[ afterHook ], instance)
        }
      }
    )

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
   * 导入编译后的子模板
   *
   * @param {string} name
   * @return {Array}
   */
  importPartial(name) {
    return Yox.compile(
      this.partial(name)
    )
  }

  /**
   * 把指令中的表达式编译成函数
   *
   * @param {Directive} directive
   * @return {Function}
   */
  compileDirective(directive) {

    let instance = this
    let { value, expr, keypath, keypathStack } = directive

    if (expr && expr.type === expressionNodeType.CALL) {
      let { callee, args } = expr, method = instance[ callee.name ]
      if (method) {
        let getValue = function (node) {
          return instance.$getter(node, keypathStack)
        }
        return function (event) {
          let isEvent = Event.is(event), result
          if (args && args[ env.RAW_LENGTH ]) {
            if (isEvent) {
              array.last(keypathStack)[ config.SPECIAL_EVENT ] = event
            }
            result = execute(method, instance, args.map(getValue))
          }
          else {
            if (isEvent) {
              result = execute(method, instance, event)
            }
          }
          if (result === env.FALSE && isEvent) {
            event.prevent().stop()
          }
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

    execute($options[ config.HOOK_BEFORE_DESTROY ], instance)

    if ($parent && $parent.$children) {
      array.remove($parent.$children, instance)
    }

    if ($node) {
      patch($node, snabbdom.createTextVnode(char.CHAR_BLANK))
    }

    $emitter.off()
    $observer.destroy()

    object.clear(instance)

    execute($options[ config.HOOK_AFTER_DESTROY ], instance)

  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   *
   * @param {Function} fn
   */
  nextTick(fn) {
    this.$observer.nextTick(fn)
  }

  /**
   * 取反 keypath 对应的数据
   *
   * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
   *
   * @param {string} keypath
   * @return {boolean} 取反后的布尔值
   */
  toggle(keypath) {
    return this.$observer.toggle(keypath)
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
    return this.$observer.increase(keypath, step, max)
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
    return this.$observer.decrease(keypath, step, min)
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

  /**
   * 在数组指定位置插入元素
   *
   * @param {string} keypath
   * @param {*} item
   * @param {number} index
   * @return {?boolean} 是否插入成功
   */
  insert(keypath, item, index) {
    return this.$observer.insert(keypath, item, index)
  }

  /**
   * 在数组尾部添加元素
   *
   * @param {string} keypath
   * @param {*} item
   * @return {?boolean} 是否添加成功
   */
  append(keypath, item) {
    return this.$observer.insert(keypath, item, env.TRUE)
  }

  /**
   * 在数组首部添加元素
   *
   * @param {string} keypath
   * @param {*} item
   * @return {?boolean} 是否添加成功
   */
  prepend(keypath, item) {
    return this.$observer.insert(keypath, item, env.FALSE)
  }

  /**
   * 通过索引移除数组中的元素
   *
   * @param {string} keypath
   * @param {number} index
   * @return {?boolean} 是否移除成功
   */
  removeAt(keypath, index) {
    return this.$observer.removeAt(keypath, index)
  }

  /**
   * 直接移除数组中的元素
   *
   * @param {string} keypath
   * @param {*} item
   * @return {?boolean} 是否移除成功
   */
  remove(keypath, item) {
    return this.$observer.remove(keypath, item)
  }

}


/**
 * 版本
 *
 * @type {string}
 */
Yox.version = '0.59.2'

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

const COMPONENT = 'component'

function getResourceAsync(data, name, callback) {
  let value = data[ name ]
  if (is.func(value)) {
    let { $pending } = value
    if (!$pending) {
      $pending = value.$pending = [ callback ]
      value(
        function (replacement) {
          delete value.$pending
          data[ name ] = replacement
          array.each(
            $pending,
            function (callback) {
              callback(replacement)
            }
          )
        }
      )
    }
    else {
      array.push($pending, callback)
    }
  }
  else {
    callback(value)
  }
}

function setResource(data, name, value) {
  if (is.object(name)) {
    object.each(
      name,
      function (value, key) {
        data[ key ] = value
      }
    )
  }
  else {
    data[ name ] = value
  }
}

/**
 * 全局/本地注册
 *
 * @param {Object|string} name
 * @param {?Object} value
 */
array.each(
  [ COMPONENT, 'transition', 'directive', 'partial', 'filter' ],
  function (type) {
    prototype[ type ] = function (name, value) {
      let instance = this, prop = `$${type}s`, data = instance[ prop ]
      if (is.string(name)) {
        let length = arguments[ env.RAW_LENGTH ], hasValue = data && object.has(data, name)
        if (length === 1) {
          return hasValue
            ? data[ name ]
            : Yox[ type ](name)
        }
        else if (length === 2 && type === COMPONENT && is.func(value)) {
          return hasValue
            ? getResourceAsync(data, name, value)
            : Yox[ type ](name, value)
        }
      }
      setResource(
        data || (instance[ prop ] = { }),
        name,
        value
      )
    }
    Yox[ type ] = function (name, value) {
      let data = registry[ type ]
      if (is.string(name)) {
        let length = arguments[ env.RAW_LENGTH ], hasValue = data && object.has(data, name)
        if (length === 1) {
          return hasValue
            ? data[ name ]
            : env.UNDEFINED
        }
        else if (length === 2 && type === COMPONENT && is.func(value)) {
          return hasValue
            ? getResourceAsync(data, name, value)
            : value()
        }
      }
      setResource(
        data || (registry[ type ] = { }),
        name,
        value
      )
    }
  }
)

/**
 * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
 *
 * @param {Function} fn
 */
Yox.nextTick = nextTask.append

/**
 * 编译模板，暴露出来是为了打包阶段的模板预编译
 *
 * @param {string} template
 * @return {Array}
 */
Yox.compile = function (template) {
  return is.string(template)
    ? templateCompiler.convert(
        templateCompiler.compile(template)
      )
    : template
}

/**
 * 验证 props，无爱请重写
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

      if (isDef(props[ key ])) {
        let target = props[ key ]
        if (is.func(rule)) {
          result[ key ] = rule(target)
        }
        // 如果不写 type 或 type 不是 字符串 或 数组
        // 就当做此规则无效，和没写一样
        else if (type) {
          let matched
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
        if (type === env.RAW_FUNCTION) {
          result[ key ] = value
        }
        else {
          result[ key ] = is.func(value) ? value(props) : value
        }
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

import event from './directive/event'
import model from './directive/model'
import binding from './directive/binding'

// 全局注册内置指令
Yox.directive({ event, model, binding })

import hasSlot from './filter/hasSlot'

// 全局注册内置过滤器
Yox.filter({ hasSlot })
