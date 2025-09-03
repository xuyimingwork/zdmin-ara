import { isObjectLike } from 'es-toolkit/compat'
import ts, { factory, SyntaxKind } from 'typescript'

export const JS_PROPERTY_INDEX_RE = /^[A-Za-z_$][A-Za-z_$0-9]*$/;

function tsPropertyIndex(index: string | number) {
  if (
    (typeof index === "number" && !(index < 0)) ||
    (typeof index === "string" && String(Number(index)) === index && index[0] !== "-")
  ) {
    return ts.factory.createNumericLiteral(index);
  }
  const literal = ts.factory.createStringLiteral(String(index));
  ts.setEmitFlags(literal, ts.EmitFlags.NoAsciiEscaping);
  return typeof index === "string" && JS_PROPERTY_INDEX_RE.test(index)
    ? ts.factory.createIdentifier(index)
    : literal;
}

export function createDefinitionsInterfaceDeclaration({ openapi }) {
  if (!isObjectLike(openapi?.definitions)) return
  return factory.createInterfaceDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    factory.createIdentifier("definitions"),
    undefined,
    undefined,
    [
      factory.createPropertySignature(
        undefined,
        factory.createStringLiteral('你好世界'),
        undefined,
        factory.createTypeLiteralNode([])
      ),
      ...Object.keys(openapi.definitions).sort().map(name => {
        return factory.createPropertySignature(
          undefined,
          tsPropertyIndex(name),
          undefined,
          factory.createTypeLiteralNode([])
        )
      })
    ]
  )
}