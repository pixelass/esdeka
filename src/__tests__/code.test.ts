import { serialize } from "../";

describe("serialize", () => {
	it("should return plain objects untouched", () => {
		const input = { hello: "world" };
		const output = serialize(input);
		expect(output).toEqual(input);
	});
	it("should return numbers untouched", () => {
		const input = 420;
		const output = serialize(input);
		expect(output).toEqual(input);
	});
	it("should return strings untouched", () => {
		const input = "420";
		const output = serialize(input);
		expect(output).toEqual(input);
	});
	it("should return null untouched", () => {
		const input = null;
		const output = serialize(input);
		expect(output).toEqual(input);
	});
	it("should remove all function from an object", () => {
		const input = {
			hello: "world",
			greet() {
				return "hello";
			},
			nested: {
				age: 21,
				add(a: number, b: number) {
					return a + b;
				},
			},
		};
		const output = serialize(input);
		expect(output).toEqual({ hello: "world", nested: { age: 21 } });
	});
});
