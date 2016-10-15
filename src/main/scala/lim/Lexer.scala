package lim

import com.sun.jmx.snmp.IPAcl.ParseError
import lim.Lexer.TokenType._
import lim.Lexer._

import scala.collection.mutable
import scala.collection.mutable.ArrayBuffer

class Lexer(cursor : Cursor) {
    
    def token() : Option[Token] = {
        identifier().orElse(operator()).orElse(codeUnit()).orElse(text()).orElse(brackets()).orElse(separator()).orElse(number())
    }

    def separator() : Option[Token] = {
        cursor.skipWhitespace() // To make sure we ignore line breaks when appropriate
        if(cursor() != '\n' && cursor() != ';') return None
        val from = cursor.offset
        while(cursor() == '\n' || cursor() == ';') {
            cursor.skip()
            cursor.skipWhitespace()
        }
        Some(Token(Separator, from, from + 1))
    }
    
    def identifier() : Option[Token] = {
        val upper = isBetween('A', 'Z')
        if(!upper && !isBetween('a', 'z')) return None
        val from = cursor.offset
        while(isBetween('a', 'z') || isBetween('A', 'Z') || isBetween('0', '9')) {
            cursor.skip()
        }
        val to = cursor.offset
        cursor.skipWhitespace()
        Some(Token(if(upper) Upper else Lower, from, to))
    }
    
    def operator() : Option[Token] = {
        val c = cursor()
        val n = cursor(1)
        val from = cursor.offset
        val result : Token = (c, n) match {
            case ('-', '>') => cursor.skip(2); Token(RightThinArrow, from, cursor.offset)
            case ('-', '=') => cursor.skip(2); Token(Decrement, from, cursor.offset)
            case ('-', _) => cursor.skip(1); Token(Minus, from, cursor.offset)
            case ('+', '=') => cursor.skip(2); Token(Increment, from, cursor.offset)
            case ('+', _) => cursor.skip(1); Token(Plus, from, cursor.offset)
            case ('=', '>') => cursor.skip(2); Token(RightThickArrow, from, cursor.offset)
            case ('=', '=') => cursor.skip(2); Token(Equal, from, cursor.offset)
            case ('!', '=') => cursor.skip(2); Token(NotEqual, from, cursor.offset)
            case ('=', _) => cursor.skip(1); Token(Assign, from, cursor.offset)
            case ('*', _) => cursor.skip(1); Token(Star, from, cursor.offset)
            case ('/', _) => cursor.skip(1); Token(Slash, from, cursor.offset)
            case ('&', '&') => cursor.skip(2); Token(And, from, cursor.offset)
            case ('|', '|') => cursor.skip(2); Token(Or, from, cursor.offset)
            case ('|', '>') => cursor.skip(2); Token(RightPipe, from, cursor.offset)
            case ('<', '|') => cursor.skip(2); Token(LeftPipe, from, cursor.offset)
            case ('?', _) => cursor.skip(1); Token(Question, from, cursor.offset)
            case ('!', _) => cursor.skip(1); Token(Exclamation, from, cursor.offset)
            case (':', _) => cursor.skip(1); Token(Colon, from, cursor.offset)
            case ('@', _) => cursor.skip(1); Token(AtSign, from, cursor.offset)
            case ('.', _) => cursor.skip(1); Token(Dot, from, cursor.offset)
            case (',', _) => cursor.skip(1); Token(Comma, from, cursor.offset)
            case ('_', _) => cursor.skip(1); Token(Underscore, from, cursor.offset)
            case ('<', '-') => cursor.skip(2); Token(LeftThinArrow, from, cursor.offset)
            case ('<', '=') => cursor.skip(2); Token(LessEqual, from, cursor.offset)
            case ('<', _) => cursor.skip(2); Token(Less, from, cursor.offset)
            case ('>', '=') => cursor.skip(2); Token(GreaterEqual, from, cursor.offset)
            case ('>', _) => cursor.skip(2); Token(Greater, from, cursor.offset)
            case _ => return None
        }
        cursor.skipWhitespace()
        Some(result)
    }

    def brackets() : Option[Token] = {
        val c = cursor()
        val from = cursor.offset
        val result : Token = c match {
            case '(' => cursor.skip(1); cursor.push(')'); Token(LeftRound, from, cursor.offset)
            case ')' => cursor.skip(1); cursor.pop(')'); Token(RightRound, from, cursor.offset)
            case '[' => cursor.skip(1); cursor.push(']'); Token(LeftSquare, from, cursor.offset)
            case ']' => cursor.skip(1); cursor.pop(']'); Token(RightSquare, from, cursor.offset)
            case '{' => cursor.skip(1); cursor.push('}'); Token(LeftCurly, from, cursor.offset)
            case '}' => cursor.skip(1); cursor.pop('}'); Token(RightCurly, from, cursor.offset)
            case _ => return None
        }
        cursor.skipWhitespace()
        Some(result)
    }

    def codeUnit() : Option[Token] = {
        val from = cursor.offset
        if(cursor() != '\'') return None
        cursor.skip()
        if(cursor() == '\\') cursor.skip()
        cursor.skip()
        if(cursor() != '\'') throw new ParseException("Expected ', but got: " + cursor(), position(cursor.buffer, from))
        cursor.skip()
        val to = cursor.offset
        cursor.skipWhitespace()
        Some(Token(CodeUnit, from, to))
    }

    def text() : Option[Token] = {
        val c = cursor()
        val from = cursor.offset
        val middle = if(c == ')' && cursor.top('"')) {
            cursor.pop('"')
            true
        } else if(c == '"') {
            false
        } else {
            return None
        }
        cursor.skip()
        while(cursor() != '"') {
            if(cursor() == '\\' && cursor(1) == '(') {
                cursor.skip()
                val to = cursor.offset
                cursor.skip()
                cursor.push('"')
                cursor.skipWhitespace()
                return Some(Token(if(middle) TextMiddle else TextStart, from, to))
            } else if(cursor() == '\\') {
                cursor.skip()
                cursor() match {
                    case 'n' => cursor.skip()
                    case 'r' => cursor.skip()
                    case 't' => cursor.skip()
                    case '\'' => cursor.skip()
                    case '\"' => cursor.skip()
                    case '\\' => cursor.skip()
                    case '{' =>
                        cursor.skip()
                        while(cursor() != '}') {
                            if(cursor.pastEnd) throw new ParseException("Unexpected end of file inside unicode escape sequence", position(cursor.buffer, from))
                            val c = cursor()
                            if((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) cursor.skip()
                            else throw new ParseException("Unexpected non-hexadecimal inside unicode escape sequence: " + c, position(cursor.buffer, from))
                        }
                        cursor.skip()
                    case _ => throw new ParseException("Unknown escape sequence: \\" + cursor(), position(cursor.buffer, from))
                }
            } else {
                if(cursor.pastEnd) throw new ParseException("Unexpected end of file inside this string", position(cursor.buffer, from))
                cursor.skip()
            }
        }
        val to = cursor.offset
        cursor.skip()
        cursor.skipWhitespace()
        Some(Token(if(middle) TextEnd else Text, from, to))
    }

    def number() : Option[Token] = {
        val c = cursor()
        if(c < '0' || c > '9') return None
        val from = cursor.offset
        while(cursor() >= '0' && cursor() <= '9') {
            if(cursor.pastEnd) throw new ParseException("Unexpected end of file inside this number", position(cursor.buffer, from))
            cursor.skip()
        }
        val to = cursor.offset
        cursor.skipWhitespace()
        // TODO: Floating
        Some(Token(Numeral, from, to))
    }

    private def isBetween(from : Char, to : Char) = { val c = cursor(); c >= from && c <= to }
    
}

object Lexer {
    
    case class Token(token : TokenType, from : Int, to : Int)
    
    sealed abstract class TokenType
    object TokenType {
        case object LeftThinArrow extends TokenType
        case object RightThinArrow extends TokenType
        case object RightThickArrow extends TokenType
        case object LeftPipe extends TokenType
        case object RightPipe extends TokenType
        case object AtSign extends TokenType
        case object Colon extends TokenType
        case object Comma extends TokenType
        case object Dot extends TokenType
        case object Underscore extends TokenType
        case object Assign extends TokenType
        case object Increment extends TokenType
        case object Decrement extends TokenType
        case object Plus extends TokenType
        case object Minus extends TokenType
        case object Star extends TokenType
        case object Slash extends TokenType
        case object Equal extends TokenType
        case object NotEqual extends TokenType
        case object Less extends TokenType
        case object LessEqual extends TokenType
        case object Greater extends TokenType
        case object GreaterEqual extends TokenType
        case object And extends TokenType
        case object Or extends TokenType
        case object Exclamation extends TokenType
        case object Question extends TokenType
        case object LeftRound extends TokenType
        case object RightRound extends TokenType
        case object LeftSquare extends TokenType
        case object RightSquare extends TokenType
        case object LeftCurly extends TokenType
        case object RightCurly extends TokenType
        case object Lower extends TokenType
        case object Upper extends TokenType
        case object CodeUnit extends TokenType
        case object Text extends TokenType
        case object TextStart extends TokenType
        case object TextMiddle extends TokenType
        case object TextEnd extends TokenType
        case object Numeral extends TokenType
        case object Floating extends TokenType
        case object Separator extends TokenType
        case object OutsideFile extends TokenType
    }
    
    case class Position(line : Int, column : Int, offset : Int)
    
    
    def position(buffer : Array[Char], offset : Int) : Position = {
        var at = 0
        var line = 1
        var column = 1
        while(at < offset) {
            if(at < buffer.length && buffer(at) == '\n') {
                line += 1
                column = 1
            } else {
                column += 1
            }
            at += 1
        }
        Position(line, column, offset)
    }

    def lineText(buffer : Array[Char], offset : Int) : String = {
        var from = offset
        var to = offset
        while(from > 0 && buffer(from) != '\n') from -= 1
        while(to < buffer.length && buffer(to) != '\n') to += 1
        text(buffer, from, to)
    }

    def text(buffer : Array[Char], from : Int, to : Int) : String = {
        new String(buffer, from, to - from)
    }

    
    def tokens(buffer : Array[Char], paddingBefore : Int = 0, paddingAfter : Int = 10) : Array[Token] = {
        val builder = new ArrayBuffer[Token]()
        for(_ <- 1 to paddingBefore) builder += Token(OutsideFile, 0, 0)
        val cursor = Cursor(buffer, 0, ArrayBuffer())
        val lexer = new Lexer(cursor)
        var lastToken : Option[Token] = None
        while({ lastToken = lexer.token(); lastToken.isDefined }) builder += lastToken.get
        if(!cursor.pastEnd) {
            println(builder.toList.map(_.token).mkString(" "))
            throw new ParseException("Unexpected character: " + cursor(), position(buffer, cursor.offset))
        }
        for(_ <- 1 to paddingAfter) builder += Token(OutsideFile, cursor.offset, cursor.offset)
        builder.toArray
    }
    
    
    case class Cursor(buffer : Array[Char], var offset : Int, stack : ArrayBuffer[Char]) {
        
        def apply(ahead : Int = 0) : Char = 
            try buffer(offset + ahead) 
            catch { case _ : ArrayIndexOutOfBoundsException => ' ' }
        
        def skip(ahead : Int = 1) : Unit = {
            offset += ahead
        }
        
        def pastEnd = offset >= buffer.length

        def top(closeSymbol : Char) : Boolean = stack.nonEmpty && stack.last == closeSymbol

        def push(closeSymbol : Char) : Unit = {
            stack += closeSymbol
        }

        def pop(closeSymbol : Char) : Unit = {
            if(stack.isEmpty) {
                throw new ParseException("Unexpected '" + closeSymbol + "'", position(buffer, offset))
            }
            if(stack.last != closeSymbol) {
                throw new ParseException("Expected '" + stack.last + "', got '" + closeSymbol + "'", position(buffer, offset))
            }
            stack.remove(stack.length - 1)
        }
        
        def skipWhitespace() : Unit = {
            val ignoreNewLine = stack.nonEmpty && (stack.last == ')' || stack.last == ']' || stack.last == '"')
            while(offset < buffer.length && (apply() == ' ' || apply() == '\t' || apply() == '\r' || (ignoreNewLine && apply() == '\n'))) {
                skip()
            }
        }

    }
    
    case class ParseException(message : String, position : Position) extends RuntimeException(message + " at line " + position.line + " column " + position.column)
}
