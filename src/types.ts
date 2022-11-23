import { HTMLAttributes, ReactNode } from "react";
import { StoreApi, UseBoundStore } from "zustand";

export interface WidgetModel<Data = any> {
	id: string;
	name: string;
	bgcolor?: string;
	widget: {
		__typename: string;
		data: Data & { src: string };
	};
}

export interface SdkModel<Data, Store, Theme> {
	store: UseBoundStore<StoreApi<Store>>;
	theme: Theme;
	data: Data;
}

export interface SdkContextModel<Data, Store, Theme> {
	sdk: SdkModel<Data, Store, Theme>;
}

export type Selector<Input, Return> = (input: Input) => Return;

export interface SdkProviderProps {
	sdkKey: string;
	children?: ReactNode;
	/**
	 * @default 10
	 */
	maxTries?: number;
	/**
	 * @default 100
	 */
	delay?: number;
	/**
	 * @default null
	 */
	fallback?: ReactNode;
}

interface CommonStoreModel<T = any> {
	widgets: Record<string, T>;
}

export interface StoreModel<T = any> extends CommonStoreModel<T> {
	setWidgetData(id: string, draft: T): void;
}

export interface PublicStoreModel<T = any> extends CommonStoreModel<T> {
	setWidgetData(draft: T): void;
}

export type SetStateInternal<T> = {
	_(
		partial:
			| T
			| Partial<T>
			| {
					_(state: T): T | Partial<T>;
			  }["_"],
		replace?: boolean | undefined
	): void;
}["_"];

export interface UseFrameWidgetProps<S, T, W> extends HTMLAttributes<HTMLIFrameElement> {
	data: WidgetModel<W>;
	store: UseBoundStore<StoreApi<S>>;
	theme: T;
}

export interface FrameWidgetProps<W> extends HTMLAttributes<HTMLIFrameElement> {
	sdkKey: string;
	data: WidgetModel<W>;
}
