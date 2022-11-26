import { Action, Clients, MessageCallback } from "./types";

export * from "./types";

export const clients: Clients = {
	host: "__ESDEKA::host__",
	guest: "__ESDEKA::guest__",
};

// Shared communicators

export function subscribe<Payload>(channel: string, callback: MessageCallback<Payload>) {
	function handleMessage(event: MessageEvent) {
		if (
			event.data.client &&
			Object.values(clients).includes(event.data.client) &&
			event.data.channel === channel
		) {
			callback(event);
		}
	}
	window.addEventListener("message", handleMessage);

	return () => {
		window.removeEventListener("message", handleMessage);
	};
}

// Host communicators

export function call<Payload>(
	window_: Window,
	channel: string,
	payload: Payload,
	targetOrigin = "*"
) {
	window_.postMessage(
		{
			client: clients.host,
			channel,
			action: {
				type: "call",
				payload,
			},
		},
		targetOrigin
	);
}

export function broadcast<Payload>(
	window_: Window,
	channel: string,
	payload: Payload,
	targetOrigin = "*"
) {
	window_.postMessage(
		{
			client: clients.host,
			channel,
			action: {
				type: "broadcast",
				payload,
			},
		},
		targetOrigin
	);
}

// Guest communicators

export function answer(window_: Window, channel: string, targetOrigin = "*") {
	window_.postMessage(
		{
			client: clients.guest,
			channel,
			action: {
				type: "answer",
			},
		},
		targetOrigin
	);
}

export function disconnect(window_: Window, channel: string, targetOrigin = "*") {
	window_.postMessage(
		{
			client: clients.guest,
			channel,
			action: {
				type: "disconnect",
			},
		},
		targetOrigin
	);
}

export function dispatch<Payload>(
	window_: Window,
	channel: string,
	action: Action<Payload>,
	targetOrigin = "*"
) {
	window_.postMessage(
		{
			client: clients.guest,
			channel,
			action,
		},
		targetOrigin
	);
}

export function serialize(data: unknown) {
	return JSON.parse(JSON.stringify(data));
}
