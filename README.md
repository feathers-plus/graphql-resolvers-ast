# graphql-resolvers-ast

[![Build Status](https://travis-ci.org/eddyystop/graphql-resolvers-ast.png?branch=master)](https://travis-ci.org/eddyystop/graphql-resolvers-ast)
[![Code Climate](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast/badges/gpa.svg)](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast)
[![Test Coverage](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast/badges/coverage.svg)](https://codeclimate.com/github/eddyystop/graphql-resolvers-ast/coverage)
[![Dependency Status](https://img.shields.io/david/eddyystop/graphql-resolvers-ast.svg?style=flat-square)](https://david-dm.org/eddyystop/graphql-resolvers-ast)
[![Download Status](https://img.shields.io/npm/dm/graphql-resolvers-ast.svg?style=flat-square)](https://www.npmjs.com/package/graphql-resolvers-ast)

> Provide GraphQL resolver functions information about the context in which they have been invoked.

## Installation

```
npm install graphql-resolvers-ast --save
```

## Documentation

GraphQL resolvers are not typically aware of the context in which they are running.
For example a resolver within User is not aware if the data is needed for the post author,
the author of a comment, the User who is following another User, or the User
who is being followed.

graphql-resolvers-ast provides context information for a resolver, including:
- What operation is being performed, e.g. Query or Mutation.
- Which resolver is running, e.g. [ 'Post', 'editor' ].
- What is it resolving in the GraphQL operation, e.g. [ 'getUser', 'posts', 0, 'Post', 'editor' ].
- What type of result it is to return, e.g. 'User' or '[User!]!'.
- Which fields from the result will GraphQL return.

Information is returned on fragments if any. Overlapping fragments are handled.

## Example

```js
const resolversAst = require('graphql-resolvers-ast');
 
const resolvers = {
  User: {
    posts (parent, args, content, ast) {
      const context = resolversAst(ast);
      console.log(context);
      return /* call backend server for appropriate posts */;
    }
  },
};
```
            
## Example of a Query Without Fragments

```js
const typeDefs = `
  type User {
    email: String
    posts: [Post!]
  }
  
  type Post {
    body: String
    draft: Boolean
    achieved: Boolean
    editor: User
  }
  
  type Query {
    getUser (keyInt: Int, keyStr: String): User
  }
`;
 
const query = `
query {
  getUser (keyInt: 1, keyStr: "a") {
    email
    posts {
      body
      editor {
        email
      }
    }
  }
}
`;
 
const resolvers = {
  Post: {
    editor (parent, args, content, ast) {
      const context = resolversAst(ast);
      return { email: 'editor@gmail.com' };
        /* resolvers.Post.editor is called twice during the query. The context values returned are:
          { operation: 'Query',
            schema: [ 'Post', 'editor' ],
            resolverPath: [ 'getUser', 'posts', 0, 'Post', 'editor' ],
            resolveTo: 'User',
            fields: [
              [{ kind: 'Field', name: 'email', hasSelections: false }]
            ],
            args: {},
            fragments: {}
          }
        and
          { operation: 'Query',
            schema: [ 'Post', 'editor' ],
            resolverPath: [ 'getUser', 'posts', 1, 'Post', 'editor' ],
            resolveTo: 'User',
            fields: [
              [{ kind: 'Field', name: 'email', hasSelections: false }]
            ],
            args: {},
            fragments: {}
          }      
        */
    }
  },
  User: {
    posts (parent, args, content, ast) {
      const context = resolversAst(ast);
      return [
        { body: '  post1 ', draft: true, achieved: true },
        { body: ' post2  ', draft: false, achieved: true }
      ];
      /* resolvers.User.posts is called once for this query. context contains:
        { operation: 'Query',
          schema: [ 'User', 'posts' ],
          resolverPath: [ 'getUser', 'User', 'posts' ],
          resolveTo: '[Post!]',
          fields: [
            [ { kind: 'Field', name: 'body', hasSelections: false },
              { kind: 'Field', name: 'editor', hasSelections: true } ]
          ],
          args: {},
          fragments: {}
        }      
      */
    }
  },
  Query: {
    getUser (parent, args, content, ast) {
      const context = resolversAst(ast);
      return { email: '  email1@gmail.com ' };
      /* resolvers.Query.getUser is called once for this query. context contains:
        { operation: 'Query',
          schema: [ 'Query', 'getUser' ],
          resolverPath: [ 'Query', 'getUser' ],
          resolveTo: 'User',
          fields: [
            [ { kind: 'Field', name: 'email', hasSelections: false },
              { kind: 'Field', name: 'posts', hasSelections: true } ]
          ],
          args: { keyInt: 1, keyStr: 'a' },
          fragments: {}
        }      
      */
    }
  }
};
```

## Example of a Query Using Overlapping Fragments

*Overlapping* fragments result in multiple context.fields entries.

```js
const query = `
query {
  getUser {
    email
    posts {
      body
    }
  }
  ... QueryFragment
}
 
fragment QueryFragment on Query {
  getUser {
    posts {
      draft
    }
    ... GetUserFragment
  }
}
 
fragment GetUserFragment on User {
  posts {
    achieved
  }
}`;
 
const resolvers = {
  User: {
    posts (parent, args, content, ast) {
      const context = resolversAst(ast);
      return [
        { body: '  post1 ', draft: true, achieved: true },
        { body: ' post2  ', draft: false, achieved: true }
      ];
      /* resolvers.User.posts is called once for this query. context contains:
        { operation: 'Query',
          schema: [ 'User', 'posts' ],
          resolverPath: [ 'getUser', 'User', 'posts' ],
          resolveTo: '[Post!]',
          fields: [
            [ { kind: 'Field', name: 'body', hasSelections: false } ],
            [ { kind: 'Field', name: 'draft', hasSelections: false } ],
            [ { kind: 'Field', name: 'achieved', hasSelections: false } ]
          ],
          args: {},
          fragments: {
            QueryFragment: {
              kind: 'FragmentDefinition',
              name: 'QueryFragment',
              hasSelections: true
            },
            GetUserFragment: {
              kind: 'FragmentDefinition',
              name: 'GetUserFragment',
              hasSelections: true
            }
          }
        }     
      */
    }
  },
  Query: {
    getUser (parent, args, content, ast) {
      const context = resolversAst(ast);
      return { email: '  email1@gmail.com ' };
      /* resolvers.Query.getUser is called once for this query. context contains:
        { operation: 'Query',
          schema: [ 'Query', 'getUser' ],
          resolverPath: [ 'Query', 'getUser' ],
          resolveTo: 'User',
          fields: [
            [ { kind: 'Field', name: 'email', hasSelections: false },
              { kind: 'Field', name: 'posts', hasSelections: true } ],
            [ { kind: 'Field', name: 'posts', hasSelections: true },
              { kind: 'FragmentSpread', name: 'GetUserFragment', hasSelections: false } ]
          ],
          args: {},
          fragments: {
            QueryFragment: {
              kind: 'FragmentDefinition',
              name: 'QueryFragment',
              hasSelections: true
            },
            GetUserFragment: {
              kind: 'FragmentDefinition',
              name: 'GetUserFragment',
              hasSelections: true
            }
          }
        }     
      */
    }
  }
};
```

## License

Copyright (c) 2017 John J. Szwaronek

Licensed under the [MIT license](LICENSE).
