import { assertEquals } from "jsr:@std/assert";

import { Keyword, Tag, type tag } from "./token.mts";
import { Lexer } from "./lexer.mts";

function testLexer(source: string, expectedTags: tag[]): void {
    const l = new Lexer(source);
    expectedTags.forEach((tag) => {
        const token = l.next();
        assertEquals(token._tag, tag);
    });
    const lastToken = l.next();
    assertEquals(lastToken._tag, Tag.EOF);
    assertEquals(source.length, lastToken._loc._from);
    assertEquals(source.length, lastToken._loc._to);
}

Deno.test("Test Keywords", () => {
    testLexer("if else then", [Keyword[0], Keyword[1], Keyword[2]] as tag[]);
});

Deno.test("Test Float Literal", () => {
    testLexer("a = 247832974.09384930843342", [
        Tag.IDENT,
        Tag.ASSIGN,
        Tag.FLOATLIT,
    ]);
});

Deno.test("Test Float Literal with Underscores", () => {
    testLexer("a = 3.7_237_498_752", [Tag.IDENT, Tag.ASSIGN, Tag.FLOATLIT]);
});

Deno.test("Test Float Literal e exponent", () => {
    testLexer(
        "a = 3.7_237_498_752e-27",
        [Tag.IDENT, Tag.ASSIGN, Tag.FLOATLIT],
    );
});

Deno.test("Test Integer Literal", () => {
    testLexer("a = 2348503828042234", [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT]);
});

Deno.test("Test Integer Literal With Underscores", () => {
    testLexer("a = 2_348_503_828_042_234", [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT]);
});

Deno.test("Test Binary Integer Literal", () => {
    testLexer("a = 0b1001001001", [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT]);
});

Deno.test("Test Octal Integer Literal", () => {
    testLexer("a = 0o1111", [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT]);
});

Deno.test("Test Hex Integer Literal", () => {
    testLexer("a = 0x249", [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT]);
});

Deno.test("Test Binary Integer Notation With Underscores", () => {
    testLexer(
        "a = 0b10_00_01_01_01_11_11_11_00_11_10_10_10_00_01_10_11_00_10_01_00_01_11_11_10_10",
        [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT],
    );
});

Deno.test("Test Octal Integer Notation With Underscores", () => {
    testLexer("a = 0o102_577_165_033_110_772", [
        Tag.IDENT,
        Tag.ASSIGN,
        Tag.INTLIT,
    ]);
});

Deno.test("Test Hexadecimal Integer Notation With Underscores", () => {
    testLexer("a = 0x8_57F3_A86C_91FA", [
        Tag.IDENT,
        Tag.ASSIGN,
        Tag.INTLIT,
    ]);
});

Deno.test("Test Identifier and BuiltIn func", () => {
    testLexer(
        'set W = @at("Hello, World", 7)',
        [
            Keyword[27],
            Tag.IDENT,
            Tag.ASSIGN,
            Tag.BUILTIN,
            Tag.LPAREN,
            Tag.STRLIT,
            Tag.COMMA,
            Tag.INTLIT,
            Tag.RPAREN,
        ] as tag[],
    );
});

Deno.test("Test Character Literal", () => {
    testLexer("'c'", [Tag.CHARLIT]);
    testLexer("''", [Tag.CHARLIT]);
});

Deno.test("Invalid Token Characters", () => {
    testLexer("`", [Tag.INVALID]);
    testLexer("'z", [Tag.INVALID]);
    testLexer("'", [Tag.INVALID]);
    testLexer("'\n'", [Tag.INVALID]);
});

Deno.test("Test NewLine in Character Literal", () => {
    testLexer(
        `'
        '`,
        [Tag.INVALID],
    );
});

Deno.test("Test NewLine in String Literal", () => {
    testLexer(
        `"
        "`,
        [Tag.INVALID],
    );
});

Deno.test("Unicode Code Point Character Literal", () => {
    testLexer(`'😹'`, [Tag.CHARLIT]);
});

Deno.test("Unicode Escape in Character Literal", () => {
    testLexer("'\u019d'", [Tag.CHARLIT]);
    testLexer("'\u20BC'", [Tag.CHARLIT]);
});
