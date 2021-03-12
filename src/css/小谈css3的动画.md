> 醉卧沙场君莫笑，古来征战几人回。 —— 唐 王翰 《凉州词》

`CSS3`中的动画分两种
1. 使用`transition`
2. 关键帧动画`key-frame`

##### transition
`transition`属性是`transition-property`，`transition-duration`，`transition-timing-function` 和 `transition-delay` 的简写属性。这个属性可以被指定为一个或者多个属性的过渡效果，比如下面的代码
```
transition: all 2s ease-in;
transition: top 2s ease-in, color 1s;
```
具体不多说，关于这个属性，说一点我认为重要的。

有时候，我们需要用`js`操作样式，设置`transition`后，需要在动画结束时执行某些代码。这时候要怎么做。

有一个事件 `transitionend` ，在对应`dom`上监听该事件，执行相应的代码

```
element.addEventListener('transitionend', function () {
    // do something
    
    // 执行完之后，移除事件监听
    element.transitionEndEventHandler = arguments.callee;
    element.removeEventListener('transitionend', element.transitionEndEventHandler);
});
```
除此之外还有几个相关事件
```
element.addEventListener('transitionrun', function() {
  // do something
});

element.addEventListener('transitionstart', function() {
  // do something
});
```

##### 关键帧动画 key-frame

通过设置关键帧，以及`animation`完成
`animation`的子属性有
1. animation-delay：设置延时，即从元素加载完成之后到动画序列开始执行的这段时间。
2. animation-direction：设置动画在每次运行完后是反向运行还是重新回到开始位置重复运行。
3. animation-duration：设置动画一个周期的时长。
4. animation-iteration-count：设置动画重复次数，可以指定infinite无限次重复动画
5. animation-name：指定由@keyframes描述的关键帧名称。
6. animation-play-state：允许暂停和恢复动画。
7. animation-timing-function：设置动画速度，即通过建立加速度曲线，设置动画在关键帧之间是如何变化。
8. animation-fill-mode：指定动画执行前后如何为目标元素应用样式
```
p {
    animation: slidein 3s;
}

@keyframes slidein {
  from {
    margin-left: 100%;
    width: 300%; 
  }

  to {
    margin-left: 0%;
    width: 100%;
  }
}
```

主要说一下`animation-fill-mode`这个属性值。有时会发现，如果不设置该属性，动画执行完之后，会保持初始样式。这是我们所不希望的，可设置该属性为`forwards`。
```
p {
    animation: slidein 3s ease-in forwards;
}
```

同时，`animation`也有对应的若干事件
```
element.addEventListener("animationstart", listener, false);
element.addEventListener("animationend", listener, false);
element.addEventListener("animationiteration", listener, false);
```

> 没什么心情写，马马虎虎，随随便便写了一点。囧

