import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnswerOption } from "./answer-option";

describe("AnswerOption labels", () => {
  it.each(["E", "AA"])("displays the stored key %s instead of its position", (optionKey) => {
    const markup = renderToStaticMarkup(
      createElement(AnswerOption, { label: "Answer text", optionKey, index: 0 }),
    );

    expect(markup).toContain(`>${optionKey}</span>`);
    expect(markup).not.toContain(">A</span>");
    expect(markup).not.toContain("optionKey=");
  });

  it.each([[0, "A"], [3, "D"], [25, "Z"], [26, "AA"], [701, "ZZ"], [702, "AAA"]])(
    "renders index %i as %s when no key is supplied",
    (index, expected) => {
      const markup = renderToStaticMarkup(
        createElement(AnswerOption, { label: "Answer text", index: index as number }),
      );

      expect(markup).toContain(`>${expected}</span>`);
    },
  );
});
