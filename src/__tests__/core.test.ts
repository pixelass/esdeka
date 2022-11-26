import { waitFor } from "@testing-library/dom";

import { serialize, subscribe } from "../";

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

describe("subscribe", () => {
	it("should return an unsubscribe function", () => {
		const callback = jest.fn();
		const unsubscribe = subscribe("test", callback);
		expect(typeof unsubscribe).toBe("function");
		unsubscribe();
	});
	it("should listen to guest events", async () => {
		const callback = jest.fn();
		subscribe("test", callback);
		window.postMessage(
			{
				client: "__ESDEKA::guest__",
				channel: "test",
				action: {
					type: "answer",
				},
			},
			"*"
		);
		await waitFor(() => {
			expect(callback).toHaveBeenCalled();
		});
	});
	it("should listen to host events", async () => {
		const callback = jest.fn();
		subscribe("test", callback);
		window.postMessage(
			{
				client: "__ESDEKA::host__",
				channel: "test",
				action: {
					type: "call",
				},
			},
			"*"
		);
		await waitFor(() => {
			expect(callback).toHaveBeenCalled();
		});
	});
	it("should ignore events from strangers", async () => {
		const callback = jest.fn();
		subscribe("test", callback);
		window.postMessage(
			{
				client: "stranger",
				channel: "test",
				action: {
					type: "call",
				},
			},
			"*"
		);
		await waitFor(() => {
			expect(callback).not.toHaveBeenCalled();
		});
	});
	it("should ignore events from other channels", async () => {
		const callback = jest.fn();
		subscribe("test", callback);
		window.postMessage(
			{
				client: "__ESDEKA::host__",
				channel: "test2",
				action: {
					type: "call",
				},
			},
			"*"
		);
		await waitFor(() => {
			expect(callback).not.toHaveBeenCalled();
		});
	});
});
