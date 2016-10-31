var Option = {
none: function() { return Option.none_k; },
none_k: {_: "none"},
some: function(value) { return {
_: "some",
value: value
}}
};

var Resolver = {
typeConstructor: function(position, symbol) { return {
_: "typeConstructor",
position: position,
symbol: symbol
}},
variable: function(position, symbol) { return {
_: "variable",
position: position,
symbol: symbol
}},
typeParameter: function(position, symbol) { return {
_: "typeParameter",
position: position,
symbol: symbol
}},
staticName: function(position, symbol) { return {
_: "staticName",
position: position,
symbol: symbol
}},
assertNoVariable: function(position, name) { return {
_: "assertNoVariable",
position: position,
name: name
}},
addVariable: function(position, name) { return {
_: "addVariable",
position: position,
name: name
}},
addTypeParameter: function(position, name) { return {
_: "addTypeParameter",
position: position,
name: name
}},
scope: function(body) { return {
_: "scope",
body: body
}},
setSource: function(text) { return {
_: "setSource",
text: text
}}
};

var Term = {
binary: function(position, operator, left, right) { return {
_: "binary",
position: position,
operator: operator,
left: left,
right: right
}},
unary: function(position, operator, value) { return {
_: "unary",
position: position,
operator: operator,
value: value
}},
codeUnitValue: function(position, value) { return {
_: "codeUnitValue",
position: position,
value: value
}},
textValue: function(position, value) { return {
_: "textValue",
position: position,
value: value
}},
textLiteral: function(position, parts) { return {
_: "textLiteral",
position: position,
parts: parts
}},
integerValue: function(position, value) { return {
_: "integerValue",
position: position,
value: value
}},
floatingValue: function(position, value) { return {
_: "floatingValue",
position: position,
value: value
}},
arrayValue: function(position, elements) { return {
_: "arrayValue",
position: position,
elements: elements
}},
thisModule: function(position) { return {
_: "thisModule",
position: position
}},
variable: function(position, symbol) { return {
_: "variable",
position: position,
symbol: symbol
}},
staticCall: function(position, symbol, name, arguments) { return {
_: "staticCall",
position: position,
symbol: symbol,
name: name,
arguments: arguments
}},
methodCall: function(position, value, name, arguments) { return {
_: "methodCall",
position: position,
value: value,
name: name,
arguments: arguments
}},
instance: function(position, symbol, thisName, methods) { return {
_: "instance",
position: position,
symbol: symbol,
thisName: thisName,
methods: methods
}},
match: function(position, value, cases) { return {
_: "match",
position: position,
value: value,
cases: cases
}},
lambda: function(position, parameters, body) { return {
_: "lambda",
position: position,
parameters: parameters,
body: body
}},
ffiJs: function(position, code) { return {
_: "ffiJs",
position: position,
code: code
}}
};

var MatchCase = {
matchCase: function(body, fieldNames) { return {
_: "matchCase",
body: body,
fieldNames: fieldNames
}}
};

var Arguments = {
arguments: function(unnamed, named) { return {
_: "arguments",
unnamed: unnamed,
named: named
}}
};

var NamedArgument = {
namedArgument: function(order, name, value) { return {
_: "namedArgument",
order: order,
name: name,
value: value
}}
};

var Statement = {
term: function(position, term) { return {
_: "term",
position: position,
term: term
}},
let_: function(position, variable, type, value) { return {
_: "let",
position: position,
variable: variable,
type: type,
value: value
}},
functions: function(definitions) { return {
_: "functions",
definitions: definitions
}},
assign: function(position, variable, value) { return {
_: "assign",
position: position,
variable: variable,
value: value
}},
increment: function(position, variable, value) { return {
_: "increment",
position: position,
variable: variable,
value: value
}},
decrement: function(position, variable, value) { return {
_: "decrement",
position: position,
variable: variable,
value: value
}},
ffi: function(position, language, code) { return {
_: "ffi",
position: position,
language: language,
code: code
}}
};

var Type = {
constructor: function(position, symbol, typeArguments) { return {
_: "constructor",
position: position,
symbol: symbol,
typeArguments: typeArguments
}},
parameter: function(position, name) { return {
_: "parameter",
position: position,
name: name
}},
variable: function(position, id) { return {
_: "variable",
position: position,
id: id
}}
};

var TypeDefinition = {
typeDefinition: function(position, symbol, typeParameters, isSum, methodSignatures) { return {
_: "typeDefinition",
position: position,
symbol: symbol,
typeParameters: typeParameters,
isSum: isSum,
methodSignatures: methodSignatures
}}
};

var FunctionDefinition = {
functionDefinition: function(position, signature, body) { return {
_: "functionDefinition",
position: position,
signature: signature,
body: body
}}
};

var MethodSignature = {
methodSignature: function(position, symbol, typeParameters, parameters, returnType) { return {
_: "methodSignature",
position: position,
symbol: symbol,
typeParameters: typeParameters,
parameters: parameters,
returnType: returnType
}}
};

var MethodImplementation = {
methodImplementation: function(position, name, parameters, body) { return {
_: "methodImplementation",
position: position,
name: name,
parameters: parameters,
body: body
}}
};

var Parameter = {
parameter: function(position, name, type) { return {
_: "parameter",
position: position,
name: name,
type: type
}}
};

var Module = {
module: function(package_, file, alias, source, typeDefinitions, functionDefinitions) { return {
_: "module",
package_: package_,
file: file,
alias: alias,
source: source,
typeDefinitions: typeDefinitions,
functionDefinitions: functionDefinitions
}}
};

var Position = {
position: function(line, column, buffer, offset) { return {
_: "position",
line: line,
column: column,
buffer: buffer,
offset: offset
}}
};

var CharCursor = {
offset: function() { return CharCursor.offset_k; },
offset_k: {_: "offset"},
buffer: function() { return CharCursor.buffer_k; },
buffer_k: {_: "buffer"},
invoke: function(ahead) { return {
_: "invoke",
ahead: ahead
}},
skip: function(ahead) { return {
_: "skip",
ahead: ahead
}},
pastEnd: function() { return CharCursor.pastEnd_k; },
pastEnd_k: {_: "pastEnd"},
lookAhead: function(ahead) { return {
_: "lookAhead",
ahead: ahead
}},
top: function(closeSymbol) { return {
_: "top",
closeSymbol: closeSymbol
}},
push: function(closeSymbol) { return {
_: "push",
closeSymbol: closeSymbol
}},
pop: function(closeSymbol) { return {
_: "pop",
closeSymbol: closeSymbol
}},
skipWhitespace: function() { return CharCursor.skipWhitespace_k; },
skipWhitespace_k: {_: "skipWhitespace"},
position: function(offset) { return {
_: "position",
offset: offset
}}
};

var StringMap = {
invoke: function(key) { return {
_: "invoke",
key: key
}},
get: function(key) { return {
_: "get",
key: key
}},
has: function(key) { return {
_: "has",
key: key
}}
};

var StringMapBuilder = {
invoke: function(key) { return {
_: "invoke",
key: key
}},
get: function(key) { return {
_: "get",
key: key
}},
has: function(key) { return {
_: "has",
key: key
}},
set: function(key, value) { return {
_: "set",
key: key,
value: value
}},
remove: function(key) { return {
_: "remove",
key: key
}},
toArray: function() { return StringMapBuilder.toArray_k; },
toArray_k: {_: "toArray"},
toStringMap: function() { return StringMapBuilder.toStringMap_k; },
toStringMap_k: {_: "toStringMap"}
};

var Case = {
case_: function(condition, body) { return {
_: "case",
condition: condition,
body: body
}},
else_: function(body) { return {
_: "else",
body: body
}}
};

var Pair = {
pair: function(first, second) { return {
_: "pair",
first: first,
second: second
}}
};

var Pc = {
position: function() { return Pc.position_k; },
position_k: {_: "position"},
consume: function(tokenType) { return {
_: "consume",
tokenType: tokenType
}},
lookahead: function(expected, cases) { return {
_: "lookahead",
expected: expected,
cases: cases
}}
};

var TokenCursor = {
invoke: function(ahead) { return {
_: "invoke",
ahead: ahead
}},
skip: function(ahead) { return {
_: "skip",
ahead: ahead
}},
skipWith: function(result, ahead) { return {
_: "skipWith",
result: result,
ahead: ahead
}}
};

var Token = {
token: function(token, from, to) { return {
_: "token",
token: token,
from: from,
to: to
}}
};

var TokenType = {
leftThinArrow: function() { return TokenType.leftThinArrow_k; },
leftThinArrow_k: {_: "leftThinArrow"},
rightThinArrow: function() { return TokenType.rightThinArrow_k; },
rightThinArrow_k: {_: "rightThinArrow"},
rightThickArrow: function() { return TokenType.rightThickArrow_k; },
rightThickArrow_k: {_: "rightThickArrow"},
leftPipe: function() { return TokenType.leftPipe_k; },
leftPipe_k: {_: "leftPipe"},
rightPipe: function() { return TokenType.rightPipe_k; },
rightPipe_k: {_: "rightPipe"},
atSign: function() { return TokenType.atSign_k; },
atSign_k: {_: "atSign"},
colon: function() { return TokenType.colon_k; },
colon_k: {_: "colon"},
comma: function() { return TokenType.comma_k; },
comma_k: {_: "comma"},
dot: function() { return TokenType.dot_k; },
dot_k: {_: "dot"},
underscore: function() { return TokenType.underscore_k; },
underscore_k: {_: "underscore"},
assign: function() { return TokenType.assign_k; },
assign_k: {_: "assign"},
increment: function() { return TokenType.increment_k; },
increment_k: {_: "increment"},
decrement: function() { return TokenType.decrement_k; },
decrement_k: {_: "decrement"},
plus: function() { return TokenType.plus_k; },
plus_k: {_: "plus"},
minus: function() { return TokenType.minus_k; },
minus_k: {_: "minus"},
star: function() { return TokenType.star_k; },
star_k: {_: "star"},
slash: function() { return TokenType.slash_k; },
slash_k: {_: "slash"},
equal: function() { return TokenType.equal_k; },
equal_k: {_: "equal"},
notEqual: function() { return TokenType.notEqual_k; },
notEqual_k: {_: "notEqual"},
less: function() { return TokenType.less_k; },
less_k: {_: "less"},
lessEqual: function() { return TokenType.lessEqual_k; },
lessEqual_k: {_: "lessEqual"},
greater: function() { return TokenType.greater_k; },
greater_k: {_: "greater"},
greaterEqual: function() { return TokenType.greaterEqual_k; },
greaterEqual_k: {_: "greaterEqual"},
and: function() { return TokenType.and_k; },
and_k: {_: "and"},
or: function() { return TokenType.or_k; },
or_k: {_: "or"},
exclamation: function() { return TokenType.exclamation_k; },
exclamation_k: {_: "exclamation"},
question: function() { return TokenType.question_k; },
question_k: {_: "question"},
leftRound: function() { return TokenType.leftRound_k; },
leftRound_k: {_: "leftRound"},
rightRound: function() { return TokenType.rightRound_k; },
rightRound_k: {_: "rightRound"},
leftSquare: function() { return TokenType.leftSquare_k; },
leftSquare_k: {_: "leftSquare"},
rightSquare: function() { return TokenType.rightSquare_k; },
rightSquare_k: {_: "rightSquare"},
leftCurly: function() { return TokenType.leftCurly_k; },
leftCurly_k: {_: "leftCurly"},
rightCurly: function() { return TokenType.rightCurly_k; },
rightCurly_k: {_: "rightCurly"},
lower: function() { return TokenType.lower_k; },
lower_k: {_: "lower"},
upper: function() { return TokenType.upper_k; },
upper_k: {_: "upper"},
codeUnit: function() { return TokenType.codeUnit_k; },
codeUnit_k: {_: "codeUnit"},
text: function() { return TokenType.text_k; },
text_k: {_: "text"},
textStart: function() { return TokenType.textStart_k; },
textStart_k: {_: "textStart"},
textMiddle: function() { return TokenType.textMiddle_k; },
textMiddle_k: {_: "textMiddle"},
textEnd: function() { return TokenType.textEnd_k; },
textEnd_k: {_: "textEnd"},
numeral: function() { return TokenType.numeral_k; },
numeral_k: {_: "numeral"},
floating: function() { return TokenType.floating_k; },
floating_k: {_: "floating"},
separator: function() { return TokenType.separator_k; },
separator_k: {_: "separator"},
outsideFile: function() { return TokenType.outsideFile_k; },
outsideFile_k: {_: "outsideFile"}
};

var ArrayBuilder = {
drain: function() { return ArrayBuilder.drain_k; },
drain_k: {_: "drain"},
push: function(element) { return {
_: "push",
element: element
}},
pushAll: function(elements) { return {
_: "pushAll",
elements: elements
}},
pop: function() { return ArrayBuilder.pop_k; },
pop_k: {_: "pop"},
top: function() { return ArrayBuilder.top_k; },
top_k: {_: "top"},
each: function(body) { return {
_: "each",
body: body
}},
map: function(body) { return {
_: "map",
body: body
}},
filter: function(body) { return {
_: "filter",
body: body
}},
invoke: function(index) { return {
_: "invoke",
index: index
}},
size: function() { return ArrayBuilder.size_k; },
size_k: {_: "size"}
};

var StringBuilder = {
drain: function() { return StringBuilder.drain_k; },
drain_k: {_: "drain"},
toString: function() { return StringBuilder.toString_k; },
toString_k: {_: "toString"},
append: function(text) { return {
_: "append",
text: text
}},
size: function() { return StringBuilder.size_k; },
size_k: {_: "size"}
};

// (Pc, F0[t], TokenType) => Array[t]
function parseCommaList(pc, parse, end) {
// ArrayBuilder[_4]
var result = newArrayBuilder();
while_((function() {
return pc.lookahead("comma separated list", [Pair.pair([end], (function() {
return false;
})), Pair.pair([], (function() {
return true;
}))]);
}), (function() {
result.push(parse());
return pc.lookahead("comma", [Pair.pair([end], (function() {
})), Pair.pair([], (function() {
return pc.consume(TokenType.comma());
}))]);
}));
return result.drain();
}

// (Pc, F0[Term], Array[TokenType]) => Term
function parseLeftAssociative(pc, next, operators) {
// Term
var result = next();
// Array[Pair[Array[TokenType], F0[Bool?]]?]
var cases = map(operators, (function(o) {
return Pair.pair([o], (function() {
// Int
var position = pc.position();
pc.consume(o);
result = Term.binary(position, o, result, next());
return true;
}));
})).concat([Pair.pair([], (function() {
return false;
}))]);
while_((function() {
return pc.lookahead("operator", cases);
}), (function() {
}));
return result;
}

// (Pc) => Type
function parseTypeConstructor(pc) {
// Int
var position = pc.position();
// Option[String]?
var moduleName = pc.lookahead("type constructor", [Pair.pair([TokenType.upper(), TokenType.dot()], (function() {
// String
var name = pc.consume(TokenType.upper());
pc.consume(TokenType.dot());
return Option.some(name);
})), Pair.pair([], (function() {
return Option.none();
}))]);
// String
var name = pc.consume(TokenType.upper());
// Array[Type]
var typeArguments = pc.lookahead("type arguments", [Pair.pair([TokenType.leftSquare()], (function() {
pc.consume(TokenType.leftSquare());
// Array[Type]
var result = parseCommaList(pc, (function() {
return parseType(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
return Type.constructor(position, (function(_match) { switch(_match._) {
case "some":
var m = _match.value;
return (m + "." + name);
case "none":
return name;
}})(moduleName), typeArguments);
}

// (Pc) => Type
function parseType(pc) {
// Type?
var left = pc.lookahead("type", [Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
// Array[Type]
var typeArguments = parseCommaList(pc, (function() {
return parseType(pc);
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
// Int
var position = pc.position();
pc.consume(TokenType.rightThickArrow());
// Type
var returnType = parseType(pc);
return Type.constructor(position, ("_.F" + ("" + typeArguments.length)), typeArguments.concat([returnType]));
})), Pair.pair([TokenType.lower()], (function() {
// Int
var position = pc.position();
// String
var name = pc.consume(TokenType.lower());
return Type.parameter(position, name);
})), Pair.pair([], (function() {
return parseTypeConstructor(pc);
}))]);
return pc.lookahead("function type", [Pair.pair([TokenType.rightThickArrow()], (function() {
// Int
var position = pc.position();
pc.consume(TokenType.rightThickArrow());
// Type
var returnType = parseType(pc);
return Type.constructor(position, "_.F1", [left, returnType]);
})), Pair.pair([], (function() {
return left;
}))]);
}

// (Pc) => Term
function parseLambda(pc) {
// Int
var position = pc.position();
return pc.lookahead("lambda function", [Pair.pair([TokenType.leftCurly()], (function() {
// Array[Statement]
var body = parseBody(pc);
return Term.lambda(position, [], body);
})), Pair.pair([], (function() {
// Array[String]
var parameters = pc.lookahead("lambda function", [Pair.pair([TokenType.lower()], (function() {
return [pc.consume(TokenType.lower())];
})), Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
// Array[String]
var result = parseCommaList(pc, (function() {
return pc.consume(TokenType.lower());
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
return result;
}))]);
pc.consume(TokenType.rightThickArrow());
// Array[Statement]
var body = pc.lookahead("lambda body", [Pair.pair([TokenType.leftCurly()], (function() {
return parseBody(pc);
})), Pair.pair([], (function() {
return [Statement.term(position, parseTerm(pc))];
}))]);
return Term.lambda(position, parameters, body);
}))]);
}

// (Pc) => MethodImplementation
function parseMethodImplementation(pc) {
// Int
var position = pc.position();
// String
var name = pc.consume(TokenType.lower());
// Array[String]
var parameters = pc.lookahead("method parameter", [Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
// Array[String]
var result = parseCommaList(pc, (function() {
return pc.consume(TokenType.lower());
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
// Array[Statement]
var body = parseBody(pc);
return MethodImplementation.methodImplementation(position, name, parameters, body);
}

// (Pc, Bool) => Pair[Option[String], Array[MethodImplementation]]
function parseMethodImplementations(pc, allowThisName) {
pc.consume(TokenType.leftCurly());
// Option[String]?
var thisName = if_((!allowThisName), (function() {
return Option.none();
}), (function() {
return pc.lookahead("this =>", [Pair.pair([TokenType.lower(), TokenType.rightThickArrow()], (function() {
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.rightThickArrow());
return Option.some(name);
})), Pair.pair([], (function() {
return Option.none();
}))]);
}));
// ArrayBuilder[_396]
var result = newArrayBuilder();
while_((function() {
return pc.lookahead("method implementation", [Pair.pair([TokenType.separator(), TokenType.rightCurly()], (function() {
pc.consume(TokenType.separator());
pc.consume(TokenType.rightCurly());
return false;
})), Pair.pair([TokenType.rightCurly()], (function() {
pc.consume(TokenType.rightCurly());
return false;
})), Pair.pair([TokenType.separator()], (function() {
pc.consume(TokenType.separator());
return true;
})), Pair.pair([], (function() {
return true;
}))]);
}), (function() {
return result.push(parseMethodImplementation(pc));
}));
return Pair.pair(thisName, result.drain());
}

// (Pc) => Term
function parseInstance(pc) {
// Int
var position = pc.position();
// Option[String]?
var moduleName = pc.lookahead("type constructor", [Pair.pair([TokenType.upper(), TokenType.dot()], (function() {
// String
var name = pc.consume(TokenType.upper());
pc.consume(TokenType.dot());
return Option.some(name);
})), Pair.pair([], (function() {
return Option.none();
}))]);
// String
var name = pc.consume(TokenType.upper());
// Pair[Option[String], Array[MethodImplementation]]
var pair = parseMethodImplementations(pc, true);
return Term.instance(position, (function(_match) { switch(_match._) {
case "some":
var m = _match.value;
return (m + "." + name);
case "none":
return name;
}})(moduleName), pair.first, pair.second);
}

// (Pc) => Term
function parseArray(pc) {
// Int
var position = pc.position();
pc.consume(TokenType.leftSquare());
// Array[Term]
var elements = parseCommaList(pc, (function() {
return parseTerm(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return Term.arrayValue(position, elements);
}

// (Pc) => Term
function parseAtom(pc) {
return pc.lookahead("atom", [Pair.pair([TokenType.leftSquare()], (function() {
return parseArray(pc);
})), Pair.pair([TokenType.lower(), TokenType.rightThickArrow()], (function() {
return parseLambda(pc);
})), Pair.pair([TokenType.leftRound(), TokenType.lower(), TokenType.comma()], (function() {
return parseLambda(pc);
})), Pair.pair([TokenType.leftRound(), TokenType.lower(), TokenType.rightRound(), TokenType.rightThickArrow()], (function() {
return parseLambda(pc);
})), Pair.pair([TokenType.leftRound(), TokenType.rightRound(), TokenType.rightThickArrow()], (function() {
return parseLambda(pc);
})), Pair.pair([TokenType.leftCurly()], (function() {
return parseLambda(pc);
})), Pair.pair([TokenType.upper(), TokenType.leftCurly()], (function() {
return parseInstance(pc);
})), Pair.pair([TokenType.upper(), TokenType.dot(), TokenType.upper(), TokenType.leftCurly()], (function() {
return parseInstance(pc);
})), Pair.pair([TokenType.upper()], (function() {
return parseStaticCall(pc);
})), Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
// Term
var result = parseTerm(pc);
pc.consume(TokenType.rightRound());
return result;
})), Pair.pair([TokenType.lower()], (function() {
// Int
var position = pc.position();
// String
var name = pc.consume(TokenType.lower());
return Term.variable(position, name);
})), Pair.pair([TokenType.codeUnit()], (function() {
// Int
var position = pc.position();
// String
var codeUnit = pc.consume(TokenType.codeUnit());
return Term.codeUnitValue(position, codeUnit);
})), Pair.pair([TokenType.text()], (function() {
// Int
var position = pc.position();
// String
var text = pc.consume(TokenType.text());
return Term.textValue(position, text);
})), Pair.pair([TokenType.textStart()], (function() {
return parseText(pc);
})), Pair.pair([TokenType.numeral()], (function() {
// Int
var position = pc.position();
// String
var value = pc.consume(TokenType.numeral());
return Term.integerValue(position, value);
})), Pair.pair([TokenType.floating()], (function() {
// Int
var position = pc.position();
// String
var value = pc.consume(TokenType.floating());
return Term.floatingValue(position, value);
}))]);
}

// (Pc) => Term
function parseText(pc) {
// Int
var position = pc.position();
// ArrayBuilder[_688]
var parts = newArrayBuilder();
// String
var firstText = pc.consume(TokenType.textStart());
when((firstText.length > 0), (function() {
return parts.push(Term.textValue(position, firstText));
}));
// Bool?
var done = false;
while_((function() {
return (!done);
}), (function() {
parts.push(parseTerm(pc));
return pc.lookahead("end of string", [Pair.pair([TokenType.textEnd()], (function() {
// String
var text = pc.consume(TokenType.textEnd());
when((text.length > 0), (function() {
return parts.push(Term.textValue(position, text));
}));
done = true;
})), Pair.pair([TokenType.textMiddle()], (function() {
// String
var text = pc.consume(TokenType.textMiddle());
return when((text.length > 0), (function() {
return parts.push(Term.textValue(position, text));
}));
}))]);
}));
return Term.textLiteral(position, parts.drain());
}

// (Pc) => Pair[String, Term]
function parseNamedArgument(pc) {
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.assign());
// Term
var term = parseTerm(pc);
return Pair.pair(name, term);
}

// (Pc) => Arguments
function parseArguments(pc) {
// Bool?
var named = false;
pc.consume(TokenType.leftRound());
// Array[Pair[String, Term]?]
var arguments = parseCommaList(pc, (function() {
return pc.lookahead("method argument", [Pair.pair([TokenType.lower(), TokenType.assign()], (function() {
named = true;
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.assign());
return Pair.pair(name, parseTerm(pc));
})), Pair.pair([], (function() {
when(named, (function() {
return panic("Unexpected unnamed argument after named argument");
}));
return Pair.pair("", parseTerm(pc));
}))]);
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
return Arguments.arguments(map(filter(arguments, (function(a) {
return (a.first == "");
})), (function(a) {
return a.second;
})), map(indexed(filter(arguments, (function(a) {
return (a.first != "");
}))), (function(i) {
return NamedArgument.namedArgument(i.first, i.second.first, i.second.second);
})));
}

// (Pc) => Term
function parseStaticCall(pc) {
// String
var module = pc.consume(TokenType.upper());
// Option[String]?
var name = pc.lookahead("type name", [Pair.pair([TokenType.dot(), TokenType.upper()], (function() {
pc.consume(TokenType.dot());
return Option.some(pc.consume(TokenType.upper()));
})), Pair.pair([], (function() {
return Option.none();
}))]);
// String
var lastName = or(name, module);
// Int
var position = pc.position();
// String
var methodName = pc.lookahead("call", [Pair.pair([TokenType.dot(), TokenType.lower()], (function() {
pc.consume(TokenType.dot());
return pc.consume(TokenType.lower());
})), Pair.pair([TokenType.leftRound()], (function() {
return (lastName.substr(0, 1).toLowerCase() + lastName.substr(1));
}))]);
// Arguments
var arguments = pc.lookahead("arguments", [Pair.pair([TokenType.leftRound()], (function() {
return parseArguments(pc);
})), Pair.pair([], (function() {
return Arguments.arguments([], []);
}))]);
// String
var staticName = (function(_match) { switch(_match._) {
case "some":
var n = _match.value;
return (module + "." + n);
case "none":
return module;
}})(name);
return Term.staticCall(position, staticName, methodName, arguments);
}

// (Pc) => Term
function parseCall(pc) {
// Term
var result = parseAtom(pc);
while_((function() {
return pc.lookahead("method", [Pair.pair([TokenType.leftRound()], (function() {
return true;
})), Pair.pair([TokenType.dot()], (function() {
return true;
})), Pair.pair([], (function() {
return false;
}))]);
}), (function() {
// Bool?
var named = false;
// Int
var position = pc.position();
// String
var methodName = pc.lookahead("method call", [Pair.pair([TokenType.dot()], (function() {
pc.consume(TokenType.dot());
return pc.consume(TokenType.lower());
})), Pair.pair([TokenType.leftRound()], (function() {
return "invoke";
}))]);
result = pc.lookahead("method call", [Pair.pair([TokenType.leftRound()], (function() {
// Arguments
var arguments = parseArguments(pc);
return Term.methodCall(position, result, methodName, arguments);
})), Pair.pair([], (function() {
return Term.methodCall(position, result, methodName, Arguments.arguments([], []));
}))]);
}));
return result;
}

// (Pc) => Term
function parseMinusNot(pc) {
// Int
var position = pc.position();
return pc.lookahead("unary operator", [Pair.pair([TokenType.minus()], (function() {
pc.consume(TokenType.minus());
return Term.unary(position, TokenType.minus(), parseCall(pc));
})), Pair.pair([TokenType.exclamation()], (function() {
pc.consume(TokenType.exclamation());
return Term.unary(position, TokenType.exclamation(), parseCall(pc));
})), Pair.pair([], (function() {
return parseCall(pc);
}))]);
}

// (Pc) => Term
function parseTimesDivide(pc) {
return parseLeftAssociative(pc, (function() {
return parseMinusNot(pc);
}), [TokenType.star(), TokenType.slash()]);
}

// (Pc) => Term
function parsePlusMinus(pc) {
return parseLeftAssociative(pc, (function() {
return parseTimesDivide(pc);
}), [TokenType.plus(), TokenType.minus()]);
}

// (Pc) => Term
function parseInequality(pc) {
return parseLeftAssociative(pc, (function() {
return parsePlusMinus(pc);
}), [TokenType.equal(), TokenType.notEqual(), TokenType.less(), TokenType.lessEqual(), TokenType.greater(), TokenType.greaterEqual()]);
}

// (Pc) => Term
function parseAndOr(pc) {
return parseLeftAssociative(pc, (function() {
return parseInequality(pc);
}), [TokenType.and(), TokenType.or()]);
}

// (Pc) => Term
function parseMatch(pc) {
// Term
var value = parseAndOr(pc);
return pc.lookahead("match", [Pair.pair([TokenType.question()], (function() {
// Int
var position = pc.position();
pc.consume(TokenType.question());
// Pair[Option[String], Array[MethodImplementation]]
var cases = parseMethodImplementations(pc, false);
return Term.match(position, value, map(cases.second, (function(m) {
return MatchCase.matchCase(m, []);
})));
})), Pair.pair([], (function() {
return value;
}))]);
}

// (Pc) => Term
function parseTerm(pc) {
return parseMatch(pc);
}

// (Pc) => Statement
function parseFfi(pc) {
// Int
var position = pc.position();
// String
var language = pc.consume(TokenType.lower());
when((language != "js"), (function() {
return panic(("Expected FFI js, got FFI " + language));
}));
// String
var code = pc.consume(TokenType.text());
return Statement.ffi(position, language, code);
}

// (Pc) => Array[Statement]
function parseBody(pc) {
pc.consume(TokenType.leftCurly());
// ArrayBuilder[_1144]
var result = newArrayBuilder();
while_((function() {
return pc.lookahead("statement or }", [Pair.pair([TokenType.rightCurly()], (function() {
pc.consume(TokenType.rightCurly());
return false;
})), Pair.pair([TokenType.separator(), TokenType.rightCurly()], (function() {
pc.consume(TokenType.separator());
pc.consume(TokenType.rightCurly());
return false;
})), Pair.pair([TokenType.separator()], (function() {
pc.consume(TokenType.separator());
return true;
})), Pair.pair([], (function() {
return true;
}))]);
}), (function() {
result.push(parseStatement(pc));
return pc.lookahead("line break, ';' or '}'", [Pair.pair([TokenType.rightCurly()], (function() {
})), Pair.pair([TokenType.separator()], (function() {
}))]);
}));
return result.drain();
}

// (Pc) => Statement
function parseStatement(pc) {
// Int
var position = pc.position();
return pc.lookahead("statement", [Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.leftCurly()], (function() {
return Statement.functions(parseFunctionDefinitions(pc));
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.colon()], (function() {
return Statement.functions(parseFunctionDefinitions(pc));
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.lower(), TokenType.colon()], (function() {
return Statement.functions(parseFunctionDefinitions(pc));
})), Pair.pair([TokenType.lower(), TokenType.colon()], (function() {
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.colon());
// Option[Type]?
var type = pc.lookahead("type", [Pair.pair([TokenType.assign()], (function() {
return Option.none();
})), Pair.pair([], (function() {
return Option.some(parseType(pc));
}))]);
pc.consume(TokenType.assign());
// Term
var value = parseTerm(pc);
return Statement.let_(position, name, type, value);
})), Pair.pair([TokenType.lower(), TokenType.assign()], (function() {
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.assign());
// Term
var value = parseTerm(pc);
return Statement.assign(position, name, value);
})), Pair.pair([TokenType.lower(), TokenType.increment()], (function() {
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.increment());
// Term
var value = parseTerm(pc);
return Statement.increment(position, name, value);
})), Pair.pair([TokenType.lower(), TokenType.decrement()], (function() {
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.decrement());
// Term
var value = parseTerm(pc);
return Statement.decrement(position, name, value);
})), Pair.pair([TokenType.lower(), TokenType.text()], (function() {
return parseFfi(pc);
})), Pair.pair([], (function() {
// Term
var term = parseTerm(pc);
return Statement.term(position, term);
}))]);
}

// (Pc) => String
function parseTypeParameter(pc) {
return pc.consume(TokenType.lower());
}

// (Pc) => Parameter
function parseParameter(pc) {
// Int
var position = pc.position();
// String
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.colon());
// Type
var type = parseType(pc);
return Parameter.parameter(position, name, type);
}

// (Pc) => MethodSignature
function parseMethodSignature(pc) {
// Int
var position = pc.position();
// String
var name = pc.consume(TokenType.lower());
// Array[String]
var typeParameters = pc.lookahead("type parameters", [Pair.pair([TokenType.leftSquare()], (function() {
pc.consume(TokenType.leftSquare());
// Array[String]
var result = parseCommaList(pc, (function() {
return parseTypeParameter(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
// Array[Parameter]
var parameters = pc.lookahead("parameters", [Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
// Array[Parameter]
var result = parseCommaList(pc, (function() {
return parseParameter(pc);
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
// Type
var returnType = pc.lookahead("return type", [Pair.pair([TokenType.colon()], (function() {
pc.consume(TokenType.colon());
return parseType(pc);
})), Pair.pair([], (function() {
return Type.constructor(position, "_.Void", []);
}))]);
return MethodSignature.methodSignature(position, name, typeParameters, parameters, returnType);
}

// (Pc) => Array[FunctionDefinition]
function parseFunctionDefinitions(pc) {
// Int
var position = pc.position();
// ArrayBuilder[_1476]
var result = newArrayBuilder();
while_((function() {
return pc.lookahead("function", [Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.leftCurly()], (function() {
return true;
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.colon()], (function() {
return true;
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.lower(), TokenType.colon()], (function() {
return true;
})), Pair.pair([TokenType.separator(), TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.leftCurly()], (function() {
pc.consume(TokenType.separator());
return true;
})), Pair.pair([TokenType.separator(), TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.colon()], (function() {
pc.consume(TokenType.separator());
return true;
})), Pair.pair([TokenType.separator(), TokenType.lower(), TokenType.leftRound(), TokenType.lower(), TokenType.colon()], (function() {
pc.consume(TokenType.separator());
return true;
})), Pair.pair([], (function() {
return false;
}))]);
}), (function() {
return result.push(parseFunctionDefinition(pc));
}));
return result.drain();
}

// (Pc) => FunctionDefinition
function parseFunctionDefinition(pc) {
// Int
var position = pc.position();
// MethodSignature
var signature = parseMethodSignature(pc);
// Array[Statement]
var body = parseBody(pc);
return FunctionDefinition.functionDefinition(position, signature, body);
}

// (Pc) => Array[MethodSignature]
function parseMethodSignatures(pc) {
pc.consume(TokenType.leftCurly());
// ArrayBuilder[_1582]
var result = newArrayBuilder();
while_((function() {
return pc.lookahead("method signature or }", [Pair.pair([TokenType.rightCurly()], (function() {
pc.consume(TokenType.rightCurly());
return false;
})), Pair.pair([TokenType.separator(), TokenType.rightCurly()], (function() {
pc.consume(TokenType.separator());
pc.consume(TokenType.rightCurly());
return false;
})), Pair.pair([TokenType.separator()], (function() {
pc.consume(TokenType.separator());
return true;
})), Pair.pair([], (function() {
return true;
}))]);
}), (function() {
result.push(parseMethodSignature(pc));
return pc.lookahead("line break, ';' or '}'", [Pair.pair([TokenType.rightCurly()], (function() {
})), Pair.pair([TokenType.separator()], (function() {
}))]);
}));
return result.drain();
}

// (Pc) => TypeDefinition
function parseTypeDefinition(pc) {
// Int
var position = pc.position();
// String
var name = pc.consume(TokenType.upper());
// Array[String]
var typeParameters = pc.lookahead("type parameters", [Pair.pair([TokenType.leftSquare()], (function() {
pc.consume(TokenType.leftSquare());
// Array[String]
var result = parseCommaList(pc, (function() {
return parseTypeParameter(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
// Bool?
var isSum = pc.lookahead("type parameters", [Pair.pair([TokenType.question()], (function() {
pc.consume(TokenType.question());
return true;
})), Pair.pair([], (function() {
return false;
}))]);
// Bool?
var isRecord = false;
// Array[MethodSignature?]
var methodSignatures = pc.lookahead("method signatures", [Pair.pair([TokenType.leftRound()], (function() {
// Int
var methodPosition = position;
pc.consume(TokenType.leftRound());
// Array[Parameter]
var parameters = parseCommaList(pc, (function() {
return parseParameter(pc);
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
// String
var methodName = (name.substr(0, 1).toLowerCase() + name.substr(1));
isRecord = true;
return [MethodSignature.methodSignature(methodPosition, methodName, [], parameters, Type.constructor(methodPosition, "_.Void", []))];
})), Pair.pair([], (function() {
return parseMethodSignatures(pc);
}))]);
return TypeDefinition.typeDefinition(position, name, typeParameters, (isSum || isRecord), methodSignatures);
}

// (Pc, String, String, String, String) => Module
function parseModule(pc, package_, alias, file, source) {
// ArrayBuilder[_1759]
var typeDefinitions = newArrayBuilder();
// ArrayBuilder[_1763]
var functionDefinitions = newArrayBuilder();
while_((function() {
return pc.lookahead("definition or end of file", [Pair.pair([TokenType.outsideFile()], (function() {
return false;
})), Pair.pair([TokenType.separator(), TokenType.outsideFile()], (function() {
pc.consume(TokenType.separator());
return false;
})), Pair.pair([TokenType.separator()], (function() {
pc.consume(TokenType.separator());
return true;
})), Pair.pair([], (function() {
return true;
}))]);
}), (function() {
pc.lookahead("definition", [Pair.pair([TokenType.lower()], (function() {
return functionDefinitions.push(parseFunctionDefinition(pc));
})), Pair.pair([], (function() {
return typeDefinitions.push(parseTypeDefinition(pc));
}))]);
return pc.lookahead("line break", [Pair.pair([TokenType.outsideFile()], (function() {
})), Pair.pair([TokenType.separator()], (function() {
}))]);
}));
return Module.module(package_, file, alias, source, typeDefinitions.drain(), functionDefinitions.drain());
}

// (Array[Pair[String, String]]) => Void
function testAll(moduleSources) {
// Array[Pair[String, Module]?]
var parsedModules = map(moduleSources, (function(p) {
// String
var moduleName = p.first;
console.log('Parsing ' + moduleName);
// Array[Token]
var tokens = lexTokens(p.second);
// Pc
var pc = newPc(newTokenCursor(tokens, 0), p.second);
return Pair.pair(p.first, parseModule(pc, "_current", "_Current", p.first, p.second));
}));
console.dir(parsedModules);
// Resolver
var resolver = newResolver(map(parsedModules, (function(p) {
return p.second;
})));
// Array[Pair[String, Module]?]
var resolvedModules = map(parsedModules, (function(p) {
// String
var moduleName = p.first;
console.log('Resolving ' + moduleName);
return Pair.pair(p.first, resolveModule(resolver, p.second));
}));
console.dir(resolvedModules);
}

// (Resolver, Module) => Module
function resolveModule(resolver, module) {
resolver.setSource(module.source);
return Module.module(module.package_, module.file, module.alias, module.source, map(module.typeDefinitions, (function(d) {
return resolveTypeDefinition(resolver, d);
})), map(module.functionDefinitions, (function(d) {
return resolveFunctionDefinition(resolver, d);
})));
}

// (Resolver, TypeDefinition) => TypeDefinition
function resolveTypeDefinition(resolver, d) {
return resolver.scope((function() {
// String
var symbol = resolver.typeConstructor(d.position, d.symbol);
// Array[String]
var typeParameters = map(d.typeParameters, (function(p) {
return resolver.addTypeParameter(d.position, p);
}));
// Array[MethodSignature]
var methodSignatures = map(d.methodSignatures, (function(s) {
return resolveMethodSignatureInScope(resolver, s);
}));
return TypeDefinition.typeDefinition(d.position, symbol, typeParameters, d.isSum, methodSignatures);
}));
}

// (Resolver, FunctionDefinition) => FunctionDefinition
function resolveFunctionDefinition(resolver, d) {
return resolver.scope((function() {
// MethodSignature
var signature = resolveMethodSignatureInScope(resolver, d.signature);
// Array[Statement]
var body = resolveBody(resolver, d.body);
return FunctionDefinition.functionDefinition(d.position, signature, body);
}));
}

// (Resolver, MethodSignature) => MethodSignature
function resolveMethodSignatureInScope(resolver, s) {
// Array[String]
var typeParameters = map(s.typeParameters, (function(p) {
return resolver.addTypeParameter(s.position, p);
}));
// Array[Parameter?]
var parameters = map(s.parameters, (function(p) {
return Parameter.parameter(p.position, resolver.addVariable(p.position, p.name), resolveType(resolver, p.type));
}));
// Type
var returnType = resolveType(resolver, s.returnType);
return MethodSignature.methodSignature(s.position, s.symbol, s.typeParameters, parameters, returnType);
}

// (Resolver, MethodImplementation) => MethodImplementation
function resolveMethodImplementation(resolver, i) {
return resolver.scope((function() {
// Array[String]
var parameters = map(i.parameters, (function(p) {
return resolver.addVariable(i.position, p);
}));
// Array[Statement]
var body = resolveBody(resolver, i.body);
return MethodImplementation.methodImplementation(i.position, i.name, parameters, body);
}));
}

// (Resolver, MatchCase) => MatchCase
function resolveMatchCase(resolver, case_) {
return MatchCase.matchCase(resolveMethodImplementation(resolver, case_.body), case_.fieldNames);
}

// (Resolver, Array[Statement]) => Array[Statement]
function resolveBody(resolver, body) {
return resolver.scope((function() {
return map(body, (function(s) {
return resolveStatement(resolver, s);
}));
}));
}

// (Resolver, Statement) => Statement
function resolveStatement(resolver, statement) {
return (function(_match) { switch(_match._) {
case "term":
var position = _match.position;
var term = _match.term;
return Statement.term(position, resolveTerm(resolver, term));
case "let":
var position = _match.position;
var variable = _match.variable;
var type = _match.type;
var value = _match.value;
resolver.assertNoVariable(position, variable);
resolver.addVariable(position, variable);
// Option[Type]?
var variableType = (function(_match) { switch(_match._) {
case "some":
var t = _match.value;
return Option.some(resolveType(resolver, t));
case "none":
return Option.none();
}})(type);
return Statement.let_(position, resolver.variable(position, variable), variableType, resolveTerm(resolver, value));
case "functions":
var definitions = _match.definitions;
each(definitions, (function(d) {
return resolver.addVariable(d.position, d.signature.symbol);
}));
return Statement.functions(map(definitions, (function(d) {
return resolveFunctionDefinition(resolver, d);
})));
case "assign":
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
return Statement.assign(position, resolver.variable(position, variable), resolveTerm(resolver, value));
case "increment":
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
return Statement.increment(position, resolver.variable(position, variable), resolveTerm(resolver, value));
case "decrement":
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
return Statement.decrement(position, resolver.variable(position, variable), resolveTerm(resolver, value));
case "ffi":
var position = _match.position;
var language = _match.language;
var code = _match.code;
return Statement.ffi(position, language, code);
}})(statement);
}

// (Resolver, Type) => Type
function resolveType(resolver, type) {
return (function(_match) { switch(_match._) {
case "constructor":
var position = _match.position;
var symbol = _match.symbol;
var typeArguments = _match.typeArguments;
// String
var resolvedSymbol = resolver.typeConstructor(position, symbol);
// Array[Type]
var resolvedTypeArguments = map(typeArguments, (function(a) {
return resolveType(resolver, a);
}));
return Type.constructor(position, resolvedSymbol, resolvedTypeArguments);
case "parameter":
var position = _match.position;
var name = _match.name;
return Type.parameter(position, resolver.typeParameter(position, name));
case "variable":
var position = _match.position;
var id = _match.id;
return type;
}})(type);
}

// (Resolver, Term) => Term
function resolveTerm(resolver, term) {
return (function(_match) { switch(_match._) {
case "binary":
var position = _match.position;
var operator = _match.operator;
var left = _match.left;
var right = _match.right;
return Term.binary(position, operator, resolveTerm(resolver, left), resolveTerm(resolver, right));
case "unary":
var position = _match.position;
var operator = _match.operator;
var value = _match.value;
return Term.unary(position, operator, resolveTerm(resolver, value));
case "codeUnitValue":
var position = _match.position;
var value = _match.value;
return term;
case "textValue":
var position = _match.position;
var value = _match.value;
return term;
case "textLiteral":
var position = _match.position;
var parts = _match.parts;
return Term.textLiteral(position, map(parts, (function(p) {
return resolveTerm(resolver, p);
})));
case "integerValue":
var position = _match.position;
var value = _match.value;
return term;
case "floatingValue":
var position = _match.position;
var value = _match.value;
return term;
case "arrayValue":
var position = _match.position;
var elements = _match.elements;
return Term.arrayValue(position, map(elements, (function(e) {
return resolveTerm(resolver, e);
})));
case "thisModule":
var position = _match.position;
return term;
case "variable":
var position = _match.position;
var symbol = _match.symbol;
return Term.variable(position, resolver.variable(position, symbol));
case "staticCall":
var position = _match.position;
var symbol = _match.symbol;
var methodName = _match.name;
var arguments = _match.arguments;
// String
var resolvedSymbol = resolver.staticName(position, symbol);
// Array[Term]
var resolvedArguments = map(arguments.unnamed, (function(a) {
return resolveTerm(resolver, a);
}));
// Array[NamedArgument?]
var resolvedNamedArguments = map(arguments.named, (function(a) {
return NamedArgument.namedArgument(a.order, a.name, resolveTerm(resolver, a.value));
}));
return Term.staticCall(position, resolvedSymbol, methodName, Arguments.arguments(resolvedArguments, resolvedNamedArguments));
case "methodCall":
var position = _match.position;
var value = _match.value;
var methodName = _match.name;
var arguments = _match.arguments;
// Term
var resolvedValue = resolveTerm(resolver, value);
// Array[Term]
var resolvedArguments = map(arguments.unnamed, (function(a) {
return resolveTerm(resolver, a);
}));
// Array[NamedArgument?]
var resolvedNamedArguments = map(arguments.named, (function(a) {
return NamedArgument.namedArgument(a.order, a.name, resolveTerm(resolver, a.value));
}));
return Term.methodCall(position, resolvedValue, methodName, Arguments.arguments(resolvedArguments, resolvedNamedArguments));
case "instance":
var position = _match.position;
var symbol = _match.symbol;
var thisName = _match.thisName;
var methods = _match.methods;
(function(_match) { switch(_match._) {
case "some":
var n = _match.value;
return resolver.addVariable(position, n);
case "none":
return "";
}})(thisName);
// String
var resolvedSymbol = resolver.typeConstructor(position, symbol);
// Array[MethodImplementation]
var resolvedMethods = map(methods, (function(i) {
return resolveMethodImplementation(resolver, i);
}));
return Term.instance(position, resolvedSymbol, thisName, resolvedMethods);
case "match":
var position = _match.position;
var value = _match.value;
var cases = _match.cases;
// Term
var resolvedValue = resolveTerm(resolver, value);
// Array[MatchCase]
var resolvedCases = map(cases, (function(c) {
return resolveMatchCase(resolver, c);
}));
return Term.match(position, resolvedValue, resolvedCases);
case "lambda":
var position = _match.position;
var parameters = _match.parameters;
var body = _match.body;
return resolver.scope((function() {
// Array[String]
var resolvedParameters = map(parameters, (function(p) {
return resolver.addVariable(position, p);
}));
// Array[Statement]
var resolvedBody = resolveBody(resolver, body);
return Term.lambda(position, resolvedParameters, resolvedBody);
}));
case "ffiJs":
var position = _match.position;
var code = _match.code;
return term;
}})(term);
}

// (Array[Module]) => Resolver
function newResolver(modules) {
// String
var source = "";
// F2[String, Int, _2221]
var error = (function(e, p) {
return panic((e + " " + positionText(newCharCursor(source), p)));
});
// Array[String]
var preludeTypes = ["Void", "Bool", "String", "Int", "Float", "Array", "Option", "Pair", "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"];
// Array[String]
var modulePreludeTypes = map(preludeTypes, (function(t) {
return ("_." + t);
}));
// Array[String]
var canonicalPreludeTypes = map(preludeTypes, (function(t) {
return (t + "@_");
}));
// Array[Pair[String, String]]
var preludeTypeConstructors = zip(preludeTypes.concat(modulePreludeTypes), canonicalPreludeTypes.concat(canonicalPreludeTypes));
// Array[Pair[String, String]?]
var allTypes = flatten(map(modules, (function(m) {
return map(m.typeDefinitions, (function(d) {
return Pair.pair(d.symbol, (d.symbol + "@" + m.package_));
}));
})));
// Array[Pair[String, String]?]
var allFunctions = flatten(map(modules, (function(m) {
return map(m.functionDefinitions, (function(d) {
return Pair.pair(d.signature.symbol, (d.signature.symbol + "@" + m.package_));
}));
})));
// StringMapBuilder[_2295]
var definedTypes = newStringMapBuilder([]);
// StringMapBuilder[_2300]
var definedFunctions = newStringMapBuilder([]);
each(allTypes, (function(p) {
when(definedTypes.has(p.second), (function() {
return panic(("Duplicate type definition: " + p.first));
}));
return definedTypes.set(p.second, true);
}));
each(allFunctions, (function(p) {
when(definedFunctions.has(p.second), (function() {
return panic(("Duplicate function definition: " + p.first));
}));
return definedFunctions.set(p.second, true);
}));
// StringMapBuilder[String]
var typeConstructors = newStringMapBuilder(preludeTypeConstructors.concat(allTypes));
// StringMapBuilder[String]
var functions = newStringMapBuilder(allFunctions);
// StringMapBuilder[String]
var moduleAliases = newStringMapBuilder(map(modules, (function(m) {
return Pair.pair(m.alias, (m.package_));
})));
// StringMapBuilder[String]
var moduleTypeConstructors = newStringMapBuilder(flatten(map(modules, (function(m) {
return map(m.typeDefinitions, (function(d) {
return Pair.pair((m.alias + "." + d.symbol), (d.symbol + "@" + m.package_));
}));
}))));
// StringMapBuilder[_2388]
var variables = newStringMapBuilder([]);
// StringMapBuilder[_2393]
var typeParameters = newStringMapBuilder([]);
return {
typeConstructor: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some":
var x = _match.value;
return x;
case "none":
return (function(_match) { switch(_match._) {
case "some":
var x = _match.value;
return x;
case "none":
return error(("No such type: " + symbol), position);
}})(moduleTypeConstructors.get(symbol));
}})(typeConstructors.get(symbol));
},
typeParameter: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some":
var x = _match.value;
return x;
case "none":
return error(("No such type parameter: " + symbol), position);
}})(typeParameters.get(symbol));
},
staticName: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some":
var x = _match.value;
return x;
case "none":
return (function(_match) { switch(_match._) {
case "some":
var x = _match.value;
return x;
case "none":
return (function(_match) { switch(_match._) {
case "some":
var x = _match.value;
return x;
case "none":
return error(("No such module or type: " + symbol), position);
}})(moduleTypeConstructors.get(symbol));
}})(moduleAliases.get(symbol));
}})(typeConstructors.get(symbol));
},
variable: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some":
var x = _match.value;
return x;
case "none":
return (function(_match) { switch(_match._) {
case "none":
return error(("No such variable or function: " + symbol), position);
case "some":
var x = _match.value;
return x;
}})(functions.get(symbol));
}})(variables.get(symbol));
},
assertNoVariable: function(position, name) {
return when(variables.has(name), (function() {
return error(("Suspicious shadowing of variable: " + name), position);
}));
},
addVariable: function(position, name) {
variables.set(name, name);
return name;
},
addTypeParameter: function(position, name) {
(function(_match) { switch(_match._) {
case "some":
var n = _match.value;
return error(("Suspicious shadowing of type parameter: " + name), position);
case "none":
return "";
}})(typeParameters.get(name));
typeParameters.set(name, name);
return name;
},
scope: function(body) {
// Array[Pair[String, String]]
var savedTypeConstructors = typeConstructors.toArray();
// Array[Pair[String, String]]
var savedVariables = variables.toArray();
// Array[Pair[String, String]]
var savedTypeParameters = typeParameters.toArray();
// t
var result = body();
typeConstructors = newStringMapBuilder(savedTypeConstructors);
variables = newStringMapBuilder(savedVariables);
typeParameters = newStringMapBuilder(savedTypeParameters);
return result;
},
setSource: function(text) {
source = text;
}
};
}

// (String) => CharCursor
function newCharCursor(buffer) {
// ArrayBuilder[_2463]
var stack = newArrayBuilder();
// Int
var offset = 0;
return {
offset: function() {
var this_ = this;
return offset;
},
buffer: function() {
var this_ = this;
return buffer;
},
invoke: function(ahead) {
var this_ = this;
// Int
var i = (offset + ahead);
return if_(((i < 0) || (i >= buffer.length)), (function() {
return 0;
}), (function() {
return buffer.charCodeAt(i);
}));
},
skip: function(ahead) {
var this_ = this;
offset += ahead;
},
pastEnd: function() {
var this_ = this;
return (offset >= buffer.length);
},
lookAhead: function(ahead) {
var this_ = this;
// Bool?
var result = true;
// Int
var i = 0;
while_((function() {
return (i < ahead.length);
}), (function() {
when((ahead[i] != this_.invoke(i)), (function() {
result = false;
}));
i += 1;
}));
return result;
},
top: function(closeSymbol) {
var this_ = this;
return ((stack.size() != 0) && (stack.invoke((stack.size() - 1)) == closeSymbol));
},
push: function(closeSymbol) {
var this_ = this;
return stack.push(closeSymbol);
},
pop: function(closeSymbol) {
var this_ = this;
when((stack.size() == 0), (function() {
return panic(("Unexpected '" + codeUnit(closeSymbol) + "' " + positionText(this_, offset)));
}));
when((stack.invoke((stack.size() - 1)) != closeSymbol), (function() {
return panic(("Expected '" + codeUnit(stack.invoke((stack.size() - 1))) + "', got '" + codeUnit(closeSymbol) + "' " + positionText(this_, offset)));
}));
return stack.pop();
},
skipWhitespace: function() {
var this_ = this;
// Bool
var ignoreNewLine = ((stack.size() > 0) && (((stack.invoke((stack.size() - 1)) == 41) || (stack.invoke((stack.size() - 1)) == 93)) || (stack.invoke((stack.size() - 1)) == 34)));
return while_((function() {
return ((offset < buffer.length) && ((((this_.invoke(0) == 32) || (this_.invoke(0) == 9)) || (this_.invoke(0) == 13)) || (ignoreNewLine && (this_.invoke(0) == 10))));
}), (function() {
return this_.skip(1);
}));
},
position: function(offset) {
var this_ = this;
// Int
var at = 0;
// Int
var line = 1;
// Int
var column = 1;
while_((function() {
return (at < offset);
}), (function() {
if_(((at < buffer.length) && (buffer.charCodeAt(at) == 10)), (function() {
line += 1;
column = 1;
}), (function() {
column += 1;
}));
at += 1;
}));
return Position.position(line, column, buffer, offset);
}
};
}

// (Int) => String
function codeUnit(c) {
return String.fromCharCode(c);
}

// (CharCursor, Int) => String
function positionText(cursor, offset) {
// Position
var position = cursor.position(offset);
return ("at line " + ("" + position.line) + " column " + ("" + position.column));
}

// (Array[Pair[String, v]]) => StringMap[v]
function newStringMap(array) {
// StringMapBuilder[v]
var builder = newStringMapBuilder(array);
return {
invoke: function(key) {
return builder.invoke(key);
},
get: function(key) {
return builder.get(key);
},
has: function(key) {
return builder.has(key);
}
};
}

// (Array[Pair[String, v]]) => StringMapBuilder[v]
function newStringMapBuilder(array) {
var map = {};
// StringMapBuilder[_2617]?!
var builder = {
invoke: function(key) {
var this_ = this;
return if_(this_.has(key), (function() {
return map[key];
}), (function() {
return panic(("No such key: " + key));
}));
},
get: function(key) {
var this_ = this;
return if_(this_.has(key), (function() {
return Option.some(map[key]);
}), (function() {
return Option.none();
}));
},
has: function(key) {
var this_ = this;
return Object.prototype.hasOwnProperty.call(map, key);
},
set: function(key, value) {
var this_ = this;
map[key] = value;
},
remove: function(key, value) {
var this_ = this;
delete map[key];
},
toArray: function() {
var this_ = this;
// Array[_2614]
var result = [];
for(var key in map) if(this_.has(key)) result.push(Pair.pair(key, map[key]));
return result;
},
toStringMap: function() {
var this_ = this;
return newStringMap(this_.toArray());
}
};
each(array, (function(p) {
return builder.set(p.first, p.second);
}));
return builder;
}

// (F0[Bool], F0[t]) => Case[t]
function case_(condition, body) {
return if_(condition(), (function() {
// t
var result = body();
return {
case_: function(a, b) {
var this_ = this;
return this_;
},
else_: function(b) {
var this_ = this;
return result;
}
};
}), (function() {
return {
case_: function(condition, body) {
return case_(condition, body);
},
else_: function(body) {
return body();
}
};
}));
}

// (Bool, F0[t], F0[t]) => t
function if_(condition, then, else_) {
return (condition ? then() : else_());
}

// (Bool, F0[Void]) => Void
function when(condition, then) {
return (condition ? then() : void(0));
}

// (F0[Bool], F0[Void]) => Void
function while_(condition, body) {
while(condition()) body();
}

// (F0[t]) => Void
function do_(body) {
return body();
}

// (Int, F0[Void]) => Void
function repeat(times, body) {
for(var i = 0; i < times; i++) body();
}

// (Array[a], F1[a, Void]) => Void
function each(array, body) {
for(var i = 0; i < array.length; i++) body(array[i]);
}

// (Array[a]) => Array[Pair[Int, a]]
function indexed(array) {
// Array[_2656]
var result = [];
for(var i = 0; i < array.length; i++) result.push(Pair.pair(i, array[i]));
return result;
}

// (Array[a], Array[b]) => Array[Pair[a, b]]
function zip(left, right) {
// Array[_2660]
var result = [];
for(var i = 0; i < left.length && i < right.length; i++) result.push(Pair.pair(left[i], right[i]));
return result;
}

// (Array[a], F1[a, b]) => Array[b]
function map(array, body) {
// Array[_2664]
var result = [];
for(var i = 0; i < array.length; i++) result.push(body(array[i]));
return result;
}

// (Array[a], F1[a, Bool]) => Array[a]
function filter(array, condition) {
// Array[_2668]
var result = [];
for(var i = 0; i < array.length; i++) if(condition(array[i])) result.push(array[i]);
return result;
}

// (Array[a], F1[a, Bool]) => Option[a]
function find(array, condition) {
for(var i = 0; i < array.length; i++) if(condition(array[i])) return Option.some(array[i]);
return Option.none();
}

// (Array[a]) => Option[a]
function first(array) {
return if_((array.length != 0), (function() {
return Option.some(array[0]);
}), (function() {
return Option.none();
}));
}

// (Array[a]) => Option[a]
function last(array) {
return if_((array.length != 0), (function() {
return Option.some(array[(array.length - 1)]);
}), (function() {
return Option.none();
}));
}

// (Array[a], F1[a, Bool]) => Bool
function any(array, condition) {
for(var i = 0; i < array.length; i++) if(condition(array[i])) return true;
return false;
}

// (Array[a], F1[a, Bool]) => Bool
function all(array, condition) {
for(var i = 0; i < array.length; i++) if(!condition(array[i])) return false;
return true;
}

// (Array[Array[a]]) => Array[a]
function flatten(array) {
// Array[_2702]
var result = [];
for(var i = 0; i < array.length; i++) for(var j = 0; j < array[i].length; j++) result.push(array[i][j]);
return result;
}

// (String) => a
function panic(problem) {
debugger;
throw problem;
}

// (Array[F0[Option[a]]]) => Option[a]
function orElse(options) {
// Option[_2708]?
var result = Option.none();
// Int
var i = 0;
while_((function() {
return ((result == Option.none()) && (i < options.length));
}), (function() {
result = options[i]();
i += 1;
}));
return result;
}

// (Option[a]) => a
function orPanic(option) {
return (function(_match) { switch(_match._) {
case "none":
return panic("orPanic(Option.none)");
case "some":
var value = _match.value;
return value;
}})(option);
}

// (Option[a], a) => a
function or(option, default_) {
return (function(_match) { switch(_match._) {
case "none":
return default_;
case "some":
var value = _match.value;
return value;
}})(option);
}

// (TokenCursor, String) => Pc
function newPc(cursor, buffer) {
// F1[_2731, _2732]
var tokenTypeText = (function(tokenType) {
return tokenType._;
});
// F1[_2735, _2736]
var tokenText = (function(token) {
return buffer.substring(token.from, token.to);
});
// F1[Token, String]
var positionText = (function(token) {
// Token
var token2 = token;
// Position
var position = newCharCursor(buffer).position(token.from);
return ("at line " + ("" + position.line) + " column " + ("" + position.column));
});
return {
position: function() {
return cursor.invoke(0).from;
},
consume: function(tokenType) {
// Token
var ahead = cursor.invoke(0);
when((ahead.token != tokenType), (function() {
return panic(("Expected " + tokenTypeText(tokenType) + ", got " + tokenText(ahead) + " " + positionText(ahead)));
}));
// String
var text = tokenText(ahead);
cursor.skip(1);
return text;
},
lookahead: function(expected, cases) {
// Int
var i = 0;
// Option[_2777]?
var result = Option.none();
while_((function() {
return ((i < cases.length) && (result == Option.none()));
}), (function() {
// Pair[Array[TokenType], F0[t]]
var case_ = cases[i];
// Int
var j = 0;
// Bool?
var match = true;
while_((function() {
return (j < case_.first.length);
}), (function() {
match = (match && (case_.first[j] == cursor.invoke(j).token));
j += 1;
}));
when(match, (function() {
result = Option.some(case_.second());
}));
i += 1;
}));
return (function(_match) { switch(_match._) {
case "none":
// Token
var ahead = cursor.invoke(0);
return panic(("Expected " + expected + ", got " + tokenText(ahead) + " " + positionText(ahead)));
case "some":
var value = _match.value;
return value;
}})(result);
}
};
}

// (CharCursor) => Option[Token]
function lexToken(cursor) {
return orElse([(function() {
return lexIdentifier(cursor);
}), (function() {
return lexOperator(cursor);
}), (function() {
return lexCodeUnit(cursor);
}), (function() {
return lexText(cursor);
}), (function() {
return lexBrackets(cursor);
}), (function() {
return lexSeparator(cursor);
}), (function() {
return lexNumber(cursor);
})]);
}

// (CharCursor) => Option[Token]
function lexSeparator(cursor) {
cursor.skipWhitespace();
return if_(((cursor.invoke(0) != 10) && (cursor.invoke(0) != 59)), (function() {
return Option.none();
}), (function() {
// Int
var from = cursor.offset();
while_((function() {
return ((cursor.invoke(0) == 10) || (cursor.invoke(0) == 59));
}), (function() {
cursor.skip(1);
return cursor.skipWhitespace();
}));
return Option.some(Token.token(TokenType.separator(), from, (from + 1)));
}));
}

// (CharCursor) => Option[Token]
function lexIdentifier(cursor) {
// Bool
var upper = isBetween(cursor.invoke(0), 65, 90);
return if_(((!upper) && (!isBetween(cursor.invoke(0), 97, 122))), (function() {
return Option.none();
}), (function() {
// Int
var from = cursor.offset();
while_((function() {
return ((isBetween(cursor.invoke(0), 97, 122) || isBetween(cursor.invoke(0), 65, 90)) || isBetween(cursor.invoke(0), 48, 57));
}), (function() {
return cursor.skip(1);
}));
// Int
var to = cursor.offset();
cursor.skipWhitespace();
return Option.some(Token.token(if_(upper, (function() {
return TokenType.upper();
}), (function() {
return TokenType.lower();
})), from, to));
}));
}

// (CharCursor) => Option[Token]
function lexOperator(cursor) {
// Int
var from = cursor.offset();
// F2[Array[Int], TokenType, F0[Option[Token?]?]]
var token = (function(ahead, tokenType) {
return (function() {
return if_(cursor.lookAhead(ahead), (function() {
cursor.skip(ahead.length);
return Option.some(Token.token(tokenType, from, cursor.offset()));
}), (function() {
return Option.none();
}));
});
});
// F1[Array[F0[Option[Token]]], Option[Token]?]
var firstAcceptedToken = (function(bodies) {
// Int
var i = 0;
// Option[_2946]?
var result = Option.none();
// Array[F0[Option[Token]]]
var array = bodies;
while_((function() {
return (i < array.length);
}), (function() {
result = array[i]();
when((result != Option.none()), (function() {
i = array.length;
}));
i += 1;
}));
return result;
});
// Option[Token]?
var result = firstAcceptedToken([token([45, 62], TokenType.rightThinArrow()), token([45, 61], TokenType.decrement()), token([45], TokenType.minus()), token([43, 61], TokenType.increment()), token([43], TokenType.plus()), token([61, 62], TokenType.rightThickArrow()), token([61, 61], TokenType.equal()), token([33, 61], TokenType.notEqual()), token([61], TokenType.assign()), token([42], TokenType.star()), token([47], TokenType.slash()), token([38, 38], TokenType.and()), token([124, 124], TokenType.or()), token([124, 62], TokenType.rightPipe()), token([60, 124], TokenType.leftPipe()), token([63], TokenType.question()), token([33], TokenType.exclamation()), token([58], TokenType.colon()), token([64], TokenType.atSign()), token([46], TokenType.dot()), token([44], TokenType.comma()), token([95], TokenType.underscore()), token([60, 45], TokenType.leftThinArrow()), token([60, 61], TokenType.lessEqual()), token([60], TokenType.less()), token([62, 61], TokenType.greaterEqual()), token([62], TokenType.greater())]);
when((result != Option.none()), (function() {
return cursor.skipWhitespace();
}));
return result;
}

// (CharCursor) => Option[Token]
function lexBrackets(cursor) {
// Int
var c = cursor.invoke(0);
// Int
var from = cursor.offset();
// Option[Token?]?
var result = case_((function() {
return cursor.lookAhead([40]);
}), (function() {
cursor.skip(1);
cursor.push(41);
return Option.some(Token.token(TokenType.leftRound(), from, cursor.offset()));
})).case_((function() {
return cursor.lookAhead([41]);
}), (function() {
cursor.skip(1);
cursor.pop(41);
return Option.some(Token.token(TokenType.rightRound(), from, cursor.offset()));
})).case_((function() {
return cursor.lookAhead([91]);
}), (function() {
cursor.skip(1);
cursor.push(93);
return Option.some(Token.token(TokenType.leftSquare(), from, cursor.offset()));
})).case_((function() {
return cursor.lookAhead([93]);
}), (function() {
cursor.skip(1);
cursor.pop(93);
return Option.some(Token.token(TokenType.rightSquare(), from, cursor.offset()));
})).case_((function() {
return cursor.lookAhead([123]);
}), (function() {
cursor.skip(1);
cursor.push(125);
return Option.some(Token.token(TokenType.leftCurly(), from, cursor.offset()));
})).case_((function() {
return cursor.lookAhead([125]);
}), (function() {
cursor.skip(1);
cursor.pop(125);
return Option.some(Token.token(TokenType.rightCurly(), from, cursor.offset()));
})).else_((function() {
return Option.none();
}));
when((result != Option.none()), (function() {
return cursor.skipWhitespace();
}));
return result;
}

// (CharCursor) => Option[Token]
function lexCodeUnit(cursor) {
// Int
var from = cursor.offset();
return if_((cursor.invoke(0) != 39), (function() {
return Option.none();
}), (function() {
cursor.skip(1);
when((cursor.invoke(0) == 92), (function() {
return cursor.skip(1);
}));
cursor.skip(1);
when((cursor.invoke(0) != 39), (function() {
return panic(("Expected ', but got: " + codeUnit(cursor.invoke(0)) + " " + positionText(cursor, from)));
}));
cursor.skip(1);
// Int
var to = cursor.offset();
cursor.skipWhitespace();
return Option.some(Token.token(TokenType.codeUnit(), from, to));
}));
}

// (CharCursor) => Option[Token]
function lexText(cursor) {
// Int
var f = cursor.invoke(0);
// Int
var from = cursor.offset();
// Bool?
var stop = false;
// Bool?
var middle = if_(((f == 41) && cursor.top(34)), (function() {
cursor.pop(34);
return true;
}), (function() {
when((f != 34), (function() {
stop = true;
}));
return false;
}));
return if_(stop, (function() {
return Option.none();
}), (function() {
cursor.skip(1);
while_((function() {
return ((!stop) && (cursor.invoke(0) != 34));
}), (function() {
return if_(((cursor.invoke(0) == 92) && (cursor.invoke(1) == 40)), (function() {
cursor.skip(1);
cursor.push(34);
stop = true;
}), (function() {
return if_((cursor.invoke(0) == 92), (function() {
cursor.skip(1);
// Int
var c = cursor.invoke(0);
return if_(((((((c == 110) || (c == 114)) || (c == 116)) || (c == 39)) || (c == 34)) || (c == 92)), (function() {
return cursor.skip(1);
}), (function() {
return if_((c == 123), (function() {
cursor.skip(1);
while_((function() {
return (cursor.invoke(0) != 125);
}), (function() {
when(cursor.pastEnd(), (function() {
return panic(("Unexpected end of file inside unicode escape sequence " + positionText(cursor, from)));
}));
// Int
var h = cursor.invoke(0);
return if_(((((h >= 48) && (h <= 57)) || ((h >= 97) && (c <= 102))) || ((h >= 65) && (c <= 70))), (function() {
return cursor.skip(1);
}), (function() {
return panic(("Unexpected non-hexadecimal inside unicode escape sequence: " + codeUnit(h) + " " + positionText(cursor, from)));
}));
}));
return cursor.skip(1);
}), (function() {
return panic(("Unknown escape sequence: \\" + codeUnit(cursor.invoke(0)) + " " + positionText(cursor, from)));
}));
}));
}), (function() {
when(cursor.pastEnd(), (function() {
return panic(("Unexpected end of file inside this string " + positionText(cursor, from)));
}));
return cursor.skip(1);
}));
}));
}));
// Int
var to = cursor.offset();
cursor.skip(1);
cursor.skipWhitespace();
// TokenType?
var tokenType = if_(stop, (function() {
return if_(middle, (function() {
return TokenType.textMiddle();
}), (function() {
return TokenType.textStart();
}));
}), (function() {
return if_(middle, (function() {
return TokenType.textEnd();
}), (function() {
return TokenType.text();
}));
}));
return Option.some(Token.token(tokenType, from, to));
}));
}

// (CharCursor) => Option[Token]
function lexNumber(cursor) {
// Int
var c = cursor.invoke(0);
return if_(((c < 48) || (c > 57)), (function() {
return Option.none();
}), (function() {
// Int
var from = cursor.offset();
while_((function() {
return ((cursor.invoke(0) >= 48) && (cursor.invoke(0) <= 57));
}), (function() {
when(cursor.pastEnd(), (function() {
return panic(("Unexpected end of file inside this number " + positionText(cursor, from)));
}));
return cursor.skip(1);
}));
// Int
var to = cursor.offset();
cursor.skipWhitespace();
return Option.some(Token.token(TokenType.numeral(), from, to));
}));
}

// (String) => Array[Token]
function lexTokens(buffer) {
// ArrayBuilder[_3406]
var builder = newArrayBuilder();
// CharCursor
var cursor = newCharCursor(buffer);
// Option[Token]
var lastToken = Option.none();
while_((function() {
lastToken = lexToken(cursor);
return (lastToken != Option.none());
}), (function() {
return builder.push(orPanic(lastToken));
}));
when((!cursor.pastEnd()), (function() {
return panic(("Unexpected character: " + codeUnit(cursor.invoke(0)) + " " + positionText(cursor, cursor.offset())));
}));
repeat(5, (function() {
return builder.push(Token.token(TokenType.outsideFile(), cursor.offset(), cursor.offset()));
}));
return builder.drain();
}

// (Int, Int, Int) => Bool
function isBetween(c, from, to) {
return ((c >= from) && (c <= to));
}

// () => Void
function testLexer() {
// Array[Token]
var result = lexTokens("\r\n        while({x > 1}, {\r\n            y += '\n'\r\n        })\r\n    ");
for(var i = 0; i < result.length; i++) console.log(result[i].token._);
}

// (Array[Token], Int) => TokenCursor
function newTokenCursor(tokens, offset) {
return {
invoke: function(ahead) {
var this_ = this;
return tokens[(offset + ahead)];
},
skip: function(ahead) {
var this_ = this;
offset += ahead;
},
skipWith: function(result, ahead) {
var this_ = this;
this_.skip(ahead);
return result;
}
};
}

// () => ArrayBuilder[t]
function newArrayBuilder() {
// Array[_3457]
var array = [];
return {
drain: function() {
var this_ = this;
// Array[_3457]
var result = array;
array = [];
return result;
},
push: function(element) {
var this_ = this;
array.push(element);
},
pushAll: function(elements) {
var this_ = this;
return each(elements, (function(e) {
return this_.push(e);
}));
},
pop: function() {
var this_ = this;
return array.pop()
},
top: function() {
var this_ = this;
// Option[_3474]?
var result = Option.none();
when((array.length > 0), (function() {
result = Option.some(array[array.length - 1])
}));
return result;
},
each: function(body) {
var this_ = this;
for(var i = 0; i < array.length; i++) body(array[i]);
},
map: function(body) {
var this_ = this;
// ArrayBuilder[_3484]
var result = newArrayBuilder();
for(var i = 0; i < array.length; i++) result.push(body(array[i]));
return result;
},
filter: function(body) {
var this_ = this;
// ArrayBuilder[_3489]
var result = newArrayBuilder();
for(var i = 0; i < array.length; i++) if(body(array[i])) result.push(array[i]);
return result;
},
invoke: function(index) {
var this_ = this;
return array[index];
},
size: function() {
var this_ = this;
return array.length;
}
};
}

// () => StringBuilder
function newStringBuilder() {
// String
var string = "";
return {
drain: function() {
// String
var result = string;
string = "";
return result;
},
toString: function() {
return string;
},
append: function(text) {
string = (string + text);
},
size: function() {
return string.length;
}
};
}
