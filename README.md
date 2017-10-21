# graphql-resolvers-ast

[![Build Status](https://travis-ci.org/eddyystop/graphql-resolvers-ast.png?branch=master)](https://travis-ci.org/eddyystop/graphql-resolvers-ast)
[![Code Climate](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast/badges/gpa.svg)](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast)
[![Test Coverage](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast/badges/coverage.svg)](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast/coverage)
[![Dependency Status](https://img.shields.io/david/eddyystop/graphql-resolvers-ast.svg?style=flat-square)](https://david-dm.org/eddyystop/graphql-resolvers-ast)
[![Download Status](https://img.shields.io/npm/dm/graphql-resolvers-ast.svg?style=flat-square)](https://www.npmjs.com/package/graphql-resolvers-ast)

> Extract useful information from the AST param passed to the GraphQL resolver function.

## Installation

```
npm install graphql-resolvers-ast --save
```

## Documentation

Please refer to the [graphql-resolvers-ast documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `graphql-resolvers-ast`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('graphql-resolvers-ast');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin', plugin())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
