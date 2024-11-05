import { assertEquals } from "jsr:@std/assert";

import { Keyword, Tag, type tag } from "./token.mts";
import { Lexer } from "./lexer.mts";

function testLexer(source: string, expectedTags: tag[]) {
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

Deno.test("Test Float Literal e exponent", () => {
    testLexer(
        "a = 3.7237498752e-27\n",
        [Tag.IDENT, Tag.ASSIGN, Tag.FLOATLIT],
    );
});

Deno.test("Test Integer", () => {
    testLexer("a = 2348503828042234", [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT]);
});

Deno.test("Test Integer With Underscores", () => {
    testLexer("a = 2_348_503_828_042_234", [Tag.IDENT, Tag.ASSIGN, Tag.INTLIT]);
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

Deno.test("Test Char", () => {
    testLexer("'c'", [Tag.CHARLIT]);
});
