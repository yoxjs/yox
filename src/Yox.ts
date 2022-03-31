import {
  Data,
  Filter,
  Partial,
  ThisTask,
  ThisWatcher,
  ThisListener,
  Listener,
  Component,
  ComponentCallback,
  ComponentLoader,
  PropTypeFunction,
  PropValueFunction,
  PropRule,
} from 'yox-type/src/type'

import {
  Slots,
  VNode,
} from 'yox-type/src/vnode'

import {
  DirectiveHooks,
  TransitionHooks,
} from 'yox-type/src/hooks'

import {
  EmitterEvent,
  ListenerOptions,
  TypeListenerOptions,
  ComponentOptions,
  ThisWatcherOptions,
  ThisListenerOptions,
  ThisTypeListenerOptions,
} from 'yox-type/src/options'

import {
  YoxInterface,
} from 'yox-type/src/yox'

import {
  IsApi,
  DomApi,
  ArrayApi,
  ObjectApi,
  StringApi,
  LoggerApi,
} from 'yox-type/src/api'

import {
  HOOK_BEFORE_CREATE,
  HOOK_AFTER_CREATE,
  HOOK_BEFORE_MOUNT,
  HOOK_AFTER_MOUNT,
  HOOK_BEFORE_UPDATE,
  HOOK_AFTER_UPDATE,
  HOOK_BEFORE_DESTROY,
  HOOK_AFTER_DESTROY,
  HOOK_BEFORE_PROPS_UPDATE,
  MODEL_PROP_DEFAULT,
  SLOT_DATA_PREFIX,
  MODIFER_NATIVE,
} from 'yox-config/src/config'

import Emitter from 'yox-common/src/util/Emitter'
import NextTask from 'yox-common/src/util/NextTask'
import CustomEvent from 'yox-common/src/util/CustomEvent'

import * as is from 'yox-common/src/util/is'
import * as cache from 'yox-common/src/util/cache'
import * as array from 'yox-common/src/util/array'
import * as string from 'yox-common/src/util/string'
import * as object from 'yox-common/src/util/object'
import * as logger from 'yox-common/src/util/logger'
import * as constant from 'yox-common/src/util/constant'

import * as snabbdom from 'yox-snabbdom/src/snabbdom'

import * as templateCompiler from 'yox-template-compiler/src/compiler'
import * as templateGenerator from 'yox-template-compiler/src/generator'
import * as templateRender from 'yox-template-compiler/src/renderer'

import * as domApi from 'yox-dom/src/dom'

import Observer from 'yox-observer/src/Observer'


class LifeCycle {
  private $emitter: Emitter

  constructor() {
    this.$emitter = new Emitter()
  }

  fire(component: YoxInterface, type: string, data?: Data) {
    this.$emitter.fire(
      type,
      [
        component,
        data,
      ]
    )
  }

  on(type: string, listener: Function) {
    this.$emitter.on(type, listener)
    return this
  }

  off(type: string, listener: Function) {
    this.$emitter.off(type, listener)
    return this
  }
}

const globalDirectives = { },

globalTransitions = { },

globalComponents = { },

globalPartials = { },

globalFilters = { },

selectorPattern = /^[#.][-\w+]+$/,

lifeCycle = new LifeCycle(),

compileTemplate = cache.createOneKeyCache(
  function (template: string) {
    const nodes = templateCompiler.compile(template)
    if (process.env.NODE_ENV === 'development') {
      if (nodes.length !== 1) {
        logger.fatal(`The "template" option should have just one root element.`)
      }
    }
    return templateGenerator.generate(nodes[0])
  }
),

markDirty = function () {
  this.$isDirty = constant.TRUE
}

export default class Yox implements YoxInterface {

  $options: ComponentOptions

  $observer: Observer

  $emitter: Emitter

  $el?: HTMLElement

  $template?: Function

  $slots?: Slots

  $refs?: Record<string, YoxInterface | HTMLElement>

  $model?: string

  $root?: YoxInterface

  $parent?: YoxInterface

  $context?: YoxInterface

  $children?: YoxInterface[]

  $vnode: VNode | undefined

  private $nextTask: NextTask

  private $directives?: Record<string, DirectiveHooks>

  private $components?: Record<string, ComponentOptions>

  private $transitions?: Record<string, TransitionHooks>

  private $partials?: Record<string, Function>

  private $filters?: Record<string, Filter>

  private $dependencies?: Record<string, boolean>

  private $isDirty?: boolean

  /**
   * core 版本
   */
  public static version = process.env.NODE_VERSION

  /**
   * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
   */
  public static is: IsApi = is
  public static dom: DomApi = domApi
  public static array: ArrayApi = array
  public static object: ObjectApi = object
  public static string: StringApi = string
  public static logger: LoggerApi = logger

  public static Event = CustomEvent
  public static Emitter = Emitter
  public static lifeCycle = lifeCycle

  /**
   * 外部可配置的对象
   */
  public static config = constant.PUBLIC_CONFIG

  /**
   * 定义组件对象
   */
  public static define<Computed, Watchers, Events, Methods>(
    options: ComponentOptions<Computed, Watchers, Events, Methods> & ThisType<Methods & YoxInterface>
  ) {
    return options
  }


  /**
   * 安装插件
   *
   * 插件必须暴露 install 方法
   */
  public static use(
    plugin: {
      install(Y: typeof Yox): void
    }
  ): void {
    plugin.install(Yox)
  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   */
  public static nextTick(task: Function, context?: any): void {
    NextTask.shared().append(task, context)
  }

  /**
   * 编译模板，暴露出来是为了打包阶段的模板预编译
   */
  public static compile(template: string | Function, stringify?: boolean): string | Function {
    if (process.env.NODE_ENV !== 'pure' && process.env.NODE_ENV !== 'runtime') {
      // 需要编译的都是模板源文件，一旦经过预编译，就成了 render 函数
      if (is.func(template)) {
        return template as Function
      }
      template = compileTemplate(template as string)
      return stringify
        ? template
        : new Function(`return ${template}`)()
    }
    else {
      return template
    }
  }

  /**
   * 注册全局指令
   */
  public static directive(
    name: string | Record<string, DirectiveHooks>,
    directive?: DirectiveHooks
  ): DirectiveHooks | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !directive) {
        return getResource(globalDirectives, name as string)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          globalDirectives,
          name,
          directive,
          {
            conflict(name) {
              logger.warn(`The global directive "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          globalDirectives,
          name,
          directive,
        )
      }
    }
  }

  /**
   * 注册全局过渡动画
   */
  public static transition(
    name: string | Record<string, TransitionHooks>,
    transition?: TransitionHooks
  ): TransitionHooks | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !transition) {
        return getResource(globalTransitions, name as string)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          globalTransitions,
          name,
          transition,
          {
            conflict(name) {
              logger.warn(`The global transition "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          globalTransitions,
          name,
          transition
        )
      }
    }
  }

  /**
   * 注册全局组件
   */
  public static component(
    name: string | Record<string, Component>,
    component?: Component
  ): Component | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !component) {
        return getResource(globalComponents, name as string)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          globalComponents,
          name,
          component,
          {
            conflict(name) {
              logger.warn(`The global component "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          globalComponents,
          name,
          component
        )
      }
    }
  }

  /**
   * 注册全局子模板
   */
  public static partial(
    name: string | Record<string, Partial>,
    partial?: Partial
  ): Function | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !partial) {
        return getResource(globalPartials, name as string)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          globalPartials,
          name,
          partial,
          {
            format: Yox.compile,
            conflict(name) {
              logger.warn(`The global partial "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          globalPartials,
          name,
          partial,
          {
            format: Yox.compile,
          }
        )
      }
    }
  }

  /**
   * 注册全局过滤器
   */
  public static filter(
    name: string | Record<string, Filter>,
    filter?: Filter
  ): Filter | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !filter) {
        return getResource(globalFilters, name as string)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          globalFilters,
          name,
          filter,
          {
            conflict(name) {
              logger.warn(`The global filter "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          globalFilters,
          name,
          filter
        )
      }
    }
  }

  /**
   * 注册全局方法
   */
  public static method(
    name: string | Record<string, Function>,
    method?: Function
  ): Function | void {
    if (is.string(name) && !method) {
      return Yox.prototype[name as string]
    }
    if (process.env.NODE_ENV === 'development') {
      setResourceSmartly(
        Yox.prototype,
        name,
        method,
        {
          conflict(name) {
            logger.warn(`The global method "${name}" already exists.`)
          }
        }
      )
    }
    else {
      setResourceSmartly(
        Yox.prototype,
        name,
        method
      )
    }
  }

  constructor(options?: ComponentOptions) {

    const instance = this, $options: ComponentOptions = options || constant.EMPTY_OBJECT

    // 为了冒泡 HOOK_BEFORE_CREATE 事件，必须第一时间创建 emitter
    // 监听各种事件
    // 支持命名空间
    instance.$emitter = new Emitter(constant.TRUE)

    if ($options.events) {
      instance.on($options.events)
    }

    if (process.env.NODE_ENV !== 'pure') {

      // 当前组件的直接父组件
      if ($options.parent) {
        instance.$parent = $options.parent
      }

      // 建立好父子连接后，立即触发钩子
      const beforeCreateHook = $options[HOOK_BEFORE_CREATE]
      if (beforeCreateHook) {
        beforeCreateHook.call(instance, $options)
      }

      lifeCycle.fire(
        instance,
        HOOK_BEFORE_CREATE,
        {
          options: $options,
        }
      )

    }

    let {
      data,
      props,
      vnode,
      propTypes,
      computed,
      methods,
      watchers,
      extensions,
    } = $options

    instance.$options = $options

    if (extensions) {
      object.extend(instance, extensions)
    }

    // 数据源，默认值仅在创建组件时启用
    const source = props ? object.copy(props) : {}
    if (process.env.NODE_ENV !== 'pure') {
      if (propTypes) {
        object.each(
          propTypes,
          function (rule: PropRule, key: string) {
            let value = source[key]
            if (process.env.NODE_ENV === 'development') {
              checkProp($options.name, key, value, rule)
            }
            if (value === constant.UNDEFINED) {
              value = rule.value
              if (value !== constant.UNDEFINED) {
                source[key] = rule.type === constant.RAW_FUNCTION
                  ? value
                  : is.func(value)
                    ? (value as PropValueFunction)()
                    : value
              }
            }
          }
        )
      }

      const { slots } = $options
      if (slots) {
        // 把 slots 放进数据里，方便 get
        instance.renderSlots(source, slots)
      }
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    const observer = instance.$observer = new Observer(
      source,
      instance,
      instance.$nextTask = new NextTask({
        afterTask() {
          if (instance.$isDirty) {
            instance.$isDirty = constant.UNDEFINED
            instance.update(
              instance.render() as VNode,
              instance.$vnode as VNode
            )
          }
        }
      })
    )

    if (computed) {
      object.each(
        computed,
        function (options, keypath) {
          observer.addComputed(keypath, options)
        }
      )
    }

    // 后放 data
    if (process.env.NODE_ENV === 'development') {
      if (vnode && is.object(data)) {
        logger.warn(`The "data" option of child component should be a function which return an object.`)
      }
    }

    const extend = is.func(data) ? (data as Function).call(instance, options) : data
    if (is.object(extend)) {
      object.each(
        extend,
        function (value, key) {
          if (process.env.NODE_ENV === 'development') {
            if (object.has(source, key)) {
              logger.warn(`The data "${key}" is already used as a prop.`)
            }
          }
          source[key] = value
        }
      )
    }

    if (methods) {
      object.each(
        methods,
        function (method: Function, name: string) {
          if (process.env.NODE_ENV === 'development') {
            if (instance[name]) {
              logger.fatal(`The method "${name}" is conflicted with built-in methods.`)
            }
          }
          instance[name] = method
        }
      )
    }

    if (process.env.NODE_ENV !== 'pure') {

      let placeholder: Node | void = constant.UNDEFINED,

      {
        el,
        root,
        model,
        context,
        replace,
        template,
        transitions,
        components,
        directives,
        partials,
        filters,
      } = $options

      if (model) {
        instance.$model = model
      }

      // 检查 template
      if (is.string(template)) {
        // 传了选择器，则取对应元素的 html
        if (selectorPattern.test(template as string)) {
          placeholder = domApi.find(template as string)
          if (placeholder) {
            template = domApi.getHtml(placeholder as Element) as string
            placeholder = constant.UNDEFINED
          }
          else if (process.env.NODE_ENV === 'development') {
            logger.fatal(`The selector "${template}" can't match an element.`)
          }
        }
      }

      // 检查 el
      if (el) {

        if (is.string(el)) {
          const selector = el as string
          if (selectorPattern.test(selector)) {
            placeholder = domApi.find(selector)
            if (process.env.NODE_ENV === 'development') {
              if (!placeholder) {
                logger.fatal(`The selector "${selector}" can't match an element.`)
              }
            }
          }
          else if (process.env.NODE_ENV === 'development') {
            logger.fatal(`The "el" option should be a selector.`)
          }
        }
        else {
          placeholder = el as Node
        }

        if (!replace) {
          domApi.append(
            placeholder as Node,
            placeholder = domApi.createComment(constant.EMPTY_STRING)
          )
        }

      }

      // 根组件
      if (root) {
        instance.$root = root
      }
      // 当前组件是被哪个组件渲染出来的
      // 因为有 slot 机制，$context 不一定等于 $parent
      if (context) {
        instance.$context = context
      }

      setOptionsSmartly(instance, constant.RAW_TRANSITION, transitions)
      setOptionsSmartly(instance, constant.RAW_COMPONENT, components)
      setOptionsSmartly(instance, constant.RAW_DIRECTIVE, directives)
      setOptionsSmartly(instance, constant.RAW_PARTIAL, partials)
      setOptionsSmartly(instance, constant.RAW_FILTER, filters)

      if (template) {

        if (watchers) {
          observer.watch(watchers)
        }

        if (process.env.NODE_ENV !== 'pure') {
          const afterCreateHook = $options[HOOK_AFTER_CREATE]
          if (afterCreateHook) {
            afterCreateHook.call(instance)
          }
          lifeCycle.fire(
            instance,
            HOOK_AFTER_CREATE
          )
        }

        // 编译模板
        // 在开发阶段，template 是原始的 html 模板
        // 在产品阶段，template 是编译后的渲染函数
        // 当然，具体是什么需要外部自己控制
        instance.$template = is.string(template)
          ? Yox.compile(template as string) as Function
          : template as Function

        if (!vnode) {

          if (process.env.NODE_ENV === 'development') {
            if (!placeholder) {
              logger.fatal('The "el" option is required for root component.')
            }
          }

          vnode = snabbdom.create(
            domApi,
            placeholder as Node,
            instance
          )

        }

        instance.update(
          instance.render() as VNode,
          vnode
        )

        return

      }
      else if (process.env.NODE_ENV === 'development') {
        if (placeholder || vnode) {
          logger.fatal('The "template" option is required.')
        }
      }

    }

    if (watchers) {
      observer.watch(watchers)
    }

    if (process.env.NODE_ENV !== 'pure') {
      const afterCreateHook = $options[HOOK_AFTER_CREATE]
      if (afterCreateHook) {
        afterCreateHook.call(instance)
      }
      lifeCycle.fire(
        instance,
        HOOK_AFTER_CREATE
      )
    }

  }

  /**
   * 取值
   */
  get(
    keypath: string,
    defaultValue?: any
  ): any {
    return this.$observer.get(keypath, defaultValue)
  }

  /**
   * 设值
   */
  set(
    keypath: string | Data,
    value?: any
  ): void {
    // 组件经常有各种异步改值，为了避免组件销毁后依然调用 set
    // 这里判断一下，至于其他方法的异步调用就算了，业务自己控制吧
    const { $observer } = this
    if ($observer) {
      $observer.set(keypath, value)
    }
  }

  /**
   * 监听事件，支持链式调用
   */
  on(
    type: string | Record<string, ThisListener<this> | ThisListenerOptions> | ThisTypeListenerOptions[],
    listener?: ThisListener<this> | ThisListenerOptions
  ): this {
    addEventSmartly(this, type, listener)
    return this
  }

  /**
   * 监听一次事件，支持链式调用
   */
  once(
    type: string | Record<string, ThisListener<this> | ThisListenerOptions> | ThisTypeListenerOptions[],
    listener?: ThisListener<this> | ThisListenerOptions
  ): this {
    addEventSmartly(this, type, listener, constant.TRUE)
    return this
  }

  /**
   * 取消监听事件，支持链式调用
   */
  off(
    type?: string,
    listener?: ThisListener<this> | ThisListenerOptions
  ): this {
    this.$emitter.off(type, listener)
    return this
  }

  /**
   * 发射事件
   */
  fire(
    type: string | EmitterEvent | CustomEvent,
    data?: Data | boolean,
    downward?: boolean
  ): boolean {

    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件

    const instance = this,

    { $emitter, $parent, $children } = instance

    // 生成事件对象
    let event: CustomEvent

    if (CustomEvent.is(type)) {
      event = type as CustomEvent
    }
    else if (is.string(type)) {
      event = new CustomEvent(type as string)
    }
    else {
      const emitterEvent = type as EmitterEvent
      event = new CustomEvent(emitterEvent.type)
      event.ns = emitterEvent.ns
    }

    // 先解析出命名空间，避免每次 fire 都要解析
    if (event.ns === constant.UNDEFINED) {
      const emitterEvent = $emitter.toEvent(event.type)
      event.type = emitterEvent.type
      event.ns = emitterEvent.ns
    }

    // 如果手动 fire 带上了事件命名空间
    // 则命名空间不能是 native，因为 native 有特殊用处
    if (process.env.NODE_ENV === 'development') {
      if (event.ns === MODIFER_NATIVE) {
        logger.error(`The namespace "${MODIFER_NATIVE}" is not permitted.`)
      }
    }

    // 告诉外部是谁发出的事件
    if (!event.target) {
      event.target = instance
    }

    // 事件参数列表
    let args: any[] = [event],

    // 事件是否正常结束（未被停止冒泡）
    isComplete: boolean

    // 比如 fire('name', true) 直接向下发事件
    if (is.object(data)) {
      array.push(args, data as Data)
    }
    else if (data === constant.TRUE) {
      downward = constant.TRUE
    }

    // 向上发事件会经过自己
    // 如果向下发事件再经过自己，就产生了一次重叠
    // 这是没有必要的，而且会导致向下发事件时，外部能接收到该事件，但我们的本意只是想让子组件接收到事件
    isComplete = downward && event.target === instance
      ? constant.TRUE
      : $emitter.fire(event, args)

    if (isComplete) {
      if (downward) {
        if ($children) {
          event.phase = CustomEvent.PHASE_DOWNWARD
          array.each(
            $children,
            function (child) {
              return isComplete = child.fire(event, data, constant.TRUE)
            }
          )
        }
      }
      else if ($parent) {
        event.phase = CustomEvent.PHASE_UPWARD
        isComplete = $parent.fire(event, data)
      }
    }

    return isComplete

  }

  /**
   * 监听数据变化，支持链式调用
   */
  watch(
    keypath: string | Record<string, ThisWatcher<this> | ThisWatcherOptions<this>>,
    watcher?: ThisWatcher<this> | ThisWatcherOptions<this>,
    immediate?: boolean
  ): this {
    this.$observer.watch(keypath, watcher, immediate)
    return this
  }

  /**
   * 取消监听数据变化，支持链式调用
   */
  unwatch(
    keypath?: string,
    watcher?: ThisWatcher<this>
  ): this {
    this.$observer.unwatch(keypath, watcher)
    return this
  }

  /**
   * 加载组件，组件可以是同步或异步，最后会调用 callback
   *
   * @param name 组件名称
   * @param callback 组件加载成功后的回调
   */
  loadComponent(name: string, callback: ComponentCallback): void {
    if (process.env.NODE_ENV !== 'pure') {
      if (!loadComponent(this.$components, name, callback)) {
        if (process.env.NODE_ENV === 'development') {
          if (!loadComponent(globalComponents, name, callback)) {
            logger.error(`The component "${name}" is not found.`)
          }
        }
        else {
          loadComponent(globalComponents, name, callback)
        }
      }
    }
  }

  /**
   * 创建子组件
   *
   * @param options 组件配置
   * @param vnode 虚拟节点
   */
  createComponent(options: ComponentOptions, vnode: VNode): YoxInterface {
    if (process.env.NODE_ENV !== 'pure') {

      const instance = this

      options = object.copy(options)
      options.root = instance.$root || instance
      options.parent = instance
      options.context = vnode.context
      options.vnode = vnode
      options.replace = constant.TRUE

      let { props, slots, model } = vnode

      if (model) {
        if (!props) {
          props = {}
        }
        const key = options.model || MODEL_PROP_DEFAULT
        props[key] = model.value
        options.model = key
      }

      if (props) {
        options.props = props
      }

      if (slots) {
        options.slots = slots
      }

      const child = new Yox(options)

      array.push(
        instance.$children || (instance.$children = []),
        child
      )

      const node = child.$el
      if (node) {
        vnode.node = node
      }
      else if (process.env.NODE_ENV === 'development') {
        logger.fatal(`The root element of component "${vnode.tag}" is not found.`)
      }

      return child
    }
    else {
      return this
    }
  }

  /**
   * 注册当前组件级别的指令
   */
  directive(
    name: string | Record<string, DirectiveHooks>,
    directive?: DirectiveHooks
  ): DirectiveHooks | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $directives } = instance
      if (is.string(name) && !directive) {
        return getResource($directives, name as string, Yox.directive)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          $directives || (instance.$directives = {}),
          name,
          directive,
          {
            conflict(name) {
              logger.warn(`The instance directive "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          $directives || (instance.$directives = {}),
          name,
          directive
        )
      }
    }
  }

  /**
   * 注册当前组件级别的过渡动画
   */
  transition(
    name: string | Record<string, TransitionHooks>,
    transition?: TransitionHooks
  ): TransitionHooks | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $transitions } = instance
      if (is.string(name) && !transition) {
        return getResource($transitions, name as string, Yox.transition)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          $transitions || (instance.$transitions = {}),
          name,
          transition,
          {
            conflict(name) {
              logger.warn(`The instance transition "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          $transitions || (instance.$transitions = {}),
          name,
          transition
        )
      }
    }
  }

  /**
   * 注册当前组件级别的组件
   */
  component(
    name: string | Record<string, Component>,
    component?: Component
  ): Component | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $components } = instance
      if (is.string(name) && !component) {
        return getResource($components, name as string, Yox.component)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          $components || (instance.$components = {}),
          name,
          component,
          {
            conflict(name) {
              logger.warn(`The instance component "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          $components || (instance.$components = {}),
          name,
          component
        )
      }
    }
  }

  /**
   * 注册当前组件级别的子模板
   */
  partial(
    name: string | Record<string, Partial>,
    partial?: Partial
  ): Function | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $partials } = instance
      if (is.string(name) && !partial) {
        return getResource($partials, name as string, Yox.partial)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          $partials || (instance.$partials = {}),
          name,
          partial,
          {
            format: Yox.compile,
            conflict(name) {
              logger.warn(`The instance partial "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          $partials || (instance.$partials = {}),
          name,
          partial,
          {
            format: Yox.compile
          }
        )
      }
    }
  }

  /**
   * 注册当前组件级别的过滤器
   */
  filter(
    name: string | Record<string, Filter>,
    filter?: Filter
  ): Filter | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $filters } = instance
      if (is.string(name) && !filter) {
        return getResource($filters, name as string, Yox.filter)
      }
      if (process.env.NODE_ENV === 'development') {
        setResourceSmartly(
          $filters || (instance.$filters = {}),
          name,
          filter,
          {
            conflict(name) {
              logger.warn(`The instance filter "${name}" already exists.`)
            }
          }
        )
      }
      else {
        setResourceSmartly(
          $filters || (instance.$filters = {}),
          name,
          filter
        )
      }
    }
  }

  /**
   * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
   * 而你非常确定需要更新模板，强制刷新正是你需要的
   */
  forceUpdate(props?: Data): void {
    if (process.env.NODE_ENV !== 'pure') {

      const instance = this,

      { $options, $vnode, $nextTask } = instance

      if ($vnode) {

        if (props) {
          const beforePropsUpdateHook = $options[HOOK_BEFORE_PROPS_UPDATE]
          if (beforePropsUpdateHook) {
            beforePropsUpdateHook.call(instance, props)
          }
          instance.set(props)
        }

        // 当前可能正在进行下一轮更新
        $nextTask.run()

        // 没有更新模板，强制刷新
        if (!props && $vnode === instance.$vnode) {
          instance.update(
            instance.render() as VNode,
            $vnode
          )
        }
      }
    }
  }

  /**
   * 把模板抽象语法树渲染成 virtual dom
   */
  render() {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this,

      { $observer, $dependencies } = instance,

      dependencies: Record<string, any> = { }

      if ($dependencies) {
        for (let key in $dependencies) {
          $observer.unwatch(key, markDirty)
        }
      }

      instance.$dependencies = dependencies

      return templateRender.render(
        instance,
        instance.$template as Function,
        $observer.data,
        $observer.computed,
        instance.$slots,
        instance.$filters,
        globalFilters,
        instance.$partials,
        globalPartials,
        instance.$directives,
        globalDirectives,
        instance.$transitions,
        globalTransitions,
        function (keypath) {
          if (!dependencies[keypath]
            && instance.$dependencies === dependencies
          ) {
            $observer.watch(keypath, markDirty)
            dependencies[keypath] = constant.TRUE
          }
        }
      )
    }
  }

  /**
   * 更新 virtual dom
   *
   * @param vnode
   * @param oldVNode
   */
  update(vnode: VNode, oldVNode: VNode) {
    if (process.env.NODE_ENV !== 'pure') {
      let instance = this,

      { $vnode, $options } = instance,

      afterHookName: string

      if ($vnode) {
        const beforeUpdateHook = $options[HOOK_BEFORE_UPDATE]
        if (beforeUpdateHook) {
          beforeUpdateHook.call(instance)
        }
        lifeCycle.fire(
          instance,
          HOOK_BEFORE_UPDATE
        )
        snabbdom.patch(domApi, vnode, oldVNode)
        afterHookName = HOOK_AFTER_UPDATE
      }
      else {
        const beforeMountHook = $options[HOOK_BEFORE_MOUNT]
        if (beforeMountHook) {
          beforeMountHook.call(instance)
        }
        lifeCycle.fire(
          instance,
          HOOK_BEFORE_MOUNT
        )
        snabbdom.patch(domApi, vnode, oldVNode)
        instance.$el = vnode.node as HTMLElement
        afterHookName = HOOK_AFTER_MOUNT
      }

      instance.$vnode = vnode

      // 跟 nextTask 保持一个节奏
      // 这样可以预留一些优化的余地
      Yox.nextTick(
        function () {
          if (instance.$vnode) {
            const afterHook = $options[afterHookName]
            if (afterHook) {
              afterHook.call(instance)
            }
            lifeCycle.fire(
              instance,
              afterHookName
            )
          }
        }
      )
    }
  }

  /**
   * 校验组件参数
   *
   * @param props
   */
  checkProp(key: string, value: any): void {
    if (process.env.NODE_ENV === 'development') {
      const { name, propTypes } = this.$options
      if (propTypes) {
        const rule = propTypes[key]
        if (rule) {
          checkProp(name, key, value, rule)
        }
      }
    }
  }

  /**
   * 渲染 slots
   *
   * @param props
   * @param slots
   */
  renderSlots(props: Data, slots: Slots): void {
    if (process.env.NODE_ENV !== 'pure') {
      this.$slots = slots
      for (let name in slots) {
        props[name] = slots[name](this)
      }
    }
  }

  /**
   * 销毁组件
   */
  destroy(): void {

    const instance = this,

    { $parent, $options, $emitter, $observer } = instance

    if (process.env.NODE_ENV !== 'pure') {

      const beforeDestroyHook = $options[HOOK_BEFORE_DESTROY]
      if (beforeDestroyHook) {
        beforeDestroyHook.call(instance)
      }

      lifeCycle.fire(
        instance,
        HOOK_BEFORE_DESTROY
      )

      const { $vnode } = instance

      if ($parent && $parent.$children) {
        array.remove($parent.$children, instance)
      }

      if ($vnode) {
        snabbdom.destroy(domApi, $vnode, !$parent)
      }

    }

    $observer.destroy()

    if (process.env.NODE_ENV !== 'pure') {

      const afterDestroyHook = $options[HOOK_AFTER_DESTROY]
      if (afterDestroyHook) {
        afterDestroyHook.call(instance)
      }

      lifeCycle.fire(
        instance,
        HOOK_AFTER_DESTROY
      )

    }

    // 发完 after destroy 事件再解绑所有事件
    $emitter.off()

    instance.$el = constant.UNDEFINED

  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   */
  nextTick(task: ThisTask<this>): void {
    this.$nextTask.append(task, this)
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
  increase(keypath: string, step?: number, max?: number): number | void {
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
  decrease(keypath: string, step?: number, min?: number): number | void {
    return this.$observer.decrease(keypath, step, min)
  }

  /**
   * 在数组指定位置插入元素
   *
   * @param keypath
   * @param item
   * @param index
   */
  insert(keypath: string, item: any, index: number | boolean): true | void {
    return this.$observer.insert(keypath, item, index)
  }

  /**
   * 在数组尾部添加元素
   *
   * @param keypath
   * @param item
   */
  append(keypath: string, item: any): true | void {
    return this.$observer.append(keypath, item)
  }

  /**
   * 在数组首部添加元素
   *
   * @param keypath
   * @param item
   */
  prepend(keypath: string, item: any): true | void {
    return this.$observer.prepend(keypath, item)
  }

  /**
   * 通过索引移除数组中的元素
   *
   * @param keypath
   * @param index
   */
  removeAt(keypath: string, index: number): true | void {
    return this.$observer.removeAt(keypath, index)
  }

  /**
   * 直接移除数组中的元素
   *
   * @param keypath
   * @param item
   */
  remove(keypath: string, item: any): true | void {
    return this.$observer.remove(keypath, item)
  }

  /**
   * 拷贝任意数据，支持深拷贝
   *
   * @param data
   * @param deep
   */
  copy<T>(data: T, deep?: boolean): T {
    return this.$observer.copy(data, deep)
  }

}

const toString = Object.prototype.toString

function matchType(value: any, type: string) {
  return type === 'numeric'
    ? is.numeric(value)
    : string.lower(toString.call(value)) === `[object ${type}]`
}

function checkProp(componentName: string | undefined, key: string, value: any, rule: PropRule) {

  // 传了数据
  if (value !== constant.UNDEFINED) {

    const type = rule.type

    // 如果不写 type 或 type 不是 字符串 或 数组
    // 就当做此规则无效，和没写一样
    if (type) {

      // 自定义函数判断是否匹配类型
      // 自己打印警告信息吧
      if (is.func(type)) {
        (type as PropTypeFunction)(key, value, componentName)
      }
      else {

        let matched = constant.FALSE

        // type: 'string'
        if (!string.falsy(type)) {
          matched = matchType(value, type as string)
        }
        // type: ['string', 'number']
        else if (!array.falsy(type)) {
          array.each(
            type as string[],
            function (item) {
              if (matchType(value, item)) {
                matched = constant.TRUE
                return constant.FALSE
              }
            }
          )
        }

        if (!matched) {
          logger.warn(`The type of prop "${key}" expected to be "${type}", but is "${value}".`, componentName)
        }

      }

    }
    else {
      logger.warn(`The prop "${key}" in propTypes has no type.`, componentName)
    }

  }
  // 没传值但此项是必传项
  else if (rule.required) {
    logger.warn(`The prop "${key}" is marked as required, but its value is undefined.`, componentName)
  }

}

function loadComponent(
  registry: Record<string, Component | ComponentCallback[]> | void,
  name: string,
  callback: ComponentCallback
): true | void {

  if (registry && registry[name]) {

    const component = registry[name]

    // 注册的是异步加载函数
    if (is.func(component)) {

      registry[name] = [callback]

      const componentCallback = function (result: ComponentOptions) {

        const queue = registry[name], options = result['default'] || result

        registry[name] = options

        array.each(
          queue as ComponentCallback[],
          function (callback) {
            callback(options)
          }
        )

      },

      promise = (component as ComponentLoader)(componentCallback)
      if (promise) {
        promise.then(componentCallback)
      }

    }
    // 正在加载中
    else if (is.array(component)) {
      array.push(
        component as ComponentCallback[],
        callback
      )
    }
    // 不是异步加载函数，直接同步返回
    else {
      callback(component as ComponentOptions)
    }
    return constant.TRUE
  }

}

function getResource(registry: Data | void, name: string, lookup?: Function) {
  if (registry && registry[name]) {
    return registry[name]
  }
  else if (lookup) {
    return lookup(name)
  }
}

type ResourceOptions = {
  format?: (value: any) => any
  conflict?: (name: string) => void | void,
}

function setResourceItem(registry: Data, name: string, value: any, options?: ResourceOptions) {

  if (process.env.NODE_ENV === 'development') {
    if (name in registry && options && options.conflict) {
      options.conflict(name)
    }
  }

  if (options && options.format) {
    value = options.format(value)
  }

  registry[name] = value

}

function setResourceSmartly(registry: Data, name: string | Data, value?: any, options?: ResourceOptions) {
  if (is.string(name)) {
    setResourceItem(registry, name as string, value, options)
  }
  else {
    object.each(
      name as Data,
      function (value, key) {
        setResourceItem(registry, key, value, options)
      }
    )
  }
}

function setOptionsSmartly(instance: YoxInterface, key: string, value: Function | Data | void) {
  if (is.func(value)) {
    instance[key](
      (value as Function).call(instance)
    )
  }
  else if (is.object(value)) {
    instance[key](value)
  }
}

function addEvent(instance: Yox, options: TypeListenerOptions, once?: true) {
  instance.$emitter.on(
    options.type as string,
    {
      listener: options.listener as Function,
      ns: options.ns,
      max: once ? 1 : -1,
      ctx: instance,
    }
  )
}

function addEventSmartly(
  instance: Yox,
  type: string | Record<string, Listener | ListenerOptions> | TypeListenerOptions[],
  listener?: Listener | ListenerOptions,
  once?: true
) {

  const { $emitter } = instance

  if (is.string(type)) {
    addEvent(
      instance,
      $emitter.toFilter(type as string, listener) as TypeListenerOptions,
      once
    )
  }
  else if (is.array(type)) {
    array.each(
      type as TypeListenerOptions[],
      function (filter) {
        addEvent(instance, filter, once)
      }
    )
  }
  else {
    object.each(
      type as Record<string, Listener | ListenerOptions>,
      function (value: Listener | ListenerOptions, key: string) {
        addEvent(
          instance,
          $emitter.toFilter(key, value) as TypeListenerOptions,
          once
        )
      }
    )
  }
}

if (process.env.NODE_ENV !== 'pure') {
  // 全局注册内置过滤器
  Yox.filter({
    hasSlot(name: string): boolean {
      // 不鼓励在过滤器使用 this
      // 因此过滤器没有 this 的类型声明
      // 这个内置过滤器是不得不用 this
      return (this as YoxInterface).get(SLOT_DATA_PREFIX + name) !== constant.UNDEFINED
    }
  })
}