import { expect } from "chai";
import { helloWorld } from "../hello";

describe("helloWorld", () => {
  it("should return 'Hello, World!'", () => {
    expect(helloWorld()).to.equal("Hello, World!");
  });

  it("should return a string", () => {
    expect(helloWorld()).to.be.a("string");
  });

  it("should not return an empty string", () => {
    expect(helloWorld()).to.not.be.empty;
  });

  it("should return exact greeting message with comma and exclamation", () => {
    const result = helloWorld();
    expect(result).to.include("Hello");
    expect(result).to.include("World");
    expect(result).to.include(",");
    expect(result).to.include("!");
  });
});
