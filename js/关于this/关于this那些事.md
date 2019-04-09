> 果然，人尼玛都是有惰性的，我...食言了。上周没有更新，罪过罪过。

**1. this指向调用者**
```
var a = 'outer';
var obj = {
    a: 'inner',
    getA: function () {
        console.log(this.a);
    }
}

var getA = obj.getA;

obj.getA(); // inner
getA(); // outer
```
- 为什么`obj.getA()`输出`inner`？

   > 因为调用`getA()`的是`obj`，于是`this`指向`obj`。所以`this.a`就是`inner`了。
   
- 为什么`getA()`输出`outer`？

   > 因为调用`getA()`的不是`obj`，而是全局变量`window`了。所以`this.a`就是`outer`了。

**2. 关于构造函数中的this**
```
function Test1() {   
  this.name = 'c';
}
function Test2() {   
  this.name = 'c';  
  return 'c';
}
function Test3() {   
  this.name = 'c';  
  return null;
}
function Test3() {   
  this.name = 'c';  
  return {};
}
var test1 = new Test1();  
var test2 = new Test2();  
var test3 = new Test3();  
var test4 = new Test4();  
console.log(test1.name); // c
console.log(test2.name); // c
console.log(test3.name); // c
console.log(test4.name); // undefined
```

> 这部分跟`new`操作符有相当大的关联，我准备单独写一篇

- 当构造函数显示返回一个值类型的结果或者`null`时，该结果将被丢弃
- 当构造函数返回一个引用类型结果时，才会被当作`new`操作符得到的结果

**3. 严格模式下的this**

> 记得之前某天，还和 @淼哥 讨论这个问题来着。可惜我太水了，当时忘了这茬了。

```
function fn () {
    'use strict';
    console.log(this); // undefined
}

function Person () {
    'use strict';
    console.log(this); // Person
}
```

- 严格模式下，`this`指向`undefined`。呵呵哒
- 构造函数，使用`new`操作符时，`this`还是指向该实例对象。 

**4. 事件处理函数的this**
```
var btn1 = document.getElementById('btn1');
btn1.onclick = function () {
    console.log(this); // btn1
}

var btn2 = document.getElementById('btn2');
document.addEventListener('click', function () {
    console.log(this); //btn2
})
```
事件处理函数的`this`指向绑定元素


**5. 匿名函数、立即执行函数等，this指向window**

```
setTimeout(function () {
    console.log(this); // window
}, 1000);

(function () {
    console.log(this); //window
})();
```

**6. ES6中的箭头函数的this**
```
var name = 'Tom',
var obj = {
    name: 'Jack',
    sayName1: function () {
        console.log(this.name); // Jack
    },
    sayName2: () => {
        console.log(this.name); // Tom
    }
}
```
### ***箭头函数中没有`this`，其`this`来自于父执行上下中的`this`。***

### ***父！执！行！上！下！文！***

上面的代码中，`obj`是个简单对象，没有上下文。所以，`sayName2`的***父执行上下文***就是***全局上下文***，即`window`。所以输出`Tom`。

```
var obj = {
  name: 'a',
  fn: function () {
    var f = () => {
      console.log(this);
    }
    f();
  }
}
obj.fn(); // obj
var fn = obj.fn;
fn(); // window
```

上面的代码中，`obj.fn`是个函数，有执行上下文。`f`是箭头函数，其`this`来自`obj.fn`。所以，执行`obj.fn()`时，`fn`的`this`是`obj`(具体原因见第一条原则)，而`f`的`this`来源于`fn`，所以，`f`的`this`指向`obj`。

执行`fn()`时，`fn`的`this`为`window`，此时，`f`的`this`也为`window`