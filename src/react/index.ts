import { RefObject, useCallback } from "react";

import {
	broadcast as broadcast_,
	subscribe as subscribe_,
	connect as connect_,
	connected as connected_,
	disconnect as disconnect_,
	dispatch as dispatch_,
} from "../index";
import { Action, MessageCallback } from "../types";

export * from "../types";
export { subscribe } from "../index";

export function useHost(ref: RefObject<HTMLIFrameElement>, channel: string) {
	const broadcast = useCallback(
		<Payload>(payload: Payload) => {
			broadcast_(ref.current.contentWindow, channel, payload);
		},
		[channel]
	);

	const connect = useCallback(
		<Payload>(payload: Payload) => {
			connect_(ref.current.contentWindow, channel, payload);
		},
		[channel]
	);

	const subscribe = useCallback(
		<Payload>(callback: MessageCallback<Payload>) => {
			subscribe_(channel, callback);
		},
		[channel]
	);

	return {
		broadcast,
		connect,
		subscribe,
	};
}

export function useGuest(ref: RefObject<Window>, channel: string) {
	const connected = useCallback(
		(window_: Window) => {
			connected_(window_, channel);
		},
		[channel]
	);

	const disconnect = useCallback(() => {
		disconnect_(ref.current, channel);
	}, [channel]);

	const dispatch = useCallback(
		<Payload>(action: Action<Payload>) => {
			dispatch_(ref.current, channel, action);
		},
		[channel]
	);

	const subscribe = useCallback(
		<Payload>(callback: MessageCallback<Payload>) => {
			subscribe_(channel, callback);
		},
		[channel]
	);

	return {
		connected,
		disconnect,
		dispatch,
		subscribe,
	};
}
