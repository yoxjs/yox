## 数据操作

### get(keypath)

获取数据。

### set(keypath, value)

设置一项数据。

### set(data)

设置多项数据。

如果需要多次调用 `set`，建议用 `set(data)` 的形式，避免多次渲染。

### updateModel(data)

只更新数据，不更新视图。

### updateView()

只更新视图，不更新数据。

## 事件处理

### on(type, listener)

监听事件。

### off(type, listener)

取消监听事件。

### once(type, listener)

监听一次事件就取消。

### fire(type, data, bubble)

触发事件，事件可携带数据，也可指定是否冒泡到根组件。

## 数据监听

### watch(keypath, watcher)

监听数据变化。

### watchOnce(keypath, watcher)

监听一次数据变化就取消。

## 工具方法

### toggle(keypath)

取反 `keypath` 对应的数据。

## 生命周期

### dispose()

销毁组件。
