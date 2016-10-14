package lim

import lim.Lexer._
import lim.Lexer.TokenType._
import lim.Parser.Assign
import lim.Parser.Decrement
import lim.Parser.Increment
import lim.Parser._

class Typer(buffer : Array[Char]) {

    var nextTypeVariableId = 1
    var environment = Map[String, Type]()
    var methodEnvironment = Map[String, MethodSignature]()
    var typeVariables = Map[Int, Type]()
    var typeEnvironment = Map[(Option[String], String), TypeDefinition](
        (None, "Void") -> TypeDefinition(0, "Void", List(), RequestResponseModifier, List(
            MethodSignature(0, "toString", List(), List(), TypeConstructor(0, None, "String", List(), None), Some((_, _) => TextValue(0, "undefined")))
        )),
        (None, "Int") -> TypeDefinition(0, "Int", List(), RequestResponseModifier, List(
            MethodSignature(0, "toString", List(), List(), TypeConstructor(0, None, "String", List(), None), Some((value, _) => Native(0, NativeToString(value))))
        )),
        (None, "Float") -> TypeDefinition(0, "Float", List(), RequestResponseModifier, List(
            MethodSignature(0, "toString", List(), List(), TypeConstructor(0, None, "String", List(), None), Some((value, _) => Native(0, NativeToString(value))))
        )),
        (None, "String") -> TypeDefinition(0, "String", List(), RequestResponseModifier, List(
            MethodSignature(0, "invoke", List(), List(Parameter(0, "index", TypeConstructor(0, None, "Int", List(), None))), TypeConstructor(0, None, "Int", List(), None), Some((value, terms) => MethodCall(0, value, "charCodeAt", terms, List()))),
            MethodSignature(0, "size", List(), List(), TypeConstructor(0, None, "Int", List(), None), Some((value, _) => Native(0, NativeFieldAccess(value, "length"))))
        )),
        // TODO: Make this use native false / true (it's a non-working mix of native and non-native right now)
        (None, "Bool") -> TypeDefinition(0, "Bool", List(), RequestModifier, List(
            MethodSignature(0, "false", List(), List(), TypeConstructor(0, None, "Void", List(), None), None),
            MethodSignature(0, "true", List(), List(), TypeConstructor(0, None, "Void", List(), None), None)
        )),
        (None, "Option") -> TypeDefinition(0, "Option", List("t"), RequestModifier, List(
            MethodSignature(0, "none", List(), List(), TypeConstructor(0, None, "Void", List(), None), None),
            MethodSignature(0, "some", List(), List(Parameter(0, "value", TypeParameter(0, "t"))), TypeConstructor(0, None, "Void", List(), None), None)
        )),
        (None, "Array") -> TypeDefinition(0, "Array", List("t"), RequestResponseModifier, List(
            MethodSignature(0, "invoke", List(), List(Parameter(0, "index", TypeConstructor(0, None, "Int", List(), None))), TypeParameter(0, "t"), Some((value, terms) => Native(0, NativeArrayAccess(value, terms.head)))),
            MethodSignature(0, "size", List(), List(), TypeConstructor(0, None, "Int", List(), None), Some((value, _) => Native(0, NativeFieldAccess(value, "length"))))
        )),
        (None, "F0") -> TypeDefinition(0, "F0", List("r"), RequestResponseModifier, List(
            MethodSignature(0, "invoke", List(), List(), TypeParameter(0, "r"), Some((value, arguments) => Native(0, NativeFunctionCall(value, arguments))))
        )),
        (None, "F1") -> TypeDefinition(0, "F1", List("p1", "r"), RequestResponseModifier, List(
            MethodSignature(0, "invoke", List(), List(Parameter(0, "a1", TypeParameter(0, "p1"))), TypeParameter(0, "r"), Some((value, arguments) => Native(0, NativeFunctionCall(value, arguments))))
        )),
        (None, "F2") -> TypeDefinition(0, "F2", List("p1", "p2", "r"), RequestResponseModifier, List(
            MethodSignature(0, "invoke", List(), List(Parameter(0, "a1", TypeParameter(0, "p1")), Parameter(0, "a2", TypeParameter(0, "p2"))), TypeParameter(0, "r"), Some((value, arguments) => Native(0, NativeFunctionCall(value, arguments))))
        )),
        (None, "F3") -> TypeDefinition(0, "F3", List("p1", "p2", "p3", "r"), RequestResponseModifier, List(
            MethodSignature(0, "invoke", List(), List(Parameter(0, "a1", TypeParameter(0, "p1")), Parameter(0, "a2", TypeParameter(0, "p2")), Parameter(0, "a3", TypeParameter(0, "p3"))), TypeParameter(0, "r"), Some((value, arguments) => Native(0, NativeFunctionCall(value, arguments))))
        ))
    )

    def nextTypeVariable(offset : Int) : TypeVariable = {
        val result = TypeVariable(offset, nextTypeVariableId)
        nextTypeVariableId += 1
        result
    }

    def expandType(unexpandedType : Type) : Type = unexpandedType match {
        case t@TypeConstructor(_, module, name, typeArguments, modifier) => t.copy(typeArguments = t.typeArguments.map(expandType))
        case t@TypeParameter(_, name) => t
        case t@TypeVariable(_, id) => typeVariables.get(id) match {
            case Some(boundToType) => expandType(boundToType)
            case None => t
        }
    }

    def saveEnvironment[T](body : => T) : T = {
        val old = environment
        val result = body
        environment = old
        result
    }

    def equalityConstraint(offset : Int, originalExpectedType : Type, originalActualType : Type) : Unit = {
        def go(expectedType : Type, actualType : Type) : Unit = {
            (expandType(expectedType), expandType(actualType)) match {
                case (t1@TypeVariable(_, id), t2) => typeVariables = typeVariables + (id -> t2)
                case (t1, t2@TypeVariable(_, id)) => typeVariables = typeVariables + (id -> t1)
                case (t1@TypeConstructor(_, module1, name1, typeArguments1, modifier1), t2@TypeConstructor(_, module2, name2, typeArguments2, modifier2)) if module1 == module2 && name1 == name2 && typeArguments1.length == typeArguments2.length =>
                    if(modifier1 != modifier2) {
                        val defaultModifier = typeEnvironment.getOrElse((module1, name1),
                            throw new TypeException("No such type: " + module1.map(_ + ".").getOrElse("") + name1, Lexer.position(buffer, offset))
                        ).defaultModifier
                        if(modifier1.getOrElse(defaultModifier) != modifier2.getOrElse(defaultModifier)) {
                            throw new TypeException("Expected type " + t1 + ", but got type " + t2 + ", which has a different modifier", Lexer.position(buffer, offset))
                        }
                    }
                    for((a1, a2) <- typeArguments1 zip typeArguments2) go(a1, a2)
                case (t1@TypeParameter(_, name1), t2@TypeParameter(_, name2)) if name1 == name2 =>
                case (t1, t2) =>
                    throw new TypeException("Expected type " + expandType(originalExpectedType) + ", but got type " + expandType(originalActualType), Lexer.position(buffer, offset))
            }
        }
        go(originalExpectedType, originalActualType)
    }

    def typeTypeDefinitions(typeTypeDefinitions : List[TypeDefinition]) : List[TypeDefinition] = {
        for(d <- typeTypeDefinitions) {
            typeEnvironment += ((None, d.name) -> d)
        }
        typeTypeDefinitions
    }

    def typeStatement(expectedType : Type, statement : Statement) : Statement = statement match {
        case s@TermStatement(_, term) => s.copy(term = typeTerm(expectedType, term))
        case s@Let(_, variable, variableType, value) =>
            val newType = variableType.getOrElse(nextTypeVariable(s.offset))
            val newValue = typeTerm(newType, value)
            val expandedType = expandType(newType)
            environment += (variable -> expandedType)
            Let(s.offset, variable, Some(expandedType), newValue)
        case s@Assign(_, variable, value) =>
            val t = environment.getOrElse(variable, throw new TypeException("Unknown variable: " + variable, Lexer.position(buffer, s.offset)))
            s.copy(value = typeTerm(t, value))
        case s@Increment(_, variable, value) =>
            val t = environment.getOrElse(variable, throw new TypeException("Unknown variable: " + variable, Lexer.position(buffer, s.offset)))
            s.copy(value = typeTerm(t, value)) // TODO: Check that it's a Int or Float
        case s@Decrement(_, variable, value) =>
            val t = environment.getOrElse(variable, throw new TypeException("Unknown variable: " + variable, Lexer.position(buffer, s.offset)))
            s.copy(value = typeTerm(t, value)) // TODO: Check that it's a Int or Float
        case s@Ffi(_, language, code) => s
    }

    def typeBody(offset : Int, expectedType : Type, body : List[Statement]) : List[Statement] = {
        if(body.isEmpty) {
            equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "Void", List(), None))
            return List()
        }
        val init = for(s <- body.init) yield typeStatement(nextTypeVariable(offset), s)
        val last = expandType(expectedType) match {
            case TypeConstructor(_, None, "Void", List(), None) => typeStatement(nextTypeVariable(offset), body.last)
            case _ => typeStatement(expectedType, body.last)
        }
        init :+ last
    }

    def instantiateType(substitution : Map[String, Type], uninstantiatedType : Type) : Type = expandType(uninstantiatedType) match {
        case t@TypeConstructor(_, module, name, ts, _) => t.copy(typeArguments = ts.map(instantiateType(substitution, _)))
        case t@TypeParameter(_, name) => substitution.get(name) match {
            case Some(typeArgument) => typeArgument
            case None => t
        }
        case t@TypeVariable(_, id) => t
    }

    def instantiateTypeDefinition(offset : Int, definition : TypeDefinition, optionalTypeArguments : Option[List[Type]]) : TypeDefinition = {
        val typeArguments = optionalTypeArguments.getOrElse(definition.typeParameters.map(_ => nextTypeVariable(offset)))
        if(definition.typeParameters.length != typeArguments.length) {
            throw new TypeException("Wrong number of type arguments for type " + definition.name + ": " + typeArguments, Lexer.position(buffer, offset))
        }
        val substitution = definition.typeParameters.zip(typeArguments).toMap
        val methodSignatures = definition.methodSignatures.map { s =>
            s.copy(
                parameters = s.parameters.map(p => p.copy(parameterType = instantiateType(substitution, p.parameterType))),
                returnType = instantiateType(substitution, s.returnType)
            )
        }
        TypeDefinition(definition.offset, definition.name, List(), definition.defaultModifier, methodSignatures)
    }

    def instantiateMethodSignature(offset : Int, methodSignature : MethodSignature, optionalTypeArguments : Option[List[Type]]) : MethodSignature = {
        val typeArguments = optionalTypeArguments.getOrElse(methodSignature.typeParameters.map(_ => nextTypeVariable(offset)))
        if(methodSignature.typeParameters.length != typeArguments.length) {
            throw new TypeException("Wrong number of type arguments for method " + methodSignature.name + ": " + typeArguments, Lexer.position(buffer, offset))
        }
        val substitution = methodSignature.typeParameters.zip(typeArguments).toMap
        methodSignature.copy(
            typeParameters = List(),
            parameters = methodSignature.parameters.map(p => p.copy(parameterType = instantiateType(substitution, p.parameterType))),
            returnType = instantiateType(substitution, methodSignature.returnType)
        )
    }

    def typeMethod(signature : MethodSignature, method : MethodImplementation) : MethodImplementation = {
        saveEnvironment {
            for((p, t) <- method.parameters zip signature.parameters.map(_.parameterType)) environment += p -> t
            method.copy(body = typeBody(method.offset, signature.returnType, method.body))
        }
    }

    def typeTerm(expectedType : Type, term : Term) : Term = term match {

        case Binary(offset, operator, left, right) =>
            def operatorType(resultTypeName : String, operandTypeName : Option[String]) = {
                val t1 = operandTypeName.map(TypeConstructor(offset, None, _, List(), None)).getOrElse(nextTypeVariable(offset))
                val t2 = TypeConstructor(offset, None, resultTypeName, List(), None)
                equalityConstraint(offset, expectedType, t2)
                Binary(offset, operator, typeTerm(t1, left), typeTerm(t1, right))
            }
            operator match {
                case TokenType.And => operatorType("Bool", Some("Bool"))
                case TokenType.Or => operatorType("Bool", Some("Bool"))
                case TokenType.Equal => operatorType("Bool", None) // TODO: Constrain types to instances of Eq, Ord, etc.
                case TokenType.NotEqual => operatorType("Bool", None)
                case TokenType.Less => operatorType("Bool", Some("Int"))
                case TokenType.LessEqual => operatorType("Bool", Some("Int"))
                case TokenType.Greater => operatorType("Bool", Some("Int"))
                case TokenType.GreaterEqual => operatorType("Bool", Some("Int"))
                case TokenType.Slash => operatorType("Int", Some("Int"))
                case TokenType.Star => operatorType("Int", Some("Int"))
                case TokenType.Minus => operatorType("Int", Some("Int"))
                case TokenType.Plus => operatorType("Int", Some("Int"))
                case _ => throw new TypeException("Unknown binary operator: " + operator, Lexer.position(buffer, offset))
            }

        case Unary(offset, Minus, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "Int", List(), None)); Unary(offset, Minus, typeTerm(expectedType, value))
        case Unary(offset, Exclamation, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "Bool", List(), None)); Unary(offset, Exclamation, typeTerm(expectedType, value))
        case Unary(offset, operator, value) => throw new TypeException("Unknown unary operator: " + operator, Lexer.position(buffer, offset))

        case CodeUnitValue(offset, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "Int", List(), None)); term

        case TextValue(offset, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "String", List(), None)); term

        case TextLiteral(offset, parts) =>
            val stringType = TypeConstructor(offset, None, "String", List(), None)
            equalityConstraint(offset, expectedType, stringType)
            TextLiteral(offset, parts.map(typeTerm(stringType, _)))

        case IntegerValue(offset, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "Int", List(), None)); term

        case FloatingValue(offset, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "Float", List(), None)); term

        case ClassOrModule(offset, module, classOrModule) => throw new TypeException("Lone interface or module: " + module.map(_ + ".").getOrElse("") + classOrModule, Lexer.position(buffer, offset))

        case ThisModule(offset) => throw new TypeException("Lone this module", Lexer.position(buffer, offset))

        case Native(offset, _) => throw new TypeException("Unexpected native operation", Lexer.position(buffer, offset))

        case ArrayValue(offset, elements) =>
            val elementType = nextTypeVariable(offset)
            equalityConstraint(offset, expectedType, TypeConstructor(offset, None, "Array", List(elementType), None))
            val typedElements = for(element <- elements) yield typeTerm(elementType, element)
            ArrayValue(offset, typedElements)

        case Variable(offset, name) =>
            environment.get(name) match {
                case Some(t) => equalityConstraint(offset, expectedType, t); term
                case None => throw new TypeException("No such variable: " + name, Lexer.position(buffer, offset))
            }

        case MethodCall(offset, value, originalMethodName, arguments, namedArguments) =>
            val valueType = nextTypeVariable(offset)
            val (typeDefinition : TypeDefinition, module : Option[String], name : String, modifier : Option[TypeModifier], typedValue : Term, methodName : String) = {
                value match {
                    // TODO: Also handle response type methods
                    case ClassOrModule(_, module1, classOrModule1) =>
                        val uninstantiatedDefinition = typeEnvironment.getOrElse(module1 -> classOrModule1, {
                            throw new TypeException("No such type: " + module1.map(_ + ".").getOrElse("") + classOrModule1, Lexer.position(buffer, offset))
                        })
                        val typeArguments = uninstantiatedDefinition.typeParameters.map(_ => nextTypeVariable(offset))
                        val definition = instantiateTypeDefinition(offset, uninstantiatedDefinition, Some(typeArguments))
                        val requestDefinition = definition.copy(methodSignatures = definition.methodSignatures.map { m =>
                            m.copy(returnType = TypeConstructor(offset, module1, classOrModule1, typeArguments, Some(RequestModifier)))
                        })
                        (requestDefinition, module1, classOrModule1, Some(RequestResponseModifier), value, originalMethodName)
                    case Variable(_, name1) if !environment.contains(name1) =>
                        val method = methodEnvironment.getOrElse(name1, {
                            throw new TypeException("No such method or variable: " + name1, Lexer.position(buffer, offset))
                        })
                        val methodTypeDefinition = TypeDefinition(offset, name1, List(), RequestResponseModifier, List(method))
                        (methodTypeDefinition, None, name1, Some(RequestResponseModifier), ThisModule(offset), name1)
                    case _ =>
                        val typedValue1 = typeTerm(valueType, value)
                        expandType(valueType) match {
                            case TypeConstructor(_, module1, name1, typeArguments1, modifier1) =>
                                val definition = typeEnvironment.get(module1 -> name1).map(instantiateTypeDefinition(offset, _, Some(typeArguments1))).getOrElse {
                                    throw new TypeException("No such type: " + module1.map(_ + ".").getOrElse("") + name1, Lexer.position(buffer, offset))
                                }
                                (definition, module1, name1, modifier1, typedValue1, originalMethodName)
                            case TypeParameter(_, name1) => throw new TypeException("Type parameter " + name1 + " may not support this method: " + originalMethodName, Lexer.position(buffer, offset))
                            case TypeVariable(_, id) => throw new TypeException("Unknown type may not support this method: " + originalMethodName, Lexer.position(buffer, offset))
                        }
                }
            }
            val TypeDefinition(_, typeName, typeParameters, defaultModifier, methodSignatures) = typeDefinition
            if(!value.isInstanceOf[ClassOrModule] && modifier.getOrElse(defaultModifier) != RequestResponseModifier) {
                if(modifier.getOrElse(defaultModifier) == RequestModifier && methodSignatures.length == 1 && methodSignatures.head.parameters.map(_.name).contains(methodName) && arguments.isEmpty && namedArguments.isEmpty) {
                    val methodSignature = instantiateMethodSignature(offset, methodSignatures.head, None)
                    equalityConstraint(offset, expectedType, methodSignature.parameters.head.parameterType)
                    return Native(offset, NativeFieldAccess(typedValue, methodName))
                } else {
                    val sigil = modifier.getOrElse(defaultModifier) match {
                        case RequestModifier => "?"
                        case ResponseModifier => "!"
                        case RequestResponseModifier => "?!"
                    }
                    throw new TypeException("Type " + module.map(_ + ".").getOrElse("") + name + sigil + " does not support this method: " + methodName, Lexer.position(buffer, offset))
                }
            }
            val signature = methodSignatures.find(_.name == methodName).map(instantiateMethodSignature(offset, _, None)).getOrElse {
                throw new TypeException("Type " + module.map(_ + ".").getOrElse("") + name + " does not support this method: " + methodName, Lexer.position(buffer, offset))
            }
            if(signature.parameters.length != arguments.length + namedArguments.length) {
                val message = if(signature.parameters.length < arguments.length + namedArguments.length) "Too many" else "Too few"
                throw new TypeException(message + " arguments to method " + methodName + ": " + arguments + ", " + namedArguments, Lexer.position(buffer, offset))
            }
            equalityConstraint(offset, expectedType, signature.returnType)
            val unnamedParameters = signature.parameters.take(arguments.length)
            val namedParameters = signature.parameters.drop(arguments.length)
            val unnamed = for((a, p) <- arguments.zip(unnamedParameters)) yield {
                typeTerm(p.parameterType, a)
            }
            val named = for(p <- namedParameters) yield {
                val (i, x, a) = namedArguments.find(_._2 == p.name).getOrElse {
                    throw new TypeException("Missing argument for method " + methodName + ": " + p.name, Lexer.position(buffer, offset))
                }
                (i, x, typeTerm(p.parameterType, a))
            }
            if(module.isEmpty && name == "Bool") { // TODO: Find a better way to detect built-in types
                Native(offset, NativeBool(methodName == "true"))
            } else {
                signature.forceImplementation match {
                    case Some(f) => f(typedValue, unnamed ++ named.map(_._3)) // TODO: Respect order of evaluation
                    case None => MethodCall(offset, typedValue, methodName, unnamed, named)
                }
            }

        case instance@Instance(offset, moduleName, interfaceName, thisName, methods) =>
            val typeDefinition = typeEnvironment.getOrElse(moduleName -> interfaceName, {
                throw new TypeException("No such type: " + moduleName.map(_ + ".").getOrElse("") + interfaceName, Lexer.position(buffer, offset))
            })
            val typeArguments = typeDefinition.typeParameters.map(_ => nextTypeVariable(offset))
            val actualType = TypeConstructor(offset, moduleName, interfaceName, typeArguments, Some(RequestResponseModifier))
            equalityConstraint(offset, expectedType, actualType)
            val instantiatedTypeDefinition = instantiateTypeDefinition(offset, typeDefinition, Some(typeArguments))
            val typedMethods = saveEnvironment {
                for(x <- thisName) environment += x -> actualType
                methods.map { m =>
                    val signature = instantiatedTypeDefinition.methodSignatures.find(_.name == m.name).getOrElse {
                        throw new TypeException("No such method: " + moduleName.map(_ + ".").getOrElse("") + interfaceName + "." + m.name, Lexer.position(buffer, offset))
                    }
                    typeMethod(signature, m)
                }
            }
            val missing = instantiatedTypeDefinition.methodSignatures.map(_.name).toSet -- methods.map(_.name)
            if(missing.nonEmpty) {
                throw new TypeException("The following methods must be implemented: " + missing.mkString(", "), Lexer.position(buffer, offset))
            }
            instance.copy(methods = typedMethods)

        case Match(offset, value, methodsWithFieldNames) =>
            val valueType = nextTypeVariable(offset)
            val typedValue = typeTerm(valueType, value)
            val (methodSignatures, moduleName, typeName) = expandType(valueType) match {
                case t@TypeConstructor(_, module1, name1, typeArguments1, modifier1) =>
                    val definition = typeEnvironment.get(module1 -> name1).map(instantiateTypeDefinition(offset, _, Some(typeArguments1))).getOrElse {
                        throw new TypeException("No such type: " + module1.map(_ + ".").getOrElse("") + name1, Lexer.position(buffer, offset))
                    }
                    // TODO: Also handle response type methods
                    if(modifier1.getOrElse(definition.defaultModifier) != RequestModifier) {
                        throw new TypeException("Can't match on non-request type: " + t, Lexer.position(buffer, offset))
                    }
                    (definition.methodSignatures, module1, name1)
                case t@TypeParameter(_, name1) => throw new TypeException("Can't match on type parameter: " + t, Lexer.position(buffer, offset))
                case t@TypeVariable(_, id) => throw new TypeException("Can't match on unknown type: " + t, Lexer.position(buffer, offset))
            }
            val resultType = nextTypeVariable(offset)
            equalityConstraint(offset, expectedType, resultType)
            val typedMethods = methodsWithFieldNames.map { case (m, _) =>
                val signature = methodSignatures.find(_.name == m.name).getOrElse {
                    throw new TypeException("No such case: " + m.name, Lexer.position(buffer, offset))
                }
                typeMethod(signature.copy(returnType = resultType), m) -> signature.parameters.map(_.name)
            }
            val missing = methodSignatures.map(_.name).toSet -- methodsWithFieldNames.map(_._1.name)
            if(missing.nonEmpty) {
                throw new TypeException("The following cases must be implemented: " + missing.mkString(", "), Lexer.position(buffer, offset))
            }
            if(moduleName.isEmpty && typeName == "Bool") { // TODO: Better native type detection
                Native(offset, NativeIf(typedValue, typedMethods.find(_._1.name == "true").get._1.body, typedMethods.find(_._1.name == "false").get._1.body))
            } else {
                Match(offset, typedValue, typedMethods)
            }

        case Lambda(offset, parameters, body) =>
            val parameterTypes = parameters.map(p => p -> nextTypeVariable(offset))
            val returnType = nextTypeVariable(offset)
            val functionType = TypeConstructor(offset, None, "F" + parameters.length, parameterTypes.map(_._2) :+ returnType, None)
            equalityConstraint(offset, expectedType, functionType)
            val typedBody = saveEnvironment {
                environment ++= parameterTypes
                typeBody(offset, returnType, body)
            }
            Lambda(offset, parameters, typedBody)
    }

    def typeValueDefinitions(valueDefinitions : List[ValueDefinition]) : List[ValueDefinition] = {
        for(definition <- valueDefinitions) yield {
            val expectedType = definition.valueType.getOrElse(nextTypeVariable(definition.offset))
            val value = typeTerm(expectedType, definition.value)
            val expandedType = expandType(expectedType)
            environment += definition.name -> expandedType
            definition.copy(valueType = Some(expandedType), value = value)
        }
    }

    def typeMethodDefinitions(methodDefinitions : List[MethodDefinition]) : List[MethodDefinition] = {
        for(d <- methodDefinitions) methodEnvironment += d.signature.name -> d.signature
        methodDefinitions.map { m =>
            saveEnvironment {
                for(p <- m.signature.parameters) environment += p.name -> p.parameterType
                m.copy(body = typeBody(m.offset, m.signature.returnType, m.body))
            }
        }
    }

    def typeImports(imports : List[Import]) : List[Import] = {
        /* TODO */ imports
    }

    def checkExports(module : Module) : Unit = {
        // TODO
    }

    def typeModule(module : Module) : Module = {
        val typedModule = module.copy(
            exports = module.exports,
            imports = typeImports(module.imports),
            typeDefinitions = typeTypeDefinitions(module.typeDefinitions),
            valueDefinitions = typeValueDefinitions(module.valueDefinitions),
            methodDefinitions = typeMethodDefinitions(module.methodDefinitions)
        )
        checkExports(typedModule)
        typedModule
    }

    case class TypeException(message : String, position : Position) extends RuntimeException(message + " at line " + position.line + " column " + position.column)
}
