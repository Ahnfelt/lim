package lim

import lim.Lexer.TokenType
import lim.Parser._

class Emitter {

    def escapeVariable(name : String) = {
        if(Emitter.reservedWords(name)) name + "_" else name
    }

    def escapeMethod(name : String) = {
        if(Emitter.reservedWords(name)) name + "_" else name
    }

    def escapeUpper(name : String) : String = {
        name
    }

    def escapeString(value : String) = {
        "\"" + value + "\"" // TODO: Support \{12345} escape literals
    }

    def emitNative(builder : StringBuilder, operation : NativeOperation) : Unit = operation match {
        case NativeArrayAccess(value, index) =>
            emitTerm(builder, value)
            builder ++= "["
            emitTerm(builder, index)
            builder ++= "]"
        case NativeFieldAccess(value, fieldName) =>
            emitTerm(builder, value)
            builder ++= "." + escapeMethod(fieldName)
        case NativeToString(value) =>
            builder ++= "(\"\" + "
            emitTerm(builder, value)
            builder ++= ")"
        case NativeFunctionCall(value, arguments) =>
            emitTerm(builder, value)
            builder ++= "("
            for((a, i) <- arguments.zipWithIndex) {
                if(i != 0) builder ++= ", "
                emitTerm(builder, a)
            }
            builder ++= ")"
        case NativeIf(condition, thenBody, elseBody) =>
            builder ++= "("
            emitTerm(builder, condition)
            builder ++= " ? "
            emitStatementsAsTerm(builder, thenBody)
            builder ++= " : "
            emitStatementsAsTerm(builder, elseBody)
            builder ++= ")"
        case NativeBool(value) =>
            builder ++= (if(value) "true" else "false")
    }

    def emitTerm(builder : StringBuilder, term : Term) : Unit = term match {
        case Binary(offset, operator, left, right) =>
            builder ++= "("
            emitTerm(builder, left)
            operator match {
                case TokenType.And => builder ++= " && "
                case TokenType.Or => builder ++= " || "
                case TokenType.Equal => builder ++= " == "
                case TokenType.NotEqual => builder ++= " != "
                case TokenType.Less => builder ++= " < "
                case TokenType.LessEqual => builder ++= " <= "
                case TokenType.Greater => builder ++= " > "
                case TokenType.GreaterEqual => builder ++= " >= "
                case TokenType.Slash => builder ++= " / "
                case TokenType.Star => builder ++= " * "
                case TokenType.Minus => builder ++= " - "
                case TokenType.Plus => builder ++= " + "
                case _ => throw new RuntimeException()
            }
            emitTerm(builder, right)
            builder ++= ")"
        case Unary(offset, operator, value) =>
            builder ++= "("
            operator match {
                case TokenType.Exclamation => builder ++= "!"
                case TokenType.Minus => builder ++= "-"
                case _ => throw new RuntimeException()
            }
            emitTerm(builder, value)
            builder ++= ")"
        case TextValue(offset, value) =>
            // TODO: Handle \{12345} escapes
            builder ++= escapeString(value)
        case TextLiteral(offset, parts) =>
            builder ++= "("
            for((p, i) <- parts.zipWithIndex) {
                if(i != 0) builder ++= " + "
                emitTerm(builder, p)
            }
            builder ++= ")"
        case IntegerValue(offset, value) => builder ++= value.toString
        case FloatingValue(offset, value) => builder ++= value.toString
        case ClassOrModule(offset, module, classOrModule) => throw new RuntimeException()
        case ThisModule(offset) => throw new RuntimeException()
        case ArrayValue(offset, elements) =>
            builder ++= "["
            for((e, i) <- elements.zipWithIndex) {
                if(i != 0) builder ++= ", "
                emitTerm(builder, e)
            }
            builder ++= "]"
        case Variable(offset, name) => builder ++= escapeVariable(name)
        case MethodCall(offset, ThisModule(_), methodName, arguments, namedArguments) =>
            builder ++= escapeMethod(methodName)
            builder ++= "("
            // TODO: Respect evaluation order (evaluate namedArguments in _._1 order)
            for((a, i) <- (arguments ++ namedArguments.map(_._3)).zipWithIndex) {
                if(i != 0) builder ++= ", "
                emitTerm(builder, a)
            }
            builder ++= ")"
        case MethodCall(offset, ClassOrModule(_, module, classOrModule), methodName, arguments, namedArguments) =>
            builder ++= module.map(escapeUpper).map(_ + ".").getOrElse("") + escapeUpper(classOrModule)
            builder ++= "." + escapeMethod(methodName)
            builder ++= "("
            // TODO: Respect evaluation order (evaluate namedArguments in _._1 order)
            for((a, i) <- (arguments ++ namedArguments.map(_._3)).zipWithIndex) {
                if(i != 0) builder ++= ", "
                emitTerm(builder, a)
            }
            builder ++= ")"
        case MethodCall(offset, value, methodName, arguments, namedArguments) =>
            emitTerm(builder, value)
            builder ++= "." + escapeMethod(methodName)
            builder ++= "("
            // TODO: Respect evaluation order (evaluate namedArguments in _._1 order)
            for((a, i) <- (arguments ++ namedArguments.map(_._3)).zipWithIndex) {
                if(i != 0) builder ++= ", "
                emitTerm(builder, a)
            }
            builder ++= ")"
        case Instance(offset, moduleName, interfaceName, thisName, methods) =>
            builder ++= "{\n"
            for((m, i) <- methods.zipWithIndex) {
                builder ++= escapeMethod(m.name)
                builder ++= ": "
                builder ++= "function("
                builder ++= m.parameters.mkString(", ")
                builder ++= ") {\n"
                for(x <- thisName) builder ++= "var " + escapeVariable(x) + " = this;\n"
                emitStatements(builder, m.body)
                builder ++= "}"
                if(i < methods.length - 1) builder ++= ","
                builder ++= "\n"
            }
            builder ++= "}"
        case Match(offset, value, methods) =>
            builder ++= "(function(_match) { switch(_match._) {\n"
            for((m, f) <- methods) {
                builder ++= "case " + escapeString(m.name) + ":\n"
                for((p, i) <- m.parameters.zipWithIndex) builder ++= "var " + escapeVariable(p) + " = _match." + escapeMethod(f(i)) + ";\n"
                emitStatements(builder, m.body)
                if(!m.body.lastOption.exists(_.isInstanceOf[TermStatement])) builder ++= "break;\n"
            }
            builder ++= "}})("
            emitTerm(builder, value)
            builder ++= ")"
        case Lambda(offset, parameters, body) =>
            //emitTerm(builder, Instance(offset, None, "F" + parameters.length, None, List(MethodImplementation(offset, "invoke", parameters, body))))
            builder ++= "(function("
            builder ++= parameters.mkString(", ")
            builder ++= ") {\n"
            emitStatements(builder, body)
            builder ++= "})"
        case Native(offset, operation) => emitNative(builder, operation)
    }

    def emitValueDefinition(builder : StringBuilder, valueDefinition : ValueDefinition) = {
        builder ++= "// " + valueDefinition.valueType.get + "\n"
        builder ++= "var "
        builder ++= escapeVariable(valueDefinition.name)
        builder ++= " = "
        emitTerm(builder, valueDefinition.value)
        builder ++= ";\n\n"
    }

    def emitStatement(builder : StringBuilder, statement : Statement) = statement match {
        case TermStatement(offset, term) =>
            emitTerm(builder, term); builder ++= ";\n"
        case Let(offset, name, variableType, value) =>
            builder ++= "// " + variableType.get + "\n"
            builder ++= "var "
            builder ++= escapeVariable(name)
            builder ++= " = "
            emitTerm(builder, value)
            builder ++= ";\n"
        case Assign(offset, variable, value) =>
            builder ++= escapeVariable(variable)
            builder ++= " = "
            emitTerm(builder, value)
            builder ++= ";\n"
        case Increment(offset, variable, value) =>
            builder ++= escapeVariable(variable)
            builder ++= " += "
            emitTerm(builder, value)
            builder ++= ";\n"
        case Decrement(offset, variable, value) =>
            builder ++= escapeVariable(variable)
            builder ++= " -= "
            emitTerm(builder, value)
            builder ++= ";\n"
    }

    def emitStatements(builder : StringBuilder, body : List[Statement]) : Unit = {
        if(body.isEmpty) return
        for(s <- body.init) emitStatement(builder, s)
        if(body.last.isInstanceOf[TermStatement]) builder ++= "return "
        emitStatement(builder, body.last)
    }

    def emitStatementsAsTerm(builder : StringBuilder, body : List[Statement]) : Unit = {
        body match {
            case List() => builder ++= "void(0)"
            case List(TermStatement(_, term)) => emitTerm(builder, term)
            case _ =>
                builder ++= "(function() {\n"
                emitStatements(builder, body)
                builder ++= "})()"
        }
    }

    def emitMethodDefinition(builder : StringBuilder, methodDefinition : MethodDefinition) = {
        builder ++= "// (" + methodDefinition.signature.parameters.map(_.parameterType).mkString(", ") + ") => " + methodDefinition.signature.returnType + "\n"
        builder ++= "function "
        builder ++= escapeMethod(methodDefinition.signature.name)
        builder ++= "("
        builder ++= methodDefinition.signature.parameters.map(p => escapeVariable(p.name)).mkString(", ")
        builder ++= ") {\n"
        emitStatements(builder, methodDefinition.body)
        builder ++= "}\n\n"
    }

    def emitImport(builder : StringBuilder, imports : List[Import]) = {

    }

    def emitTypeDefinition(builder : StringBuilder, definition : TypeDefinition) = {
        builder ++= "var " + escapeUpper(definition.name) + " = {\n"
        for((m, i) <- definition.methodSignatures.zipWithIndex) {
            builder ++= escapeMethod(m.name)
            builder ++= ": "
            builder ++= "function("
            builder ++= m.parameters.map(_.name).mkString(", ")
            builder ++= ") { return {\n"
            builder ++= "_: " + escapeString(m.name) + ""
            for(p <- m.parameters) builder ++= ",\n" + escapeMethod(p.name) + ": " + escapeVariable(p.name)
            builder ++= "\n}}"
            if(i < definition.methodSignatures.length - 1) builder ++= ","
            builder ++= "\n"
        }
        builder ++= "};\n\n"
    }

    def emitTypeDefinitions(builder : StringBuilder, typeDefinitions : List[TypeDefinition]) = {
        for(d <- typeDefinitions) emitTypeDefinition(builder, d)
    }

    def emitValueDefinitions(builder : StringBuilder, valueDefinitions : List[ValueDefinition]) = {
        for(d <- valueDefinitions) emitValueDefinition(builder, d)
    }

    def emitMethodDefinitions(builder : StringBuilder, methodDefinitions : List[MethodDefinition]) = {
        for(d <- methodDefinitions) emitMethodDefinition(builder, d)
    }

    def emitExports(builder : StringBuilder, exports : List[ExportedSymbol]) = {

    }

    def emitModule(builder : StringBuilder, module : Module) = {
        builder ++= "(function(_global, _undefined) {\n\n"
        emitImport(builder, module.imports)
        emitTypeDefinitions(builder, module.typeDefinitions)
        emitValueDefinitions(builder, module.valueDefinitions)
        emitMethodDefinitions(builder, module.methodDefinitions)
        emitExports(builder, module.exports)
        builder ++= "})(this, void(0));\n"
    }
}

object Emitter {
    val reservedWords = Set(
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "in",
        "instanceof",
        "new",
        "return",
        "super",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield",
        "enum",
        "implements",
        "interface",
        "let",
        "package",
        "private",
        "protected",
        "public",
        "static",
        "await"
    )
}