# flex布局
> 我才不会说是因为自己对`flex`一知半解导致面试的时候被问住，所以才来记录的。感谢阮一峰大神的博客[文章](http://www.ruanyifeng.com/blog/2015/07/flex-examples.html)

**9102年了，是时候记录一波`flex`布局了。**

> 写在前面，其实`flex`布局并没有多难，记住一些属性即可。然而之前由于自己懒癌作祟，导致总是对`flex`一知半解。面试的时候，不能说挂在这道题上，但总是答得不好。**君子博学而日参省乎己**，学习不可半途而废，不可拖延懒散，勉之。

1. **HOW**
> 为一个元素设置`display: flex`即可
```
.box {
    display: flex;
    display: -webkit-flex;
}
```
2. **采用`flex`布局的元素，成为`flex`容器，子元素称为`flex`项目**
3. **容器默认存在两根轴**
   - 水平的主轴`main axis`
   - 垂直的交叉轴`cross axis`
   - 主轴开始位置叫做`main start`，结束位置叫做`main end`
   - 交叉轴开始位置叫做`cross start`，结束位置叫做`cross end`
   - 项目默认沿主轴排列
 4. **容器的属性**
    - flex-direction：决定主轴的方向
       - row：默认值，主轴为水平方向，起点在左端
       - row-reverse：主轴为水平方向，起点在右端
       - column：主轴为垂直方向，起点在上沿
       - column-reverse：主轴为垂直方向，起点在下沿
    - flex-wrap：默认情况下，项目都排列在一条线(***轴线***)。如果一条轴线上排列不下项目，如果换行
       - nowrap：默认，不换行
       - wrap：换行
       - wrap-reverse：换行，第一行在下方
    - flex-flow：`flex-direction`和`flex-wrap`的简写形式，默认值是`row nowrap`
    - justify-content：定义项目在主轴的对齐方式
       - flex-start：默认值，左对齐
       - flex-end：右对齐
       - center：居中
       - space-between：两端对齐，项目之间间隔都相等
       - space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。
    - align-items：定义项目在交叉轴上如何对齐
       - flex-start：交叉轴的起点对齐
       - flex-end：交叉轴的终点对齐
       - center：交叉轴的终点对齐
       - baseline：项目的第一行文字的基线对齐
       - stretch：默认值。如果项目未设置高度或设为auto，将占满整个容器的高度。 
    - align-content：定义多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。
       - flex-start：与交叉轴的起点对齐。
       - flex-end：与交叉轴的终点对齐。
       - center：与交叉轴的中点对齐。
       - space-between：与交叉轴两端对齐，轴线之间的间隔平均分布。
       - space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
       - stretch：默认值，轴线占满整个交叉轴。
5. **项目的属性**
   - order：项目的排列顺序，数值越小，排列越靠前
   - flex-grow：项目的放大比列。默认为0，即，如果存在剩余空见，也不放大
      - 如果所有项目的`flex-grow`的属性都为`1`，他们将等分剩余空间。如果某个项目的`flex-grow`属性为`2`，其他项目都为`1`，在前者占据剩余空间比其他项多一倍
   - flex-shrink：项目的缩小比例。默认为1，即，如果空间不足，该项目将缩小。
   - flex-basis：定义在分配多余空间之前，项目占据的主轴空间。默认值为`auto`，即项目的本来大小。
      - 可以设置为跟`width`和`height`一样的值，这样的话，项目将占据固定空见
   - flex：`flex-grow`、`flex-shrink`、`flex-basis`的简写，默认值是`0 1 auto`
      - 有两个快捷值，`auto(1 1 auto`)和`none(0 0 auto)`
      - 优先使用这个属性，而不是三个分离的属性
   - align-self：允许单个项目有与其他项目不一样的对齐方式，可覆盖`align-items`属性，默认值是`auto`，表示继承父元素的`align-items`属性。