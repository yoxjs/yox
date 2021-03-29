Yox 内置了一个简易的 `分级` 日志打印器，支持以下五个日志等级：

* `Yox.logger.DEBUG`: 一般的信息
* `Yox.logger.INFO`: 比较重要的信息
* `Yox.logger.WARN`: 发生了不符合预期的行为
* `Yox.logger.ERROR`: 发生了严重的错误
* `Yox.logger.FATAL`: 发生了致命的错误，程序中断

它们分别对应以下五个打印函数：

* `Yox.logger.debug(msg)`
* `Yox.logger.info(msg)`
* `Yox.logger.warn(msg)`
* `Yox.logger.error(msg)`
* `Yox.logger.fatal(msg)`

默认情况下，`源码版` 是 `INFO` 等级，`压缩版` 是 `WARN` 等级。

也就是说，`源码版` 版本会打印 `INFO`/`WARN`/`ERROR`/`FATAL` 四种日志，`压缩版` 会打印 `WARN`/`ERROR`/`FATAL` 三种日志。

如果你希望改变这个行为，可以修改全局变量 `YOX_LOG_LEVEL`，如下：

```js
Yox.config.logLevel = Yox.logger.ERROR
```

> Yox.config 自 `1.0.0-alpha.203` 版本开始支持，之前的版本请使用 `window.YOX_LOG_LEVEL`

修改 `YOX_LOG_LEVEL` 是实时生效的，也就是说，即使上一秒还在打印 `DEBUG` 日志，一旦把 `YOX_LOG_LEVEL` 修改为 `ERROR`，之后便只会打印 `ERROR` 和 `FATAL` 日志。