import { Parser } from "acorn";
import { ReservedWords as reservedWords } from "./ReservedWords ";

const removeComments = (code) => {
  return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();
};

const normalizeCode = (code) => {
  let variableCounter = 1;
  const variableMap = new Map();
  return code.replace(/(\b[A-Za-z_]\w*\b)|\/[^/]*\/[gimsuy]*/g, (match) => {
    if (reservedWords.has(match) || match.startsWith("/")) {
      return match;
    }
    if (!variableMap.has(match)) {
      variableMap.set(match, `var${variableCounter++}`);
    }
    return variableMap.get(match);
  });
};

const compareExpressions = (code1, code2) => {
  if (!code1 || !code2) {
    return false;
  }
  if (code1.type !== code2.type) {
    return false;
  }
  switch (code1.type) {
    case "BinaryExpression":
      return (
        code1.operator === code2.operator &&
        compareExpressions(code1.left, code2.left) &&
        compareExpressions(code1.right, code2.right)
      );
    case "CallExpression":
      return (
        compareExpressions(code1.callee, code2.callee) &&
        code1.arguments.length === code2.arguments.length &&
        code1.arguments.every((arg, index) =>
          compareExpressions(arg, code2.arguments[index])
        )
      );
    case "IfStatement":
      return (
        compareExpressions(code1.test, code2.test) &&
        compareExpressions(code1.consequent, code2.consequent) &&
        (code1.alternate && code2.alternate
          ? compareExpressions(code1.alternate, code2.alternate)
          : code1.alternate === code2.alternate)
      );
    case "FunctionDeclaration":
      return (
        compareExpressions(code1.id, code2.id) &&
        code1.params.length === code2.params.length &&
        code1.params.every((param, index) =>
          compareExpressions(param, code2.params[index])
        ) &&
        compareExpressions(code1.body, code2.body)
      );
    case "ExpressionStatement":
      return compareExpressions(code1.expression, code2.expression);
    case "UpdateExpression":
      return (
        code1.operator === code2.operator &&
        code1.prefix === code2.prefix &&
        compareExpressions(code1.argument, code2.argument)
      );
    case "ReturnStatement":
      return compareExpressions(code1.argument, code2.argument);
    case "MemberExpression":
      return (
        compareExpressions(code1.object, code2.object) &&
        compareExpressions(code1.property, code2.property)
      );
    case "BlockStatement":
      return (
        code1.body.length === code2.body.length &&
        code1.body.every((stmt, index) =>
          compareExpressions(stmt, code2.body[index])
        )
      );
    case "VariableDeclaration":
      return (
        code1.declarations.length === code2.declarations.length &&
        code1.declarations.every((decl, index) =>
          compareExpressions(decl, code2.declarations[index])
        )
      );
    case "VariableDeclarator":
      return (
        compareExpressions(code1.id, code2.id) &&
        compareExpressions(code1.init, code2.init)
      );
    case "ArrowFunctionExpression":
    case "FunctionExpression":
      return (
        code1.params.length === code2.params.length &&
        code1.params.every((param, index) =>
          compareExpressions(param, code2.params[index])
        ) &&
        compareExpressions(code1.body, code2.body)
      );
    case "SpreadElement":
      return compareExpressions(code1.argument, code2.argument);
    case "UnaryExpression":
      return (
        code1.operator === code2.operator &&
        compareExpressions(code1.argument, code2.argument)
      );
    case "LogicalExpression":
      return (
        code1.operator === code2.operator &&
        compareExpressions(code1.left, code2.left) &&
        compareExpressions(code1.right, code2.right)
      );
    case "AssignmentExpression":
      return (
        code1.operator === code2.operator &&
        compareExpressions(code1.left, code2.left) &&
        compareExpressions(code1.right, code2.right)
      );
    case "ConditionalExpression":
      return (
        compareExpressions(code1.test, code2.test) &&
        compareExpressions(code1.consequent, code2.consequent) &&
        compareExpressions(code1.alternate, code2.alternate)
      );
    case "ObjectExpression":
      return (
        code1.properties.length === code2.properties.length &&
        code1.properties.every(
          (prop, index) =>
            compareExpressions(prop.key, code2.properties[index].key) &&
            compareExpressions(prop.value, code2.properties[index].value)
        )
      );
    case "ArrayExpression":
      return (
        code1.elements.length === code2.elements.length &&
        code1.elements.every((el, index) =>
          compareExpressions(el, code2.elements[index])
        )
      );
    case "ForStatement":
      return (
        compareExpressions(code1.init, code2.init) &&
        compareExpressions(code1.test, code2.test) &&
        compareExpressions(code1.update, code2.update) &&
        compareExpressions(code1.body, code2.body)
      );

    case "Identifier":
      return code1.name === code2.name;
    case "Literal":
      if (code1.regex || code2.regex) {
        return (
          code1.regex &&
          code2.regex &&
          JSON.stringify(code1.regex) === JSON.stringify(code2.regex)
        );
      }
      const res = code1.value === code2.value && code1.raw === code2.raw;
      return res;
    default:
      return false;
  }
};

const createAST = (code) => {
  try {
    return Parser.parseExpressionAt(code, 0, { ecmaVersion: 2020 });
  } catch (e) {
    return null;
  }
};

export async function processCode(code1, code2) {
  try {
    const cleanedCode1 = removeComments(code1);
    const cleanedCode2 = removeComments(code2);
    const normalizedCode1 = normalizeCode(cleanedCode1);
    const normalizedCode2 = normalizeCode(cleanedCode2);
    const returnExpression1 = createAST(normalizedCode1);
    const returnExpression2 = createAST(normalizedCode2);
    if (!returnExpression1 || !returnExpression2) {
      return false;
    }
    return compareExpressions(returnExpression1, returnExpression2);
  } catch (e) {
    return false;
  }
}
