import ts from "typescript";


export function toString(node: ts.TypeNode | null): string {
  if (!node) {
    return '';
  }

  // Convert the TypeNode to a JSON-like string representation
  return ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, ts.createSourceFile('template.d.ts', '', ts.ScriptTarget.Latest));
}