import ts from "typescript";

// Helper function to check if a TypeNode is equal to Expected
export function isExpected(typeNode: ts.TypeNode | null, expected: any): boolean {
  if (!typeNode) {
    return false;
  }

  const keys = Object.keys(expected);

  if (!keys.length) {
    return false;
  }

  let members: ts.NodeArray<ts.TypeElement> | undefined;

  if (ts.isTypeLiteralNode(typeNode)) {
    members = typeNode.members;
  }

  if (ts.isArrayTypeNode(typeNode)) {
    const elementType = typeNode.elementType;
    if (ts.isTypeLiteralNode(elementType)) {
      members = elementType.members;
    }
  }

  if (!members) {
    return false;
  }

  // Check if the typeNode has the same number of properties as Expected
  if (members.length === keys.length) {
    // Check if the typeNode has the same properties as Expected
    return members.every(member => {
      if (ts.isPropertySignature(member)) {
        // @ts-ignore
        const variableName = member.name.text;

        if (member.type) {
          if (ts.isTypeLiteralNode(member.type)) {
            return isExpected(member.type, expected[variableName])
          } else if (ts.isArrayTypeNode(member.type)) {
            const array = expected[variableName] as any[];
            const type = member.type;
            return array && array.every(item => isExpected(type, item))
          } else {
            const hasKey = keys.includes(variableName)

            if (!hasKey) {
              console.info(`INEQUALITY: Expected ${variableName} to be a key in ${keys}`);
            }

            return hasKey;
          }
        }
      }
      console.info(`INEQUALITY: Expected ${member} to be a PropertySignature`);
      return false;
    })
  }

  console.info('INEQUALITY: Types have different number of properties');
  return false;
}