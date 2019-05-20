
/*
 Utilities to explore AST
 - http://dferber90.github.io/graphql-ast-explorer/
 - http://astexplorer.net/
 */

module.exports = function graphqlResolverAst (ast) {
  const state = {
    operation: ast.schema._queryType.toString(),
    schema: [ast.parentType.name, ast.path.key],
    resolverPath: [],
    resolveTo: ast.returnType.toString(),
    fields: [],
    args: null,
    fragments: {}
  };

  // Get .resolverPath
  let path = ast.path;
  const resolverPath = [].concat(
    ast.parentType.name === 'Query' ? [] : ast.parentType.name, path.key, ast.returnType.toString()
  );

  while (path.prev) {
    path = path.prev;
    resolverPath.unshift(path.key);
  }

  state.resolverPath = resolverPath;

  // ast.fieldNode.length > 1 if the Query has fragments.
  ast.fieldNodes.forEach(fieldNode => {
    // Get .fields
    state.fields.push(fieldNode.selectionSet.selections.map(sel => getSelections(sel)));

    // get .args
    const args1 = {};

    fieldNode.arguments.forEach(argument => {
      args1[argument.name.value] = getArgumentValue(argument.value, ast);
    });

    state.args = Object.keys(args1) ? args1 : null;
  });

  // Get .fragments
  Object.keys(ast.fragments).forEach(fragmentName => {
    state.fragments[fragmentName] = getSelections(ast.fragments[fragmentName]);
  });

  return state;
};

function getSelections (sel) {
  return { kind: sel.kind, name: sel.name.value, hasSelections: !!sel.selectionSet };
}

function getArgumentValue (argumentValue, ast) {
  switch (argumentValue.kind) {
    case 'StringValue': // fall through
    case 'BooleanValue':
      return argumentValue.value;
    case 'IntValue':
      return parseInt(argumentValue.value, 10);
    case 'FloatValue':
      return parseFloat(argumentValue.value);
    case 'ListValue':
      return argumentValue.values.map(elem => getArgumentValue(elem, ast));
    case 'ObjectValue':
      const obj = {};
      argumentValue.fields.forEach(field => {
        obj[field.name.value] = getArgumentValue(field.value, ast);
      });
      return obj;
    case 'Variable':
      return ast.variableValues[argumentValue.name.value];
    default:
      throw new Error(`Unexpected GraphQL argument type "${argumentValue.kind}"`);
  }
}
