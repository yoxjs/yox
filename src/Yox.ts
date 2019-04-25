import isDef from 'yox-common/src/function/isDef'
import execute from 'yox-common/src/function/execute'

import Event from 'yox-common/src/util/Event'
import Emitter from 'yox-common/src/util/Emitter'
import NextTask from 'yox-common/src/util/NextTask'

import * as is from 'yox-common/src/util/is'
import * as env from 'yox-common/src/util/env'
import * as array from 'yox-common/src/util/array'
import * as string from 'yox-common/src/util/string'
import * as object from 'yox-common/src/util/object'
import * as logger from 'yox-common/src/util/logger'

import * as config from 'yox-config/index'
import * as snabbdom from 'yox-snabbdom/index'

import * as templateCompiler from 'yox-template-compiler/src/compiler'
import * as templateStringify from 'yox-template-compiler/src/stringify'
import * as templateRender from 'yox-template-compiler/src/renderer'
import VNode from 'yox-type/src/vnode/VNode'
import YoxInterface from 'yox-type/src/Yox'
import YoxOptions from 'yox-type/src/options/Yox'
import YoxPlugin from 'yox-type/src/YoxPlugin'
import ComputedOptions from 'yox-type/src/options/Computed'
import WatcherOptions from 'yox-type/src/options/Watcher'
import DirectiveHooks from 'yox-type/src/hooks/Directive'
import TransitionHooks from 'yox-type/src/hooks/Transition'
import PropRule from 'yox-type/src/PropRule'
import * as signature from 'yox-type/index'

import Computed from 'yox-observer/src/Computed'
import Observer from 'yox-observer/src/Observer'
import formatWatcherOptions from 'yox-observer/src/function/formatWatcherOptions'

import domApi from 'yox-dom/index'

const globalDirectives = {},

globalTransitions = {},

globalComponents = {},

globalPartials = {},

globalFilters = {},

TEMPLATE_COMPUTED = '$' + env.RAW_TEMPLATE,

selectorPattern = /^[#.][-\w+]+$/

export default class Yox implements YoxInterface {

  $options: YoxOptions

  $observer: Observer

  $emitter: Emitter

  $template?: Function

  $refs: Record<string, YoxInterface | HTMLElement>

  $parent?: YoxInterface

  $children?: YoxInterface[]

  $vnode: VNode | undefined

  $el?: HTMLElement

  $model?: string

  $directives?: Record<string, DirectiveHooks>

  $components?: Record<string, YoxOptions>

  $transitions?: Record<string, TransitionHooks>

  $partials?: Record<string, Function>

  $filters?: Record<string, Function | Record<string, Function>>

  /**
   * core 版本
   */
  public static version = '1.0.0-alpha'

  /**
   * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
   */
  public static is = is
  public static dom = domApi
  public static array = array
  public static object = object
  public static string = string
  public static logger = logger
  public static Event = Event
  public static Emitter = Emitter

  /**
   * 安装插件
   *
   * 插件必须暴露 install 方法
   */
  public static use(plugin: YoxPlugin) {
    plugin.install(Yox)
  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   */
  public static nextTick(task: Function) {
    NextTask.shared().append(task)
  }

  /**
   * 编译模板，暴露出来是为了打包阶段的模板预编译
   */
  public static compile(template: string): Function {
    // 已编译，常出现在线上阶段
    if (!templateStringify.hasStringify(template)) {
      // 未编译，常出现在开发阶段
      const nodes = templateCompiler.compile(template)
      if (nodes.length !== 1) {
        logger.fatal(`"template" expected to have just one root element.`)
      }
      template = templateStringify.stringify(nodes[0])
    }
    return new Function(`return ${template}`)()
  }

  public static directive(
    name: string | Record<string, DirectiveHooks>,
    directive?: DirectiveHooks
  ): DirectiveHooks | void {
    if (is.string(name) && !directive) {
      return getResource(globalDirectives, name as string)
    }
    setResource(globalDirectives, name, directive)
  }

  public static transition(
    name: string | Record<string, TransitionHooks>,
    transition?: TransitionHooks
  ): TransitionHooks | void {
    if (is.string(name) && !transition) {
      return getResource(globalTransitions, name as string)
    }
    setResource(globalTransitions, name, transition)
  }

  public static component(
    name: string | Record<string, YoxOptions>,
    component?: YoxOptions | signature.asyncComponent
  ): YoxOptions | void {
    if (is.string(name)) {
      // 同步取值
      if (!component) {
        return getResource(globalComponents, name as string)
      }
      else if (is.func(component)) {
        getComponentAsync(globalComponents, name as string, component as signature.asyncComponent)
        return
      }
    }
    setResource(globalComponents, name, component)
  }

  public static partial(
    name: string | Record<string, string>,
    partial?: string
  ): Function | void {
    if (is.string(name) && !partial) {
      return getResource(globalPartials, name as string)
    }
    setResource(globalPartials, name, partial, Yox.compile)
  }

  public static filter(
    name: string | Record<string, Function | Record<string, Function>>,
    filter?: Function | Record<string, Function | Record<string, Function>>
  ): Function | Record<string, Function> | void {
    if (is.string(name) && !filter) {
      return getResource(globalFilters, name as string)
    }
    setResource(globalFilters, name, filter)
  }

  /**
   * 验证 props，无爱请重写
   */
  public static checkPropTypes(props: Record<string, any>, propTypes: Record<string, PropRule>) {
    let result = object.copy(props)
    // object.each(
    //   propTypes,
    //   function (rule: PropRule, key: string) {

    //     // 类型
    //     let type = rule.type,

    //     // 默认值
    //     value = rule.value,

    //     // 是否必传
    //     required = rule.required,

    //     target = props[key]

    //     if (is.func(required)) {
    //       required = execute(required, env.UNDEFINED, props)
    //     }

    //     // 传了数据
    //     if (isDef(target)) {

    //       // 如果不写 type 或 type 不是 字符串 或 数组
    //       // 就当做此规则无效，和没写一样
    //       // if (type) {
    //       //   let matched
    //       //   // 比较类型
    //       //   if (!string.falsy(type)) {
    //       //     matched = is.is(target, type)
    //       //   }
    //       //   else if (!array.falsy(type)) {
    //       //     array.each(
    //       //       type,
    //       //       function (t) {
    //       //         if (is.is(target, t)) {
    //       //           matched = env.TRUE
    //       //           return env.FALSE
    //       //         }
    //       //       }
    //       //     )
    //       //   }
    //       //   else if (is.func(type)) {
    //       //     // 有时候做判断需要参考其他数据
    //       //     // 比如当 a 有值时，b 可以为空之类的
    //       //     matched = type(target, props)
    //       //   }
    //       //   if (matched !== env.TRUE) {
    //       //     logger.warn(`The prop "${key}" ${env.RAW_TYPE} is not matched.`)
    //       //   }
    //       // }
    //     }
    //     else if (required) {
    //       logger.warn(`The prop "${key}" is marked as required, but its value is not found.`)
    //     }
    //     else if (object.has(rule, 'value')) {
    //       result[key] = type === env.RAW_FUNCTION
    //         ? value
    //         : (is.func(value) ? value(props) : value)
    //     }
    //   }
    // )
    return result
  }

  constructor(options: YoxOptions) {

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
      model,
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

    if (model) {
      instance.$model = model
    }

    // 数据源
    const source = props
      ? instance.checkPropTypes(props)
      : {}

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
    const observer = instance.$observer = new Observer(source, instance)

    if (computed) {
      object.each(
        computed,
        function (options: signature.computedGetter | ComputedOptions, keypath: string) {
          observer.addComputed(keypath, options)
        }
      )
    }

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
            source[key] = value
          }
        }
      )
    }

    // 监听各种事件
    // 支持命名空间
    instance.$emitter = new Emitter(env.TRUE)

    let placeholder: Node | void,

    isComment = env.FALSE

    // 检查 template
    if (is.string(template)) {
      // 传了选择器，则取对应元素的 html
      if (selectorPattern.test(template)) {
        placeholder = domApi.find(template)
        if (placeholder) {
          template = domApi.html(placeholder as Element) as string
          placeholder = env.UNDEFINED
        }
        else {
          logger.fatal(`"${template}" 选择器找不到对应的元素`)
        }
      }
    }
    else {
      template = env.UNDEFINED
    }

    // 检查 el
    if (el) {
      if (is.string(el)) {
        const selector = el as string
        if (selectorPattern.test(selector)) {
          placeholder = domApi.find(selector)
          if (!placeholder) {
            logger.fatal(`"${selector}" 选择器找不到对应的元素`)
          }
        }
        else {
          logger.fatal(`"el" option 格式错误`)
        }
      }
      else {
        placeholder = el as Node
      }
    }


    if (placeholder && !replace) {
      // 如果不是替换占位元素
      // 则在该元素下新建一个注释节点，等会用新组件替换掉
      isComment = env.TRUE
      domApi.append(
        placeholder as Node,
        placeholder = domApi.createComment(env.EMPTY_STRING)
      )
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
          instance[name] = method
        }
      )
    }

    setOptions(instance, env.RAW_TRANSITION, transitions)
    setOptions(instance, env.RAW_COMPONENT, components)
    setOptions(instance, env.RAW_DIRECTIVE, directives)
    setOptions(instance, env.RAW_PARTIAL, partials)
    setOptions(instance, env.RAW_FILTER, filters)

    execute(options[ config.HOOK_AFTER_CREATE ], instance)

    // 当存在模板和计算属性时
    // 因为这里把模板当做一种特殊的计算属性
    // 因此模板这个计算属性的优先级应该最高
    if (template) {

      // 编译模板
      // 在开发阶段，template 是原始的 html 模板
      // 在产品阶段，template 是编译后且经过 stringify 的字符串
      // 当然，这个需要外部自己控制传入的 template 是什么
      // Yox.compile 会自动判断 template 是否经过编译
      instance.$template = Yox.compile(template)

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

      // 拷贝一份，避免影响外部定义的 watchers
      watchers = watchers
        ? object.copy(watchers)
        : {}

      // 当 virtual dom 变了，则更新视图
      watchers[TEMPLATE_COMPUTED] = function (vnode: VNode) {
        instance.update(vnode, instance.$vnode)
      }

      // 第一次渲染视图
      if (!placeholder) {
        isComment = env.TRUE
        placeholder = domApi.createComment(env.EMPTY_STRING)
      }

      instance.update(
        instance.get(TEMPLATE_COMPUTED),
        snabbdom.create(
          domApi,
          placeholder,
          isComment,
          instance,
          env.EMPTY_STRING
        )
      )

    }
    else if (placeholder) {
      logger.fatal('有 el 没 template 是几个意思？')
    }

    if (events) {
      instance.on(events)
    }

    // 确保早于 AFTER_MOUNT 执行
    if (watchers) {
      observer.nextTask.prepend(
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
  addComputed(keypath: string, computed: signature.computedGetter | ComputedOptions): Computed | void {
    return this.$observer.addComputed(keypath, computed)
  }

  /**
   * 删除计算属性
   */
  removeComputed(keypath: string): void {
    this.$observer.removeComputed(keypath)
  }

  /**
   * 取值
   */
  get(keypath: string, defaultValue?: any, depIgnore?: boolean): any {
    return this.$observer.get(keypath, defaultValue, depIgnore)
  }

  /**
   * 设值
   */
  set(keypath: string | Record<string, any>, value?: any): void {
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
  on(type: string | Record<string, signature.eventListener>, listener?: signature.eventListener): YoxInterface {
    this.$emitter.on(type, listener, { ctx: this })
    return this
  }

  /**
   * 监听一次事件
   */
  once(type: string | Record<string, signature.eventListener>, listener?: signature.eventListener): YoxInterface {
    this.$emitter.on(type, listener, { ctx: this, max: 1 })
    return this
  }

  /**
   * 取消监听事件
   */
  off(type: string, listener?: signature.eventListener): YoxInterface {
    this.$emitter.off(type, listener)
    return this
  }

  /**
   * 触发事件
   */
  fire(bullet: string | Event, data?: signature.eventData | boolean, downward?: boolean): boolean {

    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件

    let instance = this,

    event = bullet instanceof Event ? bullet : new Event(bullet),

    eventData: signature.eventData | void,

    isComplete: boolean | void

    // 告诉外部是谁发出的事件
    if (!event.target) {
      event.target = instance
    }

    // 比如 fire('name', true) 直接向下发事件
    if (is.object(data)) {
      eventData = data as Record<string, any>
    }
    else if (data === env.TRUE) {
      downward = env.TRUE
    }

    isComplete = instance.$emitter.fire(event, eventData)
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
  watch(
    keypath: string | Record<string, signature.watcher | WatcherOptions>,
    watcher?: signature.watcher,
    options?: WatcherOptions | boolean
  ): YoxInterface {
    this.$observer.watch(keypath, watcher, options)
    return this
  }

  /**
   * 监听一次数据变化
   */
  watchOnce(
    keypath: string,
    watcher: signature.watcher,
    options?: WatcherOptions
  ): YoxInterface {
    const watcherOptions = formatWatcherOptions(options)
    watcherOptions.once = env.TRUE
    this.$observer.watch(keypath, watcher, watcherOptions)
    return this
  }

  /**
   * 取消监听数据变化
   */
  unwatch(
    keypath: string,
    watcher?: signature.watcher
  ): YoxInterface {
    this.$observer.unwatch(keypath, watcher)
    return this
  }

  directive(
    name: string | Record<string, DirectiveHooks>,
    directive?: DirectiveHooks
  ): DirectiveHooks | void {
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

  transition(
    name: string | Record<string, TransitionHooks>,
    transition?: TransitionHooks
  ): TransitionHooks | void {
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

  component(
    name: string | Record<string, YoxOptions>,
    component?: YoxOptions | signature.asyncComponent
  ): YoxOptions | void {
    const instance = this, { $components } = instance
    if (is.string(name)) {
      // 同步取值
      if (!component) {
        return getResource($components, name as string, Yox.component)
      }
      else if (is.func(component)) {
        if (!getComponentAsync($components, name as string, component as signature.asyncComponent)) {
          getComponentAsync(globalComponents, name as string, component as signature.asyncComponent)
        }
        return
      }
    }
    setResource(
      $components || (instance.$components = {}),
      name,
      component
    )
  }

  partial(
    name: string | Record<string, string>,
    partial?: string
  ): Function | void {
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

  filter(
    name: string | Record<string, Function | Record<string, Function>>,
    filter?: Function | Record<string, Function | Record<string, Function>>
  ): Function | Record<string, Function> | void {
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

  /**
   * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
   * 而你非常确定需要更新模板，强制刷新正是你需要的
   */
  forceUpdate(): void {

    const instance = this,

    { $vnode, $observer } = instance

    if ($vnode) {

      const computed: Computed = $observer.computed[TEMPLATE_COMPUTED],

      oldValue = computed.get()

      // 当前可能正在进行下一轮更新
      $observer.nextTask.run()

      // 没有更新模板，强制刷新
      if (oldValue === computed.get()) {
        instance.update(
          computed.get(env.TRUE),
          $vnode
        )
      }
    }
  }

  /**
   * 把模板抽象语法树渲染成 virtual dom
   */
  render() {
    const instance = this
    return templateRender.render(
      instance,
      mergeResource(instance.$filters, globalFilters),
      mergeResource(instance.$partials, globalPartials),
      mergeResource(instance.$directives, globalDirectives),
      mergeResource(instance.$transitions, globalTransitions),
      instance.$template
    )
  }

  /**
   * 更新 virtual dom
   *
   * @param vnode
   * @param oldVnode
   */
  update(vnode: VNode, oldVnode: VNode) {

    let instance = this,

    { $vnode, $options } = instance,

    hook: Function | void

    // 每次渲染重置 refs
    // 在渲染过程中收集最新的 ref
    // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
    instance.$refs = {}

    if ($vnode) {
      execute($options[ config.HOOK_BEFORE_UPDATE ], instance)
      snabbdom.patch(domApi, vnode, oldVnode)
      hook = $options[config.HOOK_AFTER_UPDATE]
    }
    else {
      execute($options[ config.HOOK_BEFORE_MOUNT ], instance)
      snabbdom.patch(domApi, vnode, oldVnode)
      instance.$el = vnode.node as HTMLElement
      hook = $options[config.HOOK_AFTER_MOUNT]
    }

    instance.$vnode = vnode

    // 跟 nextTask 保持一个节奏
    // 这样可以预留一些优化的余地
    if (hook) {
      instance.nextTick(
        function () {
          if (instance.$vnode) {
            execute(hook, instance)
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
  checkPropTypes(props: Record<string, any>): Record<string, any> {
    const { propTypes } = this.$options
    return propTypes
      ? Yox.checkPropTypes(props, propTypes)
      : props
  }

  /**
   * 创建子组件
   *
   * @param options 组件配置
   * @param vnode 虚拟节点
   * @param node DOM 元素
   */
  create(options: YoxOptions, vnode?: VNode, node?: Node): YoxInterface {

    options = object.copy(options)
    options.parent = this

    if (vnode) {

      // 如果传了 node，表示有一个占位元素，新创建的 child 需要把它替换掉
      if (node) {
        options.el = node
        options.replace = env.TRUE
      }
      options.slots = vnode.slots

      let { props, model } = vnode

      // 把 model 的值设置给 props 的逻辑只能写到这
      // 不然子组件会报数据找不到的警告
      if (isDef(model)) {
        if (!props) {
          props = options.props = {}
        }
        const name = options.model || 'value'
        if (!object.has(props, name)) {
          props[name] = model
        }
        options.model = name
      }

    }

    const child = new Yox(options)
    array.push(
      this.$children || (this.$children = [ ]),
      child
    )

    return child
  }

  /**
   * 销毁组件
   */
  destroy(): void {

    const instance = this,

    {
      $options,
      $vnode,
      $parent,
      $emitter,
      $observer,
    } = instance

    execute($options[ config.HOOK_BEFORE_DESTROY ], instance)

    if ($parent && $parent.$children) {
      array.remove($parent.$children, instance)
    }

    if ($vnode) {
      snabbdom.destroy(domApi, $vnode, !$parent)
    }

    $emitter.off()
    $observer.destroy()

    object.clear(instance)

    execute($options[ config.HOOK_AFTER_DESTROY ], instance)

  }

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   */
  nextTick(task: Function, prepend?: boolean): void {
    const { nextTask } = this.$observer
    if (prepend) {
      nextTask.prepend(task)
    }
    else {
      nextTask.append(task)
    }
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
    return this.$observer.append(keypath, item)
  }

  /**
   * 在数组首部添加元素
   *
   * @param keypath
   * @param item
   */
  prepend(keypath: string, item: any): boolean | void {
    return this.$observer.prepend(keypath, item)
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

function setOptions(instance: Yox, key: string, value: Function | Record<string, any>) {
  if (is.func(value)) {
    instance[key](execute(value, instance))
  }
  else if (is.object(value)) {
    instance[key](value)
  }
}

function getComponentAsync(data: Record<string, any> | void, name: string, callback: signature.asyncComponent): boolean | void {
  if (data && object.has(data, name)) {
    const component = data[name]
    // 注册的是异步加载函数
    if (is.func(component)) {
      let { $queue } = component
      if (!$queue) {
        $queue = component.$queue = [callback]
        component(
          function (replacement: any) {

            component.$queue = env.UNDEFINED

            data[name] = replacement

            array.each(
              $queue,
              function (callback) {
                callback(replacement)
              }
            )

          }
        )
      }
      else {
        array.push($queue, callback)
      }
    }
    // 不是异步加载函数，直接同步返回
    else {
      callback(component)
    }
    return env.TRUE
  }
}

function getResource(data: Record<string, any> | void, name: string, lookup?: Function) {
  if (data && data[name]) {
    return data[name]
  }
  else if (lookup) {
    return lookup(name)
  }
}

function setResource(data: Record<string, any>, name: string | Record<string, any>, value?: any, formatValue?: (value: any) => any) {
  if (is.string(name)) {
    data[name as string] = formatValue ? formatValue(value) : value
  }
  else {
    object.each(
      name,
      function (value, key) {
        data[key] = formatValue ? formatValue(value) : value
      }
    )
  }
}

function mergeResource(locals: Record<string, any> | void, globals: Record<string, any>): Record<string, any> {
  return locals && globals
    ? object.extend({}, globals, locals)
    : locals || globals
}

import event from './directive/event'
import model from './directive/model'
import binding from './directive/binding'

// 全局注册内置指令
Yox.directive({ event, model, binding })

import hasSlot from './filter/hasSlot'

// 全局注册内置过滤器
Yox.filter({ hasSlot })
