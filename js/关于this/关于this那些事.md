> 本次主要总结在ES5，或者确切一点，是非箭头函数情况下的this。

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

> ES6中的箭头函数的`this`，又是另一种机制了，我现在了解的也不是特别的透彻。研究一下再总结。
