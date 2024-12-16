export const Tag = {
  ASSIGN: "=",
  EQ: "==",
  NOT_EQ: "!=",
  GT: ">",
  LT: "<",
  GT_EQ: ">=",
  LT_EQ: "<=",
  LSHIFT: "<<",
  RSHIFT: ">>",
  LSHIFT_EQ: "<<=",
  RSHIFT_EQ: ">>=",
  PLUS: "+",
  MINUS: "-",
  INC: "++",
  DEC: "--",
  PLUS_EQ: "+=",
  MINUS_EQ: "-=",
  DIV: "/",
  DIV_EQ: "/=",
  MUL: "*",
  MUL_EQ: "*=",
  ARROW: "->",
  BNOT: "~",
  BAND: "&",
  BAND_EQ: "&=",
  BOR: "|",
  BOR_EQ: "|=",
  AT: "@",
  COMMA: ",",
  PERCENT: "%",
  LPAREN: "(",
  RPAREN: ")",
  LSQRB: "[",
  RSQRB: "]",
  LBRACE: "{",
  RBRACE: "}",
  COLON: ":",
  PERIOD: ".",
  EOF: Symbol.for("<eof>"),
  STRLIT: Symbol.for("<strlit>"),
  CHARLIT: Symbol.for("<charlit>"),
  MULTILINESTRLIT: Symbol.for("<multilinestrlit>"),
  INTLIT: Symbol.for("<intlit>"),
  FLOATLIT: Symbol.for("<floatlit>"),
  COMMENT: Symbol.for("<comment>"),
  IDENT: Symbol.for("<identifier>"),
  BUILTIN: Symbol.for("<builtin_func>"),
  INVALID: Symbol.for("<invalid>"),
} as const;

export const Keyword = [
  "if",
  "else",
  "then",
  "typeof",
  "delete",
  "fun",
  "throw",
  "for",
  "while",
  "break",
  "continue",
  "new",
  "return",
  "true",
  "false",
  "error",
  "super",
  "struct",
  "empty",
  "is",
  "pow",
  "mod",
  "in",
  "xor",
  "not",
  "or",
  "and",
  "set",
] as string[];

export const DecDigit = /[0-9]/;
export const BinDigit = /[01]/;
export const HexDigit = /[0-9A-Fa-f]/;
export const OctDigit = /[0-7]/;
// deno-lint-ignore no-control-regex
export const CntlDigit = /[\x00-\x1F\x7F]/;

export const Space = /\s/;
export const Alpha = /[A-Za-z_]/;

export type tag = (typeof Tag)[keyof typeof Tag];
export type token = {
  _tag: tag;
  _loc: loc;
};

export type loc = {
  _from: number;
  _to: number;
  _lineno: number;
};
