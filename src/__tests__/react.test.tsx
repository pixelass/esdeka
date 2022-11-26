import { renderHook } from "@testing-library/react";

import { useGuest, useHost } from "../react";

describe("esdeka", () => {
	describe("useHost", () => {
		window.postMessage = jest.fn();
		const { result } = renderHook(() =>
			useHost(
				{
					current: { contentWindow: window } as unknown as HTMLIFrameElement,
				},
				"test"
			)
		);
		it("should call guests", async () => {
			result.current.call({ test: "works" });
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						payload: {
							test: "works",
						},
						type: "call",
					},
					channel: "test",
					client: "__ESDEKA::host__",
				},
				"*"
			);
		});
		it("should broadcast to guests", async () => {
			result.current.broadcast({ test: "works" });
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						payload: {
							test: "works",
						},
						type: "broadcast",
					},
					channel: "test",
					client: "__ESDEKA::host__",
				},
				"*"
			);
		});
		// This does not work
		// Needs investigation
		// it("should receive messages from guests", async () => {
		// 	const callback = jest.fn();
		// 	result.current.subscribe(callback);
		// 	answer(window, "test");
		// 	await waitFor(() => {
		// 		expect(callback).toHaveBeenCalledWith({
		// 			action: {
		// 				type: "answer",
		// 			},
		// 			channel: "test",
		// 			client: "__ESDEKA::guest__",
		// 		});
		// 	});
		// });
	});
	describe("useGuest", () => {
		window.postMessage = jest.fn();
		const { result } = renderHook(() =>
			useGuest(
				{
					current: window,
				},
				"test"
			)
		);
		it("should answer hosts", async () => {
			result.current.answer();
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						type: "answer",
					},
					channel: "test",
					client: "__ESDEKA::guest__",
				},
				"*"
			);
		});
		it("should dispatch to hosts without payload", async () => {
			result.current.dispatch({ type: "increment" });
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						type: "increment",
					},
					channel: "test",
					client: "__ESDEKA::guest__",
				},
				"*"
			);
		});
		it("should dispatch to hosts with payload", async () => {
			result.current.dispatch({
				type: "greet",
				payload: {
					message: "hello",
				},
			});
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						type: "greet",
						payload: {
							message: "hello",
						},
					},
					channel: "test",
					client: "__ESDEKA::guest__",
				},
				"*"
			);
		});
		it("should disconnect from hosts", async () => {
			result.current.disconnect();
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						type: "disconnect",
					},
					channel: "test",
					client: "__ESDEKA::guest__",
				},
				"*"
			);
		});
		// This does not work
		// Needs investigation
		// it("should receive messages from guests", async () => {
		// 	const callback = jest.fn();
		// 	result.current.subscribe(callback);
		// 	call(window, "test", {
		// 		message: "hello",
		// 	});
		// 	await waitFor(() => {
		// 		expect(callback).toHaveBeenCalledWith({
		// 			action: {
		// 				type: "call",
		// 				payload: {
		// 					message: "hello",
		// 				},
		// 			},
		// 			channel: "test",
		// 			client: "__ESDEKA::host__",
		// 		});
		// 	});
		// });
	});
});
