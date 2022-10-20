const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');
// 关键字： AST 抽象语法书
// webpack 构建/打包/压缩 等等一系列操作都需要基于AST进行

const getModuleInfo = (file) => {
  const body = fs.readFileSync(file, 'utf-8');
  // 将读取的文件内容转换为ast
  const ast = parser.parse(body, {
    // 表示我们要解析的是es6模块
    sourceType: 'module',
  });
  // ---- 查看ast结构 ----
  // console.log(ast);
  // console.log('------------------------')
  // console.log(ast.program.body)
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
  // console.log(deps);

  // 经过 babel 编译后的的代码
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });

  /**
   * @param file 文件路径
   * @param deps 依赖信息
   * @param code 编译后的代码
   */
  const moduleInfo = { file, deps, code };
  console.log(moduleInfo);
  return moduleInfo;
};

const parseModules = (file) => {
  // 定义依赖图
  const depsGraph = {};
  // 首先获取入口的信息
  const entry = getModuleInfo(file);

  const temp = [entry];
  for (let i = 0; i < temp.length; i++) {
    const item = temp[i];
    const deps = item.deps;
    if (deps) {
      // 遍历模块的依赖，递归获取模块信息
      for (const key in deps) {
        if (deps.hasOwnProperty(key)) {
          temp.push(getModuleInfo(deps[key]));
        }
      }
    }
  }
  temp.forEach((moduleInfo) => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code,
    };
  });
  console.log(depsGraph);
  return depsGraph;
};

// 生成最终可以在浏览器运行的代码
const bundle = file => {
  const depsGraph = JSON.stringify(parseModules(file))
  return `(function(graph){
      function require(file) {
          var exports = {};
          function absRequire(relPath){
              return require(graph[file].deps[relPath])
          }
          (function(require, exports, code){
              eval(code)
          })(absRequire, exports, graph[file].code)
          return exports
      }
      require('${file}')
  })(${depsGraph})`
}

build = file => {
  const content = bundle(file)
  // 写入到dist/bundle.js
  fs.mkdirSync('./dist')
  fs.writeFileSync('./dist/bundle.js', content)
}

build('./src/index.js')

// getModuleInfo('./src/index.js');
