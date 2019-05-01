## 定义组件

### 类型约束

Yox 组件是符合 [YoxOptions](https://github.com/yoxjs/yox-type/blob/master/src/options/Yox.ts) 类型约束的 `Plain Object`，如下：

```js
{
  // 通常只有根组件需要配置 el，支持元素节点和选择器
  // 如果只想用纯粹的数据观察者，可不传
  // 如果没传 el，但是传了 template，创建的组件只存在内存中，而不存在 DOM 树中
  el: '组件挂载的元素',

  // 组件模板，支持模板字符串和选择器
  // 如果使用选择器，获取的是目标元素的 innerHTML
  // 如果只想用纯粹的数据观察者，可不传
  template: '组件模板',

  // 如果组件支持双向绑定
  // 可设置绑定的 prop name
  // 更多内容，参考 双向绑定 - 组件
  model: 'value',

  // 外部传入的数据格式定义
  propTypes: {
    propName: {
      // 数据类型
      type: 'string',
      // 默认值
      value: '',
      // 是否必传
      required: true
    },
  },

  // 组件数据
  // 如果是根组件，data 通常是 object
  data: {},
  // 如果是子组件，data 通常是 function，返回一个 object
  data: function () {
    return {}
  },

  // 计算属性
  computed: {},

  // 组件方法
  methods: {},

  // 监听事件
  // 包括组件自身的事件，和子组件、孙组件冒泡上来的事件
  events: {},

  // 监听数据变化
  watchers: {},

  // 组件用到的过渡动画
  // 如果已全局注册，可无需再注册
  transitions: {},

  // 组件用到的子组件
  // 如果已全局注册，可无需再注册
  components: {},

  // 组件用到的指令
  // 如果已全局注册，可无需再注册
  directives: {},

  // 组件用到的子模板
  // 如果已全局注册，可无需再注册
  partials: {},

  // 组件模板中使用的过滤器
  // 如果已全局注册，可无需再注册
  filters: {},

  // 以下是组件生命周期钩子
  beforeCreate: function,
  afterCreate: function,

  beforeMount: function,
  // 一般在 afterMount 初始化第三方 DOM 库
  afterMount: function,

  beforeUpdate: function,
  afterUpdate: function,

  // 一般在 beforeDestroy 销毁第三方 DOM 库
  beforeDestroy: function,
  afterDestroy: function
}
```

### 组件名称

有了组件对象，还需要给它取个名字，这样才能在模板中通过组件名称创建组件，如下：

```js
Yox.component('CustomComponent', { ... })
```

```html
<div>
  <CustomComponent />
</div>
```

模板混合了 `组件标签` 和 `HTML 标签`，在这么多标签中，如何准确地识别出 `组件标签` 呢？

鉴于 `HTML 标签` 的形式通常是小写且没有连字符，我们定义了两种识别方式：

* `组件标签` 包含大写字母，如 `AppHeader`
* `组件标签` 包含连字符，如 `app-header`

> 某些 svg 标签试图挑战规则，比如 `<missing-glyph>` 和 `<foreignObject>`，放心，它们的反抗是徒劳的。

渲染模板时，Yox 通过 `组件标签` 获得组件名称，然后按照 `本地` => `全局` 的顺序去查找已注册的组件。

> 如果你喜欢写 `<DIV></DIV>`，那我只能送你离开。

## 注册组件

### 全局注册

比较通用的组件，建议全局注册，如下：

```js
// 单个注册
Yox.component('Component', { ... })

// 批量注册
Yox.component({
  Component1: { ... },
  Component2: { ... },
  ...
})
```

### 本地注册

通用性不强的组件，建议本地注册，本地注册的组件只在 **当前组件** 可用。

```js
{
  components: {
    Component: {...}
  }
}
```

### 异步注册

为了避免一棵组件树，打包之后的代码过于庞大，Yox 还支持异步注册。

异步注册的方式和前面提到的 `全局注册`、`本地注册` 相同，唯一不同的是它注册的是一个函数，如下：

```js
Yox.component('AsyncComponent', function (callback) {
  // 这里以 AMD 加载器举例
  // 其他加载器可在请求到组件后调用 callback，并把组件对象传进去
  require(['AsyncComponent'], callback)
})
```

## 生命周期

### beforeCreate

进入 `new Yox(options)` 之后立即触发，钩子函数会传入 `options`。

> 仅触发一次。

### afterCreate

绑定事件和数据监听之后触发。

> 仅触发一次。

### beforeMount

模板编译之后，加入 DOM 树之前触发。

> 仅触发一次，`pure` 版本不会触发。

### afterMount

加入 DOM 树之后触发。

这时可通过组件的 `$el` 属性获取组件根元素。

如有需要，可在此钩子初始化第三方 DOM 库。

> 仅触发一次，`pure` 版本不会触发。

### beforeUpdate

视图更新之前触发。

> `pure` 版本不会触发。

### afterUpdate

视图更新之后触发。

> `pure` 版本不会触发。

### beforeDestroy

销毁之前触发。

如果在 `afterMount` 初始化过第三方 DOM 库，切记在 `beforeDestroy` 销毁。

> 仅触发一次。

### afterDestroy

销毁之后触发。

> 仅触发一次。

## 单个根元素

组件 `必须` 有且只有 `一个` 根元素，如下：

```html
<div class="root">
  {{#if username}}
    hi, {{username}}!
  {{else}}
    sign in.
  {{/if}}
</div>
```

根元素应该 `保持稳定`，在组件的生命周期内，根元素不能变来变去，反例如下：

```html
{{#if username}}
  <div class="root">
    hi, {{username}}!
  </div>
{{else}}
  <div class="root">
    sign in.
  </div>
{{/if}}
```

## 传递数据

通过 `props` 把数据传递给子组件，如下：

```html
<div>
  <CustomComponent
    name="yox"
    title="guide"
  />
</div>
```

如果传递的数据比较多，推荐使用 `延展属性`。

```js
{
  data: {
    props: {
      name: 'yox',
      title: 'guide'
    }
  }
}
```

```html
<div>
  <CustomComponent {{...props}} />
</div>
```

> 参考 **模板** - **延展属性**

## 数据校验

如果定义的组件配置了 `propTypes`，当它接收到传入的 `props` 后，会立即调用 `checkPropTypes()`，这个函数会根据配置的 `propTypes`，告诉你哪些数据不符合要求。

> 此特性只在 `dev` 版本可用，其他版本，`checkPropTypes` 是个直接返回 `props` 的空函数。

`propTypes` 每项配置有三个选项，如下：

* `type`: 数据类型
* `required`: 是否必需，可选
* `value`: 默认值，可选

### type

数据类型，可以是 `string` 或 `string` 数组，也可以是 `Function`，如下：

```js
{
  propTypes: {
    name: {
      type: 'string'
    },
    age: {
      type: ['number', 'numeric']
    },
    gender: {
      type: function (props) {
        // 返回布尔类型，表示是否符合类型要求
        return true
      }
    }
  }
}
```

`type` 的可选值来自下面这个函数：

```js
function (prop) {
  return Object.prototype.toString.call(prop).slice(8, -1).toLowerCase()
}
```

常见的可选值有 `string`、`number`、`boolean`、`function`、`array`、`object`、`undefined`、`null`。

此外还有一个特殊值 `numeric`，表示字符串类型的数字。

### required

是否必需，可以是 `boolean`，也可以是 `Function`，如下：

```js
{
  propTypes: {
    name: {
      type: 'string',
      required: true
    },
    age: {
      type: 'number',
      required: function (props) {
        // 返回布尔类型，表示是否必传
        return true
      }
    }
  }
}
```

### value

如果外部没有传入此项数据，且 `required` 不为 `true`，则可设置默认值。

### 重写

如果默认实现不满足需求，你可以重写 `checkPropTypes` 函数：

```js
Yox.checkPropTypes = function (props, propTypes) {
  // 随便你怎么写
  // 最后返回一个 Object 就行，它将作为有效的 props 继续往下执行
}
```

## 传递节点

现在，你学会了给组件传递数据，正准备写一个 `<Button>` 练练手，这时你发现了一个问题，如何给 `<Button>` 传递图标呢？

聪明的你想到了一个解决方法：传入图标的名称，如下：

```html
<div>
  <Button iconName="info" />
</div>
```

```html
<div class="button">
  {{#if iconName}}
    <i class="icon icon-{{iconName}}"></i>
  {{/if}}
</div>
```

看起来没什么问题，但你需要知道的是，`<Button>` 至少耦合了 `<i>` 标签和 `class` 的命名方式，`<svg>` 图标肯定是没法用了。

你左思右想，要是能把 `图标元素` 直接传进来就好了。幸运的是，`slot` 就是为这么聪明的你准备的。


### 匿名 slot

你可以在 `组件标签` 的内部写上需要传递的节点，如下：

```html
<div>
  <Button>
    <i class="icon icon-info"></i>
  </Button>
</div>
```

在 `<Button>` 组件的模板中，通过 `<slot>` 标签获取外部传入的节点，如下：

```html
<div class="button">
  <slot name="children" />
</div>
```

如果没有为传递的节点命名，默认就叫作 `children`。

### 命名 slot

有时候，你希望传入多个节点，比如左边一个图标，右边一个图标，如下：

```html
<div>
  <Button>
    <template slot="left">
      <i class="icon-left"></i>
    </template>
    <template slot="right">
      <i class="icon-right"></i>
    </template>
    text
  </Button>
</div>
```

这里出现了 `<template>` 标签，它的角色是为组件传递节点的容器，你可以通过 `slot` 属性为它命名。

```html
<div class="button">
  <slot name="left" />
  title
  <slot name="right" />
</div>
```

细心的同学可能注意到上面的例子中还有一个孤零零的 `text`，它并非是多余的，我们的初衷是，如果组件标签内定义的节点没有名字，那它统统属于 `children`。

也就是说，你可以通过 `children` 取到 `text`，如下：

```html
<div class="button">
  <slot name="left" />
  <slot name="children" />
  <slot name="right" />
</div>
```

### 默认 slot

如果外部没有传入某个名称的节点，`<slot>` 不会有任何效果。

有时候，你需要知道外部有没有传入某个节点，如果没有，则换成默认的节点，如下：

```html
<div class="button">
  <slot name="left">
    默认的 left
  </slot>
  <slot name="children">
    默认的 children
  </slot>
  <slot name="right">
    默认的 right
  </slot>
</div>
```

### 判断 slot

你可以通过 `hasSlot(name)` 过滤器判断外部有没有传入某个节点，如下：

```html
<div class="button{{#if hasSlot('icon')}} button-icon{{/if}}">
  <slot name="icon" />
  <slot name="children">
    默认文本
  </slot>
</div>
```

## 父子通信

### 父组件 => 子组件

父组件到子组件的通信方式有三种，第一种是前面介绍的传递数据，这里不再赘述。

第二种是通过 `ref` 获取子组件实例，如下：

```html
<div>
  <Player ref="player" />
</div>
```

```js
// 比如调用子组件的方法
this.$refs.player.play()
```

这种方式无法跨层级通信，比如从父组件到孙组件，因此需要用到第三种方式，向下发射事件，如下：

```js
parent.fire('playVideo', true)
```

```js
{
  events: {
    playVideo: function (event, data) {
      // 子组件监听父组件发出的事件
      // event.target 指向 parent
    }
  }
}
```

> 更多内容，参考 **事件处理** - **手动触发事件**


### 子组件 => 父组件

原则上，子组件不应对父组件做出任何假设，作为可复用的组件，它可以是任何组件的子组件。

为了解耦父子关系，子组件对外通信的方式是向上发射事件，如下：

```js
child.fire('someThingHappened')
```

```js
{
  events: {
    someThingHappened: function (event, data) {
      // 父组件监听子组件发出的事件
      // event.target 指向 child
    }
  }
}
```

> 更多内容，参考 **事件处理** - **手动触发事件**
