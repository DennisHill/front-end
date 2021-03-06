> 本文为CSDN博主「dm_vincent」的原创文。[原文地址](https://destiny1020.blog.csdn.net/article/details/50344395)

# scope功能概述
`scope`是`AngularJS`中的核心概念之一。它的设计思想和实现方式也是希望深入了解和学习`AngularJS`的开发人员必须熟知的。

它的功能主要有以下几点：
- 通过数据共享连接`Controller`和`View`
- 事件的监听和响应
- 脏数据检查和数据绑定

前两点并没有什么新奇的地方，关键的地方在于第三点。这是`AngularJS`这一框架和好多其它框架的不同之处，也是`AngularJS`的一大卖点。

本文也着重描述这一部分。

所谓脏数据检查(`Dirty Checking`)，实际上是一种概念而不是指具体的某种技术。根据应用的场景，不同的技术都会选择实现这一概念，比如`Java`中的`ORM`框架`Hibernate`也实现了脏数据检查。

在`AngularJS`中，脏数据检查在`scope`这一对象中通过`$digest`方法实现。但是一般认为`$digest`方法过于底层，更加推荐使用`$apply`方法。该方法算是对`$digest`方法的一层包装吧。

第一次接触这两个方法的同学可以参考之前我翻译过的一篇文章来建立基本概念：
[理解Angular中的$apply()以及$digest()](http://blog.csdn.net/dm_vincent/article/details/38705099)

然而，如果仔细阅读`AngularJS`的源码就能够发现还有很多值得注意和学习的地方，且听我一一道来。

首先，我们需要明白这个`$digest`方法到底是用来干什么的，为什么需要有这个方法。

使用`jQuery`这种库开发过`Web`应用的同学们都知道，每次在获取了所需要的数据之后，需要写不少代码去把`DOM`折腾一番，让前端的`View`能够反映出最新的数据。这个过程不仅繁琐易出错而且写多了也很无聊。

在桌面应用开发中，这种数据同步的问题也没少出现，于是就顺理成章的出现了数据绑定。比如`.NET`框架的`WinForm`以及最新的`WPF`，都支持这一技术。

所谓数据绑定，实际上就是为前端部分的占位符和后台的对应数据建立一种关联关系。这个关联关系可以是双向的，也可以是单向的。

单向的数据绑定就是后台数据的动态更新能够实时自动地同步到前端。而双向的数据绑定则是在单向数据绑定的基础之上，实现了前端数据的动态更新也能自动实时地同步到后台。

注意以上提到的后台，指的就是容纳该数据变量的地方。应用于`AngularJS`这个场景，也就对应着`scope`。

那么这种能够节省前端开发人员大量时间的神奇技术，是如何实现呢？

首先，很明显的一点是需要有一种办法能够在一方数据发生变化的时候，通知另一方：嗨，我这里的数据更新了，请你也更新一下吧。看到这个需求，很多同学肯定能够不假思索地回答：使用事件不就好了！
但是！这样以来，不又走到了`jQuery`那一套`bind/on`的老路子上了嘛。最后还是需要开发人员一个个的注册事件，写响应事件的回调函数。什么都没有改变！

所以，`AngularJS`为了不走寻常路，设计一套截然不同的方案来解决了数据绑定的问题。这种方案不需要开发人员写任何事件相关的注册代码和响应代码。这就导致了`Digest Cycle`的诞生，也就是`$digest`方法。

目前看来，`$digest`方法需要完成两件事情才能实现数据绑定：
- 确定此次检查和上一次检查的这段时间内，哪些数据发生了变化
- 对于改变了的数据，设法通知到另一端(如果是后台变化了，那么就需要通知到前端)；没改变的数据则不需要处理

可是光看看第一条就觉得挺难的，又不让利用事件系统，如何知道哪些数据发生了变化…… 那就让`AngularJS`帮你完成事件的注册和监听吧！在`AngularJS`版的`Hello World`中不是有这样的代码嘛：

```
// JavaScript Code
$scope.hello = 'Hello World';

<!-- HTML Code -->
{{ hello }}

```
利用再HTML中写下`{{ hello}}`这种表达式，`AngularJS`就能够帮你自动注册并监听`hello`这个变量的改变。那么它是如何完成注册工作的呢？实际上，`AngularJS`会首先将你在`{{ }}`中声明的表达式编译成函数并调用`$watch`方法。这里出现了一个新的概念`$watch`方法，这个方法很接近事件的注册和监听：

```
$scope.$watch(
    function(scope) { return scope.someValue; },
    function(newValue, oldValue, scope) { 
    // listener code defined here 
    }
);
```

`$watch`方法的第一个参数是一个函数，它通常被称为`watch`函数，它的返回值声明需要监听的变量；第二个参数是`listener`，在变量发生改变的时候会被调用。这样看来它和传统的事件注册和监听并没有什么本质上的差别，差别仅在于`AngularJS`能够帮你自动注册绝大多数的`change`事件并监听它们，只要你按照`AngularJS`要求的语法来写`HTML`中的表达式代码，即`{{ }}`。`$watch`方法为当前`scope`注册了一个`watcher`，这个`watcher`会被保存到一个`scope`内部维护的数组中。

那么现在既然已经注册了需要监听的变量并赋予了`listener`函数，什么时候才会触发`listener`函数呢？是时候让`$digest`方法登台亮相了，在`$digest`函数中，会逐个检查`$watch`方法中注册的`watch`函数，如果该函数返回的值和上一次检查中返回的值不一样的话，就会触发对应的`listener`函数。拿`{{ }}`表达式作为例子，该表达式编译得到的`listener`的行为就是将后台的最新变量给同步到前端。这么一来，就完成了一个简单的数据绑定。

好，现在明白了`$digest`方法用来触发`watchers`中的`listener`函数。那么什么时候会触发`$digest`方法呢？如果没有地方触发`$digest`方法，那么也没有办法完成整个数据绑定的流程。

答案就是`$apply`方法。这个方法能够触发`$digest`方法。`$digest`方法的执行就标志着一轮`Digest Cycle`的开始。

下篇文章将详细介绍`$digest`以及`$apply`方法的实现，敬请期待。