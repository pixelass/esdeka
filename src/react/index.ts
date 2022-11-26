import { RefObject, useCallback } from "react";

import {
	broadcast as broadcast_,
	subscribe as subscribe_,
	call as call_,
	answer as answer_,
	disconnect as disconnect_,
	dispatch as dispatch_,
} from "../";
import { Action, MessageCallback } from "../types";

export * from "../types";
export { serialize } from "../";

export function useHost(ref: RefObject<HTMLIFrameElement>, channel: string, targetOrigin = "*") {
	const broadcast = useCallback(
		<Payload>(payload: Payload) => {
			broadcast_(ref.current.contentWindow, channel, payload, targetOrigin);
		},
		[channel, targetOrigin]
	);

	const call = useCallback(
		<Payload>(payload: Payload) => {
			call_(ref.current.contentWindow, channel, payload, targetOrigin);
		},
		[channel, targetOrigin]
	);

	const subscribe = useCallback(
		<Payload>(callback: MessageCallback<Payload>) => subscribe_(channel, callback),
		[channel]
	);

	return {
		broadcast,
		call,
		subscribe,
	};
}

export function useGuest(ref: RefObject<Window>, channel: string, targetOrigin = "*") {
	const answer = useCallback(() => {
		answer_(ref.current, channel, targetOrigin);
	}, [channel, targetOrigin]);

	const disconnect = useCallback(() => {
		disconnect_(ref.current, channel, targetOrigin);
	}, [channel, targetOrigin]);

	const dispatch = useCallback(
		<Payload>(action: Action<Payload>) => {
			dispatch_(ref.current, channel, action, targetOrigin);
		},
		[channel, targetOrigin]
	);

	const subscribe = useCallback(
		<Payload>(callback: MessageCallback<Payload>) => subscribe_(channel, callback),
		[channel]
	);

	return {
		answer,
		disconnect,
		dispatch,
		subscribe,
	};
}
