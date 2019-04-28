事件处理有以下两种方式：

* 事件转换
* 调用函数

## 事件转换

事件转换，指的是把 A 事件转成了 B 事件。举个例子，把 `click` 转成 `submit`：

```html
<button on-click="submit">
  Submit
</button>
```

为什么要做这种看似多此一举的工作呢？

对于监听 DOM 事件来说，转换意味着**语义化**，语义化让代码逻辑更加清晰，这一点是显而易见的。

> `click` 没有业务层面的意义，`submit` 则不然，它意味着你可能即将向服务器提交一个请求。

在 `元素节点` 上监听事件，Yox 会把 DOM 事件封装成自定义事件，如下：

```html
<button on-click="submit">
  Submit
</button>
```

```js
function (domEvent) {
  this.fire(new Event('submit', domEvent))
}
```

> `fire(event)` 方法的默认行为是 `向上冒泡`。

在 `组件节点` 上监听事件，Yox 会把子组件冒泡上来的事件再次封装成新的自定义事件，如下：

```html
<Button on-click="submit" />
```

```js
function (event, data) {
  this.fire(new Event('submit', event), data)
}
```

> `fire(event, data)` 方法的默认行为是 `向上冒泡`。

`<Button>` 组件冒泡了一个 `click` 事件，父组件监听到 `click` 事件后触发了一个 `submit` 事件，此时共有 `两个` 冒泡事件。

当我们处于一个层级复杂的组件树中，事件可能从任何子组件（或孙组件）冒泡上来，因此，我们建议事件应该越语义化越好，这样当父组件接收到子组件（或孙组件）发出的事件时，才不会无所适从。

> 如果不需要事件冒泡，请调用方法。

转换后的事件，可以通过配置 `events` 监听，也可以调用 `on()` 监听。

```js
{
  events: {
    submit: function (event, data) {
      // this 指向当前组件实例
      // event.target 是谁发出的事件
    }
  },
  afterMount: function () {
    this.on('submit', function (event, data) {
      // this 指向当前组件实例
      console.log(this, event)
    })
  }
}
```

## 调用函数

我们也可以调用 `methods` 定义的方法，如下：

```html
<button on-click="submit()">
  Submit
</button>
```

```js
{
  methods: {
    submit: function (event) {
      // this 指向触发事件的组件实例
    }
  }
}
```

如果调用方法没有传参，默认会传入事件对象。


## 特殊变量

在 `元素节点` 上监听事件，当事件触发时，会创建 `$event` 变量，如下：

```html
<button on-click="submit($event)">
  Submit
</button>
```

在 `组件节点` 上监听事件，当事件触发时，会创建 `$event` 和 `$data` 变量，如下：

```html
<Button on-click="submit($event, $data)" />
```

> 更多内容，参考 **模板语法** - **特殊变量**


## 停止事件冒泡

事件冒泡过程中，任何一个事件处理函数，返回 `false` 或调用 `event.stop()` 可以阻止事件继续冒泡。

> 返回 `false` 相当于 `event.prevent()` + `event.stop()`
>
> 如果你不需要阻止事件默认行为，调用 `event.stop()` 更为合适

```js
{
  events: {
    submit: function (event) {
      event.stop()
    }
  }
}
```

> `event.stop()` 等价于 `event.stopPropagation()`


## 阻止事件默认行为

在事件处理函数中，调用 `event.prevent()` 可以阻止事件默认行为。

```js
{
  events: {
    submit: function (event) {
      event.prevent()
    }
  }
}
```

> `event.prevent()` 等价于 `event.preventDefault()`


## 自定义事件

如果浏览器自带的 DOM 事件不满足需求，Yox 还支持自定义事件。

我们知道，当使用中文输入法进行文本输入时，如果没有敲击回车或空格，输入框会不停地触发 `input` 事件，这通常不是什么问题，但对于双向绑定来说，这样的体验并不好。

因此，我们内置了 `唯一的` 自定义事件 `model`，它可以过滤掉输入法正在输入过程中 `input` 事件。

对于跨端页面来说，通常还需要 `tap` 事件，下面简单示范如何实现它：

```js
Yox.dom.specialEvents.tap = {
  on: function (element, listener) {
    Yox.dom.on(
      element,
      isMobile ? 'touchstart' : 'click',
      listener
    )
  },
  off: function (element, listener) {
    Yox.dom.off(
      element,
      isMobile ? 'touchstart' : 'click',
      listener
    )
  }
}
```

```html
<button on-tap="submit()">
  Submit
</button>
```

## 手动触发事件

向上发射事件，即冒泡事件。

```js
this.fire('submit')
```

向上发射事件，并带上一些数据。

```js
this.fire('submit', { name: 'yox' })
```

> 注意：数据必须是个对象。

向下发射事件，事件会一层接一层的往下传递，直到尽头。

```js
this.fire('submit', true)
this.fire('submit', { name: 'yox' }, true)
```

## 解绑事件

```js
this.off(type, ?listener)
```

如果不传 `listener`，则解绑该 `type` 绑定的所有事件处理函数。


## 事件对象

事件对象具有以下属性：

* `type`: 事件名称
* `target`: 是哪个组件发出的事件
* `originalEvent`: 原始事件
* `isPrevented`: 是否已阻止事件的默认行为
* `isStoped`: 是否已停止事件冒泡
* `listener`: 当前正在执行的事件处理函数

下面用一个例子说明为什么要加 `listener` 属性，如下：

```js
{
  events: {
    submit: function (event) {
      // event.listener 非常便于事件解绑
      this.off('submit', event.listener)
    }
  }
}
```

## 事件名称格式

在 `元素节点` 上监听事件，`on-[type]` 中 `type` 和 DOM 事件完全一致（反正全都是小写...）

```html
<button on-mousedown="mousedown" on-mouseup="mouse-up" on-mouseover="mouseOver">
  Submit
</button>
```

事件经过转换后，向上冒泡 `mousedown`、`mouse-up`、`mouseOver` 三个事件。

在 `组件节点` 上监听事件，`on-[type]` 中的 `type` 会经过 `camelize` 处理，也就是说，不论 `type` 怎么写，最终都不会监听 `连字符` 格式的事件。

```html
<Button on-mousedown="mousedown()" on-mouse-up="mouseup()" on-mouseOver="mouseOver()" />
```

`on-mouse-up` 监听不到任何事件，因为子组件只冒泡了 `mouse-up` 事件，而它实际监听的是 `mouseUp` 事件，只有当子组件冒泡的是 `mouseUp` 事件，父组件才能监听到。

为了保证统一且规范的开发风格，我们推荐使用如下格式：

* 调用 `fire(type)` 中的 `type`，使用驼峰格式
* 模板 `on-[type]` 中的 `type`，使用连字符格式