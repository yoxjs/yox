你可以使用 `on` 指令在 `元素节点` 或 `组件节点` 绑定事件，如下：

```html
<button on-click="submit">
  Submit
</button>
```

事件处理，有以下两种方式：

* 事件转换
* 调用方法

## 事件转换

事件转换，指的是把 `A` 事件转成 `B` 事件，如下：

```html
<button on-click="submit">
  Submit
</button>
```

这里把 `click` 转成 `submit`，为什么要做这种看似多此一举的事呢？

### 语义化

`DOM 事件` 通常没有业务层面的意义，比如 `click` 表示一次点击事件，但你并不知道点击了什么，是确定按钮还是取消按钮呢？

> 如果只知道 `click`，其实意味着你什么都不知道

事件转换意味着 `语义化`，语义化让代码逻辑更加清晰，这一点是显而易见的，比如 `submit` 意味着你可能即将向服务器提交一个请求。

当我们处于一个复杂的组件树中，事件可能从任何子组件（或孙组件）冒泡上来。因此，我们建议事件应该越语义化越好，这样当父组件接收到子组件（或孙组件）发出的事件时，才不会无所适从。

### DOM 事件

在 `元素节点` 上监听事件，`on-[type]` 中 `type` 和 DOM 事件名称完全一致（都是小写形式），如下：

```html
<button on-click="submit">
  Submit
</button>
```

Yox 会把 DOM 事件封装成 `Yox.Event`，因此在事件处理函数中，你能取到 `Yox.Event` 对象。

```js
function (domEvent) {
  this.fire(new Yox.Event('submit', domEvent))
}
```

> `fire(event)` 方法的默认行为是 `向上冒泡`。

DOM 事件转换后的事件名称，只支持以下两种格式：

* 符合变量命名规则，比如 `submit`
* 符合事件命名空间规则，比如 `submit.button`

> 关于事件命名空间，参考 **事件处理** - **事件命名空间**

我们通过一个例子加深印象：

```html
<button
  on-mousedown="mousedown"
  on-mouseup="mouse-up"
  on-mouseover="mouseOver"
  on-click="submit.button"
>
  Submit
</button>
```

Yox 不支持 `mouse-up`，在模板编译阶段就会报错。

### 组件事件

在 `组件节点` 上监听的事件，通常是子组件冒泡上来的事件，如下：

```html
<Button on-click="submit" />
```

Yox 会把子组件冒泡上来的事件封装成新的 `Yox.Event`，如下：

```js
function (event, data) {
  this.fire(new Yox.Event('submit', event), data)
}
```

> `fire(event, data)` 方法的默认行为是 `向上冒泡`。

`Button` 组件冒泡了一个 `click` 事件，父组件监听到 `click` 事件后转换成了 `submit` 事件，此时共有 `两个` 冒泡事件。

> 如果不需要事件冒泡，请调用方法。

子组件冒泡上来的事件名称有四种可能的格式：

* 符合变量命名规则的简单事件，比如 `submit`
* 符合变量命名规则的复杂事件，比如 `userRemove`
* 符合事件命名空间规则的简单事件，比如 `submit.button`
* 符合事件命名空间规则的复杂事件，比如 `userRemove.removeButton`

> 这里的 `简单` 和 `复杂` 仅仅表示事件名称是否包含多个单词

监听组件事件时，`on-[type]` 中的 `type` 会经过 `camelize` 处理，也就是说，连字符格式的事件名称会转成驼峰格式，举个例子：

```html
<Button
  on-user-remove="removeUser()"
/>
```

这里实际监听的是 `userRemove`，而不是 `user-remove`。

> 这样设计的原因是，连字符格式更符合 HTML 的开发习惯，如果你更喜欢使用驼峰格式，也无妨

如果子组件冒泡上来的事件包含命名空间，父组件监听事件时，`on-[type]` 中的 `type` 也可以加上该命名空间，举个例子：

```html
<Button
  on-user-remove.remove-button="removeUser()"
/>
```

这里监听的事件名称是 `userRemove`，事件命名空间是 `removeButton`，可以发现，事件命名空间同样会经过 `camelize` 处理。

> 关于事件命名空间，参考 **事件处理** - **事件命名空间**

最后，需要特别注意，组件事件名称和转换后的事件名称 `不能相同`，否则会报错，举个例子：

```html
<Button
  on-click="click"
/>
```

这种写法没有任何意义，冒泡事件本就可以直接处理，没必要再转换一个相同的事件。

综上，为了保证统一且规范的开发风格，我们在此给出事件名称的最佳实践，如下：

* 事件转换或调用 `fire(type)` 中的 `type`，使用驼峰格式，更符合 `JavaScript` 习惯
* 模板 `on-[type]` 中的 `type`，使用连字符格式，更符合 `HTML` 习惯

### 配置 events

转换后的事件，可以通过配置 `events` 监听。

```js
{
  events: {
    submit: function (event, data) {
      // this 指向当前组件实例
    }
  }
}
```

## 调用方法

你也可以调用 `methods` 定义的方法。

在 `元素节点` 调用方法，默认会传入事件对象，如下：

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

在 `组件节点` 调用方法，默认会传入事件对象和数据对象，如下：

```html
<Button on-click="submit()">
```

```js
{
  methods: {
    submit: function (event, data) {
      // this 指向触发事件的组件实例
    }
  }
}
```

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

如果不需要阻止事件的默认行为，调用 `event.stop()` 更为合适。

> 返回 `false` 相当于 `event.prevent()` + `event.stop()`

```js
{
  events: {
    submit: function (event) {
      event.stop()
    }
  }
}
```

> `event.stop()` 是 `event.stopPropagation()` 的简单版本。


## 阻止事件默认行为

在事件处理函数中，调用 `event.prevent()` 可以阻止事件的默认行为。

```js
{
  events: {
    submit: function (event) {
      event.prevent()
    }
  }
}
```

> `event.prevent()` 是 `event.preventDefault()` 的简单版本。


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

## 绑定事件

调用 Yox 实例的 `on()` 方法手动绑定事件，如下：

```js
this.on(type, ?listener)
```

当 `type` 是个对象时，可绑定多个事件，如下：

```js
this.on({
  click1: function () {

  },
  click2: function () {

  },
  ...
})
```

如果响应一次事件后就要解绑事件，可换成 `once()` 方法。

## 解绑事件

调用 Yox 实例的 `off()` 方法手动解绑事件，如下：

```js
this.off(type, ?listener)
```

如果不传 `listener`，则解绑该 `type` 绑定的所有事件处理函数。

## 触发事件

向上发射事件，即冒泡事件，它会一直冒泡到根组件。

```js
this.fire('submit')
```

向上发射事件，并带上一些数据。

```js
this.fire('submit', { name: 'yox' })
```

> 注意：数据必须是个 `Object`

向下发射事件，事件会一层接一层的往下传递，直到尽头。

```js
this.fire('submit', true)
this.fire('submit', { name: 'yox' }, true)
```

## 事件命名空间

`Yox` 实例还支持事件命名空间，前面提到的所有事件的命名空间都是 `""`，因此你感觉不到命名空间的存在。

绑定事件，其实可以指定事件的命名空间，如下：

```js
// 不指定命名空间
this.on('submit', function () {})
// 指定命名空间为 button
this.on('submit.button', function () {})
```

如果触发了 `submit` 事件，这两个事件处理函数都会执行，如下：

```js
this.fire('submit')
```

> 如果触发的事件没有命名空间，则不会判断事件处理函数的命名空间是否匹配

如果触发了 `submit.button` 事件，只有第二个事件处理函数会执行，如下：

```js
this.fire('submit.button')
```

> 如果触发的事件包含命名空间，则会判断事件处理函数的命名空间和触发事件的命名空间是否匹配

如果触发了 `submit.xx` 事件，则两个事件处理函数都不会执行，如下：

```js
this.fire('submit.xx')
```

> 因为命名空间不匹配

解绑事件，也可以指定事件的命名空间，如下：

```js
this.off('submit.button', listener)
```

当你指定命名空间后，`事件名称`、`事件命名空间` 和 `事件处理函数` 三者必须同时匹配才能解绑成功。

如果不传 `listener`，绑定到 `submit.button` 的所有事件都会被解绑，如下：

```js
this.off('submit.button')
```

> 只要匹配 `事件名称` 和`事件命名空间` 就能解绑成功

你甚至可以不传 `事件名称`，这样可以解绑某个命名空间下的所有事件绑定，如下：

```js
this.off('.button')
```

> 只要匹配 `事件命名空间` 就能解绑成功

## 事件对象

当 `DOM 事件` 或 `组件事件` 触发后，Yox 会把它封装成 `Yox.Event`，它有如下属性：

* `type`: 事件名称 + 事件命名空间（如果有的话）
* `target`: 是哪个组件发出的事件
* `originalEvent`: 被封装的原始事件
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
