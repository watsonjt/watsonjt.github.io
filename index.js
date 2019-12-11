var metalsmith = require("metalsmith"),
    pandoc = require("metalsmith-pandoc"),
    markdown = require('metalsmith-markdown'),
    layouts = require('metalsmith-layouts'),
    collections = require('metalsmith-collections'),
    inplace = require('metalsmith-in-place'),
    ignore = require('metalsmith-ignore'),
    nunjucks = require('nunjucks'),
    moment = require('moment')

var nunjucksEnv = nunjucks.configure()
nunjucksEnv.addGlobal("moment",moment)
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
  }))
  .use(markdown({sanitize: false}))
  .use(layouts({
    engine: 'nunjucks',
    directory: './templates',
    default: 'articles.njk',
    pattern: ["*/*/*html","*/*html","*html"],
    engineOptions: nunjucksEnv
}))
  .build(function(err){
    if(err){
      console.log(err)
    }
    else{
      console.log("build successful")
    }
  })