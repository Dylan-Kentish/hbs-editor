import handlebars from 'handlebars';
import { z } from 'zod';

function parsePathExpressionNode(node: hbs.AST.PathExpression): z.AnyZodObject {
  return z.object({
    [node.parts.join('.')]: z.string(),
  });
}

function parseMustacheStatementNode(node: hbs.AST.MustacheStatement): z.AnyZodObject | null {
  if (node.path.type === 'PathExpression') {
    return parsePathExpressionNode(node.path as hbs.AST.PathExpression);
  }
  return null;
}

function parseBlockStatementNode(node: hbs.AST.BlockStatement): z.AnyZodObject | null {
  if (node.params[0]?.type === 'PathExpression') {
    const variable = (node.params[0] as hbs.AST.PathExpression).parts[0];
    const type = parseProgramNode(node.program);
    const isEach = node.path.original === 'each';
    if (variable && type) {
      return z.object({
        [variable]: isEach ? z.array(type) : type,
      });
    }
  }
  return null;
}

function convertToNestedObject(props: z.AnyZodObject[]): z.AnyZodObject {
  const schema: Record<string, z.AnyZodObject> = props.reduce((acc, prop) => {
    const fullKey = Object.keys(prop.shape)[0];
    const [key, ...rest] = fullKey.split('.');
    if (rest.length) {
      const innerKey = rest.join('.');
      const nestedProps = convertToNestedObject([
        z.object({
          [innerKey]: prop.shape[fullKey],
        }),
      ]);

      const type = acc[key];
      if (!type) {
        acc[key] = nestedProps;
      } else {
        acc[key] = type.merge(nestedProps);
      }
    } else {
      acc[key] = prop.shape[key];
    }

    return acc;
  }, {} as Record<string, z.AnyZodObject>);

  const schemaObject = Object.entries(schema).reduce((acc, [name, type]) => {
    acc[name] = type;
    return acc;
  }, {} as Record<string, z.AnyZodObject>);

  return z.object(schemaObject);
}

function parseProgramNode(node: hbs.AST.Program): z.AnyZodObject | null {
  const props: z.AnyZodObject[] = node.body.reduce((acc, node) => {
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
  }, [] as z.AnyZodObject[]);

  if (props.length) {
    return convertToNestedObject(props);
  }

  return null;
}

// Function to generate TypeScript types from a Handlebars template
export function parseHBSTemplate(hbsTemplate: string): z.AnyZodObject | null {
  const ast = handlebars.parse(hbsTemplate);

  return parseProgramNode(ast);
}
