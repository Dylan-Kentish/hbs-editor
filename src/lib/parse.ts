import handlebars from 'handlebars';
import ts from 'typescript';

function parsePathExpressionNode(node: hbs.AST.PathExpression): ts.PropertySignature | null {
  return ts.factory.createPropertySignature(undefined, node.parts.join('.'), undefined, ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
}

function parseMustacheStatementNode(node: hbs.AST.MustacheStatement): ts.PropertySignature | null {
  if (node.path.type === 'PathExpression') {
    return parsePathExpressionNode(node.path as hbs.AST.PathExpression);
  }
  return null;
}

function parseBlockStatementNode(node: hbs.AST.BlockStatement): ts.PropertySignature | null {
  if (node.params[0].type === 'PathExpression') {
    const variable = (node.params[0] as hbs.AST.PathExpression).parts[0];
    const type = parseProgramNode(node.program);
    const isEach = node.path.original === 'each';
    if (type) {
      return ts.factory.createPropertySignature(
        undefined,
        ts.factory.createStringLiteral(variable),
        undefined,
        isEach ? ts.factory.createArrayTypeNode(type) : type,
      );
    }
  }
  return null;
}

function convertToNestedObject(props: ts.PropertySignature[]): ts.TypeLiteralNode {
  const propsMap = props.reduce((acc, prop) => {
    // @ts-ignore
    const [key, ...rest] = prop.name.text.split('.');
    if (rest.length) {
      const nestedProps = convertToNestedObject([ts.factory.createPropertySignature(undefined, rest.join('.'), undefined, prop.type!)]);

      if (!acc[key]) {
        acc[key] = nestedProps;
      } else {
        if (ts.isPropertySignature(acc[key])) {
          const current = acc[key] as unknown as ts.PropertySignature;
          acc[key] = ts.factory.createTypeLiteralNode([current, ...nestedProps.members]);
        } else if (ts.isTypeLiteralNode(acc[key])) {
          const current = acc[key] as unknown as ts.TypeLiteralNode;
          acc[key] = ts.factory.createTypeLiteralNode([...current.members, ...nestedProps.members]);
        }
      }
    } else {
      acc[key] = prop.type!;
    }

    return acc;
  }, {} as { [key: string]: ts.TypeNode });

  const propsMapEntries = Object.entries(propsMap).map(([name, type]) => {
    return ts.factory.createPropertySignature(undefined, name, undefined, type);
  });

  return ts.factory.createTypeLiteralNode(propsMapEntries);
}

function parseProgramNode(node: hbs.AST.Program): ts.TypeNode | null {
  const props = node.body.reduce((acc, node) => {
    if (node.type === 'BlockStatement') {
      const prop = parseBlockStatementNode(node as hbs.AST.BlockStatement);
      if (prop) {
        acc.push(prop);
      }
    }

    if (node.type === 'MustacheStatement') {
      const prop = parseMustacheStatementNode(node as hbs.AST.MustacheStatement);
      if (prop) {
        acc.push(prop);
      }
    }

    return acc;
  }, [] as ts.PropertySignature[]);

  if (props.length) {
    return convertToNestedObject(props);
  }

  return null;
}

// Function to generate TypeScript types from a Handlebars template
export function generateTypeScriptTypes(hbsTemplate: string): ts.TypeNode | null {
  const ast = handlebars.parse(hbsTemplate);

  return parseProgramNode(ast);
}
