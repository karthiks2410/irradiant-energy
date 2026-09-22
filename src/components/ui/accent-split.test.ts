import { describe, expect, it } from "vitest";
import { splitOnAccent } from "./accent-split";

describe("splitOnAccent", () => {
  it("splits around an accent at the end, the English shape", () => {
    expect(splitOnAccent("Ready to see your savings?", "your savings?")).toEqual({
      before: "Ready to see ",
      accent: "your savings?",
      after: "",
    });
  });

  it("splits around an accent at the START, which is where a Kannada noun phrase sits", () => {
    // "Adopt rooftop solar across Karnataka" — the emphasis is the place, and the verb is last.
    const text = "ಕರ್ನಾಟಕದಾದ್ಯಂತ ಸೌರ ವಿದ್ಯುತ್ ಅಳವಡಿಸಿಕೊಳ್ಳಿ";
    expect(splitOnAccent(text, "ಕರ್ನಾಟಕದಾದ್ಯಂತ")).toEqual({
      before: "",
      accent: "ಕರ್ನಾಟಕದಾದ್ಯಂತ",
      after: " ಸೌರ ವಿದ್ಯುತ್ ಅಳವಡಿಸಿಕೊಳ್ಳಿ",
    });
  });

  it("splits around an accent in the middle", () => {
    expect(splitOnAccent("More than solar. A better energy future.", "solar.")).toEqual({
      before: "More than ",
      accent: "solar.",
      after: " A better energy future.",
    });
  });

  it("accepts a single-word accent covering the whole headline", () => {
    expect(splitOnAccent("ಮುಖಪುಟ", "ಮುಖಪುಟ")).toEqual({ before: "", accent: "ಮುಖಪುಟ", after: "" });
  });

  it("returns null when no accent is given, so the caller keeps its position rule", () => {
    expect(splitOnAccent("Talk to us about your roof.", undefined)).toBeNull();
    expect(splitOnAccent("Talk to us about your roof.", "")).toBeNull();
  });

  it("returns null when the accent no longer appears in the copy", () => {
    // A copy edit that orphans the accent must degrade to a plain headline, never crash.
    expect(splitOnAccent("Talk to us about your roof.", "your rooftop.")).toBeNull();
  });

  it("uses the first occurrence when the accent repeats", () => {
    expect(splitOnAccent("solar and more solar", "solar")).toEqual({
      before: "",
      accent: "solar",
      after: " and more solar",
    });
  });
});
