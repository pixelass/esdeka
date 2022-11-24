import {
	PublicStoreModel,
	SdkModel,
	Selector,
	WidgetModel,
	useSdk as useEsdeka,
	useSdkStore as useEsdekaStore,
} from "esdeka";

import { CounterStore } from "./example-store";

export type PublicCounterStore = CounterStore & PublicStoreModel;

/**
 * A custom SdkModel, which is needed ty add full type support to your hooks.
 */
export type CustomSdkModel<Data = any> = SdkModel<
	WidgetModel<Data>,
	PublicCounterStore,
	{ primary: string; secondary: string }
>;

/**
 * An alias sdk hook with type mutation
 * @param selector
 */
export function useSdk<Return, Data, Input = CustomSdkModel<Data>>(
	selector: Selector<Input, Return>
) {
	return useEsdeka(selector as Selector<CustomSdkModel<Data>, Return>);
}

/**
 * An alias to the sdkStore hook with type mutation
 * @param selector
 */
export function useSdkStore<U, T = PublicCounterStore>(selector: Selector<T, U>) {
	return useEsdekaStore(selector as Selector<PublicCounterStore, U>);
}

export const SDK_KEY = "just-an-example-sdk";
