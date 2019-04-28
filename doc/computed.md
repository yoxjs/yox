如果某个数据不能直接 `get()` 出来，或是用简单的表达式求值，那么就应该使用 `计算属性`。

## options

计算属性支持以下配置：

* `get`: 取值函数，必填，参数列表是 `()`
* `set`: 设值函数，可选，参数列表是 `(value)`
* `cache`: 是否开启缓存，默认为 `true`
* `deps`: 指定依赖，类型是长度大于 0 的数组，如果手动指定依赖，则不会自动收集

如果 `options` 是个函数，则内部转换为如下格式：

```js
{
  get: options
}
```

## get

如果未配置 `deps`，执行计算属性的取值函数会自动发现并收集依赖，举个例子：

```js
{
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  }
  computed: {
    fullName: function () {
      return this.get('firstName') + ' ' + this.get('lastName')
    }
  }
}
```

执行 `fullName` 的取值函数，会读取 `firstName` 和 `lastName`，因此 `fullName` 的依赖便是 `['firstName', 'lastName']`。

我们认为取值函数中的任何 `get(keypath)` 都是当前计算属性的依赖，这样很好用不是吗？

## set

设值函数不太常用，举个例子自行感受：

```js
{
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  }
  computed: {
    fullName: {
      get: function () {
        return this.get('firstName') + ' ' + this.get('lastName')
      },
      set: function (value) {
        var names = value.split(' ')
        this.set('firstName', names[0])
        this.set('lastName', names[1])
      }
    }
  }
}
```

## cache

执行计算属性的取值函数后，会把结果缓存起来，只有当计算属性的依赖发生变化时，才会重新执行取值函数，并再次缓存。

如果希望每次 `this.get('computedName')` 都会执行取值函数，可把 `cache` 配置为 `false`。

> 建议不要关闭缓存，除非调试

```js
{
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  }
  computed: {
    fullName: {
      cache: false,
      get: function () {
        return this.get('firstName') + ' ' + this.get('lastName')
      }
    }
  }
}
```

## deps

前面提到，取值函数会自动收集依赖，在大多数情况下，这种自动化机制都能工作的很好。

有时候，取值函数中的 `this.get(keypath)` 并不能代表它的真实依赖，遍历数组就是一个很好的例子，如下：

```js
{
  data: {
    list: [
      { checked: false },
      { checked: false }
    ]
  },
  computed: {
    allChecked: function () {
      var list = this.get('list')
      for (var i = 0, len = list.length; i < len; i++) {
        if (!list[i].checked) {
          return false
        }
      }
      return len > 0
    }
  }
}
```

从 `allChecked` 的取值函数可以看出，它的依赖只有 `list`。

我们将 `list.0.checked` 和 `list.1.checked` 设为 `true`，发现 `allChecked` 的值没有变化，因为它的依赖 `list` 没有变化。

怎么解决这个问题呢？

毫无疑问，关闭缓存是最简单直接的方式，但我们并不推荐这样做。

其实，配置 `deps` 才是最合适的方式，既然计算属性**自动**收集的依赖错了，那我们就**手动**为它指定依赖。

```js
{
  data: {
    list: [
      { checked: false },
      { checked: false }
    ]
  },
  computed: {
    allChecked: {
      deps: ['list', 'list.*.checked'],
      get: function () {
        var list = this.get('list')
        for (var i = 0, len = list.length; i < len; i++) {
          if (!list[i].checked) {
            return false
          }
        }
        return len > 0
      }
    }
  }
}
```

`['list', 'list.*.checked']` 的意思是，当整个数组变了，或者数组某一项的 `checked` 变了，都要重新执行取值函数。

> 更多内容，参考 **数据监听** - **通配符**