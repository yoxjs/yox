
## 数据操作

### get(keypath)

获取数据。

### set(keypath, value)

设置一项数据。

### set(data)

批量设置多项数据。

如果选择了同步更新模式，多次调用 `set` 建议使用 `set(data)` 的形式，避免多次渲染，浪费性能。

### updateModel(data)

只更新数据，不更新视图。

## 事件处理

### on(type, listener)

监听事件。

### off(type, listener)

取消监听事件。

### once(type, listener)

监听一次事件就取消。

### fire(type, ?data, ?noBubble): boolean

触发事件。

调用 `fire()` 触发事件默认会冒泡到根组件，如果明确不需要冒泡，可为 `noBubble` 参数传 `true`。

该方法返回一个布尔值，表示事件流是否正常结束（即没有被中断）。

## 数据监听

### watch(keypath, watcher)

监听数据变化。

### watchOnce(keypath, watcher)

监听一次数据变化就取消。

## 工具方法

### toggle(keypath)

取反 `keypath` 对应的数据。

### increase(keypath, ?step, ?max)

递增 `keypath` 对应的数字。

默认递增 `1`，可配置增量，也可配置递增的最大值。

### decrease(keypath, ?step, ?min)

递减 `keypath` 对应的数字。

默认递减 `1`，可配置减量，也可配置递减的最小值。

## 生命周期

### updateView()

只更新视图，不更新数据。

### dispose()

销毁组件。
