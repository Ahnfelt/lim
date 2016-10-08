package lim

import lim.Lexer._
import lim.Lexer.TokenType._
import lim.Parser.Cursor
import lim.Parser._

import scala.collection.mutable._

class Parser(cursor : Cursor, buffer : Array[Char]) {

    def commaList[T](parse : () => T, isEnd : () => Boolean) : List[T] = {
        if(isEnd()) return List()
        val list = new ListBuffer[T]()
        while(true) {
            list += parse()
            if(isEnd()) return list.toList
            if(cursor().token != Comma) ParseException("Expected comma, got " + cursor().token, Lexer.position(buffer, cursor().from))
            cursor.skip()
        }
        list.toList
    }

    def leftAssociative(next : () => Term, operators : List[TokenType]) : Term = {
        var result = next()
        while(operators.contains(cursor().token)) {
            result = Binary(cursor.offset, cursor().token, result, {
                cursor.skip()
                next()
            })
        }
        result
    }

    def parseTypeConstructor() : Type = {
        val position = cursor().from
        if(cursor().token != Upper) throw new ParseException("Expected type, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val name = Lexer.text(buffer, cursor().from, cursor().to)
        cursor.skip()
        val typeArguments = if(cursor().token != LeftSquare) List() else {
            cursor.skip()
            val result = commaList(parseType, () => cursor().token == RightSquare)
            cursor.skip()
            result
        }
        TypeConstructor(position, name, typeArguments)
    }

    def parseType() : Type = {
        if(cursor().token == LeftRound) {
            cursor.skip()
            val typeArguments = commaList(parseType, () => cursor().token == RightRound)
            cursor.skip()
            if(cursor().token != RightThickArrow) throw new ParseException("Expected =>, got " + cursor().token, Lexer.position(buffer, cursor().from))
            val position = cursor.offset
            cursor.skip()
            val right = parseType()
            TypeConstructor(position, "F" + typeArguments.length, typeArguments ++ List(right))
        } else {
            val left = if(cursor().token != Lower) parseTypeConstructor() else {
                val typeParameter = TypeParameter(cursor.offset, Lexer.text(buffer, cursor().from, cursor().to))
                cursor.skip()
                typeParameter
            }
            if(cursor().token != RightThickArrow) left else {
                val position = cursor.offset
                cursor.skip()
                val right = parseType()
                TypeConstructor(position, "F1", List(right))
            }
        }
    }

    def parseMethodImplementation() : MethodImplementation = {
        val offset = cursor.offset
        if(cursor().token != Lower) throw new ParseException("Expected method name, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val name = Lexer.text(buffer, cursor().from, cursor().to)
        cursor.skip()
        val parameters = if(cursor().token != LeftRound) List() else {
            cursor.skip()
            def parse() = {
                if(cursor().token != Lower) throw new ParseException("Expected parameter, got " + cursor().token, Lexer.position(buffer, cursor().from))
                cursor.skipWith(Lexer.text(buffer, cursor().from, cursor().to))
            }
            val result = commaList(parse, () => cursor().token == RightRound)
            cursor.skip()
            result
        }
        val body = parseBody()
        MethodImplementation(offset, name, parameters, body)
    }

    def parseMethodImplementations(allowThisName : Boolean) : (Option[String], List[MethodImplementation]) = {
        if(cursor().token != LeftCurly) throw new ParseException("Expected {, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val thisName = if(allowThisName && cursor().token == Lower && cursor(1).token == RightThickArrow) {
            cursor.skipWith(Some(Lexer.text(buffer, cursor().from, cursor().to)), 2)
        } else None
        val result = ListBuffer[MethodImplementation]()
        while(cursor().token != RightCurly) {
            if(cursor().token == Separator) cursor.skip()
            result += parseMethodImplementation()
            if(cursor().token != RightCurly) {
                if(cursor().token != Separator) throw new ParseException("Expected } or line break, got " + cursor().token, Lexer.position(buffer, cursor().from))
                cursor.skip()
            }
        }
        cursor.skip()
        (thisName, result.toList)
    }

    def parseInstance() : Term = {
        val offset = cursor.offset
        if(cursor().token != Upper) throw new ParseException("Expected instance, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val (module, name) = if(cursor(1).token == Dot) {
            val moduleName = Lexer.text(buffer, cursor().from, cursor().to)
            cursor.skip(2)
            cursor.skipWith(Some(moduleName) -> Lexer.text(buffer, cursor().from, cursor().to))
        } else {
            cursor.skipWith(None -> Lexer.text(buffer, cursor().from, cursor().to))
        }
        if(cursor().token != LeftCurly) throw new ParseException("Expected {, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val (thisName, methodImplementations) = parseMethodImplementations(true)
        Instance(offset, module, name, thisName, methodImplementations)
    }

    def parseLambda() : Term = {
        val offset = cursor.offset
        if(cursor().token == LeftCurly) {
            val body = parseBody()
            return Lambda(offset, List(), body)
        }
        val parameters = if(cursor().token == Lower) {
            cursor.skipWith(List(Lexer.text(buffer, cursor().from, cursor().to)))
        } else if(cursor().token == LeftRound) {
            cursor.skip()
            def parse() = {
                if(cursor().token != Lower) throw new ParseException("Expected parameter, got " + cursor().token, Lexer.position(buffer, cursor().from))
                cursor.skipWith(Lexer.text(buffer, cursor().from, cursor().to))
            }
            val result = commaList(parse, () => cursor().token == RightRound)
            cursor.skip()
            result
        } else {
            throw new ParseException("Expected lambda function, got " + cursor().token, Lexer.position(buffer, cursor().from))
        }
        if(cursor().token != RightThickArrow) throw new ParseException("Expected =>, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val body = if(cursor().token == LeftCurly) {
            parseBody()
        } else {
            List(TermStatement(cursor.offset, parseTerm()))
        }
        Lambda(offset, parameters, body)
    }

    def parseAtom() : Term = {
        (cursor(0).token, cursor(1).token, cursor(2).token, cursor(3).token) match {
            case (Lower, RightThickArrow, _, _) => parseLambda()
            case (LeftRound, Lower, Comma, _) => parseLambda()
            case (LeftRound, Lower, RightRound, RightThickArrow) => parseLambda()
            case (LeftCurly, _, _, _) => parseLambda()
            case (Upper, LeftCurly, _, _) => parseInstance()
            case (Upper, Dot, Upper, LeftCurly) => parseInstance()
            case (LeftRound, _, _, _) =>
                cursor.skip()
                val result = parseTerm()
                if(cursor().token != RightRound) throw new ParseException("Expected ), got " + cursor().token, Lexer.position(buffer, cursor().from))
                cursor.skip()
                result
            case (Upper, Dot, Upper, _) =>
                val module = Lexer.text(buffer, cursor().from, cursor().to)
                cursor.skip(2)
                val result = ClassOrModule(cursor.offset, Some(module), Lexer.text(buffer, cursor().from, cursor().to))
                cursor.skip()
                result
            case (Upper, _, _, _) =>
                val result = ClassOrModule(cursor.offset, None, Lexer.text(buffer, cursor().from, cursor().to))
                cursor.skip()
                result
            case (Lower, _, _, _) =>
                val result = Variable(cursor.offset, Lexer.text(buffer, cursor().from, cursor().to))
                cursor.skip()
                result
            case (Text, _, _, _) =>
                cursor.skipWith(TextValue(cursor.offset, Lexer.text(buffer, cursor().from, cursor().to)))
            case (Numeral, _, _, _) =>
                cursor.skipWith(IntegerValue(cursor.offset, Lexer.text(buffer, cursor().from, cursor().to).toLong))
            case (Floating, _, _, _) =>
                cursor.skipWith(FloatingValue(cursor.offset, Lexer.text(buffer, cursor().from, cursor().to).toDouble))
            case _ => throw new ParseException("Expected atom, got " + cursor().token, Lexer.position(buffer, cursor().from))
        }
    }

    def parseNamedArgument() : (String, Term) = {
        if(cursor().token != Lower) throw new ParseException("Expected argument name, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val name = Lexer.text(buffer, cursor().from, cursor().to)
        cursor.skip()
        if(cursor().token != TokenType.Assign) throw new ParseException("Expected =, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val term = parseTerm()
        (name, term)
    }

    def parseCall() : Term = {
        var result = parseAtom()
        while(cursor().token == LeftRound || cursor().token == Dot) {
            val position = cursor.offset
            val methodName = if(cursor().token != Dot) "invoke" else {
                cursor.skip()
                if(cursor().token != Lower) throw new ParseException("Expected method name, got " + cursor().token, Lexer.position(buffer, cursor().from))
                val name = Lexer.text(buffer, cursor().from, cursor().to)
                cursor.skip()
                name
            }
            if(cursor().token != LeftRound) {
                result = MethodCall(position, result, methodName, List(), List())
            } else {
                cursor.skip()
                val arguments = commaList(parseTerm, () => cursor().token == RightRound ||
                    (cursor().token == Comma && cursor(1).token == Lower && cursor(2).token == TokenType.Assign))
                val hasNamedArguments = cursor().token == Comma
                cursor.skip()
                val namedArguments = if(!hasNamedArguments) List() else commaList(parseNamedArgument, () => cursor().token == RightRound)
                result = MethodCall(position, result, methodName, arguments, namedArguments)
            }
        }
        result
    }

    def parseMinusNot() : Term = {
        val token = cursor()
        if(token.token == Minus || token.token == Exclamation) {
            cursor.skip()
            val value = parseCall()
            Unary(token.from, token.token, value)
        } else {
            parseCall()
        }
    }

    def parseTimesDivide() : Term = leftAssociative(parseMinusNot, List(Star, Slash))
    def parsePlusMinus() : Term = leftAssociative(parseTimesDivide, List(Plus, Minus))
    def parseInequality() : Term = leftAssociative(parsePlusMinus, List(Equal, NotEqual, Less, LessEqual, Greater, GreaterEqual))
    def parseAndOr() : Term = leftAssociative(parseInequality, List(And, Or))

    def parseMatch() : Term = {
        val value = parseAndOr()
        if(cursor().token != Question) return value
        val offset = cursor.offset
        cursor.skip()
        val (_, methods) = parseMethodImplementations(false)
        Match(offset, value, methods)
    }

    def parseTerm() : Term = parseMatch()

    def parseBody() : List[Statement] = {
        if(cursor().token != LeftCurly) throw new ParseException("Expected {, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val result = ListBuffer[Statement]()
        while(cursor().token != RightCurly) {
            if(cursor().token == Separator) cursor.skip()
            result += parseStatement()
            if(cursor().token != RightCurly) {
                if(cursor().token != Separator) throw new ParseException("Expected } or line break, got " + cursor().token, Lexer.position(buffer, cursor().from))
                cursor.skip()
            }
        }
        cursor.skip()
        result.toList
    }

    def parseStatement() : Statement = {
        (cursor(0).token, cursor(1).token) match {
            case (Lower, Colon) =>
                val offset = cursor.offset
                val name = Lexer.text(buffer, cursor().from, cursor().to)
                cursor.skip(2)
                val variableType = if(cursor().token == Lexer.TokenType.Assign) None else Some(parseType())
                if(cursor().token != Lexer.TokenType.Assign) throw new ParseException("Expected =, got " + cursor().token, Lexer.position(buffer, cursor().from))
                val value = parseTerm()
                Let(offset, name, variableType, value)
            case (Lower, Lexer.TokenType.Assign) =>
                val offset = cursor.offset
                val name = Lexer.text(buffer, cursor().from, cursor().to)
                cursor.skip(2)
                val value = parseTerm()
                Parser.Assign(offset, name, value)
            case (Lower, Lexer.TokenType.Increment) =>
                val offset = cursor.offset
                val name = Lexer.text(buffer, cursor().from, cursor().to)
                cursor.skip(2)
                val value = parseTerm()
                Parser.Increment(offset, name, value)
            case (Lower, Lexer.TokenType.Decrement) =>
                val offset = cursor.offset
                val name = Lexer.text(buffer, cursor().from, cursor().to)
                cursor.skip(2)
                val value = parseTerm()
                Parser.Decrement(offset, name, value)
            case _ => TermStatement(cursor.offset, parseTerm())
        }
    }

    def parseTypeParameter() : String = {
        if(cursor().token != Lower) throw new ParseException("Expected type parameter, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skipWith(Lexer.text(buffer, cursor().from, cursor().to))
    }

    def parseParameter() : Parameter = {
        val offset = cursor.offset
        if(cursor().token != Lower) throw new ParseException("Expected parameter name, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val name = cursor.skipWith(Lexer.text(buffer, cursor().from, cursor().to))
        if(cursor().token != Colon) throw new ParseException("Expected parameter type, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val parameterType = parseType()
        Parameter(offset, name, parameterType)
    }

    def parseMethodSignature() : MethodSignature = {
        val offset = cursor.offset
        if(cursor().token != Lower) throw new ParseException("Expected method name, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val name = cursor.skipWith(Lexer.text(buffer, cursor().from, cursor().to))
        val typeParameters = if(cursor().token == LeftSquare) {
            cursor.skip()
            cursor.skipWith(commaList(parseTypeParameter, () => cursor().token == RightSquare))
        } else List()
        val parameters = if(cursor().token == LeftRound) {
            cursor.skip()
            cursor.skipWith(commaList(parseParameter, () => cursor().token == RightRound))
        } else List()
        val returnType = if(cursor().token == Colon) {
            cursor.skip()
            parseType()
        } else TypeConstructor(cursor.offset, "Void", List())
        MethodSignature(offset, name, typeParameters, parameters, returnType)
    }

    def parseMethodDefinition() = {
        val offset = cursor.offset
        val signature = parseMethodSignature()
        val body = parseBody()
        MethodDefinition(offset, signature, body)
    }

    def parseMethodSignatures() : List[MethodSignature] = {
        if(cursor().token != LeftCurly) throw new ParseException("Expected {, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val result = ListBuffer[MethodSignature]()
        while(cursor().token != RightCurly) {
            if(cursor().token == Separator) cursor.skip()
            result += parseMethodSignature()
            if(cursor().token != RightCurly) {
                if(cursor().token != Separator) throw new ParseException("Expected } or line break, got " + cursor().token, Lexer.position(buffer, cursor().from))
                cursor.skip()
            }
        }
        cursor.skip()
        result.toList
    }

    def parseValueDefinition() : ValueDefinition = {
        val offset = cursor.offset
        if(cursor().token != Lower) throw new ParseException("Expected constant name, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val name = cursor.skipWith(Lexer.text(buffer, cursor().from, cursor().to))
        if(cursor().token != Colon) throw new ParseException("Expected constant type, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val valueType = if(cursor().token == Lexer.TokenType.Assign) None else Some(parseType())
        if(cursor().token != Lexer.TokenType.Assign) throw new ParseException("Expected constant value, got " + cursor().token, Lexer.position(buffer, cursor().from))
        cursor.skip()
        val value = parseTerm()
        // TODO: Check if value contains method calls (forbidden at toplevel to prevent global state)
        ValueDefinition(offset, name, valueType, value)
    }

    def parseTypeDefinition() : TypeDefinition = {
        val offset = cursor.offset
        if(cursor().token != Upper) throw new ParseException("Expected type name, got " + cursor().token, Lexer.position(buffer, cursor().from))
        val name = cursor.skipWith(Lexer.text(buffer, cursor().from, cursor().to))
        val typeParameters = if(cursor().token == LeftSquare) {
            cursor.skip()
            cursor.skipWith(commaList(parseTypeParameter, () => cursor().token == RightSquare))
        } else List()
        val defaultModifier = (cursor(0).token, cursor(1).token) match {
            case (Question, Exclamation) => cursor.skipWith(RequestResponseModifier, 2)
            case (Question, _) => cursor.skipWith(RequestModifier)
            case (Exclamation, _) => cursor.skipWith(ResponseModifier)
            case (LeftRound, _) => RequestModifier
            case _ => RequestResponseModifier
        }
        val methodSignatures = if(cursor().token == LeftRound) {
            cursor.skip()
            val parameters = commaList(parseParameter, () => cursor().token == RightRound)
            cursor.skip()
            List(MethodSignature(offset, name.head.toLower + name.tail, List(), parameters, TypeConstructor(offset, "Void", List())))
        } else parseMethodSignatures()
        TypeDefinition(offset, name, typeParameters, defaultModifier, methodSignatures)
    }

    def parseDefinition() = {
        (cursor(0).token, cursor(1).token) match {
            case (Lower, Colon) => parseValueDefinition()
            case (Lower, _) => parseMethodDefinition()
            case _ => parseTypeDefinition()
        }
    }

    def parseModule() = {
        val result = ListBuffer[Definition]()
        while(cursor().token != OutsideFile) {
            if(cursor().token == Separator) cursor.skip()
            result += parseDefinition()
            if(cursor().token != OutsideFile) {
                if(cursor().token != Separator) throw new ParseException("Expected end of file or line break, got " + cursor().token, Lexer.position(buffer, cursor().from))
                cursor.skip()
            }
        }
        result.toList
    }

}

object Parser {

    sealed abstract class Term
    case class Binary(offset : Int, operator : TokenType, left : Term, right : Term) extends Term
    case class Unary(offset : Int, operator : TokenType, value : Term) extends Term
    case class TextValue(offset : Int, value : String) extends Term
    case class IntegerValue(offset : Int, value : Long) extends Term
    case class FloatingValue(offset : Int, value : Double) extends Term
    case class ClassOrModule(offset : Int, module : Option[String], classOrModule : String) extends Term
    case class Variable(offset : Int, name : String) extends Term
    case class MethodCall(offset : Int, value : Term, methodName : String, arguments : List[Term], namedArguments : List[(String, Term)]) extends Term
    case class Copy(offset : Int, value : Term, fields : List[(String, Term)]) extends Term
    case class Instance(offset : Int, moduleName : Option[String], interfaceName : String, thisName : Option[String], methods : List[MethodImplementation]) extends Term
    case class Match(offset : Int, value : Term, methods : List[MethodImplementation]) extends Term
    case class Lambda(offset : Int, parameters : List[String], body : List[Statement]) extends Term

    sealed abstract class Statement
    case class TermStatement(offset : Int, term : Term) extends Statement
    case class Let(offset : Int, variable : String, variableType : Option[Type], value : Term) extends Statement
    case class Assign(offset : Int, variable : String, value : Term) extends Statement
    case class Increment(offset : Int, variable : String, value : Term) extends Statement
    case class Decrement(offset : Int, variable : String, value : Term) extends Statement

    sealed abstract class Type
    case class TypeConstructor(offset : Int, name : String, typeArguments : List[Type]) extends Type
    case class TypeParameter(offset : Int, name : String) extends Type
    case class TypeVariable(offset : Int, id : Int) extends Type

    sealed abstract class Definition
    case class TypeDefinition(offset : Int, name : String, typeParameters : List[String], defaultModifier : TypeModifier, methodSignatures : List[MethodSignature]) extends Definition
    case class MethodDefinition(offset : Int, signature : MethodSignature, body : List[Statement]) extends Definition
    case class ValueDefinition(offset : Int, name : String, valueType : Option[Type], value : Term) extends Definition

    sealed abstract class TypeModifier
    case object RequestModifier extends TypeModifier
    case object ResponseModifier extends TypeModifier
    case object RequestResponseModifier extends TypeModifier

    case class MethodSignature(offset : Int, name : String, typeParameters : List[String], parameters : List[Parameter], returnType : Type)

    case class MethodImplementation(offset : Int, name : String, parameters : List[String], body : List[Statement])

    case class Parameter(offset : Int, name : String, parameterType : Type)


    case class Module(
        exports : List[ExportedSymbol],
        imports : List[Import],
        typeDefinitions : List[TypeDefinition],
        methodDefinitions : List[MethodDefinition],
        valueDefinitions : List[ValueDefinition]
    )

    case class Import(offset : Int, moduleName : String, symbol : ExportedSymbol)

    case class ExportedSymbol(offset : Int, name : String, everything : Boolean)



    case class Cursor(tokens : Array[Token], var offset : Int) {
        def apply(ahead : Int = 0) = tokens(offset + ahead)
        def skip(ahead : Int = 1) = offset += ahead
        def skipWith[T](result : T, ahead : Int = 1) = { skip(ahead); result }
    }


    def main(args : Array[String]) {
        println(testParse("""

        origo := Point(0, 0)

        Iterator[t] {
            next() : Option[t]
        }

        newIntIterator(i : Int) : Iterator[Int] {
            Iterator {
                next() {
                    Option.none
                }
            }
        }

        """))
    }

    def testParse(text : String) : Any = {
        val buffer = text.toCharArray
        val tokens = Lexer.tokens(buffer, 0)
        val parser = new Parser(new Parser.Cursor(tokens, 0), buffer)
        parser.parseModule()
    }
}
