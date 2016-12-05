
var Pair = {
pair: function(first, second) {
return {_: "pair", first: first, second: second};
}
};

var Option = {
none_k: {_: "none"},
none: function() {
return Option.none_k;
},
some: function(value) {
return {_: "some", value: value};
}
};


var Bool = {
false_k: {_: "false"},
false: function() {
return Bool.false_k;
},
true_k: {_: "true"},
true: function() {
return Bool.true_k;
}
};










function newArrayBuilder() {
var array = [];
return {
drain: function() {
var this_ = this;
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
var result = Option.none();
when(array.length > 0, (function() {
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
var result = newArrayBuilder();
for(var i = 0; i < array.length; i++) result.push(body(array[i]));
return result;
},
filter: function(body) {
var this_ = this;
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

var Position = {
position: function(line, column, buffer, offset) {
return {_: "position", line: line, column: column, buffer: buffer, offset: offset};
}
};


function newCharCursor(buffer) {
var stack = newArrayBuilder();
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
var i = offset + ahead;
return if_(i < 0 || i >= buffer.length, (function() {
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
return offset >= buffer.length;
},
lookAhead: function(ahead) {
var this_ = this;
var result = true;
var i = 0;
while_((function() {
return i < ahead.length;
}), (function() {
when(ahead[i] != this_.invoke(i), (function() {
result = false;
}));
i += 1;
}));
return result;
},
top: function(closeSymbol) {
var this_ = this;
return stack.size() != 0 && stack.invoke(stack.size() - 1) == closeSymbol;
},
push: function(closeSymbol) {
var this_ = this;
return stack.push(closeSymbol);
},
pop: function(closeSymbol) {
var this_ = this;
when(stack.size() == 0, (function() {
return panic(("Unexpected '" + codeUnit(closeSymbol) + "' " + positionText(this_, offset)));
}));
when(stack.invoke(stack.size() - 1) != closeSymbol, (function() {
return panic(("Expected '" + codeUnit(stack.invoke(stack.size() - 1)) + "', got '" + codeUnit(closeSymbol) + "' " + positionText(this_, offset)));
}));
return stack.pop();
},
skipWhitespace: function() {
var this_ = this;
var ignoreNewLine = stack.size() > 0 && stack.invoke(stack.size() - 1) == 41 || stack.invoke(stack.size() - 1) == 93 || stack.invoke(stack.size() - 1) == 34;
return while_((function() {
return offset < buffer.length && this_.invoke(0) == 32 || this_.invoke(0) == 9 || this_.invoke(0) == 13 || ignoreNewLine && this_.invoke(0) == 10;
}), (function() {
return this_.skip(1);
}));
},
position: function(offset) {
var this_ = this;
var at = 0;
var line = 1;
var column = 1;
while_((function() {
return at < offset;
}), (function() {
if_(at < buffer.length && buffer.charCodeAt(at) == 10, (function() {
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

function codeUnit(c) {
return String.fromCharCode(c);
}

function positionText(cursor, offset) {
var position = cursor.position(offset);
return ("at line " + ('' + position.line) + " column " + ('' + position.column));
}

function checkModule(typer, module) {
typer.setModule(module);
return Module.module(module.package_, module.file, module.alias, module.source, module.typeDefinitions, map(module.functionDefinitions, (function(d) {
return typer.topScope((function() {
return checkFunctionDefinitionInScope(typer, d);
}));
})));
}

function checkFunctionDefinitionInScope(typer, definition) {
each(definition.signature.parameters, (function(p) {
return typer.bindVariable(p.name, p.type);
}));
var body = checkBody(typer, definition.signature.returnType, definition.position, definition.body);
return FunctionDefinition.functionDefinition(definition.position, definition.signature, body);
}

function checkBody(typer, expectedType, position, body) {
return if_(body.length == 0, (function() {
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Void@_", []));
return [];
}), (function() {
return typer.scope((function() {
var initial = map(firsts(body), (function(s) {
return checkStatement(typer, Type.variable(position, typer.fresh()), s);
}));
var return_ = orPanic(last(body));
var typedReturn = (function(_match) { switch(_match._) {
case "constructor": return (function(){
var position2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
return if_(symbol2 == "Void@_", (function() {
return checkStatement(typer, Type.variable(position, typer.fresh()), return_);
}), (function() {
return checkStatement(typer, expectedType, return_);
}));
})();
case "record": return (function(){
var position2 = _match.position;
var fields2 = _match.fields;
return checkStatement(typer, expectedType, return_);
})();
case "parameter": return (function(){
var position2 = _match.position;
var name2 = _match.name;
return checkStatement(typer, expectedType, return_);
})();
case "variable": return (function(){
var position2 = _match.position;
var id2 = _match.id;
return checkStatement(typer, expectedType, return_);
})();
}})(typer.expand(expectedType));
return initial.concat([typedReturn]);
}));
}));
}

function checkStatement(typer, expectedType, statement) {
return (function(_match) { switch(_match._) {
case "term": return (function(){
var position = _match.position;
var term = _match.term;
var term2 = checkTerm(typer, expectedType, term);
return Statement.term(position, term2);
})();
case "let": return (function(){
var position = _match.position;
var variable = _match.variable;
var type = _match.type;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Void@_", []));
var type2 = or(type, Type.variable(position, typer.fresh()));
var value2 = checkTerm(typer, type2, value);
var expandedType = typer.expand(type2);
typer.bindVariable(variable, expandedType);
return Statement.let_(position, variable, Option.some(expandedType), value2);
})();
case "functions": return (function(){
var definitions = _match.definitions;
var position = orPanic(first(definitions)).position;
each(definitions, (function(d) {
return typer.bindFunction(d.signature.symbol, d);
}));
var typedDefinitions = map(definitions, (function(d) {
return typer.scope((function() {
return checkFunctionDefinitionInScope(typer, d);
}));
}));
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Void@_", []));
return Statement.functions(typedDefinitions);
})();
case "assign": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Void@_", []));
var value2 = checkTerm(typer, typer.variable(variable), value);
return Statement.assign(position, variable, value2);
})();
case "increment": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Void@_", []));
var value2 = checkTerm(typer, typer.variable(variable), value);
return Statement.increment(position, variable, value2);
})();
case "decrement": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Void@_", []));
var value2 = checkTerm(typer, typer.variable(variable), value);
return Statement.decrement(position, variable, value2);
})();
case "ffi": return (function(){
var position = _match.position;
var language = _match.language;
var code = _match.code;
return statement;
})();
}})(statement);
}

function checkArguments(typer, expectedType, position, signature, arguments_) {
var instantiation = newStringMap(map(signature.typeParameters, (function(p) {
return Pair.pair(p, Type.variable(position, typer.fresh()));
})));
var parameterTypes = map(signature.parameters, (function(p) {
return typer.instantiate(instantiation, p.type);
}));
var returnType = typer.instantiate(instantiation, signature.returnType);
equalityConstraint(typer, position, expectedType, returnType);
var unnamed = map(zip(parameterTypes, arguments_.unnamed), (function(p) {
return checkTerm(typer, p.first, p.second);
}));
var namedParameters = map(signature.parameters.slice(arguments_.unnamed.length), (function(p) {
return p.name;
}));
var named = map(zip(parameterTypes.slice(arguments_.unnamed.length), namedParameters), (function(p) {
return (function(_match) { switch(_match._) {
case "some": return (function(){
var a = _match.value;
return NamedArgument.namedArgument(a.order, p.second, checkTerm(typer, p.first, a.value));
})();
case "none": return (function(){
return typer.error(position, ("Missing argument: " + p.second));
})();
}})(find(arguments_.named, (function(a) {
return a.name == p.second;
})));
}));
var totalArguments = arguments_.unnamed.length + arguments_.named.length;
when(totalArguments < parameterTypes.length, (function() {
return typer.error(position, "Too few arguments");
}));
when(totalArguments > parameterTypes.length, (function() {
return typer.error(position, "Too many arguments");
}));
return Arguments.arguments_(unnamed, named);
}

function checkTerm(typer, expectedType, term) {
return (function(_match) { switch(_match._) {
case "binary": return (function(){
var position = _match.position;
var operator = _match.operator;
var left = _match.left;
var right = _match.right;
var operandType = Type.variable(position, typer.fresh());
var typedLeft = checkTerm(typer, operandType, left);
var typedRight = checkTerm(typer, operandType, right);
var returnType = if_(operator == TokenType.plus() || operator == TokenType.minus() || operator == TokenType.star() || operator == TokenType.slash(), (function() {
(function(_match) { switch(_match._) {
case "constructor": return (function(){
var position2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
return when(symbol2 != "Int@_" && symbol2 != "Float@_" && symbol2 != "String@_", (function() {
return typer.error(position, ("Expected Int, Float or String, got " + typeToString(operandType)));
}));
})();
case "record": return (function(){
var position2 = _match.position;
var fields2 = _match.fields;
return typer.error(position, ("Expected Int, Float or String, got " + typeToString(operandType)));
})();
case "parameter": return (function(){
var position2 = _match.position;
var symbol2 = _match.name;
return typer.error(position, ("Expected Int, Float or String, got " + typeToString(operandType)));
})();
case "variable": return (function(){
var position2 = _match.position;
var id2 = _match.id;
return typer.error(position, ("Expected Int, Float or String, got " + typeToString(operandType)));
})();
}})(typer.expand(operandType));
return operandType;
}), (function() {
return Type.constructor(position, "Bool@_", []);
}));
equalityConstraint(typer, position, expectedType, returnType);
return Term.binary(position, operator, typedLeft, typedRight);
})();
case "unary": return (function(){
var position = _match.position;
var operator = _match.operator;
var value = _match.value;
var types = if_(operator == TokenType.minus(), (function() {
return Pair.pair(Type.constructor(position, "Int@_", []), Type.constructor(position, "Int@_", []));
}), (function() {
return Pair.pair(Type.constructor(position, "Bool@_", []), Type.constructor(position, "Bool@_", []));
}));
equalityConstraint(typer, position, expectedType, types.second);
var typedValue = checkTerm(typer, types.first, value);
return Term.unary(position, operator, typedValue);
})();
case "codeUnit": return (function(){
var position = _match.position;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Int@_", []));
return term;
})();
case "text": return (function(){
var position = _match.position;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "String@_", []));
return term;
})();
case "textLiteral": return (function(){
var position = _match.position;
var parts = _match.parts;
var typedParts = map(parts, (function(p) {
return checkTerm(typer, Type.constructor(position, "String@_", []), p);
}));
equalityConstraint(typer, position, expectedType, Type.constructor(position, "String@_", []));
return Term.textLiteral(position, typedParts);
})();
case "integer": return (function(){
var position = _match.position;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Int@_", []));
return term;
})();
case "floating": return (function(){
var position = _match.position;
var value = _match.value;
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Float@_", []));
return term;
})();
case "array": return (function(){
var position = _match.position;
var elements = _match.elements;
var elementType = Type.variable(position, typer.fresh());
equalityConstraint(typer, position, expectedType, Type.constructor(position, "Array@_", [elementType]));
var typedElements = map(elements, (function(e) {
return checkTerm(typer, elementType, e);
}));
return Term.array(position, typedElements);
})();
case "record": return (function(){
var position = _match.position;
var fields = _match.fields;
var fieldTypes = map(fields, (function(f) {
return Type.variable(position, typer.fresh());
}));
var typedFields = map(zip(fields, fieldTypes), (function(p) {
var typedValue = checkTerm(typer, p.second, p.first.value);
return Pair.pair(Field.field(p.first.position, p.first.label, typedValue), FieldType.fieldType(p.first.position, p.first.label, p.second));
}));
var recordType = Type.record(position, sortByString(map(typedFields, (function(p) {
return p.second;
})), (function(f) {
return f.label;
})));
equalityConstraint(typer, position, expectedType, recordType);
return Term.record(position, map(typedFields, (function(p) {
return p.first;
})));
})();
case "instance": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var thisName = _match.thisName;
var methods = _match.methods;
var typeDefinition = typer.type(symbol);
var typeArguments = map(typeDefinition.typeParameters, (function(p) {
return Type.variable(position, typer.fresh());
}));
var instantiation = newStringMap(zip(typeDefinition.typeParameters, typeArguments));
var type = Type.constructor(position, symbol, typeArguments);
equalityConstraint(typer, position, expectedType, type);
var typedMethods = typer.scope((function() {
(function(_match) { switch(_match._) {
case "some": return (function(){
var name = _match.value;
return typer.bindVariable(name, type);
})();
case "none": return (function(){
})();
}})(thisName);
return map(methods, (function(m) {
var signature = (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("Unknown method: " + m.name));
})();
case "some": return (function(){
var s = _match.value;
return s;
})();
}})(find(typeDefinition.methodSignatures, (function(s) {
return s.symbol == m.name;
})));
return typer.scope((function() {
var parameterTypes = map(signature.parameters, (function(p) {
return typer.instantiate(instantiation, p.type);
}));
var returnType = typer.instantiate(instantiation, signature.returnType);
each(zip(m.parameters, parameterTypes), (function(p) {
return typer.bindVariable(p.first, p.second);
}));
var typedBody = checkBody(typer, returnType, m.position, m.body);
return MethodImplementation.methodImplementation(m.position, m.name, m.parameters, typedBody);
}));
}));
}));
each(typeDefinition.methodSignatures, (function(s) {
return (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("Missing method: " + s.symbol));
})();
case "some": return (function(){
var s = _match.value;
})();
}})(find(methods, (function(m) {
return s.symbol == m.name;
})));
}));
when(methods.length > typeDefinition.methodSignatures.length, (function() {
return typer.error(position, "Duplicate method");
}));
return Term.instance(position, symbol, thisName, typedMethods);
})();
case "match": return (function(){
var position = _match.position;
var value = _match.value;
var cases = _match.cases;
var hintSymbol = _match.hintSymbol;
var type = Type.variable(position, typer.fresh());
var typedValue = checkTerm(typer, type, value);
var signaturesAndHint = (function(_match) { switch(_match._) {
case "variable": return (function(){
var position2 = _match.position;
var id2 = _match.id;
return typer.error(position, "Match requires known object type");
})();
case "parameter": return (function(){
var position2 = _match.position;
var name2 = _match.name;
return typer.error(position, ("Can't match on type parameter: " + typeToString(typer.expand(type))));
})();
case "record": return (function(){
var position2 = _match.position;
var fields2 = _match.fields;
return typer.error(position, ("Can't match on record type: " + typeToString(typer.expand(type))));
})();
case "constructor": return (function(){
var position2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
var typeDefinition = typer.type(symbol2);
when(!typeDefinition.isSum, (function() {
return typer.error(position, ("Can't match on non-sum type: " + typeToString(typer.expand(type))));
}));
var signatures = map(typeDefinition.methodSignatures, (function(s) {
when(find(cases, (function(c) {
return c.body.name == s.symbol;
})) == Option.none(), (function() {
return typer.error(position, ("Missing case: " + s.symbol + " on type " + typeToString(typer.expand(type))));
}));
var instantiation = newStringMap(zip(typeDefinition.typeParameters, typeArguments2));
var parameters = map(s.parameters, (function(p) {
return Parameter.parameter(p.position, p.name, typer.instantiate(instantiation, p.type));
}));
var returnType = typer.instantiate(instantiation, s.returnType);
return MethodSignature.methodSignature(s.position, s.symbol, s.typeParameters, parameters, returnType);
}));
each(cases, (function(c) {
return (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("Unknown case: " + c.body.name));
})();
case "some": return (function(){
var s = _match.value;
})();
}})(find(typeDefinition.methodSignatures, (function(s) {
return s.symbol == c.body.name;
})));
}));
when(cases.length > typeDefinition.methodSignatures.length, (function() {
return typer.error(position, "Duplicate case");
}));
return Pair.pair(signatures, symbol2);
})();
}})(typer.expand(type));
var typedCases = map(cases, (function(c) {
return (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("No such case: " + c.body.name + " in type " + typeToString(typer.expand(type))));
})();
case "some": return (function(){
var s = _match.value;
var fieldNames = map(s.parameters, (function(p) {
return p.name;
}));
var implementation = typer.scope((function() {
each(zip(s.parameters, c.body.parameters), (function(p) {
return typer.bindVariable(p.second, p.first.type);
}));
var statements = checkBody(typer, expectedType, position, c.body.body);
return MethodImplementation.methodImplementation(c.body.position, c.body.name, c.body.parameters, statements);
}));
return MatchCase.matchCase(implementation, fieldNames);
})();
}})(find(signaturesAndHint.first, (function(s) {
return c.body.name == s.symbol;
})));
}));
return Term.match(position, typedValue, typedCases, signaturesAndHint.second);
})();
case "lambda": return (function(){
var position = _match.position;
var parameters = _match.parameters;
var body = _match.body;
var parameterTypes = map(parameters, (function(p) {
return Type.variable(position, typer.fresh());
}));
var returnType = Type.variable(position, typer.fresh());
var functionType = Type.constructor(position, ("F" + ('' + parameters.length) + "@_"), parameterTypes.concat([returnType]));
equalityConstraint(typer, position, expectedType, functionType);
var typedBody = typer.scope((function() {
each(zip(parameters, parameterTypes), (function(p) {
return typer.bindVariable(p.first, p.second);
}));
return checkBody(typer, returnType, position, body);
}));
return Term.lambda(position, parameters, typedBody);
})();
case "functionCall": return (function(){
var position = _match.position;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var signature = (function(_match) { switch(_match._) {
case "some": return (function(){
var f = _match.value;
return f.signature;
})();
case "none": return (function(){
return typer.error(position, ("No such method: " + methodName));
})();
}})(typer.function_(methodName));
var typedArguments = checkArguments(typer, expectedType, position, signature, arguments_);
return Term.functionCall(position, methodName, typedArguments);
})();
case "staticCall": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var signature = (function(_match) { switch(_match._) {
case "some": return (function(){
var f = _match.value;
return f.signature;
})();
case "none": return (function(){
var typeDefinition = typer.type(symbol);
when(!typeDefinition.isSum, (function() {
return typer.error(position, ("No such method: " + symbol + "." + methodName));
}));
return (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("No such method: " + symbol + "." + methodName));
})();
case "some": return (function(){
var s = _match.value;
var typeArguments = map(typeDefinition.typeParameters, (function(p) {
return Type.variable(position, typer.fresh());
}));
var instantiation = newStringMap(zip(typeDefinition.typeParameters, typeArguments));
var parameters = map(s.parameters, (function(p) {
return Parameter.parameter(p.position, p.name, typer.instantiate(instantiation, p.type));
}));
var returnType = Type.constructor(position, symbol, typeArguments);
return MethodSignature.methodSignature(s.position, s.symbol, s.typeParameters, parameters, returnType);
})();
}})(find(typeDefinition.methodSignatures, (function(s) {
return s.symbol == methodName;
})));
})();
}})(typer.function_((symbol + "." + methodName)));
var typedArguments = checkArguments(typer, expectedType, position, signature, arguments_);
return Term.staticCall(position, symbol, methodName, typedArguments);
})();
case "methodCall": return (function(){
var position = _match.position;
var value = _match.value;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var hintSymbol = _match.hintSymbol;
var type = Type.variable(position, typer.fresh());
var typedValue = checkTerm(typer, type, value);
var signatureAndHint = (function(_match) { switch(_match._) {
case "variable": return (function(){
var position2 = _match.position;
var id2 = _match.id;
return typer.error(position, ("Method call requires known object type: " + methodName));
})();
case "parameter": return (function(){
var position2 = _match.position;
var name2 = _match.name;
return typer.error(position, ("No such method: " + methodName + " on type parameter " + name2));
})();
case "record": return (function(){
var position2 = _match.position;
var fields2 = _match.fields;
var field = (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("No such field: " + methodName + " in record " + typeToString(typer.expand(type))));
})();
case "some": return (function(){
var f = _match.value;
return f;
})();
}})(find(fields2, (function(f) {
return f.label == methodName;
})));
return Pair.pair(MethodSignature.methodSignature(position2, field.label, [], [], field.type), "_field");
})();
case "constructor": return (function(){
var position2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
var typeDefinition = typer.type(symbol2);
return if_(typeDefinition.isSum, (function() {
when(typeDefinition.methodSignatures.length != 1, (function() {
return typer.error(position, ("No such method: " + methodName + " on sum type " + symbol2));
}));
var s = typeDefinition.methodSignatures[0];
var instantiation = newStringMap(zip(typeDefinition.typeParameters, typeArguments2));
var parameters = map(s.parameters, (function(p) {
return Parameter.parameter(p.position, p.name, typer.instantiate(instantiation, p.type));
}));
var field = (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("No such field: " + methodName + " on object of type " + symbol2));
})();
case "some": return (function(){
var f = _match.value;
return f;
})();
}})(find(parameters, (function(p) {
return p.name == methodName;
})));
return Pair.pair(MethodSignature.methodSignature(s.position, field.name, [], [], field.type), "_field");
}), (function() {
return (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("No such method: " + methodName + " on object of type " + symbol2));
})();
case "some": return (function(){
var s = _match.value;
var instantiation = newStringMap(zip(typeDefinition.typeParameters, typeArguments2));
var parameters = map(s.parameters, (function(p) {
return Parameter.parameter(p.position, p.name, typer.instantiate(instantiation, p.type));
}));
var returnType = typer.instantiate(instantiation, s.returnType);
return Pair.pair(MethodSignature.methodSignature(s.position, s.symbol, s.typeParameters, parameters, returnType), symbol2);
})();
}})(find(typeDefinition.methodSignatures, (function(s) {
return s.symbol == methodName;
})));
}));
})();
}})(typer.expand(type));
var typedArguments = checkArguments(typer, expectedType, position, signatureAndHint.first, arguments_);
return Term.methodCall(position, typedValue, methodName, typedArguments, signatureAndHint.second);
})();
case "variable": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var type = if_(typer.hasVariable(symbol), (function() {
return typer.variable(symbol);
}), (function() {
return (function(_match) { switch(_match._) {
case "none": return (function(){
return typer.error(position, ("No such variable: " + symbol));
})();
case "some": return (function(){
var d = _match.value;
var instantiation = newStringMap(zip(d.signature.typeParameters, map(d.signature.typeParameters, (function(t) {
return Type.variable(position, typer.fresh());
}))));
var parameters = map(d.signature.parameters, (function(p) {
return typer.instantiate(instantiation, p.type);
}));
var returnType = typer.instantiate(instantiation, d.signature.returnType);
return Type.constructor(position, ("F" + ('' + parameters.length) + "@_"), parameters.concat([returnType]));
})();
}})(typer.function_(symbol));
}));
equalityConstraint(typer, position, expectedType, type);
return term;
})();
}})(term);
}

function emitModule(builder, module) {
each(module.typeDefinitions, (function(d) {
emitTypeDefinition(builder, d);
return builder.append("\n");
}));
return each(module.functionDefinitions, (function(d) {
emitFunctionDefinition(builder, d);
return builder.append("\n");
}));
}

function emitTypeDefinition(builder, definition) {
return when(definition.isSum, (function() {
var name = baseName(definition.symbol);
builder.append(("var " + escapeUpper(name) + " = {\n"));
var first = true;
each(definition.methodSignatures, (function(s) {
when(!first, (function() {
return builder.append(",\n");
}));
first = false;
when(s.parameters.length == 0, (function() {
return builder.append((escapeMethod(s.symbol) + "_k: {_: " + escapeString(s.symbol) + "},\n"));
}));
builder.append((escapeMethod(s.symbol) + ": function("));
builder.append(join(map(s.parameters, (function(p) {
return escapeVariable(p.name);
})), ", "));
builder.append(") {\n");
if_(s.parameters.length == 0, (function() {
return builder.append(("return " + escapeUpper(name) + "." + escapeMethod(s.symbol) + "_k;\n"));
}), (function() {
builder.append(("return {_: " + escapeString(s.symbol)));
builder.append(join(map(s.parameters, (function(p) {
return (", " + escapeMethod(p.name) + ": " + escapeVariable(p.name));
})), ""));
return builder.append("};\n");
}));
return builder.append("}");
}));
return builder.append("\n};\n");
}));
}

function emitFunctionDefinition(builder, definition) {
var name = baseName(definition.signature.symbol);
var parameters = join(map(definition.signature.parameters, (function(p) {
return escapeVariable(p.name);
})), ", ");
builder.append(("function " + escapeMethod(name) + "(" + parameters + ") {\n"));
emitBody(builder, definition.body);
return builder.append("}\n");
}

function emitBody(builder, body) {
var firsts = body.slice(0, body.length - 1);
var lasts = body.slice(body.length - 1);
each(firsts, (function(s) {
return emitStatement(builder, s, false);
}));
return each(lasts, (function(s) {
return emitStatement(builder, s, true);
}));
}

function emitStatement(builder, statement, return_) {
return (function(_match) { switch(_match._) {
case "term": return (function(){
var position = _match.position;
var term = _match.term;
when(return_, (function() {
return builder.append("return ");
}));
emitTerm(builder, term);
return builder.append(";\n");
})();
case "let": return (function(){
var position = _match.position;
var variable = _match.variable;
var type = _match.type;
var value = _match.value;
builder.append(("var " + escapeVariable(variable) + " = "));
emitTerm(builder, value);
return builder.append(";\n");
})();
case "functions": return (function(){
var definitions = _match.definitions;
return each(definitions, (function(d) {
return emitFunctionDefinition(builder, d);
}));
})();
case "assign": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
builder.append((escapeVariable(variable) + " = "));
emitTerm(builder, value);
return builder.append(";\n");
})();
case "increment": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
builder.append((escapeVariable(variable) + " += "));
emitTerm(builder, value);
return builder.append(";\n");
})();
case "decrement": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
builder.append((escapeVariable(variable) + " -= "));
emitTerm(builder, value);
return builder.append(";\n");
})();
case "ffi": return (function(){
var position = _match.position;
var language = _match.language;
var code = _match.code;
builder.append(code);
return builder.append("\n");
})();
}})(statement);
}

function emitArguments(builder, arguments_) {
var first = true;
each(arguments_.unnamed, (function(a) {
when(!first, (function() {
return builder.append(", ");
}));
first = false;
return emitTerm(builder, a);
}));
/* TODO: Respect original evaluation order */
var named = sortByInt(arguments_.named, (function(a) {
return a.order;
}));
return each(named, (function(a) {
when(!first, (function() {
return builder.append(", ");
}));
first = false;
return emitTerm(builder, a.value);
}));
}

function emitTerm(builder, term) {
return (function(_match) { switch(_match._) {
case "binary": return (function(){
var position = _match.position;
var operator = _match.operator;
var left = _match.left;
var right = _match.right;
emitTerm(builder, left);
builder.append(" ");
var done = false;
when(operator == TokenType.star(), (function() {
builder.append("*");
done = true;
}));
when(operator == TokenType.slash(), (function() {
builder.append("/");
done = true;
}));
when(operator == TokenType.plus(), (function() {
builder.append("+");
done = true;
}));
when(operator == TokenType.minus(), (function() {
builder.append("-");
done = true;
}));
when(operator == TokenType.equal(), (function() {
builder.append("==");
done = true;
}));
when(operator == TokenType.notEqual(), (function() {
builder.append("!=");
done = true;
}));
when(operator == TokenType.less(), (function() {
builder.append("<");
done = true;
}));
when(operator == TokenType.lessEqual(), (function() {
builder.append("<=");
done = true;
}));
when(operator == TokenType.greater(), (function() {
builder.append(">");
done = true;
}));
when(operator == TokenType.greaterEqual(), (function() {
builder.append(">=");
done = true;
}));
when(operator == TokenType.and(), (function() {
builder.append("&&");
done = true;
}));
when(operator == TokenType.or(), (function() {
builder.append("||");
done = true;
}));
when(!done, (function() {
return panic("Unknown binary operator");
}));
builder.append(" ");
return emitTerm(builder, right);
})();
case "unary": return (function(){
var position = _match.position;
var operator = _match.operator;
var value = _match.value;
var done = false;
when(operator == TokenType.minus(), (function() {
builder.append("-");
done = true;
}));
when(operator == TokenType.exclamation(), (function() {
builder.append("!");
done = true;
}));
when(!done, (function() {
return panic("Unknown unary operator");
}));
return emitTerm(builder, value);
})();
case "codeUnit": return (function(){
var position = _match.position;
var value = _match.value;
return builder.append(('' + value));
})();
case "text": return (function(){
var position = _match.position;
var value = _match.value;
return builder.append(escapeString(value));
})();
case "textLiteral": return (function(){
var position = _match.position;
var parts = _match.parts;
var first = true;
when(parts.length > 1, (function() {
return builder.append("(");
}));
each(parts, (function(p) {
when(!first, (function() {
return builder.append(" + ");
}));
first = false;
return emitTerm(builder, p);
}));
return when(parts.length > 1, (function() {
return builder.append(")");
}));
})();
case "integer": return (function(){
var position = _match.position;
var value = _match.value;
return builder.append(value);
})();
case "floating": return (function(){
var position = _match.position;
var value = _match.value;
return builder.append(value);
})();
case "array": return (function(){
var position = _match.position;
var elements = _match.elements;
var first = true;
builder.append("[");
each(elements, (function(e) {
when(!first, (function() {
return builder.append(", ");
}));
first = false;
return emitTerm(builder, e);
}));
return builder.append("]");
})();
case "record": return (function(){
var position = _match.position;
var fields = _match.fields;
var first = true;
builder.append("{");
each(fields, (function(f) {
when(!first, (function() {
return builder.append(", ");
}));
first = false;
builder.append((escapeMethod(f.label) + ": "));
return emitTerm(builder, f.value);
}));
return builder.append("}");
})();
case "instance": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var thisName = _match.thisName;
var methods = _match.methods;
when(symbol == "F0@_" || symbol == "F1@_" || symbol == "F2@_" || symbol == "F3@_", (function() {
return panic("Can't create explicit instance of lambda function F*@_");
}));
builder.append("{\n");
each(indexed(methods), (function(m) {
builder.append(escapeMethod(m.second.name));
builder.append(": ");
builder.append("function(");
builder.append(join(m.second.parameters, ", "));
builder.append(") {\n");
(function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return builder.append(("var " + escapeVariable(x) + " = this;\n"));
})();
case "none": return (function(){
})();
}})(thisName);
emitBody(builder, m.second.body);
builder.append("}");
when(m.first < methods.length - 1, (function() {
return builder.append(",");
}));
return builder.append("\n");
}));
return builder.append("}");
})();
case "match": return (function(){
var position = _match.position;
var value = _match.value;
var cases = _match.cases;
var hintSymbol = _match.hintSymbol;
return if_(hintSymbol == "Bool@_", (function() {
builder.append("(");
emitTerm(builder, value);
builder.append(" ? (function() {\n");
emitBody(builder, orPanic(find(cases, (function(c) {
return c.body.name == "true";
}))).body.body);
builder.append("})() : (function() {\n");
emitBody(builder, orPanic(find(cases, (function(c) {
return c.body.name == "false";
}))).body.body);
return builder.append("})())");
}), (function() {
builder.append("(function(_match) { switch(_match._) {\n");
each(cases, (function(c) {
builder.append(("case " + escapeString(c.body.name) + ": return (function(){\n"));
each(indexed(c.body.parameters), (function(p) {
return builder.append(("var " + escapeVariable(p.second) + " = _match." + escapeMethod(c.fieldNames[p.first]) + ";\n"));
}));
emitBody(builder, c.body.body);
return builder.append("})();\n");
}));
builder.append("}})(");
emitTerm(builder, value);
return builder.append(")");
}));
})();
case "lambda": return (function(){
var position = _match.position;
var parameters = _match.parameters;
var body = _match.body;
var ps = join(map(parameters, (function(p) {
return escapeVariable(p);
})), ", ");
builder.append(("(function(" + ps + ") {\n"));
emitBody(builder, body);
return builder.append("})");
})();
case "functionCall": return (function(){
var position = _match.position;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var name = baseName(methodName);
builder.append(escapeMethod(name));
builder.append("(");
emitArguments(builder, arguments_);
return builder.append(")");
})();
case "staticCall": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var methodName = _match.name;
var arguments_ = _match.arguments_;
return if_(symbol == "Bool@_", (function() {
return builder.append(methodName);
}), (function() {
var name = baseName(symbol);
builder.append((escapeUpper(name) + "." + escapeMethod(methodName)));
builder.append("(");
emitArguments(builder, arguments_);
return builder.append(")");
}));
})();
case "methodCall": return (function(){
var position = _match.position;
var value = _match.value;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var hintSymbol = _match.hintSymbol;
return if_(hintSymbol == "_field", (function() {
emitTerm(builder, value);
return builder.append(("." + escapeMethod(methodName)));
}), (function() {
return (function(_match) { switch(_match._) {
case "some": return (function(){
var f = _match.value;
return f(value, builder, arguments_);
})();
case "none": return (function(){
emitTerm(builder, value);
builder.append(("." + escapeMethod(methodName)));
builder.append("(");
emitArguments(builder, arguments_);
return builder.append(")");
})();
}})(specialMethods().get((hintSymbol + "." + methodName)));
}));
})();
case "variable": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var name = baseName(symbol);
return builder.append(escapeVariable(name));
})();
}})(term);
}

function specialMethods() {
return newStringMap([Pair.pair("Array@_.invoke", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append("[");
emitArguments(builder, arguments_);
return builder.append("]");
})), Pair.pair("Array@_.size", (function(value, builder, arguments_) {
emitTerm(builder, value);
return builder.append(".length");
})), Pair.pair("Array@_.take", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".slice(0, ");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("Array@_.drop", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".slice(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("String@_.invoke", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".charCodeAt(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("String@_.size", (function(value, builder, arguments_) {
emitTerm(builder, value);
return builder.append(".length");
})), Pair.pair("String@_.take", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".substr(0, ");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("String@_.drop", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".substr(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("String@_.toUpper", (function(value, builder, arguments_) {
emitTerm(builder, value);
return builder.append(".toUpperCase()");
})), Pair.pair("String@_.toLower", (function(value, builder, arguments_) {
emitTerm(builder, value);
return builder.append(".toLowerCase()");
})), Pair.pair("String@_.contains", (function(value, builder, arguments_) {
builder.append("(");
emitTerm(builder, value);
builder.append(".indexOf(");
emitArguments(builder, arguments_);
return builder.append(") != -1)");
})), Pair.pair("F0@_.invoke", (function(value, builder, arguments_) {
emitTerm(builder, value);
return builder.append("()");
})), Pair.pair("F1@_.invoke", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append("(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("F2@_.invoke", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append("(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("F3@_.invoke", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append("(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("Bool@_.toString", (function(value, builder, arguments_) {
builder.append("('' + ");
emitTerm(builder, value);
return builder.append(")");
})), Pair.pair("Int@_.toString", (function(value, builder, arguments_) {
builder.append("('' + ");
emitTerm(builder, value);
return builder.append(")");
})), Pair.pair("Float@_.toString", (function(value, builder, arguments_) {
builder.append("('' + ");
emitTerm(builder, value);
return builder.append(")");
})), Pair.pair("Promise@_.map", (function(value, builder, arguments_) {
/* TODO: Promise.resolve special cases on things with a .then method, so this is wrong when body returns a promise. */
emitTerm(builder, value);
builder.append(".then(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("Promise@_.flatMap", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".then(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("Promise@_.catchMap", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".catch(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("Promise@_.catchFlatMap", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".catch(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("Promise@_.thenMap", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".then(");
emitArguments(builder, arguments_);
return builder.append(")");
})), Pair.pair("Promise@_.thenFlatMap", (function(value, builder, arguments_) {
emitTerm(builder, value);
builder.append(".then(");
emitArguments(builder, arguments_);
return builder.append(")");
}))]);
}

function escapeVariable(name) {
return if_(reservedWords().has(name), (function() {
return (name + "_");
}), (function() {
return name;
}));
}

function escapeMethod(name) {
return if_(reservedWords().has(name), (function() {
return (name + "_");
}), (function() {
return name;
}));
}

function escapeUpper(name) {
return name;
}

function escapeString(value) {
return ("\"" + value + "\"");
}

function reservedWords() {
return newStringMap(map(["arguments", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "enum", "implements", "interface", "let", "package", "private", "protected", "public", "static", "await"], (function(w) {
return Pair.pair(w, true);
})));
}

function baseName(name) {
return name.replace(/[@].*/, '');
}


function newFileSystem() {
return require('fs');
}

function readDirectory(fs, directory) {
return newPromise((function(onSuccess, onError) {
fs.readdir(directory, function(error, filenames) { if(error) onError(error); else onSuccess(filenames) });
}));
}

function readTextFile(fs, filename) {
return newPromise((function(onSuccess, onError) {
fs.readFile(filename, 'utf-8', function(error, text) { if(error) onError(error); else onSuccess(text) });
}));
}

function writeTextFile(fs, filename, text) {
return newPromise((function(onSuccess, onError) {
fs.writeFile(filename, text, function(error) { if(error) onError(error); else onSuccess(void 0) });
}));
}

function normalizeFilePath(filePath) {
return require('path').normalize(filePath);
}

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

function lexSeparator(cursor) {
cursor.skipWhitespace();
return if_(cursor.invoke(0) != 10 && cursor.invoke(0) != 59, (function() {
return Option.none();
}), (function() {
var from = cursor.offset();
while_((function() {
return cursor.invoke(0) == 10 || cursor.invoke(0) == 59;
}), (function() {
cursor.skip(1);
return cursor.skipWhitespace();
}));
return Option.some(Token.token(TokenType.separator(), from, from + 1));
}));
}

function lexIdentifier(cursor) {
var upper = isBetween(cursor.invoke(0), 65, 90);
return if_(!upper && !isBetween(cursor.invoke(0), 97, 122), (function() {
return Option.none();
}), (function() {
var from = cursor.offset();
while_((function() {
return isBetween(cursor.invoke(0), 97, 122) || isBetween(cursor.invoke(0), 65, 90) || isBetween(cursor.invoke(0), 48, 57);
}), (function() {
return cursor.skip(1);
}));
var to = cursor.offset();
cursor.skipWhitespace();
return Option.some(Token.token(if_(upper, (function() {
return TokenType.upper();
}), (function() {
return TokenType.lower();
})), from, to));
}));
}

function lexOperator(cursor) {
var from = cursor.offset();
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
var firstAcceptedToken = (function(bodies) {
var i = 0;
var result = Option.none();
var array = bodies;
while_((function() {
return i < array.length;
}), (function() {
result = array[i]();
when(result != Option.none(), (function() {
i = array.length;
}));
i += 1;
}));
return result;
});
var result = firstAcceptedToken([token([45, 62], TokenType.rightThinArrow()), token([45, 61], TokenType.decrement()), token([45], TokenType.minus()), token([43, 61], TokenType.increment()), token([43], TokenType.plus()), token([61, 62], TokenType.rightThickArrow()), token([61, 61], TokenType.equal()), token([33, 61], TokenType.notEqual()), token([61], TokenType.assign()), token([42], TokenType.star()), token([47], TokenType.slash()), token([38, 38], TokenType.and()), token([124, 124], TokenType.or()), token([124, 62], TokenType.rightPipe()), token([60, 124], TokenType.leftPipe()), token([63], TokenType.question()), token([33], TokenType.exclamation()), token([58], TokenType.colon()), token([64], TokenType.atSign()), token([46], TokenType.dot()), token([44], TokenType.comma()), token([95], TokenType.underscore()), token([60, 45], TokenType.leftThinArrow()), token([60, 61], TokenType.lessEqual()), token([60], TokenType.less()), token([62, 61], TokenType.greaterEqual()), token([62], TokenType.greater())]);
when(result != Option.none(), (function() {
return cursor.skipWhitespace();
}));
return result;
}

function lexBrackets(cursor) {
var c = cursor.invoke(0);
var from = cursor.offset();
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
when(result != Option.none(), (function() {
return cursor.skipWhitespace();
}));
return result;
}

function lexCodeUnit(cursor) {
var from = cursor.offset();
return if_(cursor.invoke(0) != 39, (function() {
return Option.none();
}), (function() {
cursor.skip(1);
when(cursor.invoke(0) == 92, (function() {
return cursor.skip(1);
}));
cursor.skip(1);
when(cursor.invoke(0) != 39, (function() {
return panic(("Expected ', but got: " + codeUnit(cursor.invoke(0)) + " " + positionText(cursor, from)));
}));
cursor.skip(1);
var to = cursor.offset();
cursor.skipWhitespace();
return Option.some(Token.token(TokenType.codeUnit(), from, to));
}));
}

function lexText(cursor) {
var f = cursor.invoke(0);
var from = cursor.offset();
var stop = false;
var middle = if_(f == 41 && cursor.top(34), (function() {
cursor.pop(34);
return true;
}), (function() {
when(f != 34, (function() {
stop = true;
}));
return false;
}));
return if_(stop, (function() {
return Option.none();
}), (function() {
cursor.skip(1);
while_((function() {
return !stop && cursor.invoke(0) != 34;
}), (function() {
return if_(cursor.invoke(0) == 92 && cursor.invoke(1) == 40, (function() {
cursor.skip(1);
cursor.push(34);
stop = true;
}), (function() {
return if_(cursor.invoke(0) == 92, (function() {
cursor.skip(1);
var c = cursor.invoke(0);
return if_(c == 110 || c == 114 || c == 116 || c == 39 || c == 34 || c == 92, (function() {
return cursor.skip(1);
}), (function() {
return if_(c == 123, (function() {
cursor.skip(1);
while_((function() {
return cursor.invoke(0) != 125;
}), (function() {
when(cursor.pastEnd(), (function() {
return panic(("Unexpected end of file inside unicode escape sequence " + positionText(cursor, from)));
}));
var h = cursor.invoke(0);
return if_(h >= 48 && h <= 57 || h >= 97 && c <= 102 || h >= 65 && c <= 70, (function() {
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
var to = cursor.offset();
cursor.skip(1);
cursor.skipWhitespace();
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

function lexNumber(cursor) {
var c = cursor.invoke(0);
return if_(c < 48 || c > 57, (function() {
return Option.none();
}), (function() {
var from = cursor.offset();
while_((function() {
return cursor.invoke(0) >= 48 && cursor.invoke(0) <= 57;
}), (function() {
when(cursor.pastEnd(), (function() {
return panic(("Unexpected end of file inside this number " + positionText(cursor, from)));
}));
return cursor.skip(1);
}));
var to = cursor.offset();
cursor.skipWhitespace();
return Option.some(Token.token(TokenType.numeral(), from, to));
}));
}

function lexTokens(buffer) {
var builder = newArrayBuilder();
var cursor = newCharCursor(buffer);
var lastToken = Option.none();
while_((function() {
lastToken = lexToken(cursor);
return lastToken != Option.none();
}), (function() {
return builder.push(orPanic(lastToken));
}));
when(!cursor.pastEnd(), (function() {
return panic(("Unexpected character: " + codeUnit(cursor.invoke(0)) + " " + positionText(cursor, cursor.offset())));
}));
repeat(5, (function() {
return builder.push(Token.token(TokenType.outsideFile(), cursor.offset(), cursor.offset()));
}));
return builder.drain();
}

function isBetween(c, from, to) {
return c >= from && c <= to;
}

function testLexer() {
var result = lexTokens("while({x > 1}, { y += '\n' })");
for(var i = 0; i < result.length; i++) console.log(result[i].token._);
}

function compile(fs, moduleSources) {
var parsedModules = map(moduleSources, (function(p) {
var moduleName = p.filename;
console.log('Parsing ' + moduleName);
var tokens = lexTokens(p.text);
var pc = newPc(newTokenCursor(tokens, 0), p.text);
return {filename: p.filename, module: parseModule(pc, "_current", "_Current", p.filename, p.text)};
}));
var resolver = newResolver(map(parsedModules, (function(p) {
return p.module;
})));
var resolvedModules = map(parsedModules, (function(p) {
console.log('Resolving ' + p.filename);
return {filename: p.filename, module: resolveModule(resolver, p.module)};
}));
var typer = newTyper(map(resolvedModules, (function(p) {
return p.module;
})));
var typedModules = map(resolvedModules, (function(p) {
console.log('Typing ' + p.filename);
return {filename: p.filename, module: checkModule(typer, p.module)};
}));
var builder = newStringBuilder();
console.log('Emitting built-in types');
emitModule(builder, Module.module("_prelude", "_prelude", "_prelude", "", map(preludeTypeDefinitions(), (function(p) {
return p.second;
})), []));
each(typedModules, (function(p) {
console.log('Emitting ' + p.filename);
return emitModule(builder, p.module);
}));
var emitted = builder.drain();
return writeTextFile(fs, "output.js", (emitted + "\n\nmain();\n")).then((function(v) {
console.log('Wrote output.js')
}));
}

function loadAndCompile(fs, directory) {
function compileDirectory(directory) {
return readDirectory(fs, directory).then((function(files) {
return promiseAll(map(files, (function(file) {
var filename = directory + "/" + file;
return if_((file.indexOf(".") != -1), (function() {
return readTextFile(fs, filename).then((function(text) {
return [{filename: file, text: text}];
}));
}), (function() {
return compileDirectory(filename).then(flatten);
}));
})));
}));
}
return compileDirectory(directory).then((function(files) {
var sortedFiles = sortByString(flatten(files), (function(p) {
return p.filename;
}));
return compile(fs, sortedFiles);
})).catch((function(error) {
console.log(error);
}));
}

function main() {
process.on('unhandledRejection', function (err, p) { console.error('Unhandled promise rejection: ' + err) })
var fs = newFileSystem();
return loadAndCompile(fs, "lim");
}

function parseCommaList(pc, parse, end) {
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
return "";
})), Pair.pair([], (function() {
return pc.consume(TokenType.comma());
}))]);
}));
return result.drain();
}

function parseLeftAssociative(pc, next, operators) {
var result = next();
var cases = map(operators, (function(o) {
return Pair.pair([o], (function() {
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

function parseRecordType(pc) {
var parseField = (function() {
var fieldPosition = pc.position();
var label = pc.consume(TokenType.lower());
pc.consume(TokenType.colon());
var value = parseType(pc);
return FieldType.fieldType(fieldPosition, label, value);
});
var position = pc.position();
pc.consume(TokenType.leftSquare());
var fields = parseCommaList(pc, parseField, TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
var sortedFields = sortByString(fields, (function(f) {
return f.label;
}));
return Type.record(position, fields);
}

function parseTypeConstructor(pc) {
var position = pc.position();
var moduleName = pc.lookahead("type constructor", [Pair.pair([TokenType.upper(), TokenType.dot()], (function() {
var name = pc.consume(TokenType.upper());
pc.consume(TokenType.dot());
return Option.some(name);
})), Pair.pair([], (function() {
return Option.none();
}))]);
var name = pc.consume(TokenType.upper());
var typeArguments = pc.lookahead("type arguments", [Pair.pair([TokenType.leftSquare()], (function() {
pc.consume(TokenType.leftSquare());
var result = parseCommaList(pc, (function() {
return parseType(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
return Type.constructor(position, (function(_match) { switch(_match._) {
case "some": return (function(){
var m = _match.value;
return (m + "." + name);
})();
case "none": return (function(){
return name;
})();
}})(moduleName), typeArguments);
}

function parseType(pc) {
var left = pc.lookahead("type", [Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
var typeArguments = parseCommaList(pc, (function() {
return parseType(pc);
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
var position = pc.position();
pc.consume(TokenType.rightThickArrow());
var returnType = parseType(pc);
return Type.constructor(position, ("_.F" + ('' + typeArguments.length)), typeArguments.concat([returnType]));
})), Pair.pair([TokenType.lower()], (function() {
var position = pc.position();
var name = pc.consume(TokenType.lower());
return Type.parameter(position, name);
})), Pair.pair([TokenType.leftSquare()], (function() {
return parseRecordType(pc);
})), Pair.pair([], (function() {
return parseTypeConstructor(pc);
}))]);
return pc.lookahead("function type", [Pair.pair([TokenType.rightThickArrow()], (function() {
var position = pc.position();
pc.consume(TokenType.rightThickArrow());
var returnType = parseType(pc);
return Type.constructor(position, "_.F1", [left, returnType]);
})), Pair.pair([], (function() {
return left;
}))]);
}

function parseLambda(pc) {
var position = pc.position();
return pc.lookahead("lambda function", [Pair.pair([TokenType.leftCurly()], (function() {
var body = parseBody(pc);
return Term.lambda(position, [], body);
})), Pair.pair([], (function() {
var parameters = pc.lookahead("lambda function", [Pair.pair([TokenType.lower()], (function() {
return [pc.consume(TokenType.lower())];
})), Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
var result = parseCommaList(pc, (function() {
return pc.consume(TokenType.lower());
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
return result;
}))]);
pc.consume(TokenType.rightThickArrow());
var body = pc.lookahead("lambda body", [Pair.pair([TokenType.leftCurly()], (function() {
return parseBody(pc);
})), Pair.pair([], (function() {
return [Statement.term(position, parseTerm(pc))];
}))]);
return Term.lambda(position, parameters, body);
}))]);
}

function parseMethodImplementation(pc) {
var position = pc.position();
var name = pc.consume(TokenType.lower());
var parameters = pc.lookahead("method parameter", [Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
var result = parseCommaList(pc, (function() {
return pc.consume(TokenType.lower());
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
var body = parseBody(pc);
return MethodImplementation.methodImplementation(position, name, parameters, body);
}

function parseMethodImplementations(pc, allowThisName) {
pc.consume(TokenType.leftCurly());
var thisName = if_(!allowThisName, (function() {
return Option.none();
}), (function() {
return pc.lookahead("this =>", [Pair.pair([TokenType.lower(), TokenType.rightThickArrow()], (function() {
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.rightThickArrow());
return Option.some(name);
})), Pair.pair([], (function() {
return Option.none();
}))]);
}));
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

function parseInstance(pc) {
var position = pc.position();
var moduleName = pc.lookahead("type constructor", [Pair.pair([TokenType.upper(), TokenType.dot()], (function() {
var name = pc.consume(TokenType.upper());
pc.consume(TokenType.dot());
return Option.some(name);
})), Pair.pair([], (function() {
return Option.none();
}))]);
var name = pc.consume(TokenType.upper());
var pair = parseMethodImplementations(pc, true);
return Term.instance(position, (function(_match) { switch(_match._) {
case "some": return (function(){
var m = _match.value;
return (m + "." + name);
})();
case "none": return (function(){
return name;
})();
}})(moduleName), pair.first, pair.second);
}

function parseArray(pc) {
var position = pc.position();
pc.consume(TokenType.leftSquare());
var elements = parseCommaList(pc, (function() {
return parseTerm(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return Term.array(position, elements);
}

function parseRecord(pc) {
var parseField = (function() {
var fieldPosition = pc.position();
var label = pc.consume(TokenType.lower());
pc.consume(TokenType.assign());
var value = parseTerm(pc);
return Field.field(fieldPosition, label, value);
});
var position = pc.position();
pc.consume(TokenType.leftSquare());
var fields = parseCommaList(pc, parseField, TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return Term.record(position, fields);
}

function parseAtom(pc) {
return pc.lookahead("atom", [Pair.pair([TokenType.leftSquare(), TokenType.lower(), TokenType.assign()], (function() {
return parseRecord(pc);
})), Pair.pair([TokenType.leftSquare()], (function() {
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
var result = parseTerm(pc);
pc.consume(TokenType.rightRound());
return result;
})), Pair.pair([TokenType.lower()], (function() {
var position = pc.position();
var name = pc.consume(TokenType.lower());
return Term.variable(position, name);
})), Pair.pair([TokenType.codeUnit()], (function() {
var position = pc.position();
var text = pc.consume(TokenType.codeUnit());
var c = 0;
when(text == "'\\\\'", (function() {
c = 92;
}));
when(text == "'\\''", (function() {
c = 39;
}));
when(text == "'\\\"'", (function() {
c = 34;
}));
when(text == "'\\r'", (function() {
c = 13;
}));
when(text == "'\\n'", (function() {
c = 10;
}));
when(text == "'\\t'", (function() {
c = 9;
}));
when(text.charCodeAt(1) == 92 && c == 0, (function() {
return panic(("Unsupported escape code: " + text));
}));
when(c == 0, (function() {
c = text.charCodeAt(1);
}));
/* TODO: Unicode escape codes */
return Term.codeUnit(position, c);
})), Pair.pair([TokenType.text()], (function() {
var position = pc.position();
var text = pc.consume(TokenType.text());
text = text.substr(1);
return Term.text(position, text);
})), Pair.pair([TokenType.textStart()], (function() {
return parseText(pc);
})), Pair.pair([TokenType.numeral()], (function() {
var position = pc.position();
var value = pc.consume(TokenType.numeral());
return Term.integer(position, value);
})), Pair.pair([TokenType.floating()], (function() {
var position = pc.position();
var value = pc.consume(TokenType.floating());
return Term.floating(position, value);
}))]);
}

function parseText(pc) {
/* TODO: Replace line breaks with escaped line breaks \r and \n */
var position = pc.position();
var parts = newArrayBuilder();
var firstText = pc.consume(TokenType.textStart());
firstText = firstText.substr(1);
firstText = firstText.substr(0, firstText.length - 1);
when(firstText.length > 0, (function() {
return parts.push(Term.text(position, firstText));
}));
var done = false;
while_((function() {
return !done;
}), (function() {
parts.push(parseTerm(pc));
return pc.lookahead("end of string", [Pair.pair([TokenType.textEnd()], (function() {
var text = pc.consume(TokenType.textEnd());
text = text.substr(1);
when(text.length > 0, (function() {
return parts.push(Term.text(position, text));
}));
done = true;
})), Pair.pair([TokenType.textMiddle()], (function() {
var text = pc.consume(TokenType.textMiddle());
text = text.substr(1);
text = text.substr(0, text.length - 1);
return when(text.length > 0, (function() {
return parts.push(Term.text(position, text));
}));
}))]);
}));
return Term.textLiteral(position, parts.drain());
}

function parseNamedArgument(pc) {
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.assign());
var term = parseTerm(pc);
return Pair.pair(name, term);
}

function parseArguments(pc) {
var named = false;
pc.consume(TokenType.leftRound());
var arguments_ = parseCommaList(pc, (function() {
return pc.lookahead("method argument", [Pair.pair([TokenType.lower(), TokenType.assign()], (function() {
named = true;
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
return Arguments.arguments_(map(filter(arguments_, (function(a) {
return a.first == "";
})), (function(a) {
return a.second;
})), map(indexed(filter(arguments_, (function(a) {
return a.first != "";
}))), (function(i) {
return NamedArgument.namedArgument(i.first, i.second.first, i.second.second);
})));
}

function parseStaticCall(pc) {
var module = pc.consume(TokenType.upper());
var name = pc.lookahead("type name", [Pair.pair([TokenType.dot(), TokenType.upper()], (function() {
pc.consume(TokenType.dot());
return Option.some(pc.consume(TokenType.upper()));
})), Pair.pair([], (function() {
return Option.none();
}))]);
var lastName = or(name, module);
var position = pc.position();
var methodName = pc.lookahead("call", [Pair.pair([TokenType.dot(), TokenType.lower()], (function() {
pc.consume(TokenType.dot());
return pc.consume(TokenType.lower());
})), Pair.pair([TokenType.leftRound()], (function() {
return (lastName.substr(0, 1).toLowerCase() + lastName.substr(1));
}))]);
var arguments_ = pc.lookahead("arguments", [Pair.pair([TokenType.leftRound()], (function() {
return parseArguments(pc);
})), Pair.pair([], (function() {
return Arguments.arguments_([], []);
}))]);
var staticName = (function(_match) { switch(_match._) {
case "some": return (function(){
var n = _match.value;
return (module + "." + n);
})();
case "none": return (function(){
return module;
})();
}})(name);
return Term.staticCall(position, staticName, methodName, arguments_);
}

function parseCall(pc) {
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
var named = false;
var position = pc.position();
var methodName = pc.lookahead("method call", [Pair.pair([TokenType.dot()], (function() {
pc.consume(TokenType.dot());
return pc.consume(TokenType.lower());
})), Pair.pair([TokenType.leftRound()], (function() {
return "invoke";
}))]);
result = pc.lookahead("method call", [Pair.pair([TokenType.leftRound()], (function() {
var arguments_ = parseArguments(pc);
return Term.methodCall(position, result, methodName, arguments_, "");
})), Pair.pair([], (function() {
return Term.methodCall(position, result, methodName, Arguments.arguments_([], []), "");
}))]);
}));
return result;
}

function parseMinusNot(pc) {
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

function parseTimesDivide(pc) {
return parseLeftAssociative(pc, (function() {
return parseMinusNot(pc);
}), [TokenType.star(), TokenType.slash()]);
}

function parsePlusMinus(pc) {
return parseLeftAssociative(pc, (function() {
return parseTimesDivide(pc);
}), [TokenType.plus(), TokenType.minus()]);
}

function parseInequality(pc) {
return parseLeftAssociative(pc, (function() {
return parsePlusMinus(pc);
}), [TokenType.equal(), TokenType.notEqual(), TokenType.less(), TokenType.lessEqual(), TokenType.greater(), TokenType.greaterEqual()]);
}

function parseAndOr(pc) {
return parseLeftAssociative(pc, (function() {
return parseInequality(pc);
}), [TokenType.and(), TokenType.or()]);
}

function parseMatch(pc) {
var value = parseAndOr(pc);
return pc.lookahead("match", [Pair.pair([TokenType.question()], (function() {
var position = pc.position();
pc.consume(TokenType.question());
var cases = parseMethodImplementations(pc, false);
return Term.match(position, value, map(cases.second, (function(m) {
return MatchCase.matchCase(m, []);
})), "");
})), Pair.pair([], (function() {
return value;
}))]);
}

function parseTerm(pc) {
return parseMatch(pc);
}

function parseFfi(pc) {
var position = pc.position();
var language = pc.consume(TokenType.lower());
when(language != "js", (function() {
return panic(("Expected FFI js, got FFI " + language));
}));
var code = pc.consume(TokenType.text());
code = code.substr(1);
return Statement.ffi(position, language, code);
}

function parseBody(pc) {
pc.consume(TokenType.leftCurly());
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

function parseStatement(pc) {
var position = pc.position();
return pc.lookahead("statement", [Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.leftCurly()], (function() {
return Statement.functions(parseFunctionDefinitions(pc));
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.colon()], (function() {
return Statement.functions(parseFunctionDefinitions(pc));
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.lower(), TokenType.colon()], (function() {
return Statement.functions(parseFunctionDefinitions(pc));
})), Pair.pair([TokenType.lower(), TokenType.leftSquare()], (function() {
return Statement.functions(parseFunctionDefinitions(pc));
})), Pair.pair([TokenType.lower(), TokenType.colon()], (function() {
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.colon());
var type = pc.lookahead("type", [Pair.pair([TokenType.assign()], (function() {
return Option.none();
})), Pair.pair([], (function() {
return Option.some(parseType(pc));
}))]);
pc.consume(TokenType.assign());
var value = parseTerm(pc);
return Statement.let_(position, name, type, value);
})), Pair.pair([TokenType.lower(), TokenType.assign()], (function() {
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.assign());
var value = parseTerm(pc);
return Statement.assign(position, name, value);
})), Pair.pair([TokenType.lower(), TokenType.increment()], (function() {
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.increment());
var value = parseTerm(pc);
return Statement.increment(position, name, value);
})), Pair.pair([TokenType.lower(), TokenType.decrement()], (function() {
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.decrement());
var value = parseTerm(pc);
return Statement.decrement(position, name, value);
})), Pair.pair([TokenType.lower(), TokenType.text()], (function() {
return parseFfi(pc);
})), Pair.pair([], (function() {
var term = parseTerm(pc);
return Statement.term(position, term);
}))]);
}

function parseTypeParameter(pc) {
return pc.consume(TokenType.lower());
}

function parseParameter(pc) {
var position = pc.position();
var name = pc.consume(TokenType.lower());
pc.consume(TokenType.colon());
var type = parseType(pc);
return Parameter.parameter(position, name, type);
}

function parseMethodSignature(pc) {
var position = pc.position();
var name = pc.consume(TokenType.lower());
var typeParameters = pc.lookahead("type parameters", [Pair.pair([TokenType.leftSquare()], (function() {
pc.consume(TokenType.leftSquare());
var result = parseCommaList(pc, (function() {
return parseTypeParameter(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
var parameters = pc.lookahead("parameters", [Pair.pair([TokenType.leftRound()], (function() {
pc.consume(TokenType.leftRound());
var result = parseCommaList(pc, (function() {
return parseParameter(pc);
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
var returnType = pc.lookahead("return type", [Pair.pair([TokenType.colon()], (function() {
pc.consume(TokenType.colon());
return parseType(pc);
})), Pair.pair([], (function() {
return Type.constructor(position, "_.Void", []);
}))]);
return MethodSignature.methodSignature(position, name, typeParameters, parameters, returnType);
}

function parseFunctionDefinitions(pc) {
var position = pc.position();
var result = newArrayBuilder();
while_((function() {
return pc.lookahead("function", [Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.leftCurly()], (function() {
return true;
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.rightRound(), TokenType.colon()], (function() {
return true;
})), Pair.pair([TokenType.lower(), TokenType.leftRound(), TokenType.lower(), TokenType.colon()], (function() {
return true;
})), Pair.pair([TokenType.lower(), TokenType.leftSquare()], (function() {
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
})), Pair.pair([TokenType.separator(), TokenType.lower(), TokenType.leftSquare()], (function() {
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

function parseFunctionDefinition(pc) {
var position = pc.position();
var signature = parseMethodSignature(pc);
var body = parseBody(pc);
return FunctionDefinition.functionDefinition(position, signature, body);
}

function parseMethodSignatures(pc) {
pc.consume(TokenType.leftCurly());
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

function parseTypeDefinition(pc) {
var position = pc.position();
var name = pc.consume(TokenType.upper());
var typeParameters = pc.lookahead("type parameters", [Pair.pair([TokenType.leftSquare()], (function() {
pc.consume(TokenType.leftSquare());
var result = parseCommaList(pc, (function() {
return parseTypeParameter(pc);
}), TokenType.rightSquare());
pc.consume(TokenType.rightSquare());
return result;
})), Pair.pair([], (function() {
return [];
}))]);
var isSum = pc.lookahead("type parameters", [Pair.pair([TokenType.question()], (function() {
pc.consume(TokenType.question());
return true;
})), Pair.pair([], (function() {
return false;
}))]);
var isRecord = false;
var methodSignatures = pc.lookahead("method signatures", [Pair.pair([TokenType.leftRound()], (function() {
var methodPosition = position;
pc.consume(TokenType.leftRound());
var parameters = parseCommaList(pc, (function() {
return parseParameter(pc);
}), TokenType.rightRound());
pc.consume(TokenType.rightRound());
var methodName = (name.substr(0, 1).toLowerCase() + name.substr(1));
isRecord = true;
return [MethodSignature.methodSignature(methodPosition, methodName, [], parameters, Type.constructor(methodPosition, "_.Void", []))];
})), Pair.pair([], (function() {
return parseMethodSignatures(pc);
}))]);
return TypeDefinition.typeDefinition(position, name, typeParameters, isSum || isRecord, methodSignatures);
}

function parseModule(pc, package_, alias, file, source) {
var typeDefinitions = newArrayBuilder();
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


function newPc(cursor, buffer) {
var tokenTypeText = (function(tokenType) {
return tokenType._;
});
var tokenText = (function(token) {
return buffer.substring(token.from, token.to);
});
var positionText = (function(token) {
var token2 = token;
var position = newCharCursor(buffer).position(token.from);
return ("at line " + ('' + position.line) + " column " + ('' + position.column));
});
return {
position: function() {
return cursor.invoke(0).from;
},
consume: function(tokenType) {
var ahead = cursor.invoke(0);
when(ahead.token != tokenType, (function() {
return panic(("Expected " + tokenTypeText(tokenType) + ", got " + tokenText(ahead) + " " + positionText(ahead)));
}));
var text = tokenText(ahead);
cursor.skip(1);
return text;
},
lookahead: function(expected, cases) {
var i = 0;
var result = Option.none();
while_((function() {
return i < cases.length && result == Option.none();
}), (function() {
var case_ = cases[i];
var j = 0;
var match = true;
while_((function() {
return j < case_.first.length;
}), (function() {
match = match && case_.first[j] == cursor.invoke(j).token;
j += 1;
}));
when(match, (function() {
result = Option.some(case_.second());
}));
i += 1;
}));
return (function(_match) { switch(_match._) {
case "none": return (function(){
var ahead = cursor.invoke(0);
return panic(("Expected " + expected + ", got " + tokenText(ahead) + " " + positionText(ahead)));
})();
case "some": return (function(){
var value = _match.value;
return value;
})();
}})(result);
}
};
}


var Pair = {
pair: function(first, second) {
return {_: "pair", first: first, second: second};
}
};

function case_(condition, body) {
return if_(condition(), (function() {
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

function if_(condition, then, else_) {
return (condition ? (function() {
return then();
})() : (function() {
return else_();
})());
}

function when(condition, then) {
return (condition ? (function() {
return then();
})() : (function() {
})());
}

function while_(condition, body) {
while(condition()) body();
}

function do_(body) {
return body();
}

function repeat(times, body) {
for(var i = 0; i < times; i++) body();
}

function each(array, body) {
for(var i = 0; i < array.length; i++) body(array[i]);
}

function indexed(array) {
var result = [];
for(var i = 0; i < array.length; i++) result.push(Pair.pair(i, array[i]));
return result;
}

function zip(left, right) {
var result = [];
for(var i = 0; i < left.length && i < right.length; i++) result.push(Pair.pair(left[i], right[i]));
return result;
}

function map(array, body) {
var result = [];
for(var i = 0; i < array.length; i++) result.push(body(array[i]));
return result;
}

function filter(array, condition) {
var result = [];
for(var i = 0; i < array.length; i++) if(condition(array[i])) result.push(array[i]);
return result;
}

function find(array, condition) {
for(var i = 0; i < array.length; i++) if(condition(array[i])) return Option.some(array[i]);
return Option.none();
}

function first(array) {
return if_(array.length != 0, (function() {
return Option.some(array[0]);
}), (function() {
return Option.none();
}));
}

function firsts(array) {
var result = [];
for(var i = 0; i < array.length - 1; i++) result.push(array[i]);
return result;
}

function last(array) {
return if_(array.length != 0, (function() {
return Option.some(array[array.length - 1]);
}), (function() {
return Option.none();
}));
}

function lasts(array) {
var result = [];
for(var i = 1; i < array.length; i++) result.push(array[i]);
return result;
}

function any(array, condition) {
for(var i = 0; i < array.length; i++) if(condition(array[i])) return true;
return false;
}

function all(array, condition) {
for(var i = 0; i < array.length; i++) if(!condition(array[i])) return false;
return true;
}

function flatten(array) {
var result = [];
for(var i = 0; i < array.length; i++) for(var j = 0; j < array[i].length; j++) result.push(array[i][j]);
return result;
}

function join(array, separator) {
return array.join(separator);
}

function panic(problem) {
throw problem;
}

function orElse(options) {
var result = Option.none();
var i = 0;
while_((function() {
return result == Option.none() && i < options.length;
}), (function() {
result = options[i]();
i += 1;
}));
return result;
}

function orPanic(option) {
return (function(_match) { switch(_match._) {
case "none": return (function(){
return panic("orPanic(Option.none)");
})();
case "some": return (function(){
var value = _match.value;
return value;
})();
}})(option);
}

function or(option, default_) {
return (function(_match) { switch(_match._) {
case "none": return (function(){
return default_;
})();
case "some": return (function(){
var value = _match.value;
return value;
})();
}})(option);
}

function sortByString(array, selector) {
return array.slice().sort(function(a, b) { return selector(a).localeCompare(selector(b)); });
}

function sortByInt(array, selector) {
return array.slice().sort(function(a, b) { return selector(a) - selector(b); });
}

function newPromise(executor) {
return new Promise(executor);
}

function promiseVoid() {
return Promise.resolve(void 0);
}

function promiseResolve(value) {
return Promise.resolve(value);
}

function promiseReject(reason) {
return Promise.reject(reason);
}

function promiseBoth(left, right) {
return Promise.all([left, right]).then(function(p) { return Pair.pair(p.left, p.right) });
}

function promiseAll(promises) {
return Promise.all(promises);
}

function promiseRace(promises) {
return Promise.race(promises);
}


function resolveModule(resolver, module) {
resolver.setSource(module.source);
return Module.module(module.package_, module.file, module.alias, module.source, map(module.typeDefinitions, (function(d) {
return resolveTypeDefinition(resolver, d);
})), map(module.functionDefinitions, (function(d) {
return resolveFunctionDefinition(resolver, d, true);
})));
}

function resolveTypeDefinition(resolver, d) {
return resolver.scope((function() {
var symbol = resolver.typeConstructor(d.position, d.symbol);
var typeParameters = map(d.typeParameters, (function(p) {
return resolver.addTypeParameter(d.position, p);
}));
var methodSignatures = map(d.methodSignatures, (function(s) {
return resolver.scope((function() {
return resolveMethodSignatureInScope(resolver, s, false);
}));
}));
return TypeDefinition.typeDefinition(d.position, symbol, typeParameters, d.isSum, methodSignatures);
}));
}

function resolveFunctionDefinition(resolver, d, topLevel) {
return resolver.scope((function() {
var signature = resolveMethodSignatureInScope(resolver, d.signature, topLevel);
var body = resolveBody(resolver, d.body);
return FunctionDefinition.functionDefinition(d.position, signature, body);
}));
}

function resolveMethodSignatureInScope(resolver, s, topLevel) {
var symbol = if_(topLevel, (function() {
return resolver.variable(s.position, s.symbol);
}), (function() {
return s.symbol;
}));
var typeParameters = map(s.typeParameters, (function(p) {
return resolver.addTypeParameter(s.position, p);
}));
var parameters = map(s.parameters, (function(p) {
return Parameter.parameter(p.position, resolver.addVariable(p.position, p.name), resolveType(resolver, p.type));
}));
var returnType = resolveType(resolver, s.returnType);
return MethodSignature.methodSignature(s.position, symbol, s.typeParameters, parameters, returnType);
}

function resolveMethodImplementation(resolver, i) {
return resolver.scope((function() {
var parameters = map(i.parameters, (function(p) {
return resolver.addVariable(i.position, p);
}));
var body = resolveBody(resolver, i.body);
return MethodImplementation.methodImplementation(i.position, i.name, parameters, body);
}));
}

function resolveMatchCase(resolver, case_) {
var body = case_.body;
var resolvedImplementation = resolveMethodImplementation(resolver, body);
return MatchCase.matchCase(resolvedImplementation, case_.fieldNames);
}

function resolveBody(resolver, body) {
return resolver.scope((function() {
return map(body, (function(s) {
return resolveStatement(resolver, s);
}));
}));
}

function resolveStatement(resolver, statement) {
return (function(_match) { switch(_match._) {
case "term": return (function(){
var position = _match.position;
var term = _match.term;
return Statement.term(position, resolveTerm(resolver, term));
})();
case "let": return (function(){
var position = _match.position;
var variable = _match.variable;
var type = _match.type;
var value = _match.value;
var value2 = resolveTerm(resolver, value);
resolver.assertNoVariable(position, variable);
resolver.addVariable(position, variable);
var variableType = (function(_match) { switch(_match._) {
case "some": return (function(){
var t = _match.value;
return Option.some(resolveType(resolver, t));
})();
case "none": return (function(){
return Option.none();
})();
}})(type);
return Statement.let_(position, resolver.variable(position, variable), variableType, value2);
})();
case "functions": return (function(){
var definitions = _match.definitions;
each(definitions, (function(d) {
return resolver.addFunction(d.position, d.signature.symbol);
}));
return Statement.functions(map(definitions, (function(d) {
return resolveFunctionDefinition(resolver, d, false);
})));
})();
case "assign": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
return Statement.assign(position, resolver.variable(position, variable), resolveTerm(resolver, value));
})();
case "increment": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
return Statement.increment(position, resolver.variable(position, variable), resolveTerm(resolver, value));
})();
case "decrement": return (function(){
var position = _match.position;
var variable = _match.variable;
var value = _match.value;
return Statement.decrement(position, resolver.variable(position, variable), resolveTerm(resolver, value));
})();
case "ffi": return (function(){
var position = _match.position;
var language = _match.language;
var code = _match.code;
return Statement.ffi(position, language, code);
})();
}})(statement);
}

function resolveType(resolver, type) {
return (function(_match) { switch(_match._) {
case "constructor": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var typeArguments = _match.typeArguments;
var resolvedSymbol = resolver.typeConstructor(position, symbol);
var resolvedTypeArguments = map(typeArguments, (function(a) {
return resolveType(resolver, a);
}));
return Type.constructor(position, resolvedSymbol, resolvedTypeArguments);
})();
case "record": return (function(){
var position = _match.position;
var fields = _match.fields;
return Type.record(position, map(fields, (function(f) {
return FieldType.fieldType(f.position, f.label, resolveType(resolver, f.type));
})));
})();
case "parameter": return (function(){
var position = _match.position;
var name = _match.name;
return Type.parameter(position, resolver.typeParameter(position, name));
})();
case "variable": return (function(){
var position = _match.position;
var id = _match.id;
return type;
})();
}})(type);
}

function resolveTerm(resolver, term) {
return (function(_match) { switch(_match._) {
case "binary": return (function(){
var position = _match.position;
var operator = _match.operator;
var left = _match.left;
var right = _match.right;
return Term.binary(position, operator, resolveTerm(resolver, left), resolveTerm(resolver, right));
})();
case "unary": return (function(){
var position = _match.position;
var operator = _match.operator;
var value = _match.value;
return Term.unary(position, operator, resolveTerm(resolver, value));
})();
case "codeUnit": return (function(){
var position = _match.position;
var value = _match.value;
return term;
})();
case "text": return (function(){
var position = _match.position;
var value = _match.value;
return term;
})();
case "textLiteral": return (function(){
var position = _match.position;
var parts = _match.parts;
return Term.textLiteral(position, map(parts, (function(p) {
return resolveTerm(resolver, p);
})));
})();
case "integer": return (function(){
var position = _match.position;
var value = _match.value;
return term;
})();
case "floating": return (function(){
var position = _match.position;
var value = _match.value;
return term;
})();
case "array": return (function(){
var position = _match.position;
var elements = _match.elements;
return Term.array(position, map(elements, (function(e) {
return resolveTerm(resolver, e);
})));
})();
case "record": return (function(){
var position = _match.position;
var fields = _match.fields;
return Term.record(position, map(fields, (function(f) {
return Field.field(f.position, f.label, resolveTerm(resolver, f.value));
})));
})();
case "instance": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var thisName = _match.thisName;
var methods = _match.methods;
(function(_match) { switch(_match._) {
case "some": return (function(){
var n = _match.value;
return resolver.addVariable(position, n);
})();
case "none": return (function(){
return "";
})();
}})(thisName);
var resolvedSymbol = resolver.typeConstructor(position, symbol);
var resolvedMethods = map(methods, (function(i) {
return resolveMethodImplementation(resolver, i);
}));
return Term.instance(position, resolvedSymbol, thisName, resolvedMethods);
})();
case "match": return (function(){
var position = _match.position;
var value = _match.value;
var cases = _match.cases;
var hintSymbol = _match.hintSymbol;
var resolvedValue = resolveTerm(resolver, value);
var resolvedCases = map(cases, (function(c) {
return resolveMatchCase(resolver, c);
}));
return Term.match(position, resolvedValue, resolvedCases, hintSymbol);
})();
case "lambda": return (function(){
var position = _match.position;
var parameters = _match.parameters;
var body = _match.body;
return resolver.scope((function() {
var resolvedParameters = map(parameters, (function(p) {
return resolver.addVariable(position, p);
}));
var resolvedBody = resolveBody(resolver, body);
return Term.lambda(position, resolvedParameters, resolvedBody);
}));
})();
case "functionCall": return (function(){
var position = _match.position;
var name = _match.name;
var arguments_ = _match.arguments_;
var resolvedName = orPanic(resolver.function_(position, name));
var resolvedArguments = map(arguments_.unnamed, (function(a) {
return resolveTerm(resolver, a);
}));
var resolvedNamedArguments = map(arguments_.named, (function(a) {
return NamedArgument.namedArgument(a.order, a.name, resolveTerm(resolver, a.value));
}));
return Term.functionCall(position, resolvedName, Arguments.arguments_(resolvedArguments, resolvedNamedArguments));
})();
case "staticCall": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var resolvedSymbol = resolver.staticName(position, symbol);
var resolvedArguments = map(arguments_.unnamed, (function(a) {
return resolveTerm(resolver, a);
}));
var resolvedNamedArguments = map(arguments_.named, (function(a) {
return NamedArgument.namedArgument(a.order, a.name, resolveTerm(resolver, a.value));
}));
return Term.staticCall(position, resolvedSymbol, methodName, Arguments.arguments_(resolvedArguments, resolvedNamedArguments));
})();
case "methodCall": return (function(){
var position = _match.position;
var value = _match.value;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var hintSymbol = _match.hintSymbol;
var functionName = (function(_match) { switch(_match._) {
case "binary": return (function(){
var position = _match.position;
var operator = _match.operator;
var left = _match.left;
var right = _match.right;
return Option.none();
})();
case "unary": return (function(){
var position = _match.position;
var operator = _match.operator;
var value = _match.value;
return Option.none();
})();
case "codeUnit": return (function(){
var position = _match.position;
var value = _match.value;
return Option.none();
})();
case "text": return (function(){
var position = _match.position;
var value = _match.value;
return Option.none();
})();
case "textLiteral": return (function(){
var position = _match.position;
var parts = _match.parts;
return Option.none();
})();
case "integer": return (function(){
var position = _match.position;
var value = _match.value;
return Option.none();
})();
case "floating": return (function(){
var position = _match.position;
var value = _match.value;
return Option.none();
})();
case "array": return (function(){
var position = _match.position;
var elements = _match.elements;
return Option.none();
})();
case "record": return (function(){
var position = _match.position;
var fields = _match.fields;
return Option.none();
})();
case "instance": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var thisName = _match.thisName;
var methods = _match.methods;
return Option.none();
})();
case "match": return (function(){
var position = _match.position;
var value = _match.value;
var cases = _match.cases;
var hintSymbol = _match.hintSymbol;
return Option.none();
})();
case "lambda": return (function(){
var position = _match.position;
var parameters = _match.parameters;
var body = _match.body;
return Option.none();
})();
case "functionCall": return (function(){
var position = _match.position;
var name = _match.name;
var arguments_ = _match.arguments_;
return Option.none();
})();
case "staticCall": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var methodName = _match.name;
var arguments_ = _match.arguments_;
return Option.none();
})();
case "methodCall": return (function(){
var position = _match.position;
var value = _match.value;
var methodName = _match.name;
var arguments_ = _match.arguments_;
var hintSymbol = _match.hintSymbol;
return Option.none();
})();
case "variable": return (function(){
var position = _match.position;
var symbol = _match.symbol;
return if_(methodName == "invoke", (function() {
return (function(_match) { switch(_match._) {
case "some": return (function(){
var name = _match.value;
return Option.none();
})();
case "none": return (function(){
return resolver.function_(position, symbol);
})();
}})(resolver.getVariable(position, symbol));
}), (function() {
return Option.none();
}));
})();
}})(value);
var resolvedUnnamed = map(arguments_.unnamed, (function(a) {
return resolveTerm(resolver, a);
}));
var resolvedNamed = map(arguments_.named, (function(a) {
return NamedArgument.namedArgument(a.order, a.name, resolveTerm(resolver, a.value));
}));
var resolvedArguments = Arguments.arguments_(resolvedUnnamed, resolvedNamed);
return (function(_match) { switch(_match._) {
case "some": return (function(){
var name = _match.value;
return Term.functionCall(position, name, resolvedArguments);
})();
case "none": return (function(){
var resolvedValue = resolveTerm(resolver, value);
return Term.methodCall(position, resolvedValue, methodName, resolvedArguments, hintSymbol);
})();
}})(functionName);
})();
case "variable": return (function(){
var position = _match.position;
var symbol = _match.symbol;
return (function(_match) { switch(_match._) {
case "some": return (function(){
var name = _match.value;
return Term.variable(position, name);
})();
case "none": return (function(){
return (function(_match) { switch(_match._) {
case "some": return (function(){
var functionName = _match.value;
return Term.variable(position, functionName);
})();
case "none": return (function(){
return resolver.error(position, ("No such variable: " + symbol));
})();
}})(resolver.function_(position, symbol));
})();
}})(resolver.getVariable(position, symbol));
})();
}})(term);
}

function newResolver(modules) {
var source = "";
var error = (function(e, p) {
return panic((e + " " + positionText(newCharCursor(source), p)));
});
var preludeTypes = ["Void", "Bool", "String", "Int", "Float", "Array", "Option", "Pair", "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "Promise"];
var modulePreludeTypes = map(preludeTypes, (function(t) {
return ("_." + t);
}));
var canonicalPreludeTypes = map(preludeTypes, (function(t) {
return (t + "@_");
}));
var preludeTypeConstructors = zip(preludeTypes.concat(modulePreludeTypes), canonicalPreludeTypes.concat(canonicalPreludeTypes));
var allTypes = flatten(map(modules, (function(m) {
return map(m.typeDefinitions, (function(d) {
return Pair.pair(d.symbol, (d.symbol + "@" + m.package_));
}));
})));
var allFunctions = flatten(map(modules, (function(m) {
return map(m.functionDefinitions, (function(d) {
return Pair.pair(d.signature.symbol, (d.signature.symbol + "@" + m.package_));
}));
})));
var definedTypes = newStringMapBuilder([]);
var definedFunctions = newStringMapBuilder([]);
each(modules, (function(m) {
source = m.source;
return each(m.typeDefinitions, (function(d) {
var unique = (d.symbol + "@" + m.package_);
when(definedTypes.has(unique), (function() {
var moduleName = m.file;
console.log('Resolving ' + moduleName);
return error(("Duplicate type definition: " + d.symbol), d.position);
}));
return definedTypes.set(unique, true);
}));
}));
each(modules, (function(m) {
source = m.source;
return each(m.functionDefinitions, (function(d) {
var unique = (d.signature.symbol + "@" + m.package_);
when(definedFunctions.has(unique), (function() {
var moduleName = m.file;
console.log('Resolving ' + moduleName);
return error(("Duplicate function definition: " + d.signature.symbol), d.position);
}));
return definedFunctions.set(unique, true);
}));
}));
var typeConstructors = newStringMapBuilder(preludeTypeConstructors.concat(allTypes));
var functions = newStringMapBuilder(allFunctions);
var moduleAliases = newStringMapBuilder(map(modules, (function(m) {
return Pair.pair(m.alias, m.package_);
})));
var moduleTypeConstructors = newStringMapBuilder(flatten(map(modules, (function(m) {
return map(m.typeDefinitions, (function(d) {
return Pair.pair((m.alias + "." + d.symbol), (d.symbol + "@" + m.package_));
}));
}))));
var variables = newStringMapBuilder([]);
var typeParameters = newStringMapBuilder([]);
return {
typeConstructor: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return x;
})();
case "none": return (function(){
return (function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return x;
})();
case "none": return (function(){
return error(("No such type: " + symbol), position);
})();
}})(moduleTypeConstructors.get(symbol));
})();
}})(typeConstructors.get(symbol));
},
typeParameter: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return x;
})();
case "none": return (function(){
return error(("No such type parameter: " + symbol), position);
})();
}})(typeParameters.get(symbol));
},
staticName: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return x;
})();
case "none": return (function(){
return (function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return x;
})();
case "none": return (function(){
return (function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return x;
})();
case "none": return (function(){
return error(("No such module or type: " + symbol), position);
})();
}})(moduleTypeConstructors.get(symbol));
})();
}})(moduleAliases.get(symbol));
})();
}})(typeConstructors.get(symbol));
},
getVariable: function(position, symbol) {
return variables.get(symbol);
},
variable: function(position, symbol) {
return (function(_match) { switch(_match._) {
case "some": return (function(){
var x = _match.value;
return x;
})();
case "none": return (function(){
return (function(_match) { switch(_match._) {
case "none": return (function(){
return error(("No such variable: " + symbol + " (but there is a method with that name)"), position);
})();
case "some": return (function(){
var x = _match.value;
return x;
})();
}})(functions.get(symbol));
})();
}})(variables.get(symbol));
},
function_: function(position, symbol) {
return functions.get(symbol);
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
addFunction: function(position, name) {
functions.set(name, name);
return name;
},
addTypeParameter: function(position, name) {
(function(_match) { switch(_match._) {
case "some": return (function(){
var n = _match.value;
return error(("Suspicious shadowing of type parameter: " + name), position);
})();
case "none": return (function(){
return "";
})();
}})(typeParameters.get(name));
typeParameters.set(name, name);
return name;
},
scope: function(body) {
var savedTypeConstructors = typeConstructors.toArray();
var savedVariables = variables.toArray();
var savedFunctions = functions.toArray();
var savedTypeParameters = typeParameters.toArray();
var result = body();
typeConstructors = newStringMapBuilder(savedTypeConstructors);
variables = newStringMapBuilder(savedVariables);
functions = newStringMapBuilder(savedFunctions);
typeParameters = newStringMapBuilder(savedTypeParameters);
return result;
},
error: function(position, message) {
error(message, position);
return panic(message);
},
setSource: function(text) {
source = text;
}
};
}


function newStringBuilder() {
var string = "";
return {
drain: function() {
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



function newStringMap(array) {
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

function newStringMapBuilder(array) {
var map = {};
var builder = {
invoke: function(key) {
var this_ = this;
return if_(this_.has(key), (function() {
return map['~' + key];
}), (function() {
return panic(("No such key: " + key));
}));
},
get: function(key) {
var this_ = this;
return if_(this_.has(key), (function() {
return Option.some(map['~' + key]);
}), (function() {
return Option.none();
}));
},
has: function(key) {
var this_ = this;
return map.hasOwnProperty('~' + key);
},
set: function(key, value) {
var this_ = this;
map['~' + key] = value;
},
remove: function(key, value) {
var this_ = this;
delete map['~' + key];
},
toArray: function() {
var this_ = this;
var result = [];
for(var key in map) if(this_.has(key.substr(1))) result.push(Pair.pair(key.substr(1), map[key]));
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

var Term = {
binary: function(position, operator, left, right) {
return {_: "binary", position: position, operator: operator, left: left, right: right};
},
unary: function(position, operator, value) {
return {_: "unary", position: position, operator: operator, value: value};
},
codeUnit: function(position, value) {
return {_: "codeUnit", position: position, value: value};
},
text: function(position, value) {
return {_: "text", position: position, value: value};
},
textLiteral: function(position, parts) {
return {_: "textLiteral", position: position, parts: parts};
},
integer: function(position, value) {
return {_: "integer", position: position, value: value};
},
floating: function(position, value) {
return {_: "floating", position: position, value: value};
},
array: function(position, elements) {
return {_: "array", position: position, elements: elements};
},
record: function(position, fields) {
return {_: "record", position: position, fields: fields};
},
variable: function(position, symbol) {
return {_: "variable", position: position, symbol: symbol};
},
staticCall: function(position, symbol, name, arguments_) {
return {_: "staticCall", position: position, symbol: symbol, name: name, arguments_: arguments_};
},
functionCall: function(position, name, arguments_) {
return {_: "functionCall", position: position, name: name, arguments_: arguments_};
},
methodCall: function(position, value, name, arguments_, hintSymbol) {
return {_: "methodCall", position: position, value: value, name: name, arguments_: arguments_, hintSymbol: hintSymbol};
},
instance: function(position, symbol, thisName, methods) {
return {_: "instance", position: position, symbol: symbol, thisName: thisName, methods: methods};
},
match: function(position, value, cases, hintSymbol) {
return {_: "match", position: position, value: value, cases: cases, hintSymbol: hintSymbol};
},
lambda: function(position, parameters, body) {
return {_: "lambda", position: position, parameters: parameters, body: body};
}
};

var MatchCase = {
matchCase: function(body, fieldNames) {
return {_: "matchCase", body: body, fieldNames: fieldNames};
}
};

var Arguments = {
arguments_: function(unnamed, named) {
return {_: "arguments", unnamed: unnamed, named: named};
}
};

var NamedArgument = {
namedArgument: function(order, name, value) {
return {_: "namedArgument", order: order, name: name, value: value};
}
};

var Field = {
field: function(position, label, value) {
return {_: "field", position: position, label: label, value: value};
}
};

var FieldType = {
fieldType: function(position, label, type) {
return {_: "fieldType", position: position, label: label, type: type};
}
};

var Statement = {
term: function(position, term) {
return {_: "term", position: position, term: term};
},
let_: function(position, variable, type, value) {
return {_: "let", position: position, variable: variable, type: type, value: value};
},
functions: function(definitions) {
return {_: "functions", definitions: definitions};
},
assign: function(position, variable, value) {
return {_: "assign", position: position, variable: variable, value: value};
},
increment: function(position, variable, value) {
return {_: "increment", position: position, variable: variable, value: value};
},
decrement: function(position, variable, value) {
return {_: "decrement", position: position, variable: variable, value: value};
},
ffi: function(position, language, code) {
return {_: "ffi", position: position, language: language, code: code};
}
};

var Type = {
constructor: function(position, symbol, typeArguments) {
return {_: "constructor", position: position, symbol: symbol, typeArguments: typeArguments};
},
record: function(position, fields) {
return {_: "record", position: position, fields: fields};
},
parameter: function(position, name) {
return {_: "parameter", position: position, name: name};
},
variable: function(position, id) {
return {_: "variable", position: position, id: id};
}
};

var TypeDefinition = {
typeDefinition: function(position, symbol, typeParameters, isSum, methodSignatures) {
return {_: "typeDefinition", position: position, symbol: symbol, typeParameters: typeParameters, isSum: isSum, methodSignatures: methodSignatures};
}
};

var FunctionDefinition = {
functionDefinition: function(position, signature, body) {
return {_: "functionDefinition", position: position, signature: signature, body: body};
}
};

var MethodSignature = {
methodSignature: function(position, symbol, typeParameters, parameters, returnType) {
return {_: "methodSignature", position: position, symbol: symbol, typeParameters: typeParameters, parameters: parameters, returnType: returnType};
}
};

var MethodImplementation = {
methodImplementation: function(position, name, parameters, body) {
return {_: "methodImplementation", position: position, name: name, parameters: parameters, body: body};
}
};

var Parameter = {
parameter: function(position, name, type) {
return {_: "parameter", position: position, name: name, type: type};
}
};

var Module = {
module: function(package_, file, alias, source, typeDefinitions, functionDefinitions) {
return {_: "module", package_: package_, file: file, alias: alias, source: source, typeDefinitions: typeDefinitions, functionDefinitions: functionDefinitions};
}
};

var Token = {
token: function(token, from, to) {
return {_: "token", token: token, from: from, to: to};
}
};

var TokenType = {
leftThinArrow_k: {_: "leftThinArrow"},
leftThinArrow: function() {
return TokenType.leftThinArrow_k;
},
rightThinArrow_k: {_: "rightThinArrow"},
rightThinArrow: function() {
return TokenType.rightThinArrow_k;
},
rightThickArrow_k: {_: "rightThickArrow"},
rightThickArrow: function() {
return TokenType.rightThickArrow_k;
},
leftPipe_k: {_: "leftPipe"},
leftPipe: function() {
return TokenType.leftPipe_k;
},
rightPipe_k: {_: "rightPipe"},
rightPipe: function() {
return TokenType.rightPipe_k;
},
atSign_k: {_: "atSign"},
atSign: function() {
return TokenType.atSign_k;
},
colon_k: {_: "colon"},
colon: function() {
return TokenType.colon_k;
},
comma_k: {_: "comma"},
comma: function() {
return TokenType.comma_k;
},
dot_k: {_: "dot"},
dot: function() {
return TokenType.dot_k;
},
underscore_k: {_: "underscore"},
underscore: function() {
return TokenType.underscore_k;
},
assign_k: {_: "assign"},
assign: function() {
return TokenType.assign_k;
},
increment_k: {_: "increment"},
increment: function() {
return TokenType.increment_k;
},
decrement_k: {_: "decrement"},
decrement: function() {
return TokenType.decrement_k;
},
plus_k: {_: "plus"},
plus: function() {
return TokenType.plus_k;
},
minus_k: {_: "minus"},
minus: function() {
return TokenType.minus_k;
},
star_k: {_: "star"},
star: function() {
return TokenType.star_k;
},
slash_k: {_: "slash"},
slash: function() {
return TokenType.slash_k;
},
equal_k: {_: "equal"},
equal: function() {
return TokenType.equal_k;
},
notEqual_k: {_: "notEqual"},
notEqual: function() {
return TokenType.notEqual_k;
},
less_k: {_: "less"},
less: function() {
return TokenType.less_k;
},
lessEqual_k: {_: "lessEqual"},
lessEqual: function() {
return TokenType.lessEqual_k;
},
greater_k: {_: "greater"},
greater: function() {
return TokenType.greater_k;
},
greaterEqual_k: {_: "greaterEqual"},
greaterEqual: function() {
return TokenType.greaterEqual_k;
},
and_k: {_: "and"},
and: function() {
return TokenType.and_k;
},
or_k: {_: "or"},
or: function() {
return TokenType.or_k;
},
exclamation_k: {_: "exclamation"},
exclamation: function() {
return TokenType.exclamation_k;
},
question_k: {_: "question"},
question: function() {
return TokenType.question_k;
},
leftRound_k: {_: "leftRound"},
leftRound: function() {
return TokenType.leftRound_k;
},
rightRound_k: {_: "rightRound"},
rightRound: function() {
return TokenType.rightRound_k;
},
leftSquare_k: {_: "leftSquare"},
leftSquare: function() {
return TokenType.leftSquare_k;
},
rightSquare_k: {_: "rightSquare"},
rightSquare: function() {
return TokenType.rightSquare_k;
},
leftCurly_k: {_: "leftCurly"},
leftCurly: function() {
return TokenType.leftCurly_k;
},
rightCurly_k: {_: "rightCurly"},
rightCurly: function() {
return TokenType.rightCurly_k;
},
lower_k: {_: "lower"},
lower: function() {
return TokenType.lower_k;
},
upper_k: {_: "upper"},
upper: function() {
return TokenType.upper_k;
},
codeUnit_k: {_: "codeUnit"},
codeUnit: function() {
return TokenType.codeUnit_k;
},
text_k: {_: "text"},
text: function() {
return TokenType.text_k;
},
textStart_k: {_: "textStart"},
textStart: function() {
return TokenType.textStart_k;
},
textMiddle_k: {_: "textMiddle"},
textMiddle: function() {
return TokenType.textMiddle_k;
},
textEnd_k: {_: "textEnd"},
textEnd: function() {
return TokenType.textEnd_k;
},
numeral_k: {_: "numeral"},
numeral: function() {
return TokenType.numeral_k;
},
floating_k: {_: "floating"},
floating: function() {
return TokenType.floating_k;
},
separator_k: {_: "separator"},
separator: function() {
return TokenType.separator_k;
},
outsideFile_k: {_: "outsideFile"},
outsideFile: function() {
return TokenType.outsideFile_k;
}
};


function newTokenCursor(tokens, offset) {
return {
invoke: function(ahead) {
var this_ = this;
return tokens[offset + ahead];
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


function newTyper(modules) {
var types = newStringMapBuilder(preludeTypeDefinitions().concat(flatten(map(modules, (function(m) {
return map(m.typeDefinitions, (function(d) {
return Pair.pair(d.symbol, d);
}));
})))));
var functions = newStringMapBuilder(flatten(map(modules, (function(m) {
return map(m.functionDefinitions, (function(d) {
return Pair.pair(d.signature.symbol, d);
}));
}))));
var variables = newStringMapBuilder([]);
var substitution = newStringMapBuilder([]);
var nextId = 0;
var module = modules[0];
return {
scope: function(body) {
var typer = this;
var oldVariables = variables.toArray();
var oldFunctions = functions.toArray();
var result = body();
variables = newStringMapBuilder(oldVariables);
functions = newStringMapBuilder(oldFunctions);
return result;
},
topScope: function(body) {
var typer = this;
var result = typer.scope(body);
substitution = newStringMapBuilder([]);
nextId = 0;
return result;
},
type: function(name) {
var typer = this;
return types.invoke(name);
},
function_: function(name) {
var typer = this;
return functions.get(name);
},
variable: function(name) {
var typer = this;
return variables.invoke(name);
},
hasVariable: function(name) {
var typer = this;
return variables.has(name);
},
bindVariable: function(name, type) {
var typer = this;
return variables.set(name, type);
},
bindFunction: function(name, definition) {
var typer = this;
return functions.set(name, definition);
},
bindTypeVariable: function(position, id, type) {
var typer = this;
typer.occursCheck(position, id, type, type);
when(substitution.has(('' + id)), (function() {
return typer.error(position, ("Type variable already bound: _" + ('' + id)));
}));
return substitution.set(('' + id), type);
},
occursCheck: function(position, id, outerType, type) {
var typer = this;
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p2 = _match.position;
var id2 = _match.id;
return when(id == id2, (function() {
debugger;
return typer.error(position, ("Infinite type: _" + ('' + id) + " = " + typeToString(typer.expand(outerType))));
}));
})();
case "constructor": return (function(){
var p2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
return each(typeArguments2, (function(a) {
return typer.occursCheck(position, id, outerType, a);
}));
})();
case "record": return (function(){
var p2 = _match.position;
var fields2 = _match.fields;
return each(fields2, (function(f) {
return typer.occursCheck(position, id, outerType, f.type);
}));
})();
case "parameter": return (function(){
var p2 = _match.position;
var name2 = _match.name;
})();
}})(typer.expand(type));
},
fresh: function() {
var typer = this;
nextId += 1;
return nextId;
},
expand: function(type) {
var typer = this;
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p2 = _match.position;
var id2 = _match.id;
return (function(_match) { switch(_match._) {
case "some": return (function(){
var t = _match.value;
return typer.expand(t);
})();
case "none": return (function(){
return type;
})();
}})(substitution.get(('' + id2)));
})();
case "constructor": return (function(){
var p2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
return Type.constructor(p2, symbol2, map(typeArguments2, (function(a) {
return typer.expand(a);
})));
})();
case "record": return (function(){
var p2 = _match.position;
var fields2 = _match.fields;
return Type.record(p2, map(fields2, (function(f) {
return FieldType.fieldType(f.position, f.label, typer.expand(f.type));
})));
})();
case "parameter": return (function(){
var p2 = _match.position;
var name2 = _match.name;
return type;
})();
}})(type);
},
instantiate: function(instantiation, type) {
var typer = this;
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var position = _match.position;
var id = _match.id;
return type;
})();
case "parameter": return (function(){
var position = _match.position;
var name = _match.name;
return (function(_match) { switch(_match._) {
case "some": return (function(){
var t = _match.value;
return t;
})();
case "none": return (function(){
return type;
})();
}})(instantiation.get(name));
})();
case "record": return (function(){
var position = _match.position;
var fields = _match.fields;
return Type.record(position, map(fields, (function(f) {
return FieldType.fieldType(f.position, f.label, typer.instantiate(instantiation, f.type));
})));
})();
case "constructor": return (function(){
var position = _match.position;
var symbol = _match.symbol;
var typeArguments = _match.typeArguments;
return Type.constructor(position, symbol, map(typeArguments, (function(t) {
return typer.instantiate(instantiation, t);
})));
})();
}})(type);
},
setModule: function(newModule) {
var typer = this;
module = newModule;
},
error: function(position, problem) {
var typer = this;
var moduleName = module.file;
console.log('Type error in ' + moduleName + ':');
return panic((problem + " " + positionText(newCharCursor(module.source), position)));
}
};
}

function equalityConstraint(typer, position, expectedType, actualType) {
return solveEqualityConstraint(typer, position, expectedType, actualType, expectedType, actualType);
}

function solveEqualityConstraint(typer, position, originalExpectedType, originalActualType, expectedType, actualType) {
var error = (function() {
return typer.error(position, ("Expected " + typeToString(typer.expand(originalExpectedType)) + ", got " + typeToString(typer.expand(originalActualType))));
});
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p1 = _match.position;
var id1 = _match.id;
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p2 = _match.position;
var id2 = _match.id;
return when(id1 != id2, (function() {
return typer.bindTypeVariable(position, id1, actualType);
}));
})();
case "record": return (function(){
var p2 = _match.position;
var fields2 = _match.fields;
return typer.bindTypeVariable(position, id1, actualType);
})();
case "constructor": return (function(){
var p2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
return typer.bindTypeVariable(position, id1, actualType);
})();
case "parameter": return (function(){
var p2 = _match.position;
var name2 = _match.name;
return typer.bindTypeVariable(position, id1, actualType);
})();
}})(typer.expand(actualType));
})();
case "record": return (function(){
var p1 = _match.position;
var fields1 = _match.fields;
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p2 = _match.position;
var id2 = _match.id;
return typer.bindTypeVariable(position, id2, expectedType);
})();
case "constructor": return (function(){
var p2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
return error();
})();
case "record": return (function(){
var p2 = _match.position;
var fields2 = _match.fields;
when(fields1.length != fields2.length, (function() {
return error();
}));
return each(zip(fields1, fields2), (function(p) {
when(p.first.label != p.second.label, (function() {
return error();
}));
return solveEqualityConstraint(typer, position, originalExpectedType, originalActualType, p.first.type, p.second.type);
}));
})();
case "parameter": return (function(){
var p2 = _match.position;
var name2 = _match.name;
return error();
})();
}})(typer.expand(actualType));
})();
case "constructor": return (function(){
var p1 = _match.position;
var symbol1 = _match.symbol;
var typeArguments1 = _match.typeArguments;
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p2 = _match.position;
var id2 = _match.id;
return typer.bindTypeVariable(position, id2, expectedType);
})();
case "constructor": return (function(){
var p2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
when(symbol1 != symbol2, (function() {
return error();
}));
when(typeArguments1.length != typeArguments2.length, (function() {
return error();
}));
return each(zip(typeArguments1, typeArguments2), (function(p) {
return solveEqualityConstraint(typer, position, originalExpectedType, originalActualType, p.first, p.second);
}));
})();
case "record": return (function(){
var p2 = _match.position;
var fields2 = _match.fields;
return error();
})();
case "parameter": return (function(){
var p2 = _match.position;
var name2 = _match.name;
return error();
})();
}})(typer.expand(actualType));
})();
case "parameter": return (function(){
var p1 = _match.position;
var name1 = _match.name;
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p2 = _match.position;
var id2 = _match.id;
return typer.bindTypeVariable(position, id2, expectedType);
})();
case "constructor": return (function(){
var p2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
return error();
})();
case "record": return (function(){
var p2 = _match.position;
var fields2 = _match.fields;
return error();
})();
case "parameter": return (function(){
var p2 = _match.position;
var name2 = _match.name;
return when(name1 != name2, (function() {
return error();
}));
})();
}})(typer.expand(actualType));
})();
}})(typer.expand(expectedType));
}

function typeToString(type) {
return (function(_match) { switch(_match._) {
case "variable": return (function(){
var p2 = _match.position;
var id2 = _match.id;
return ("_" + ('' + id2));
})();
case "constructor": return (function(){
var p2 = _match.position;
var symbol2 = _match.symbol;
var typeArguments2 = _match.typeArguments;
var as = map(typeArguments2, (function(a) {
return typeToString(a);
}));
var joined = join(map(typeArguments2, (function(t) {
return typeToString(t);
})), ", ");
var name = symbol2;
name = name.replace(/[@].*/, '');
return if_(typeArguments2.length == 0, (function() {
return name;
}), (function() {
return (name + "[" + joined + "]");
}));
})();
case "record": return (function(){
var p2 = _match.position;
var fields2 = _match.fields;
var joined = join(map(fields2, (function(f) {
return (f.label + " : " + typeToString(f.type));
})), ", ");
return ("[" + joined + "]");
})();
case "parameter": return (function(){
var p2 = _match.position;
var name2 = _match.name;
return name2;
})();
}})(type);
}

function preludeTypeDefinitions() {
var void_ = Type.constructor(0, "Void@_", []);
var int = Type.constructor(0, "Int@_", []);
var bool = Type.constructor(0, "Bool@_", []);
var string = Type.constructor(0, "String@_", []);
var typeDefinitions = [TypeDefinition.typeDefinition(0, "Void@_", [], false, []), TypeDefinition.typeDefinition(0, "Pair@_", ["a", "b"], true, [MethodSignature.methodSignature(0, "pair", [], [Parameter.parameter(0, "first", Type.parameter(0, "a")), Parameter.parameter(0, "second", Type.parameter(0, "b"))], void_)]), TypeDefinition.typeDefinition(0, "Option@_", ["a"], true, [MethodSignature.methodSignature(0, "none", [], [], void_), MethodSignature.methodSignature(0, "some", [], [Parameter.parameter(0, "value", Type.parameter(0, "a"))], void_)]), TypeDefinition.typeDefinition(0, "String@_", [], false, [MethodSignature.methodSignature(0, "invoke", [], [Parameter.parameter(0, "index", int)], int), MethodSignature.methodSignature(0, "size", [], [], int), MethodSignature.methodSignature(0, "take", [], [Parameter.parameter(0, "count", int)], string), MethodSignature.methodSignature(0, "drop", [], [Parameter.parameter(0, "count", int)], string), MethodSignature.methodSignature(0, "toLower", [], [], string), MethodSignature.methodSignature(0, "toUpper", [], [], string), MethodSignature.methodSignature(0, "contains", [], [Parameter.parameter(0, "needle", string)], bool)]), TypeDefinition.typeDefinition(0, "Bool@_", [], true, [MethodSignature.methodSignature(0, "false", [], [], void_), MethodSignature.methodSignature(0, "true", [], [], void_)]), TypeDefinition.typeDefinition(0, "Int@_", [], false, [MethodSignature.methodSignature(0, "toString", [], [], string)]), TypeDefinition.typeDefinition(0, "Float@_", [], false, [MethodSignature.methodSignature(0, "toString", [], [], string)]), TypeDefinition.typeDefinition(0, "Array@_", ["a"], false, [MethodSignature.methodSignature(0, "invoke", [], [Parameter.parameter(0, "index", int)], Type.parameter(0, "a")), MethodSignature.methodSignature(0, "size", [], [], int), MethodSignature.methodSignature(0, "take", [], [Parameter.parameter(0, "count", int)], Type.constructor(0, "Array@_", [Type.parameter(0, "a")])), MethodSignature.methodSignature(0, "drop", [], [Parameter.parameter(0, "count", int)], Type.constructor(0, "Array@_", [Type.parameter(0, "a")])), MethodSignature.methodSignature(0, "concat", [], [Parameter.parameter(0, "array", Type.constructor(0, "Array@_", [Type.parameter(0, "a")]))], Type.constructor(0, "Array@_", [Type.parameter(0, "a")]))]), TypeDefinition.typeDefinition(0, "F0@_", ["r"], false, [MethodSignature.methodSignature(0, "invoke", [], [], Type.parameter(0, "r"))]), TypeDefinition.typeDefinition(0, "F1@_", ["p1", "r"], false, [MethodSignature.methodSignature(0, "invoke", [], [Parameter.parameter(0, "a1", Type.parameter(0, "p1"))], Type.parameter(0, "r"))]), TypeDefinition.typeDefinition(0, "F2@_", ["p1", "p2", "r"], false, [MethodSignature.methodSignature(0, "invoke", [], [Parameter.parameter(0, "a1", Type.parameter(0, "p1")), Parameter.parameter(0, "a2", Type.parameter(0, "p2"))], Type.parameter(0, "r"))]), TypeDefinition.typeDefinition(0, "F3@_", ["p1", "p2", "p3", "r"], false, [MethodSignature.methodSignature(0, "invoke", [], [Parameter.parameter(0, "a1", Type.parameter(0, "p1")), Parameter.parameter(0, "a2", Type.parameter(0, "p2")), Parameter.parameter(0, "a3", Type.parameter(0, "p3"))], Type.parameter(0, "r"))]), TypeDefinition.typeDefinition(0, "Promise@_", ["a"], false, [MethodSignature.methodSignature(0, "map", ["b"], [Parameter.parameter(0, "onFulfilled", Type.constructor(0, "F1@_", [Type.parameter(0, "a"), Type.parameter(0, "b")]))], Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])), MethodSignature.methodSignature(0, "flatMap", ["b"], [Parameter.parameter(0, "onFulfilled", Type.constructor(0, "F1@_", [Type.parameter(0, "a"), Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])]))], Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])), MethodSignature.methodSignature(0, "catchMap", ["r", "b"], [Parameter.parameter(0, "onRejected", Type.constructor(0, "F1@_", [Type.parameter(0, "r"), Type.parameter(0, "b")]))], Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])), MethodSignature.methodSignature(0, "catchFlatMap", ["r", "b"], [Parameter.parameter(0, "onRejected", Type.constructor(0, "F1@_", [Type.parameter(0, "r"), Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])]))], Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])), MethodSignature.methodSignature(0, "thenMap", ["r", "b"], [Parameter.parameter(0, "onFulfilled", Type.constructor(0, "F1@_", [Type.parameter(0, "a"), Type.parameter(0, "b")])), Parameter.parameter(0, "onRejected", Type.constructor(0, "F1@_", [Type.parameter(0, "r"), Type.parameter(0, "b")]))], Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])), MethodSignature.methodSignature(0, "thenFlatMap", ["r", "b"], [Parameter.parameter(0, "onFulfilled", Type.constructor(0, "F1@_", [Type.parameter(0, "a"), Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])])), Parameter.parameter(0, "onRejected", Type.constructor(0, "F1@_", [Type.parameter(0, "r"), Type.constructor(0, "Promise@_", [Type.parameter(0, "b")])]))], Type.constructor(0, "Promise@_", [Type.parameter(0, "b")]))])];
/* Promises are not quite right since JS looks into promises and checks for a .then method, and flattens it 'automatically' (thanks...). */
return map(typeDefinitions, (function(d) {
return Pair.pair(d.symbol, d);
}));
}



main();
