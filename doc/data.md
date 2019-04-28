## 风格

Yox 采用了 `get()` 和 `set()` 的方式读写数据。

我们认为这将带来以下好处：

1. 兼容所有运行环境，因为没有使用任何高级 API
2. 保持数据的纯粹性，无需 `defineProperty` 或任何形式的改写
3. 无需在 `data` 写默认值（从代码可维护性考虑，建议写默认值）即可响应数据变化
4. `get('a.b.c.d.e.f.g')` 无需担心空异常

## get

```js
var value = this.get(keypath, defaultValue)
```

读取一个可能不存在的值，常见的做法如下：

```js
var value = this.get('name')
if (value == null) {
  value = 'yox'
}
```

为了减少模板代码，`get()` 方法提供了 `defaultValue` 参数，用于设置默认值。

```js
var value = this.get('name', 'yox')
```

> 以上两种写法不完全等价，如果获取的值正好是个 `undefined` 或 `null`，我们认为它是一个合理的返回值。只有获取的值 `不存在`，才会返回默认值。

读取数组数据，同样使用 `.`，而不要使用 `[]`，如下：

```js
// 支持
this.get('users.0.name')
// 不支持
this.get('users[0]name')
```

`get()` 方法会妥善处理数据为空的情况，无需担心空异常。

```js
// a、b、c、d、e、f 任何一个为空都不会报错
this.get('a.b.c.d.e.f.g')
// 如果这么写，空异常只能怪自己了
this.get('a.b.c.d.e.f').g
```

## set

```js
this.set(keypath, value)
```

`keypath` 参数如果是对象，可批量设值。

```js
this.set({
  name: 'yox',
  'user.name': 'yox',
  'users.0.name': 'yox'
})
```

`set()` 方法会自动创建不存在的对象。

默认状态下，数据格式如下：

```js
{

}
```

调用 `this.set('user.name', 'yox')` 后，数据格式如下：

```js
{
  user: {
    name: 'yox'
  }
}
```

为数组的某一项设值，比如 `this.set('users.0.name', 'yox')`，数据格式如下：

```js
{
  user: {
    name: 'yox'
  },
  users: {
    0: {
      name: 'yox'
    }
  }
}
```

> Yox 不知道 `users` 应该是个数组，这种情况请先创建数组。

前面提到的都是纯数据的操作，如果 Yox 作为视图层响应式框架，当视图的依赖发生变化时会自动更新视图，如下：

```html
<div>
  name: {{name}}
  age: {{age}}
</div>
```

此模板依赖了 `name` 和 `age`，它们中的任何一个发生了变化，都会更新视图。

```js
this.set('name', 'yox')
// 视图没有更新
this.nextTick(
  function () {
    // 视图更新了
  }
)
```

注意，更新视图的动作是异步的，也就是说，当你调用 `set()` 方法后，视图并不会立刻更新，原理和 Vue 相同。

## 数组操作

操作数组的方法比较多，我们内置了几个最常用的，如下：

* `append(keypath, item)`：在数组尾部添加元素，添加成功返回 `true`
* `prepend(keypath, item)`：在数组头部添加元素，添加成功返回 `true`
* `insert(keypath, item, index)`：指定元素的插入位置，插入成功返回 `true`
* `remove(keypath, item)`：从数组中删除一个元素，删除成功返回 `true`
* `removeAt(keypath, index)`：通过索引删除数组中的元素，删除成功返回 `true`

