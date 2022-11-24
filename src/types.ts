export interface Action<Payload = any> {
	type: string;
	payload?: Payload;
}

export interface MessageData<Payload = any> {
	client: string;
	channel: string;
	action: Action<Payload>;
}

export interface Clients {
	host: string;
	guest: string;
}

export interface MessageCallback<Data> {
	(event: MessageEvent<MessageData<Data>>): void;
}
