package lim

import lim.Lexer.Position
import lim.Parser._

class Typer(buffer : Array[Char]) {

    var nextTypeVariableId = 1
    var environment = Map[String, Type]()
    var typeVariables = Map[Int, Type]()
    var typeEnvironment = Map[(Option[String], String), TypeDefinition](
        (Some("_"), "Void") -> TypeDefinition(0, "Void", List(), RequestModifier, List()),
        (Some("_"), "Int") -> TypeDefinition(0, "Int", List(), RequestModifier, List()),
        (Some("_"), "Float") -> TypeDefinition(0, "Float", List(), RequestModifier, List()),
        (Some("_"), "String") -> TypeDefinition(0, "String", List(), RequestModifier, List()),
        (Some("_"), "Bool") -> TypeDefinition(0, "Bool", List(), RequestModifier, List(
            MethodSignature(0, "false", List(), List(), TypeConstructor(0, Some("_"), "Void", List())),
            MethodSignature(0, "true", List(), List(), TypeConstructor(0, Some("_"), "Void", List()))
        )),
        (Some("_"), "F0") -> TypeDefinition(0, "F0", List(), RequestModifier, List(
            MethodSignature(0, "invoke", List("r"), List(), TypeParameter(0, "r"))
        )),
        (Some("_"), "F1") -> TypeDefinition(0, "F1", List(), RequestModifier, List(
            MethodSignature(0, "invoke", List("p1", "r"), List(Parameter(0, "a1", TypeParameter(0, "p1"))), TypeParameter(0, "r"))
        )),
        (Some("_"), "F2") -> TypeDefinition(0, "F2", List(), RequestModifier, List(
            MethodSignature(0, "invoke", List("p1", "p2", "r"), List(Parameter(0, "a1", TypeParameter(0, "p1")), Parameter(0, "a2", TypeParameter(0, "p2"))), TypeParameter(0, "r"))
        )),
        (Some("_"), "F3") -> TypeDefinition(0, "F3", List(), RequestModifier, List(
            MethodSignature(0, "invoke", List("p1", "p2", "p3", "r"), List(Parameter(0, "a1", TypeParameter(0, "p1")), Parameter(0, "a2", TypeParameter(0, "p2")), Parameter(0, "a3", TypeParameter(0, "p3"))), TypeParameter(0, "r"))
        ))
    )

    def nextTypeVariable(offset : Int) : TypeVariable = {
        val result = TypeVariable(offset, nextTypeVariableId)
        nextTypeVariableId += 1
        result
    }

    def expandType(unexpandedType : Type) : Type = unexpandedType match {
        case t@TypeConstructor(_, module, name, typeArguments) => t.copy(typeArguments = t.typeArguments.map(expandType))
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

    def equalityConstraint(offset : Int, expectedType : Type, actualType : Type) : Unit = {
        (expandType(expectedType), expandType(actualType)) match {
            case (t1@TypeVariable(_, id), t2) => typeVariables = typeVariables + (id -> t2)
            case (t1, t2@TypeVariable(_, id)) => typeVariables = typeVariables + (id -> t1)
            case (t1@TypeConstructor(_, module1, name1, typeArguments1), t2@TypeConstructor(_, module2, name2, typeArguments2)) if module1 == module2 && name1 == name2 && typeArguments1.length == typeArguments2.length =>
                for((a1, a2) <- typeArguments1 zip typeArguments2) equalityConstraint(offset, a1, a2)
            case (t1@TypeParameter(_, name1), t2@TypeParameter(_, name2)) if name1 == name2 =>
            case (t1, t2) =>
                throw new TypeException("Expected type " + t1 + ", but got type " + t2, Lexer.position(buffer, offset))
        }
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
            environment += (variable -> newType)
            Let(s.offset, variable, Some(newType), newValue)
        case s@Assign(_, variable, value) =>
            val t = environment.getOrElse(variable, throw new TypeException("Unknown variable: " + variable, Lexer.position(buffer, s.offset)))
            s.copy(value = typeTerm(t, value))
        case s@Increment(_, variable, value) =>
            val t = environment.getOrElse(variable, throw new TypeException("Unknown variable: " + variable, Lexer.position(buffer, s.offset)))
            s.copy(value = typeTerm(t, value)) // TODO: Check that it's a Int or Float
        case s@Decrement(_, variable, value) =>
            val t = environment.getOrElse(variable, throw new TypeException("Unknown variable: " + variable, Lexer.position(buffer, s.offset)))
            s.copy(value = typeTerm(t, value)) // TODO: Check that it's a Int or Float
    }

    def typeBody(offset : Int, expectedType : Type, body : List[Statement]) : List[Statement] = {
        if(body.isEmpty) {
            equalityConstraint(offset, expectedType, TypeConstructor(offset, Some("_"), "Void", List()))
            return List()
        }
        val init = for(s <- body.init) yield typeStatement(nextTypeVariable(offset), s)
        val last = expandType(expectedType) match {
            case TypeConstructor(_, Some("_"), "Void", List()) => typeStatement(nextTypeVariable(offset), body.last)
            case _ => typeStatement(expectedType, body.last)
        }
        init :+ last
    }

    def typeTerm(expectedType : Type, term : Term) : Term = term match {
        case Binary(offset, operator, left, right) => /* TODO */ term
        case Unary(offset, operator, value) => /* TODO */ term
        case TextValue(offset, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, Some("_"), "String", List())); term
        case IntegerValue(offset, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, Some("_"), "Int", List())); term
        case FloatingValue(offset, value) => equalityConstraint(offset, expectedType, TypeConstructor(offset, Some("_"), "Float", List())); term
        case ClassOrModule(offset, module, classOrModule) => /* TODO */ term
        case Variable(offset, name) =>
            environment.get(name) match {
                case Some(t) => equalityConstraint(offset, expectedType, t); term
                case None => throw new TypeException("Unknown variable: " + name, Lexer.position(buffer, offset))
            }
        case MethodCall(offset, value, methodName, arguments, namedArguments) => /* TODO */ term
        case Copy(offset, value, fields) => /* TODO */ term
        case Instance(offset, moduleName, interfaceName, thisName, methods) => /* TODO */ term
        case Match(offset, value, methods) => /* TODO */ term
        case Lambda(offset, parameters, body) =>
            val parameterTypes = parameters.map(p => p -> nextTypeVariable(offset))
            val returnType = nextTypeVariable(offset)
            val functionType = TypeConstructor(offset, Some("_"), "F" + parameters.length, parameterTypes.map(_._2) :+ returnType)
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
            definition.copy(valueType = Some(expandType(expectedType)), value = value)
        }
    }

    def typeMethodDefinitions(methodDefinitions : List[MethodDefinition]) : List[MethodDefinition] = {
        /* TODO */ methodDefinitions
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
