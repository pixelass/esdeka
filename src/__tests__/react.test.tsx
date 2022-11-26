import { renderHook, waitFor } from "@testing-library/react";

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
	});
	describe("useHost secure", () => {
		window.postMessage = jest.fn();
		const { result } = renderHook(() =>
			useHost(
				{
					current: { contentWindow: window } as unknown as HTMLIFrameElement,
				},
				"test",
				window.location.origin
			)
		);
		it("should call guests with the correct origin", async () => {
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
				window.location.origin
			);
		});
		it("should broadcast to guests with the correct origin", async () => {
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
				window.location.origin
			);
		});
		it("should receive messages from guests", async () => {
			const callback = jest.fn();
			window.postMessage = jest.fn(data => callback({ data }));
			result.current.subscribe(callback);
			window.postMessage(
				{
					client: "__ESDEKA::guest__",
					channel: "test",
					action: {
						type: "answer",
					},
				},
				window.location.origin
			);
			await waitFor(() => {
				expect(callback).toHaveBeenCalledWith({
					data: {
						client: "__ESDEKA::guest__",
						channel: "test",
						action: {
							type: "answer",
						},
					},
				});
			});
		});
	});
	describe("useGuest", () => {
		window.postMessage = jest.fn();
		const { result } = renderHook(() =>
			useGuest(
				{
					current: window,
				},
				"test",
				"*"
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
	});
	describe("useGuest secure", () => {
		window.postMessage = jest.fn();
		const { result } = renderHook(() =>
			useGuest(
				{
					current: window,
				},
				"test",
				window.location.origin
			)
		);
		it("should answer hosts with the correct origin", async () => {
			result.current.answer();
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						type: "answer",
					},
					channel: "test",
					client: "__ESDEKA::guest__",
				},
				window.location.origin
			);
		});
		it("should dispatch to hosts with the correct origin without payload", async () => {
			result.current.dispatch({ type: "increment" });
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						type: "increment",
					},
					channel: "test",
					client: "__ESDEKA::guest__",
				},
				window.location.origin
			);
		});
		it("should dispatch to hosts with the correct origin with payload", async () => {
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
				window.location.origin
			);
		});
		it("should disconnect from hosts with the correct origin", async () => {
			result.current.disconnect();
			expect(window.postMessage).toHaveBeenCalledWith(
				{
					action: {
						type: "disconnect",
					},
					channel: "test",
					client: "__ESDEKA::guest__",
				},
				window.location.origin
			);
		});
		it("should receive messages from guests", async () => {
			const callback = jest.fn();
			window.postMessage = jest.fn(data => callback({ data }));
			result.current.subscribe(callback);
			window.postMessage(
				{
					client: "__ESDEKA::host__",
					channel: "test",
					action: {
						type: "call",
						payload: {},
					},
				},
				window.location.origin
			);
			await waitFor(() => {
				expect(callback).toHaveBeenCalledWith({
					data: {
						client: "__ESDEKA::host__",
						channel: "test",
						action: {
							type: "call",
							payload: {},
						},
					},
				});
			});
		});
	});
});
