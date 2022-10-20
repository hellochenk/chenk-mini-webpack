# chenk-mini-webpack

[原文链接](https://jelly.jd.com/article/5fe434e8dfdd9d014fbb7584)

# webpack 基本原理

## 关键字:`AST`/`抽象语法书`

1. webpack 根据入口开始解析文件（@babel/paser）生成 AST
2. 分析AST的import信息，生成文件依赖关系描述 （这一部分需要递归操作）
3. 理解中...

最终将代码写入到bundle文件，完成webpack构建的工作
