import {
  data,
  filter,
  ComputedGetter,
  component,
  componentCallback,
  componentLoader,
  propTypeFunction,
  propValueFunction,
  PropRule,
  VNode,
  IsUtil,
  DomUtil,
  ArrayUtil,
  StringUtil,
  ObjectUtil,
  LoggerUtil,
} from '../../yox-type/src/type'

import {
  Listener,
  Watcher,
  WatcherOptions,
  ComputedOptions,
  EmitterOptions,
  YoxOptions,
  YoxInterface,
  YoxPlugin,
  DirectiveHooks,
  TransitionHooks,
  EmitterClass,
  CustomEventClass,
} from '../../yox-type/src/global'

import isDef from '../../yox-common/src/function/isDef'
import isUndef from '../../yox-common/src/function/isUndef'
import execute from '../../yox-common/src/function/execute'

import CustomEvent from '../../yox-common/src/util/CustomEvent'
import Emitter from '../../yox-common/src/util/Emitter'
import NextTask from '../../yox-common/src/util/NextTask'

import * as is from '../../yox-common/src/util/is'
import * as env from '../../yox-common/src/util/env'
import * as array from '../../yox-common/src/util/array'
import * as string from '../../yox-common/src/util/string'
import * as object from '../../yox-common/src/util/object'
import * as logger from '../../yox-common/src/util/logger'

import * as config from '../../yox-config/src/config'
import * as snabbdom from '../../yox-snabbdom/src/snabbdom'

import * as templateCompiler from '../../yox-template-compiler/src/compiler'
import * as templateGenerator from '../../yox-template-compiler/src/generator'
import * as templateRender from '../../yox-template-compiler/src/renderer'

import * as domApi from '../../yox-dom/src/dom'

import Computed from '../../yox-observer/src/Computed'
import Observer from '../../yox-observer/src/Observer'

import * as event from './directive/event'
import * as model from './directive/model'
import * as binding from './directive/binding'
import hasSlot from './filter/hasSlot'


const globalDirectives = {},

globalTransitions = {},

globalComponents = {},

globalPartials = {},

globalFilters = {},

compileCache = {},

TEMPLATE_COMPUTED = '$$',

selectorPattern = /^[#.][-\w+]+$/

export default class Yox implements YoxInterface {

  $options: YoxOptions

  $observer: Observer<YoxInterface>

  $emitter: Emitter<YoxInterface>

  $el?: HTMLElement

  $template?: Function

  $refs?: Record<string, YoxInterface | HTMLElement>

  $model?: string

  $root?: YoxInterface

  $parent?: YoxInterface

  $context?: YoxInterface

  $children?: YoxInterface[]

  $vnode: VNode | undefined

  $directives?: Record<string, DirectiveHooks>

  $components?: Record<string, YoxOptions>

  $transitions?: Record<string, TransitionHooks>

  $partials?: Record<string, Function>

  $filters?: Record<string, filter>

  /**
   * core 版本
   */
  public static version = process.env.NODE_VERSION

  /**
   * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
   */
  public static is: IsUtil = is
  public static dom: DomUtil = domApi
  public static array: ArrayUtil = array
  public static object: ObjectUtil = object
  public static string: StringUtil = string
  public static logger: LoggerUtil = logger
  public static Event: CustomEventClass = CustomEvent
  public static Emitter: EmitterClass = Emitter

  /**
   * 安装插件
   *
   * 插件必须暴露 install 方法
   */
  public static use(plugin: YoxPlugin): void {
    plugin.install(Yox)
  }

  /**
   * 创建组件对象
   */
  public static create(options: YoxOptions): YoxOptions {
    return options
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
  public static compile(template: string, stringify?: boolean): Function | string {
    if (process.env.NODE_ENV !== 'pure' && process.env.NODE_ENV !== 'runtime') {
      // 需要编译的都是模板源文件，一旦经过预编译，就成了 render 函数，不会再走进 Yox.compile
      if (!compileCache[template]) {
        const nodes = templateCompiler.compile(template)
        if (process.env.NODE_ENV === 'development') {
          if (nodes.length !== 1) {
            logger.fatal(`"template" should have just one root element.`)
          }
        }
        compileCache[template] = templateGenerator.generate(nodes[0])
      }
      template = compileCache[template]
      return stringify
        ? template
        : new Function(`return ${template}`)()
    }
    else {
      return env.EMPTY_STRING
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
      setResource(globalDirectives, name, directive)
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
      setResource(globalTransitions, name, transition)
    }
  }

  /**
   * 注册全局组件
   */
  public static component(
    name: string | Record<string, component>,
    component?: component
  ): component | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !component) {
        return getResource(globalComponents, name as string)
      }
      setResource(globalComponents, name, component)
    }
  }

  /**
   * 注册全局子模板
   */
  public static partial(
    name: string | Record<string, string>,
    partial?: string
  ): Function | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !partial) {
        return getResource(globalPartials, name as string)
      }
      setResource(globalPartials, name, partial, Yox.compile)
    }
  }

  /**
   * 注册全局过滤器
   */
  public static filter(
    name: string | Record<string, filter>,
    filter?: filter
  ): filter | void {
    if (process.env.NODE_ENV !== 'pure') {
      if (is.string(name) && !filter) {
        return getResource(globalFilters, name as string)
      }
      setResource(globalFilters, name, filter)
    }
  }

  constructor(options: YoxOptions | void) {

    const instance = this, $options: YoxOptions = options || env.EMPTY_OBJECT

    // 为了冒泡 HOOK_BEFORE_CREATE 事件，必须第一时间创建 emitter
    // 监听各种事件
    // 支持命名空间
    instance.$emitter = new Emitter(env.TRUE)

    if ($options.events) {
      instance.on($options.events)
    }

    if (process.env.NODE_ENV !== 'pure') {

      // 当前组件的直接父组件
      if ($options.parent) {
        instance.$parent = $options.parent
      }

      // 建立好父子连接后，立即触发钩子
      execute($options[config.HOOK_BEFORE_CREATE], instance, $options)
      // 冒泡 before create 事件
      instance.fire(config.HOOK_BEFORE_CREATE + config.NAMESPACE_HOOK, $options)

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
              checkProp(key, value, rule)
            }
            if (isUndef(value)) {
              value = rule.value
              if (isDef(value)) {
                source[key] = rule.type === env.RAW_FUNCTION
                  ? value
                  : is.func(value)
                    ? (value as propValueFunction)()
                    : value
              }
            }
          }
        )
      }
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    const observer = instance.$observer = new Observer(source, instance)

    if (computed) {
      object.each(
        computed,
        function (options: ComputedGetter<YoxInterface> | ComputedOptions<YoxInterface>, keypath: string) {
          observer.addComputed(keypath, options)
        }
      )
    }

    // 后放 data
    if (process.env.NODE_ENV === 'development') {
      if (vnode && is.object(data)) {
        logger.warn(`child component's data should be a function which return an object.`)
      }
    }

    const extend = is.func(data) ? execute(data, instance, options) : data
    if (is.object(extend)) {
      object.each(
        extend,
        function (value, key) {
          if (process.env.NODE_ENV === 'development') {
            if (object.has(source, key)) {
              logger.warn(`"${key}" is already defined as a prop. Use prop default value instead.`)
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
              logger.fatal(`method "${name}" is conflicted with built-in methods.`)
            }
          }
          instance[name] = method
        }
      )
    }

    if (process.env.NODE_ENV !== 'pure') {

      let placeholder: Node | void = env.UNDEFINED,

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
        slots,
      } = $options

      if (model) {
        instance.$model = model
      }

      // 把 slots 放进数据里，方便 get
      if (slots) {
        object.extend(source, slots)
      }

      // 检查 template
      if (is.string(template)) {
        // 传了选择器，则取对应元素的 html
        if (selectorPattern.test(template as string)) {
          placeholder = domApi.find(template as string)
          if (placeholder) {
            template = domApi.html(placeholder as Element) as string
            placeholder = env.UNDEFINED
          }
          else if (process.env.NODE_ENV === 'development') {
            logger.fatal(`selector "${template}" can't match an element.`)
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
                logger.fatal(`selector "${selector}" can't match an element.`)
              }
            }
          }
          else if (process.env.NODE_ENV === 'development') {
            logger.fatal(`"el" option should be a selector.`)
          }
        }
        else {
          placeholder = el as Node
        }

        if (!replace) {
          domApi.append(
            placeholder as Node,
            placeholder = domApi.createComment(env.EMPTY_STRING)
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

      setFlexibleOptions(instance, env.RAW_TRANSITION, transitions)
      setFlexibleOptions(instance, env.RAW_COMPONENT, components)
      setFlexibleOptions(instance, env.RAW_DIRECTIVE, directives)
      setFlexibleOptions(instance, env.RAW_PARTIAL, partials)
      setFlexibleOptions(instance, env.RAW_FILTER, filters)

      // 当存在模板和计算属性时
      // 因为这里把模板当做一种特殊的计算属性
      // 因此模板这个计算属性的优先级应该最高
      if (template) {

        // 拷贝一份，避免影响外部定义的 watchers
        const newWatchers = watchers
          ? object.copy(watchers)
          : {}

        newWatchers[TEMPLATE_COMPUTED] = {
          // 模板一旦变化，立即刷新
          sync: env.TRUE,
          watcher: function (vnode: VNode) {
            instance.update(vnode, instance.$vnode as VNode)
          }
        }

        // 当模板的依赖变了，则重新创建 virtual dom
        observer.addComputed(
          TEMPLATE_COMPUTED,
          {
            // 当模板依赖变化时，异步通知模板更新
            sync: env.FALSE,
            get: function () {
              return instance.render()
            }
          }
        )

        afterCreateHook(instance, newWatchers)

        // 编译模板
        // 在开发阶段，template 是原始的 html 模板
        // 在产品阶段，template 是编译后且经过 stringify 的字符串
        // 当然，这个需要外部自己控制传入的 template 是什么
        // Yox.compile 会自动判断 template 是否经过编译
        instance.$template = is.string(template)
          ? Yox.compile(template as string) as Function
          : template as Function

        if (!vnode) {

          if (process.env.NODE_ENV === 'development') {
            if (!placeholder) {
              logger.fatal('"el" option is required for root component.')
            }
          }

          vnode = snabbdom.create(
            domApi,
            placeholder as Node,
            instance,
            env.EMPTY_STRING
          )

        }

        instance.update(
          instance.get(TEMPLATE_COMPUTED),
          vnode
        )

        return

      }
      else if (process.env.NODE_ENV === 'development') {
        if (placeholder || vnode) {
          logger.fatal('"template" option is required.')
        }
      }

    }

    afterCreateHook(instance, watchers)

  }

  /**
   * 添加计算属性
   */
  addComputed(
    keypath: string,
    computed: ComputedGetter<YoxInterface> | ComputedOptions<YoxInterface>
  ): Computed<YoxInterface> | void {
    return this.$observer.addComputed(keypath, computed)
  }

  /**
   * 删除计算属性
   */
  removeComputed(
    keypath: string
  ): void {
    this.$observer.removeComputed(keypath)
  }

  /**
   * 取值
   */
  get(
    keypath: string,
    defaultValue?: any,
    depIgnore?: boolean
  ): any {
    return this.$observer.get(keypath, defaultValue, depIgnore)
  }

  /**
   * 设值
   */
  set(
    keypath: string | data,
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
    type: string | Record<string, Listener<YoxInterface>>,
    listener?: Listener<YoxInterface>
  ): YoxInterface {
    return addEvents(this, type, listener)
  }

  /**
   * 监听一次事件，支持链式调用
   */
  once(
    type: string | Record<string, Listener<YoxInterface>>,
    listener?: Listener<YoxInterface>
  ): YoxInterface {
    return addEvents(this, type, listener, env.TRUE)
  }

  /**
   * 取消监听事件，支持链式调用
   */
  off(
    type?: string,
    listener?: Listener<YoxInterface>
  ): YoxInterface {
    this.$emitter.off(type, listener)
    return this
  }

  /**
   * 发射事件
   */
  fire(
    type: string | CustomEvent,
    data?: data | boolean,
    downward?: boolean
  ): boolean {

    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件

    let instance = this,

    event = type instanceof CustomEvent ? type : new CustomEvent(type),

    args: any[] = [event],

    isComplete: boolean

    // 告诉外部是谁发出的事件
    if (!event.target) {
      event.target = instance
    }

    // 比如 fire('name', true) 直接向下发事件
    if (is.object(data)) {
      array.push(args, data as data)
    }
    else if (data === env.TRUE) {
      downward = env.TRUE
    }

    isComplete = instance.$emitter.fire(event.type, args)
    if (isComplete) {
      const { $parent, $children } = instance
      if (downward) {
        if ($children) {
          event.phase = CustomEvent.PHASE_DOWNWARD
          array.each(
            $children,
            function (child) {
              return isComplete = child.fire(event, data, env.TRUE)
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
    keypath: string | Record<string, Watcher<YoxInterface> | WatcherOptions<YoxInterface>>,
    watcher?: Watcher<YoxInterface> | WatcherOptions<YoxInterface>,
    immediate?: boolean
  ): YoxInterface {
    this.$observer.watch(keypath, watcher, immediate)
    return this
  }

  /**
   * 取消监听数据变化，支持链式调用
   */
  unwatch(
    keypath?: string,
    watcher?: Watcher<YoxInterface>
  ): YoxInterface {
    this.$observer.unwatch(keypath, watcher)
    return this
  }

  /**
   * 加载组件，组件可以是同步或异步，最后会调用 callback
   *
   * @param name 组件名称
   * @param callback 组件加载成功后的回调
   */
  loadComponent(name: string, callback: componentCallback): void {
    if (process.env.NODE_ENV !== 'pure') {
      if (!loadComponent(this.$components, name, callback)) {
        if (process.env.NODE_ENV === 'development') {
          if (!loadComponent(globalComponents, name, callback)) {
            logger.error(`Component "${name}" is not found.`)
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
  createComponent(options: YoxOptions, vnode: VNode): YoxInterface {
    if (process.env.NODE_ENV !== 'pure') {

      const instance = this

      options = object.copy(options)
      options.root = instance.$root || instance
      options.parent = instance
      options.context = vnode.context
      options.vnode = vnode
      options.replace = env.TRUE

      let { props, slots, directives } = vnode,

      model = directives && directives[config.DIRECTIVE_MODEL]

      if (model) {
        if (!props) {
          props = {}
        }
        const key = options.model || config.MODEL_PROP_DEFAULT
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
        logger.fatal(`The root element of [Component ${vnode.tag}] is not found.`)
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
      setResource(
        $directives || (instance.$directives = {}),
        name,
        directive
      )
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
      setResource(
        $transitions || (instance.$transitions = {}),
        name,
        transition
      )
    }
  }

  /**
   * 注册当前组件级别的组件
   */
  component(
    name: string | Record<string, component>,
    component?: component
  ): component | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $components } = instance
      if (is.string(name) && !component) {
        return getResource($components, name as string, Yox.component)
      }
      setResource(
        $components || (instance.$components = {}),
        name,
        component
      )
    }
  }

  /**
   * 注册当前组件级别的子模板
   */
  partial(
    name: string | Record<string, string>,
    partial?: string
  ): Function | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $partials } = instance
      if (is.string(name) && !partial) {
        return getResource($partials, name as string, Yox.partial)
      }
      setResource(
        $partials || (instance.$partials = {}),
        name,
        partial,
        Yox.compile
      )
    }
  }

  /**
   * 注册当前组件级别的过滤器
   */
  filter(
    name: string | Record<string, filter>,
    filter?: filter
  ): filter | void {
    if (process.env.NODE_ENV !== 'pure') {
      const instance = this, { $filters } = instance
      if (is.string(name) && !filter) {
        return getResource($filters, name as string, Yox.filter)
      }
      setResource(
        $filters || (instance.$filters = {}),
        name,
        filter
      )
    }
  }

  /**
   * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
   * 而你非常确定需要更新模板，强制刷新正是你需要的
   */
  forceUpdate(data?: data): void {
    if (process.env.NODE_ENV !== 'pure') {

      const instance = this,

      { $vnode, $observer } = instance,

      { computed } = $observer

      if ($vnode && computed) {

        const template = computed[TEMPLATE_COMPUTED],

        oldValue = template.get()

        if (data) {
          instance.set(data)
        }

        // 当前可能正在进行下一轮更新
        $observer.nextTask.run()

        // 没有更新模板，强制刷新
        if (!data && oldValue === template.get()) {
          instance.update(
            template.get(env.TRUE),
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
      const instance = this
      return templateRender.render(
        instance,
        instance.$template as Function,
        object.merge(instance.$filters, globalFilters) as Record<string, Function>,
        object.merge(instance.$partials, globalPartials) as Record<string, Function>,
        object.merge(instance.$directives, globalDirectives) as Record<string, DirectiveHooks>,
        object.merge(instance.$transitions, globalTransitions) as Record<string, TransitionHooks>
      )
    }
  }

  /**
   * 更新 virtual dom
   *
   * @param vnode
   * @param oldVnode
   */
  update(vnode: VNode, oldVnode: VNode) {
    if (process.env.NODE_ENV !== 'pure') {
      let instance = this,

      { $vnode, $options } = instance,

      afterHook: string

      // 每次渲染重置 refs
      // 在渲染过程中收集最新的 ref
      // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
      instance.$refs = {}

      if ($vnode) {
        execute($options[config.HOOK_BEFORE_UPDATE], instance)
        instance.fire(config.HOOK_BEFORE_UPDATE + config.NAMESPACE_HOOK)
        snabbdom.patch(domApi, vnode, oldVnode)
        afterHook = config.HOOK_AFTER_UPDATE
      }
      else {
        execute($options[config.HOOK_BEFORE_MOUNT], instance)
        instance.fire(config.HOOK_BEFORE_MOUNT + config.NAMESPACE_HOOK)
        snabbdom.patch(domApi, vnode, oldVnode)
        instance.$el = vnode.node as HTMLElement
        afterHook = config.HOOK_AFTER_MOUNT
      }

      instance.$vnode = vnode

      // 跟 nextTask 保持一个节奏
      // 这样可以预留一些优化的余地
      Yox.nextTick(
        function () {
          if (instance.$vnode) {
            execute($options[afterHook], instance)
            instance.fire(afterHook + config.NAMESPACE_HOOK)
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
  checkProps(props: data): void {
    if (process.env.NODE_ENV === 'development') {
      const instance = this
      object.each(
        props,
        function (value, key) {
          instance.checkProp(key, value)
        }
      )
    }
  }

  checkProp(key: string, value: any): void {
    if (process.env.NODE_ENV === 'development') {
      const { propTypes } = this.$options
      if (propTypes) {
        const rule = propTypes[key]
        if (rule) {
          checkProp(key, value, rule)
        }
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

      execute($options[config.HOOK_BEFORE_DESTROY], instance)
      instance.fire(config.HOOK_BEFORE_DESTROY + config.NAMESPACE_HOOK)

      const { $vnode } = instance

      if ($parent && $parent.$children) {
        array.remove($parent.$children, instance)
      }

      if ($vnode) {
        // virtual dom 通过判断 parent.$vnode 知道宿主组件是否正在销毁
        instance.$vnode = env.UNDEFINED
        snabbdom.destroy(domApi, $vnode, !$parent)
      }

    }

    $observer.destroy()

    if (process.env.NODE_ENV !== 'pure') {
      execute($options[config.HOOK_AFTER_DESTROY], instance)
      instance.fire(config.HOOK_AFTER_DESTROY + config.NAMESPACE_HOOK)
    }

    // 发完 after destroy 事件再解绑所有事件
    $emitter.off()

    object.clear(instance)

  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   */
  nextTick(task: Function): void {
    this.$observer.nextTask.append(task, this)
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

function checkProp(key: string, value: any, rule: PropRule) {

  // 传了数据
  if (isDef(value)) {

    const type = rule.type

    // 如果不写 type 或 type 不是 字符串 或 数组
    // 就当做此规则无效，和没写一样
    if (type) {

      // 自定义函数判断是否匹配类型
      // 自己打印警告信息吧
      if (is.func(type)) {
        (type as propTypeFunction)(key, value)
      }
      else {

        let matched = env.FALSE

        // type: 'string'
        if (!string.falsy(type)) {
          matched = matchType(value, type as string)
        }
        // type: ['string', 'number']
        else if (!array.falsy(type)) {
          array.each(
            type as string[],
            function (item: string) {
              if (matchType(value, item)) {
                matched = env.TRUE
                return env.FALSE
              }
            }
          )
        }

        if (!matched) {
          logger.warn(`The type of prop "${key}" expected to be "${type}", but is "${value}".`)
        }

      }

    }
    else {
      logger.warn(`The prop "${key}" in propTypes has no type.`)
    }

  }
  // 没传值但此项是必传项
  else if (rule.required) {
    logger.warn(`The prop "${key}" is marked as required, but its value is not found.`)
  }

}

function afterCreateHook(instance: Yox, watchers: Record<string, Watcher<YoxInterface> | WatcherOptions<YoxInterface>> | void) {

  if (watchers) {
    instance.watch(watchers)
  }

  if (process.env.NODE_ENV !== 'pure') {
    execute(instance.$options[config.HOOK_AFTER_CREATE], instance)
    instance.fire(config.HOOK_AFTER_CREATE + config.NAMESPACE_HOOK)
  }

}

function setFlexibleOptions(instance: Yox, key: string, value: Function | data | void) {
  if (is.func(value)) {
    instance[key](execute(value, instance))
  }
  else if (is.object(value)) {
    instance[key](value)
  }
}

function addEvent(instance: Yox, type: string, listener: Listener<YoxInterface>, once?: true) {
  const options: EmitterOptions = {
    fn: listener,
    ctx: instance
  }
  if (once) {
    options.max = 1
  }
  instance.$emitter.on(type, options)
}

function addEvents(
  instance: Yox,
  type: string | Record<string, Listener<YoxInterface>>,
  listener?: Listener<YoxInterface>,
  once?: true
): Yox {
  if (is.string(type)) {
    addEvent(instance, type as string, listener as Listener<YoxInterface>, once)
  }
  else {
    object.each(
      type as data,
      function (value: Listener<YoxInterface>, key: string) {
        addEvent(instance, key, value, once)
      }
    )
  }
  return instance
}

function loadComponent(
  registry: Record<string, component | componentCallback[]> | void,
  name: string,
  callback: componentCallback
): true | void {

  if (registry && registry[name]) {

    const component = registry[name]

    // 注册的是异步加载函数
    if (is.func(component)) {

      registry[name] = [callback]

      const componentCallback = function (result: YoxOptions) {

        const queue = registry[name], options = result['default'] || result

        registry[name] = options

        array.each(
          queue as componentCallback[],
          function (callback) {
            callback(options)
          }
        )

      },

      promise = (component as componentLoader)(componentCallback)
      if (promise) {
        promise.then(componentCallback)
      }

    }
    // 正在加载中
    else if (is.array(component)) {
      array.push(
        component as componentCallback[],
        callback
      )
    }
    // 不是异步加载函数，直接同步返回
    else {
      callback(component as YoxOptions)
    }
    return env.TRUE
  }

}

function getResource(registry: data | void, name: string, lookup?: Function) {
  if (registry && registry[name]) {
    return registry[name]
  }
  else if (lookup) {
    return lookup(name)
  }
}

function setResource(registry: data, name: string | data, value?: any, formatValue?: (value: any) => any) {
  if (is.string(name)) {
    registry[name as string] = formatValue ? formatValue(value) : value
  }
  else {
    object.each(
      name as data,
      function (value, key) {
        registry[key] = formatValue ? formatValue(value) : value
      }
    )
  }
}

if (process.env.NODE_ENV !== 'pure') {
  // 全局注册内置指令
  Yox.directive({ event, model, binding })
  // 全局注册内置过滤器
  Yox.filter({ hasSlot })
}

