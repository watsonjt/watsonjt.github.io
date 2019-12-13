var metalsmith = require("metalsmith"),
    pandoc = require("metalsmith-pandoc"),
    markdown = require('metalsmith-markdown'),
    layouts = require('metalsmith-layouts'),
    collections = require('metalsmith-collections'),
    inplace = require('metalsmith-in-place'),
    ignore = require('metalsmith-ignore'),
    nunjucks = require('nunjucks'),
    moment = require('moment'),
    cp = require('cp-file'),
    path = require('path'),
    fs = require('fs')

var getDir = (path_str)=>{
  var dirs = path_str.split(path.sep).slice(0,-1);
  if(dirs.length != 0)
    return dirs.pop();
  return "/"
}

var getNoteDict = (list)=>{
  var set = {}
    list.forEach((obj)=>{
    if(!set[getDir(obj.path)])
      set[getDir(obj.path)] = [obj]
    else
      set[getDir(obj.path)].push(obj)
  })
  var collection = Object.keys(set).map((key)=>{
    return {title:key, data:set[key]}
  })
  return collection
}

var setArticleImage = function(articlePath){
  var fn = articlePath.split(path.sep).pop().split(".")[0]
  if(fs.existsSync(`src/assets/imgs/articles/${fn}.jpg`)){
    return `/assets/imgs/articles/${fn}.jpg`
  }
  return "https://picsum.photos/292/219"
}
var nunjucksEnv = nunjucks.configure()
nunjucksEnv.addGlobal("moment",moment)
nunjucksEnv.addGlobal("getDir",getDir)
nunjucksEnv.addGlobal("getNoteDict",getNoteDict)
nunjucksEnv.addGlobal("setArticleImage",setArticleImage)

  metalsmith(__dirname)
  .ignore(["katex","assets/katex"])
  .metadata({
    site:{
      name:"Jon Watson",
      title:"Jon Watson",
      description:"Personal site"
    }
  })
  .source("./src")
  .destination("./build")
  .use(collections({
    articles: {
      pattern: 'articles/**/*.md',
      sortBy: 'date',
      reverse: true
      },
    books:{
      pattern: 'notes/**/*.md',
      sortBy: function(a, b){
        var apath_parts = a.path.split(path.sep)
        var bpath_parts = b.path.split(path.sep)
        var atitle = apath_parts.pop(), btitle = bpath_parts.pop()
        var adir = apath_parts.pop(), bdir = bpath_parts.pop()
        if(adir == bdir){
          return atitle < btitle;
        }
        else return adir < bdir;
      }
    }
  }))
  .use(markdown({sanitize: false}))
  .use(layouts({
    engine: 'nunjucks',
    directory: './templates',
    default: 'article.njk',
    pattern: ["*/*/*html","*/*html","*html"],
    engineOptions: nunjucksEnv
  }))
  .build(async function(err){
    if(err){
      console.log(err)
    }
    else{
      console.log("build successful")
      console.log("copying CNAME to build dir")
      await cp('CNAME', 'build/CNAME');
    }
  })

  