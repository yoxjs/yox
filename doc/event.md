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

为什么要做这种看似多此一举的事呢？

对于监听 DOM 事件来说，转换意味着**语义化**，语义化让代码逻辑更加清晰，这一点是显而易见的。

> `click` 没有业务层面的意义，`submit` 则不然，它意味着你可能即将向服务器提交一个请求。

事件转换有一个 `副作用`，转换后的事件会一直冒泡到根组件，正因为如此，我们建议事件应该越语义化越好，这样当父组件接收到子组件发出的事件时，才不会无所适从。

> 如果不需要事件冒泡，请调用方法

转换后的事件，可以通过配置 `events` 监听，也可以调用 `on()` 监听。

```js
{
  events: {
    submit: function (event) {
      // this 指向当前组件实例
      console.log(this, event)
    }
  },
  afterMount: function () {
    this.on('submit', function (event) {
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

如果需要自定义调用参数，可能会用到特殊变量，如下：

```html
<button on-click="submit(name, $event, $keypath)">
  Submit
</button>
```

> 更多内容，参考 **模板语法** - **特殊变量**


## 阻止事件冒泡

事件转换，会触发事件冒泡，事件冒泡过程中，任何一个事件处理函数，返回 `false` 或调用 `event.stop()` 可以阻止事件继续冒泡。

> 返回 `false` 相当于 `event.prevent()` + `event.stop()`
>
> 如果你不需要阻止事件默认行为，调用 `event.stop()` 更为合适

```js
{
  events: {
    submit: function (event) {
      // 1. return false;
      // 2. event.stop();
    }
  }
}
```

> `event.stop()` 等价于 `event.stopPropagation()`


## 阻止事件默认行为

事件处理函数调用 `event.prevent()` 可以阻止事件默认行为。

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

## 事件对象

事件对象具有以下属性：

* `type`: 事件名称
* `target`: 是哪个组件发出的事件
* `originalEvent`: 原始事件
* `isPrevented`: 是否已阻止事件的默认行为
* `isStoped`: 是否已停止事件冒泡
* `listener`: 处理当前事件的监听器

下面用一个例子说明为什么要加 `listener` 属性，如下：

```js
{
  events: {
    submit: function (event) {
      // event.listener 指向当前正在执行的事件处理函数
      // 非常便于事件解绑
      this.off('submit', event.listener)
    }
  }
}
```