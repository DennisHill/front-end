> 冲天香阵透长安，满城尽带黄金甲。 ——唐 黄巢 《不第后赋菊》

现看一下`call`
```
var obj = {
    a: 'a'
}
function fn () {
    console.log(this);
}
fn.call(obj); // obj
```
先不考虑参数的情况下，如何改变`this`的指向呢？因为`this`的指向与调用者有关，考虑为对象临时新增一个属性，该临时属性就是原函数。然后再用这个对象调用这个函数。
```
Function.prototype.myCall = function (obj) {
    // 加一个临时属性
    obj._tempFunction = this;
    var ret = obj._tempFunction();
    // 删除临时属性
    delete obj._tempFunction
    return ret;
}
fn.call(obj); // obj
```
考虑到参数问题，用`arguments`处理一下，于是，则有如下
```
Function.prototype.myCall = function () {
    var that = arguments[0];
    // 加一个临时属性
    that._tempFunction = this;
    var ret = that._tempFunction(...Array.prototype.slice.call(arguments, 1));
    // 删除临时属性
    delete that._tempFunction
    return ret;
}
```
不过有一点瑕疵，`call`方法，在`ES1`标准就有了，但是`...`运算符是`ES6`的东西，`slice`是`ES3`的东西，所以，怎么办呢？

嗯~ ~ ~ ~ 

用`eval`
```
Function.prototype.myCall = function () {
    var that = arguments[0];
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    // 加一个临时属性
    that._tempFunction = this;
    var fnStr = 'that._tempFunction(';
    fnStr += args.join(',');
    fnStr += ')';
    var ret = eval(fnStr);
    // 删除临时属性
    delete that._tempFunction
    return ret;
}
```
到这里，貌似已经完成。但是。。。。。。
```
function fn () {
    console.log(this);
}
fn.call(true); // 布尔类型的包装类 Boolean
fn.call('string'); // 字符串类型的包装类 String
fn.call(2019); // 数字类型的包装类 Number
fn.call(undefined); // Window
fn.call(null); // Window
```
如果第一个参数是基本类型的数据，那么会有以上表现，于是。。。

```
Function.prototype.myCall = function () {
    var that = arguments[0];
    var type = typeof that;
    switch(type) {
        case 'number':
            that = new Number(that);
            break;
        case 'boolean':
            that = new Boolean(that);
            break;
        case 'string':
            that = new String(that);
            break;
        case 'undefined':
            that = window;
            break;
        default: 
            if (that === null) {
                that = window;
            }
            break;
    }
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    // 加一个临时属性
    that._tempFunction = this;
    var fnStr = 'that._tempFunction(';
    fnStr += args.join(',');
    fnStr += ')';
    var ret = eval(fnStr);
    // 删除临时属性
    delete that._tempFunction
    return ret;
}
```

说完`call`，那么`apply`也就很容易实现了。`apply`接收两个参数，第二个参数是函数参数列表数组，于是。。。
```
Function.prototype.myApply = function () {
    var that = arguments[0];
    var type = typeof that;
    switch(type) {
        case 'number':
            that = new Number(that);
            break;
        case 'boolean':
            that = new Boolean(that);
            break;
        case 'string':
            that = new String(that);
            break;
        case 'undefined':
            that = window;
            break;
        default: 
            if (that === null) {
                that = window;
            }
            break;
    }
    var args = [];
    for (var i = 0; i < arguments[1].length; i++) {
        args.push(arguments[1][i]);
    }
    // 加一个临时属性
    that._tempFunction = this;
    // 考虑到可能有返回值，所以最终返回 ret
    // 若没有返回值，则最终返回 undefined
    var fnStr = 'that._tempFunction(';
    fnStr += args.join(',');
    fnStr += ')';
    var ret = eval(fnStr);
    // 删除临时属性
    delete that._tempFunction
    return ret;
}
```

以上是我所理解的关于`call`和`apply`的模拟实现。

本人才疏学浅，如有疏漏，请指正。