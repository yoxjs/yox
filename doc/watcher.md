数据监听的场景非常多，不论是业务逻辑，或是框架的底层实现，都需要依靠它。

数据监听，有以下两种方式：

* 配置 watchers
* 调用 watch(keypath, watcher, ?options)

## Options

Yox 监听每一项数据变化都支持以下配置：

* `watcher`: 监听函数，参数列表是 `(newValue, oldValue, keypath)`
* `immediate`: 是否立即执行一次，默认为 `false`
* `sync`: 是否同步监听变化，默认为 `false`
* `once`: 是否只监听一次，默认为 `false`

## 配置 watchers

```js
{
  watchers: {
    // 简单版本，immediate/sync/once 都采用默认值
    name: function (newValue, oldValue, keypath) {
      // this 指向组件实例
    },
    // 可配置每一个 option
    age: {
      watcher: function (newValue, oldValue, keypath) {
        // this 指向组件实例
      },
      immediate: true
    }
  }
}
```

## 调用 watch()

```js
// 简单版本，immediate/sync/once 都采用默认值
this.watch(
  'name',
  function (newValue, oldValue, keypath) {
    // this 指向组件实例
  }
)

// 立即执行一次 watcher 的简单版本，sync/once 都采用默认值
// 考虑到 immediate 单词较长，不易拼写，才为它开了一个特例
this.watch(
  'name',
  function (newValue, oldValue, keypath) {
    // this 指向组件实例
  },
  true
)

// 完整版
this.watch(
  'name',
  {
    watcher: function (newValue, oldValue, keypath) {
      // this 指向组件实例
    },
    immediate: true
  }
)

// 终极版本，一次监听多个数据
this.watch({
  name1: {
    watcher: function (newValue, oldValue, keypath) {
      // this 指向组件实例
    },
    immediate: true
  },
  name2: {
    watcher: function (newValue, oldValue, keypath) {
      // this 指向组件实例
    },
    once: true
  }
})
```


## Keypath

`keypath` 的分隔符是 `.`，一个典型的例子是 `users.0.name`，可见即使是数组下标，最终也是通过 `.` 来访问。

所有的数据变化都是通过 `keypath` 进行分发。也就是说，如果你希望响应**数组**的变化，请用 `.` 的方式监听。


## 通配符

通配符，类似于磁盘路径中的 `glob`，如下：

* **\***：匹配一个段
* **\*\***：匹配任意长度的段

下面，我们用几个例子加深印象：

* `user.*`：匹配 `user` 的任意属性，如 `user.name`、`user.age`，但无法匹配 `user.name.familyName`
* `user.**`：匹配 `user` 的任意属性，且不限深度
* `users.*.name`：匹配 `users.0.name`、`users.1.name` 等，但无法匹配 `users.name`
* `users.**.name`：只要 `keypath` 以 `users.` 开头，以 `.name` 结尾就能匹配
* `**`：超级无敌的存在，可以匹配任意 `keypath`，且不限深度

```js
{
  watchers: {
    'users.*.name': function (newValue, oldValue, keypath) {
      console.log(keypath + ' is changed')
    }
  }
}
```

