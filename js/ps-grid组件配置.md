# 配置项

## 示例
```
{
  columns: [{
    key: '',
    label: '',
    type: '',
    relate: {},
    format: {},
    add: {
        type: '',
        config: {},
        options: {},
        watch: {
            key: '',
            handler: function (d, next) {}
        }
    },
    edit: {
        type: '',
        config: {},
        options: [],
        watch: {
            key: '',
            handler: function (d, next) {}
        }
    }
  }],
  url: "resourceUIService.getAllGatewaysByCondition",
  parameter: {},
  data: [],
  inlineAddConfirm: function (row, next) {},
  inlineEditConfirm: function (new, old, next) {}
}
```
## 表格配置项说明

配置 | 类型 | 说明  | 备注 | 是否必须
---|---|---|---  |--- 
`columns` | `Array` | 表格列 |  简写方式`[['xxx',  '']]`，暂不支持简写方式，之后添加。详细字段含义参见下文“列配置项说明” | 是
`url` | `String|Array` | 数据请求接口 |  `Array`类型暂不支持，先不要配置为`Array`类型 | 否
`parameter` | `<Any>` | 接口参数 |  | 否 |
data | `Array` | 表格数据 |  当设置`url`时，该属性将被忽略，表格数据将采用从接口请求回来的数据 | 否
`inlineAddConfirm` | `function` | 行内添加时，点击确认后执行的函数|参数有两个，第一个为当前添加的数据`row`，`next`为执行完函数之后所必要调用的 | 否
`inlineEditConfirm` | `function` | 行内编辑时，点击确认后执行的函数| 参数有三个，第一个为编辑后的数据`newRow`，第二个为编辑后的数据`oldRow`，`next`为执行完函数之后所必要调用的 | 否


## 列配置项说明
配置 | 类型 | 说明 | 可选值 | 默认值 | 备注 | 是否必须
---|---|--- | --- | --- | --- | ---
`column.key` | `String` | 对应数据的`key`值 |  | 无 |  |  是
`column.label` | `String` | 表头文字 |  | 无 | | 是
`column.relate` | `Object|String` | 定义关联属性 |  | 无 | 暂不支持`String` | 否 
`column.format` | `Object|String` | 定义格式化 | | 无 | 暂不支持`String`  | 否
`column.type` | `String` | 编辑类型 | `text|link|input|select`等 | `text` |  | 否
`column.add` | `Object` | 行内添加时的一些配置 |  |  | | 否
`column.add.type` | `String` | 行内添加时的类型 | `input|select|tree`等 | `column.type` | 当该字段缺省时，默认取`column.type` | 否
`column.add.type` | `String` | 行内添加时的类型 | `input|select|tree`等 | `column.type` | 当该字段缺省时，默认取`column.type` | 否
`column.add.config` | `Object` | 行内添加时的对应组件的配置 |  |  | 当该字段会被当做组件的`config`值 | 否
`column.add.options` | `Array|Object` | 行内添加时的对应组件的`options` |  |  | 当该字段会被当做组件的`options`值 | 否
`column.add.watch` | `Object` | 行内添加的监听 | | | | 否
`column.add.watch.key` | `String` | 行内添加时需要监听的字段 | | | | 否
`column.add.watch.handler` | `function` | 行内添加时需要监听的字段发生变化时，需要执行的`function` | | | | 否
`column.edit` | `Object` | 行内编辑时的一些配置 |  |  | | 否
`column.edit.type` | `String` | 行内编辑时的类型 | `input|select|tree`等 | `column.type` | 当该字段缺省时，默认取`column.type` | 否
`column.edit.type` | `String` | 行内编辑时的类型 | `input|select|tree`等 | `column.type` | 当该字段缺省时，默认取`column.type` | 否
`column.edit.config` | `Object` | 行内编辑时的对应组件的配置 |  |  | 当该字段会被当做组件的`config`值 | 否
`column.edit.options` | `Array|Object` | 行内编辑时的对应组件的`options` |  |  | 当该字段会被当做组件的`options`值 | 否
`column.edit.watch` | `Object` | 行内编辑的监听 | | | | 否
`column.edit.watch.key` | `String` | 行内编辑时需要监听的字段 | | | | 否
`column.edit.watch.handler` | `function` | 行内编辑时需要监听的字段发生变化时，需要执行的`function` | | | | 否



