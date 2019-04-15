import isDef from 'yox-common/function/isDef'
import execute from 'yox-common/function/execute'

import Event from 'yox-common/util/Event'
import Emitter from 'yox-common/util/Emitter'
import NextTask from 'yox-common/util/NextTask'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'
import * as logger from 'yox-common/util/logger'
import * as keypathUtil from 'yox-common/util/keypath'

// import * as snabbdom from 'yox-snabbdom'

import * as templateCompiler from 'yox-template-compiler/src/compiler'
import * as templateStringify from 'yox-template-compiler/src/stringify'
import * as templateRender from 'yox-template-compiler/src/renderer'
import * as Node from 'yox-template-compiler/src/node/Node'

import * as expressionCompiler from 'yox-expression-compiler'
import * as expressionNodeType from 'yox-expression-compiler/src/nodeType'

import Computed from 'yox-observer/src/Computed'
import Observer from 'yox-observer/src/Observer'

import * as config from 'yox-config'

import * as pattern from './config/pattern'

import api from './platform/web/api'

// const patch = snabbdom.init(api)

const TEMPLATE = env.RAW_TEMPLATE
const TEMPLATE_COMPUTED = '$' + TEMPLATE

interface Plugin {
  install: Function
}

interface PropRule {
  type: string | string[]
  value: any | Function
  required: boolean | Function
}

export default class Yox {

  $options: Record<string, any>

  $observer: Observer

  $emitter: Emitter

  $template: Function

  $refs: Record<string, Yox | HTMLElement>

  $parent: Yox | undefined

  $children: Yox[] | undefined

  /**
   * 安装插件
   *
   * 插件必须暴露 install 方法
   */
  public static use(plugin: Plugin) {
    plugin.install(Yox)
  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   */
  public static nextTick(fn: Function) {
    NextTask.getInstance().append(fn)
  }

  /**
   * 编译模板，暴露出来是为了打包阶段的模板预编译
   */
  public static compile(template: string): Function[] {
    return is.string(template)
      ? templateCompiler.compile(template).map(
          function (node: Node) {
            return templateStringify.parse(
              templateStringify.stringify(node)
            )
          }
        )
      ? template
  }

  /**
   * 验证 props，无爱请重写
   */
  public static checkPropTypes(props: Record<string, any>, propTypes: Record<string, PropRule>) {
    let result = object.copy(props)
    object.each(
      propTypes,
      function (rule: PropRule, key: string) {

        // 类型
        let type = rule.type,

        // 默认值
        value = rule.value,

        // 是否必传
        required = rule.required,

        target = props[key]

        if (is.func(required)) {
          required = execute(required, env.UNDEFINED, props)
        }

        // 传了数据
        if (isDef(target)) {

          // 如果不写 type 或 type 不是 字符串 或 数组
          // 就当做此规则无效，和没写一样
          if (type) {
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
            if (matched !== env.TRUE) {
              logger.warn(`The prop "${key}" ${env.RAW_TYPE} is not matched.`)
            }
          }
        }
        else if (required) {
          logger.warn(`The prop "${key}" is marked as required, but its value is not found.`)
        }
        else if (object.has(rule, env.RAW_VALUE)) {
          result[key] = type === env.RAW_FUNCTION
            ? value
            : (is.func(value) ? value(props) : value)
        }
      }
    )
    return result
  }



  constructor(options: Record<string, any>) {

    const instance = this

    if (!is.object(options)) {
      options = env.EMPTY_OBJECT
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
      extensions,
    } = options

    if (extensions) {
      object.extend(instance, extensions)
    }

    // 数据源
    const source = instance.checkPropTypes(props || env.EMPTY_OBJECT)

    // 把 slots 放进数据里，方便 get
    if (slots) {
      object.extend(source, slots)
    }

    // 如果传了 props，则 data 应该是个 function
    if (props && is.object(data)) {
      logger.warn('"data" option expected to be a function.')
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$observer = new Observer(source, instance)

    // 后放 data
    const extend = is.func(data) ? execute(data, instance, options) : data
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

    let templateError = `"template" option expected to have just one root element.`

    // 检查 template
    if (is.string(template)) {
      if (pattern.selector.test(template)) {
        template = api.html(
          api.find(template)
        )
      }
      // 如果是根组件，必须有一个根元素
      if (!pattern.tag.test(template) && !parent) {
        logger.error(templateError)
      }
    }
    else {
      template = env.NULL
    }

    // 检查 el
    if (is.string(el) && pattern.selector.test(el)) {
      el = api.find(el)
    }

    // 可以不传 el，比如用作纯数据对象
    if (el) {
      if (api.isElement(el)) {
        if (!replace) {
          api.html(el, '<div></div>')
          el = api[ env.RAW_CHILDREN ](el)[ 0 ]
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
        function (method: Function, name: string) {
          if (instance[name]) {
            logger.fatal(`"${name}" method is conflicted with built-in methods.`)
          }
          instance[ name ] = method
        }
      )
    }

    // 聪明的 set...
    let smartSet = function (key: string, value: Function | Record<string, any>) {
      if (is.func(value)) {
        instance[ key ](execute(value, instance))
      }
      else if (is.object(value)) {
        instance[ key ](value)
      }
    }

    smartSet(env.RAW_TRANSITION, transitions)
    smartSet(env.RAW_COMPONENT, components)
    smartSet(env.RAW_DIRECTIVE, directives)
    smartSet(env.RAW_PARTIAL, partials)
    smartSet(env.RAW_FILTER, filters)

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

    if (events) {
      instance.on(events)
    }

    // 确保早于 AFTER_MOUNT 执行
    if (watchers) {
      nextTask.prepend(
        function () {
          if (instance.$observer) {
            instance.watch(watchers)
          }
        }
      )
    }

  }

  /**
   * 添加计算属性
   */
  addComputed(keypath: string, computed: Function | Record<string, any>): Computed | void {
    return this.$observer.addComputed(keypath, computed)
  }

  /**
   * 取值
   */
  get(keypath: string, defaultValue?: any): any {
    return this.$observer.get(keypath, defaultValue)
  }

  /**
   * 设值
   */
  set(keypath: string | Record<string, any>, value?: any) {
    // 组件经常有各种异步改值，为了避免组件销毁后依然调用 set
    // 这里判断一下，至于其他方法的异步调用就算了，业务自己控制吧
    const { $observer } = this
    if ($observer) {
      $observer.set(keypath, value)
    }
  }

  /**
   * 监听事件
   */
  on(type: string | Record<string, Function>, listener?: Function): Yox {
    this.$emitter.on(type, listener)
    return this
  }

  /**
   * 监听一次事件
   */
  once(type: string | Record<string, Function>, listener?: Function): Yox {
    this.$emitter.once(type, listener)
    return this
  }

  /**
   * 取消监听事件
   */
  off(type: string, listener?: Function): Yox {
    this.$emitter.off(type, listener)
    return this
  }

  /**
   * 触发事件
   */
  fire(type: string | Event, data: Record<string, any> | boolean | void, downward?: boolean): boolean {

    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件

    const instance = this,

    event = is.string(type)
      ? new Event(type)
      : type as Event,

    args: any[] = [ event ]

    // 告诉外部是谁发出的事件
    if (!event.target) {
      event.target = instance
    }

    // 有事件数据
    if (is.object(data)) {
      array.push(args, data)
    }
    // 比如 fire('name', true) 直接向下发事件
    else if (data === env.TRUE) {
      downward = env.TRUE
    }

    let isComplete = instance.$emitter.fire(event.type, args, instance)
    if (isComplete) {
      if (downward) {
        if (instance.$children) {
          array.each(
            instance.$children,
            function (child: Yox) {
              return isComplete = child.fire(event, data, env.TRUE)
            }
          )
        }
      }
      else if (instance.$parent) {
        isComplete = instance.$parent.fire(event, data)
      }
    }

    return isComplete

  }

  /**
   * 监听数据变化
   */
  watch(keypath: string | Record<string, any>, watcher?: Function | Record<string, any> | boolean, options?: boolean | Record<string, any>): Yox {
    this.$observer.watch(keypath, watcher, options)
    return this
  }

  /**
   * 监听一次数据变化
   */
  watchOnce(keypath: string | Record<string, any>, watcher?: Function | Record<string, any>, options?: Record<string, any>): Yox {
    this.$observer.watchOnce(keypath, watcher, options)
    return this
  }

  /**
   * 取消监听数据变化
   */
  unwatch(keypath: string, watcher: Function | Record<string, any>): Yox {
    this.$observer.unwatch(keypath, watcher)
    return this
  }

  /**
   * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
   * 而你非常确定需要更新模板，强制刷新正是你需要的
   */
  forceUpdate() {

    // if (this.$node) {
    //   let computed = this.$observer.computed[ TEMPLATE_COMPUTED ]
    //   if (computed.isDirty()) {
    //     this.$observer.nextRun()
    //   }
    //   else {
    //     this.updateView(
    //       computed.get(env.TRUE),
    //       this.$node
    //     )
    //   }
    // }

  }

  /**
   * 把模板抽象语法树渲染成 virtual dom
   */
  render() {

    const instance = this

    // 每次渲染重置 refs
    // 在渲染过程中收集最新的 ref
    // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
    instance.$refs = {}

    return templateRender.render(instance, instance.$template)

  }

  /**
   * 更新 virtual dom
   *
   * @param {Vnode} newNode
   * @param {HTMLElement|Vnode} oldNode
   */
  updateView(newNode, oldNode) {

    let instance = this, { $node, $options } = instance, afterHook

    instance.$flags = { }

    if ($node) {
      execute($options[ config.HOOK_BEFORE_UPDATE ], instance)
      // instance.$node = patch(oldNode, newNode)
      afterHook = config.HOOK_AFTER_UPDATE
    }
    else {
      execute($options[ config.HOOK_BEFORE_MOUNT ], instance)
      // $node = patch(oldNode, newNode)
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
   * 校验组件参数
   *
   * @param {Object} props
   * @return {?Object}
   */
  checkPropTypes(props) {
    let { propTypes } = this.$options
    return propTypes
      ? Yox.checkPropTypes(props, propTypes)
      : props
  }

  /**
   * 创建子组件
   *
   * @param {Object} options 组件配置
   * @param {?Object} vnode 虚拟节点
   * @param {?HTMLElement} el DOM 元素
   * @return {Yox} 子组件实例
   */
  create(options, vnode, el) {

    options = object.copy(options)
    options.parent = this

    if (vnode && el) {

      options.el = el
      options.replace = env.TRUE
      options.slots = vnode.slots

      let { attrs } = vnode

      if (vnode.model) {
        if (!attrs) {
          attrs = { }
        }
        let field = options.model || env.RAW_VALUE
        if (!object.has(attrs, field)) {
          attrs[ field ] = vnode.instance.get(vnode.model)
        }
        options.extensions = {
          $model: field,
        }
      }

      options.props = attrs

    }

    let child = new Yox(options)
    array.push(
      this.$children || (this.$children = [ ]),
      child
    )

    return child
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
      // patch($node, snabbdom.createTextVnode(env.EMPTY_STRING))
    }

    $emitter.off()
    $observer.destroy()

    object.clear(instance)

    execute($options[ config.HOOK_AFTER_DESTROY ], instance)

  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   */
  nextTick(fn: Function) {
    this.$observer.nextTick(fn)
  }

  /**
   * 取反 keypath 对应的数据
   *
   * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
   */
  toggle(keypath: string): boolean {
    return this.$observer.toggle(keypath)
  }

  /**
   * 递增 keypath 对应的数据
   *
   * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
   *
   * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
   * @param step 步进值，默认是 1
   * @param max 可以递增到的最大值，默认不限制
   */
  increase(keypath: string, step = 1, max?: number): number | void {
    return this.$observer.increase(keypath, step, max)
  }

  /**
   * 递减 keypath 对应的数据
   *
   * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
   *
   * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
   * @param step 步进值，默认是 1
   * @param min 可以递减到的最小值，默认不限制
   */
  decrease(keypath: string, step = 1, min?: number): number | void {
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
   * @param keypath
   * @param item
   * @param index
   */
  insert(keypath: string, item: any, index: number | boolean): boolean | void {
    return this.$observer.insert(keypath, item, index)
  }

  /**
   * 在数组尾部添加元素
   *
   * @param keypath
   * @param item
   */
  append(keypath: string, item: any): boolean | void {
    return this.$observer.insert(keypath, item, env.TRUE)
  }

  /**
   * 在数组首部添加元素
   *
   * @param keypath
   * @param item
   */
  prepend(keypath: string, item: any): boolean | void {
    return this.$observer.insert(keypath, item, env.FALSE)
  }

  /**
   * 通过索引移除数组中的元素
   *
   * @param keypath
   * @param index
   */
  removeAt(keypath: string, index: number): boolean | void {
    return this.$observer.removeAt(keypath, index)
  }

  /**
   * 直接移除数组中的元素
   *
   * @param keypath
   * @param item
   */
  remove(keypath: string, item: any): boolean | void {
    return this.$observer.remove(keypath, item)
  }

}


/**
 * 版本
 *
 * @type {string}
 */
Yox.version = '0.63.0'

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
 * // filter 为了支持类似 loadsh 这个的函数库，如 loadsh.trim
      // 这种过滤器就不是单纯的函数了，而是用 . 访问
 *
 * @param {Object|string} name
 * @param {?Object} value
 */
array.each(
  [ env.RAW_COMPONENT, env.RAW_TRANSITION, env.RAW_DIRECTIVE, env.RAW_PARTIAL, env.RAW_FILTER ],
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
        else if (length === 2 && type === env.RAW_COMPONENT && is.func(value)) {
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
        else if (length === 2 && type === env.RAW_COMPONENT && is.func(value)) {
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





import event from './directive/event'
import model from './directive/model'
import binding from './directive/binding'

// 全局注册内置指令
Yox.directive({ event, model, binding })

import hasSlot from './filter/hasSlot'

// 全局注册内置过滤器
Yox.filter({ hasSlot })
