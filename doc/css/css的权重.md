> 人间四月芳菲尽，山寺桃花始盛开。 ——唐 白居易《大林寺桃花》

### 权重的五个等级及其权重


种类 | 权重
---|---
`!important` | 10000
行内样式 | 1000
id选择器 | 100
class、属性选择器、伪类选择器 | 10
标签选择器、伪元素选择器 | 1

### 规则总结
1. 行内样式总会覆盖外部样式表的任何样式(除了`!important`)
2. 单独使用一个选择器的时候，不能跨等级使css规则生效
3. 如果两个权重不同的选择器作用在同一元素上，权重值高的css规则生效
4. 如果两个相同权重的选择器作用在同一元素上，以后面出现的选择器为最后规则

##### 第二条规则

```
#test11 {
    color: red;
}
  
.test1 .test2 .test3 .test4 .test5 .test6 .test7 .test8 .test9 .test10 .test11 {
    color: blue;
}
<div class="test1">
  <div class="test2">
    <div class="test3">
      <div class="test4">
        <div class="test5">
          <div class="test6">
            <div class="test7">
              <div class="test8">
                <div class="test9">
                  <div class="test10">
                    <div class="test11" id="test11">
                      css权重
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```
最终还是表现为红色。按理说，十一个`class`选择器权重为`110`，`id`选择器权重为`100`，`110 > 100`，应该表现为蓝色。因为`class`选择器和`id`选择器不是一个等级的，再多的`class`也会被一个`id`干掉。
> 想想那些网络小说里常说的一句话，“不成圣，终为蝼蚁”。多少准圣在圣人眼里，也不过是一只大一点的蝼蚁。没到哪个境界，啥都不是。比如镇元子，被周青一根手指头捏死了。

##### 第三条规则
```
.test #test{ } // id + class = 100 + 10 = 110
.test #test span{} // id + class + element = 100 + 10 + 1 = 111
.test #test .sonClass{} // id + class + class = 100 + 10 + 10 = 120
```
第三条样式生效。这个不用多说了，如果不是这样，权重还有毛线用。

##### 第四条规则
```
<div id="app">
    <div class="test" id="test">
        啦啦啦
  </div>
</div>
<style>
#test span{
  color:blue;
}
#app span{
  color: red;
}
</style>
```
表现为红色，因为权重相同(权重都是`110`)，但是红色的样式后出现，所以，表现为红色。

------------------------------
### 后记
用过一段时间的`scss`、`less`写样式，因为大多只用了嵌套，所以多多少少有一些关于权重的问题。

嗯 ~ ~ ~ 感觉`BEM`或许更适合中大型项目一些？
