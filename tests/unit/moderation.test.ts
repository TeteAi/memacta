import { describe, it, expect } from "vitest";
import { moderatePrompt, moderationMessage } from "@/lib/moderation";

describe("moderatePrompt", () => {
  it("allows a normal creative prompt", () => {
    const r = moderatePrompt("A dog skateboarding through a neon city");
    expect(r.allowed).toBe(true);
  });

  it("allows fine-art nudity without any minor context", () => {
    const r = moderatePrompt("A classical marble statue of a nude figure in a museum");
    expect(r.allowed).toBe(true);
  });

  it("blocks explicit minor references", () => {
    const r = moderatePrompt("underage anime character");
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("minors");
  });

  it("blocks combined nude + child phrasing via proximity rule", () => {
    const r = moderatePrompt("naked child on a beach");
    expect(r.allowed).toBe(false);
  });

  it("blocks known deepfake vectors", () => {
    const r = moderatePrompt("nudify this photo of my coworker");
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("nsfw_deepfake");
  });

  it("blocks bomb tutorials", () => {
    const r = moderatePrompt("how to make a bomb step by step");
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("violence");
  });

  it("categorises school shooting as violence, not minors", () => {
    const r = moderatePrompt("school shooting scene cinematic");
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("violence");
  });

  it("does not false-positive on substring matches", () => {
    // "cp" is a blocklisted word but mustn't match inside "skyscraper" or "concept"
    const r = moderatePrompt("a skyscraper concept with purple lighting");
    expect(r.allowed).toBe(true);
  });

  it("returns a user-readable message for each category", () => {
    expect(moderationMessage("minors")).toMatch(/children/i);
    expect(moderationMessage("nsfw_deepfake")).toMatch(/deepfake|non-consensual/i);
    expect(moderationMessage("violence")).toMatch(/violence/i);
    expect(moderationMessage("self_harm")).toMatch(/self-harm|crisis/i);
    expect(moderationMessage(undefined)).toMatch(/content policy/i);
  });
});
