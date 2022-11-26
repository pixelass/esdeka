import { RefObject, useCallback } from "react";

import {
	broadcast as broadcast_,
	subscribe as subscribe_,
	call as call_,
	answer as answer_,
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

	const call = useCallback(
		<Payload>(payload: Payload) => {
			call_(ref.current.contentWindow, channel, payload);
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
		call,
		subscribe,
	};
}

export function useGuest(ref: RefObject<Window>, channel: string) {
	const answer = useCallback(
		(window_: Window) => {
			answer_(window_, channel);
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
		answer,
		disconnect,
		dispatch,
		subscribe,
	};
}
