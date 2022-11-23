/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";

import useCounter from "./use-counter";

describe("useCounter", () => {
	test("should return a count value", () => {
		const { result } = renderHook(() => useCounter());
		expect(result.current).toHaveProperty("count");
	});

	test("should return an increment method", () => {
		const { result } = renderHook(() => useCounter());
		expect(result.current).toHaveProperty("increment");
	});

	test("should return a decrement method", () => {
		const { result } = renderHook(() => useCounter());
		expect(result.current).toHaveProperty("decrement");
	});

	test("should return a setCount method", () => {
		const { result } = renderHook(() => useCounter());
		expect(result.current).toHaveProperty("setCount");
	});

	describe("count", () => {
		test("should match the initialValue", () => {
			const initialValue = 420;
			const { result } = renderHook(() => useCounter(initialValue));
			expect(result.current.count).toBe(initialValue);
		});
	});

	describe("increment", () => {
		test("should increment the value", async () => {
			const { result } = renderHook(() => useCounter());
			act(() => {
				result.current.increment();
			});
			expect(result.current.count).toBe(1);
		});
	});

	describe("decrement", () => {
		test("should decrement the value", async () => {
			const { result } = renderHook(() => useCounter());
			act(() => {
				result.current.decrement();
			});
			expect(result.current.count).toBe(-1);
		});
	});

	describe("setCount", () => {
		test("should set the value", async () => {
			const { result } = renderHook(() => useCounter());
			const nextValue = 420;
			act(() => {
				result.current.setCount(nextValue);
			});
			expect(result.current.count).toBe(nextValue);
		});
	});
});
