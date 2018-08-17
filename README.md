# Yox

Just like Vue, but it is more lightweight and easy than Vue.

The key is that yox supports IE6.

> QQ 群 232021930，**可用于生产环境，没有 Vue 使用经验不建议使用，谢谢**。

> 关于未来版本的重要提示：
> 1. 模板将不再兼容类似 `list[0].name` 的数组语法，必须写成 `list.0.name`
> 2. legacy 版本将不再提供补丁函数的支持，必须自行引入 `es5-shim.js/es5-sham.js/json.js`

```js
{
  // 通常只有根组件需要配置 el，支持元素节点和选择器
  // 如果只想把组件用于纯粹的数据观察者，可不传
  // 如果没传 el，但是传了 template，创建的组件只存在内存中，而不存在 DOM 树中
  el: '组件挂载的元素',

  // 组件模板，支持模板字符串和选择器
  // 如果使用选择器，获取的是目标元素的 innerHTML
  // 如果只想把组件用于纯粹的数据观察者，可不传
  template: '组件模板',

  // 外部传入的数据格式定义
  propTypes: {
    propA: {
      // 数据类型
      type: 'string',
      // 默认值
      value: ''
    },
    propB: {
      // 类型支持数组
      type: ['string', 'number'],
      value: ''
    },
    propC: {
      // 等同于 [ 'string', 'number' ]
      type: 'numeric',
      // 强制必需
      required: true
    }
  },

  // 组件数据
  // 如果是根组件，
  // data 通常是 object
  data: {},
  // 如果是子组件，data 通常是 function，返回一个 object
  data: function () { return {}; },

  // 计算属性
  computed: {
    field1: function () {

    },
    field2: {
      deps: [ 'dep1', 'dep2' ],
      get: function () {

      }
    }
  },
  // 监听事件
  // 包括组件自身的事件，和子组件冒泡上来的事件
  events: {
    eventName: function (event, data) {
    }
  },

  // 监听数据变化
  watchers: {
    keypath: function (newValue, oldValue, keypath) {

    }
  },

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

  // 组件实例方法
  methods: {},

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

## Install

NPM

```shell
npm install yox
```

CDN

```html
<script src="https://unpkg.com/yox@latest"></script>
```

## Example

* [Hello World](https://jsfiddle.net/musicode/coLxry2w/)
* [Condition](https://jsfiddle.net/musicode/5pq2kmo8/6/)
* [Render List](https://jsfiddle.net/musicode/1kewyatu/)
* [Data Binding](https://jsfiddle.net/musicode/u1kj5vyL/)
* [Event Handle](https://jsfiddle.net/musicode/2hpLnoz5/)
* [Custom Component](https://jsfiddle.net/musicode/3jx6x8e1/)

## Document

[技术预览版](https://musicode.gitbooks.io/yox)

## Donation

If you think Yox is very helpful to you, please give me some encouragement.

Wechat Pay

<img src="https://user-images.githubusercontent.com/2732303/44254903-ce6d3f80-a236-11e8-86dd-f6b27a7f94df.png" width="200">

Ali Pay

<img src="https://user-images.githubusercontent.com/2732303/44254929-e5139680-a236-11e8-95e2-f5a864246f83.png" width="200">