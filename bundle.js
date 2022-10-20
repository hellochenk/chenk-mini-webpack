const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// 关键字： AST 抽象语法书
// webpack 构建/打包/压缩 等等一系列操作都需要基于AST进行

const getModuleInfo = (file) => {
  const body = fs.readFileSync(file, 'utf-8');
  // 将读取的文件内容转换为ast
  const ast = parser.parse(body, {
    // 表示我们要解析的是es6模块
    sourceType: 'module',
  });
  const deps = {};
  // 转换ast
  // 使用 traverse 遍历 ast
  traverse(ast, {
    // 抽取每个 ImportDeclaration node信息
    // 在AST当中还会有一些其他的 Declaration
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file);
      const absPath = './' + path.join(dirname, node.source.value);
      deps[node.source.value] = absPath;
    },
  });
  console.log(deps);
  // console.log(ast);
  // console.log('------------------------')
  // console.log(ast.program.body)
};
getModuleInfo('./src/index.js');
