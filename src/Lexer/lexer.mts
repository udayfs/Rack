import {
  Alpha,
  BinDigit,
  CntlDigit,
  DecDigit,
  HexDigit,
  Keyword,
  OctDigit,
  Space,
  Tag,
} from "./token.mts";
import { State } from "./state.mts";

import type { tag, token } from "./token.mts";
import type { state } from "./state.mts";

export class Lexer {
  private Buffer: string[];
  private index: number = 0;

  private getKeyword(s: string): string | undefined {
    if (Keyword.includes(s)) return s;
    else return undefined;
  }

  public constructor(rawBytes: string) {
    this.Buffer = rawBytes.split("");
  }

  public next(): token {
    const res: token = {
      _tag: Tag.EOF,
      _loc: {
        _from: this.index,
        _to: -1,
        _lineno: 1,
      },
    };
    let s: state = State.start;
    let c;
    loop: while (this.index < this.Buffer.length) {
      c = this.Buffer[this.index];
      switch (s) {
        case (State.start):
          switch (c) {
            case '"': {
              s = State.str_lit;
              if (this.index === this.Buffer.length - 1) {
                res._tag = Tag.INVALID;
                break loop;
              }
              res._tag = Tag.STRLIT;
              break;
            }
            case "'": {
              s = State.char_lit;
              if (this.index === this.Buffer.length - 1) {
                res._tag = Tag.INVALID;
                break loop;
              }
              res._tag = Tag.CHARLIT;
              break;
            }
            case "@": {
              s = State.saw_at_sign;
              break;
            }
            case ",": {
              res._tag = Tag.COMMA;
              this.index += 1;
              break loop;
            }
            case "=": {
              s = State.equal;
              break;
            }
            case "!": {
              s = State.bang;
              break;
            }
            case "|": {
              s = State.pipe;
              break;
            }
            case "(": {
              res._tag = Tag.LPAREN;
              this.index += 1;
              break loop;
            }
            case ")": {
              res._tag = Tag.RPAREN;
              this.index += 1;
              break loop;
            }
            case "[": {
              res._tag = Tag.LSQRB;
              this.index += 1;
              break loop;
            }
            case "]": {
              res._tag = Tag.RSQRB;
              this.index += 1;
              break loop;
            }
            case ":": {
              res._tag = Tag.COLON;
              this.index += 1;
              break loop;
            }
            case "%": {
              s = State.percent;
              res._tag = Tag.MULTILINESTRLIT;
              break;
            }
            case "*": {
              s = State.asterisk;
              break;
            }
            case ">": {
              s = State.rangle;
              break;
            }
            case "<": {
              s = State.langle;
              break;
            }
            case "{": {
              res._tag = Tag.LBRACE;
              this.index += 1;
              break loop;
            }
            case "}": {
              res._tag = Tag.RBRACE;
              this.index += 1;
              break loop;
            }
            case "~": {
              res._tag = Tag.BNOT;
              this.index += 1;
              break loop;
            }
            case "+": {
              s = State.plus;
              break;
            }
            case ".": {
              res._tag = Tag.PERIOD;
              this.index += 1;
              break loop;
            }
            case "-": {
              s = State.minus;
              break;
            }
            case "/": {
              s = State.slash;
              break;
            }
            case "&": {
              s = State.ampersand;
              break;
            }
            case "0": {
              s = State.zero;
              res._tag = Tag.INTLIT;
              break;
            }
            default: {
              if (Space.test(c)) {
                res._loc._from += 1;
                if (c === "\n") res._loc._lineno += 1;
              } else if (Alpha.test(c)) {
                s = State.ident;
                res._tag = Tag.IDENT;
              } else if (DecDigit.test(c)) {
                s = State.int_lit_dec;
                res._tag = Tag.INTLIT;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
            }
          }
          break;

        case (State.saw_at_sign):
          switch (c) {
            default: {
              if (Alpha.test(c)) {
                s = State.builtin;
                res._tag = Tag.BUILTIN;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
              break;
            }
          }
          break;

        case (State.ampersand):
          switch (c) {
            case "=": {
              res._tag = Tag.BAND_EQ;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.BAND;
              break loop;
            }
          }

          /* falls through */
        case (State.asterisk):
          switch (c) {
            case "=": {
              res._tag = Tag.MUL_EQ;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.MUL;
              break loop;
            }
          }

          /* falls through */
        case (State.plus):
          switch (c) {
            case "=": {
              res._tag = Tag.PLUS_EQ;
              this.index += 1;
              break loop;
            }
            case "+": {
              res._tag = Tag.INC;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.PLUS;
              break loop;
            }
          }

          /* falls through */
        case (State.ident):
          switch (c) {
            default: {
              if (Alpha.test(c) || DecDigit.test(c)) break;
              else {
                const _keyword = this.getKeyword(
                  this.Buffer.slice(res._loc._from, this.index).join(""),
                );
                if (_keyword !== undefined) res._tag = _keyword as tag;
                break loop;
              }
            }
          }
          break;

        case (State.builtin):
          switch (c) {
            default: {
              if (Alpha.test(c) || DecDigit.test(c)) break;
              else break loop;
            }
          }
          break;

        case (State.percent):
          switch (c) {
            case "%": {
              s = State.mult_line_strlit_line;
              break;
            }
            default: {
              res._tag = Tag.INVALID;
              break loop;
            }
          }
          break;

        case (State.str_lit):
          switch (c) {
            case "\\": {
              s = State.str_lit_backslash;
              break;
            }
            case '"': {
              this.index += 1;
              break loop;
            }
            case "\n": {
              res._tag = Tag.INVALID;
              break loop;
            }
            default: {
              if (CntlDigit.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              }
              break;
            }
          }
          break;

        case (State.str_lit_backslash):
          switch (c) {
            case "\n": {
              res._tag = Tag.INVALID;
              break loop;
            }
            default: {
              s = State.str_lit;
              break;
            }
          }
          break;

        case (State.char_lit):
          switch (c) {
            case "'": {
              this.index += 1;
              break loop;
            }
            case "\\": {
              s = State.char_lit_backslash;
              break;
            }
            case "\n": {
              res._tag = Tag.INVALID;
              break loop;
            }
            default: {
              if (
                CntlDigit.test(c) || this.index === this.Buffer.length - 1
              ) {
                res._tag = Tag.INVALID;
                break loop;
              }
              s = State.char_lit;
              break;
            }
          }
          break;

        case (State.char_lit_backslash):
          switch (c) {
            case "\n": {
              res._tag = Tag.INVALID;
              break loop;
            }
            default: {
              if (
                CntlDigit.test(c) || this.index === this.Buffer.length - 1
              ) {
                res._tag = Tag.INVALID;
                break loop;
              }
              s = State.char_lit;
              break;
            }
          }
          break;

          /* falls through */
        case (State.mult_line_strlit_line):
          switch (c) {
            case "\n": {
              this.index += 1;
              break loop;
            }
            case "\r": {
              if (this.Buffer[this.index + 1] != "\n") {
                res._tag = Tag.INVALID;
                break loop;
              }
              break;
            }
            default: {
              if (CntlDigit.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break;
            }
          }
          break;

        case (State.bang):
          switch (c) {
            case "=": {
              res._tag = Tag.NOT_EQ;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.INVALID;
              break loop;
            }
          }

          /* falls through */
        case (State.pipe):
          switch (c) {
            case "=": {
              res._tag = Tag.BOR_EQ;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.BOR;
              break loop;
            }
          }

          /* falls through */
        case (State.equal):
          switch (c) {
            case "=": {
              res._tag = Tag.EQ;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.ASSIGN;
              break loop;
            }
          }

          /* falls through */
        case (State.minus):
          switch (c) {
            case "=": {
              res._tag = Tag.MINUS_EQ;
              this.index += 1;
              break loop;
            }
            case "-": {
              res._tag = Tag.DEC;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.MINUS;
              break loop;
            }
          }

        /* falls through */
        case (State.slash):
          switch (c) {
            case "/": {
              s = State.line_comment;
              break;
            }
            case "=": {
              res._tag = Tag.DIV_EQ;
              this.index += 1;
              break loop;
            }
            default: {
              res._tag = Tag.DIV;
              break loop;
            }
          }
          break;

        case (State.line_comment):
          switch (c) {
            case "\n": {
              s = State.start;
              res._loc._from = this.index + 1;
              break;
            }
            default:
              break;
          }
          break;

        case (State.zero):
          switch (c) {
            case "b": {
              s = State.int_lit_bin_nounder;
              break;
            }
            case "o": {
              s = State.int_lit_oct_nounder;
              break;
            }
            case "x": {
              s = State.int_lit_hex_nounder;
              break;
            }
            default: {
              if (
                DecDigit.test(c) || c === "_" || c === "." ||
                c === "e" || c === "E"
              ) {
                this.index -= 1;
                s = State.int_lit_dec;
                break;
              } else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;

        case (State.int_lit_bin_nounder):
          switch (c) {
            default: {
              if (BinDigit.test(c)) {
                s = State.int_lit_bin;
                break;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
            }
          }
          break;

        case (State.int_lit_bin):
          switch (c) {
            case "_": {
              s = State.int_lit_bin_nounder;
              break;
            }
            default: {
              if (BinDigit.test(c)) break;
              else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;

        case (State.int_lit_oct_nounder):
          switch (c) {
            default: {
              if (OctDigit.test(c)) {
                s = State.int_lit_oct;
                break;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
            }
          }
          break;

        case (State.int_lit_oct):
          switch (c) {
            case "_": {
              s = State.int_lit_oct_nounder;
              break;
            }
            default: {
              if (OctDigit.test(c)) break;
              else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;

        case (State.int_lit_hex_nounder):
          switch (c) {
            default: {
              if (HexDigit.test(c)) {
                s = State.int_lit_hex;
                break;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
            }
          }
          break;

        case (State.int_lit_hex):
          switch (c) {
            case "_": {
              s = State.int_lit_hex_nounder;
              break;
            }
            default: {
              if (HexDigit.test(c)) break;
              else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;

        case (State.int_lit_dec):
          switch (c) {
            case "_": {
              s = State.int_lit_dec_nounder;
              break;
            }
            case ".": {
              s = State.num_dot_dec;
              break;
            }
            default: {
              if (c === "e" || c === "E") {
                s = State.float_exponent_usize;
                res._tag = Tag.FLOATLIT;
                break;
              } else if (DecDigit.test(c)) break;
              else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;

        case (State.int_lit_dec_nounder):
          switch (c) {
            default: {
              if (DecDigit.test(c)) {
                s = State.int_lit_dec;
                break;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
            }
          }
          break;

        case (State.num_dot_dec):
          switch (c) {
            default: {
              if (DecDigit.test(c)) {
                res._tag = Tag.FLOATLIT;
                s = State.float_lit;
                break;
              } else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;

        case (State.float_lit):
          switch (c) {
            case "_": {
              s = State.float_lit_nounder;
              break;
            }
            case "e":
            case "E": {
              s = State.float_exponent_usize;
              break;
            }
            default: {
              if (DecDigit.test(c)) break;
              else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;

        case (State.float_lit_nounder):
          switch (c) {
            default: {
              if (DecDigit.test(c)) {
                s = State.float_lit;
                break;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
            }
          }
          break;

        case (State.float_exponent_usize):
          switch (c) {
            case "+":
            case "-": {
              s = State.float_exponent_num_nounder;
              break;
            }
            default: {
              this.index -= 1;
              s = State.float_exponent_num_nounder;
              break;
            }
          }
          break;

        case (State.float_exponent_num_nounder):
          switch (c) {
            default: {
              if (DecDigit.test(c)) {
                s = State.float_exponent_num;
                break;
              } else {
                res._tag = Tag.INVALID;
                break loop;
              }
            }
          }
          break;

        case (State.float_exponent_num):
          switch (c) {
            case "_": {
              s = State.float_exponent_num_nounder;
              break;
            }
            default: {
              if (DecDigit.test(c)) break;
              else if (Alpha.test(c)) {
                res._tag = Tag.INVALID;
                break loop;
              } else break loop;
            }
          }
          break;
      }
      this.index += 1;
    }

    if (res._tag === Tag.INVALID) this.index = this.Buffer.length;
    else if (res._tag !== Tag.EOF) {
      const _keyword = this.getKeyword(
        this.Buffer.slice(res._loc._from, this.index).join(""),
      );
      if (_keyword !== undefined) res._tag = _keyword as tag;
    }

    res._loc._to = (res._tag === Tag.EOF) ? this.index : this.index - 1;
    return res;
  }
}
