import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
	PublicStoreModel,
	SdkContextModel,
	SdkModel,
	SdkProviderProps,
	Selector,
	StoreModel,
	WidgetModel,
} from "./types";

export const SdkContext = createContext({
	sdk: null,
});

export const { Provider: SdkContextProvider } = SdkContext;

export function useSdkContext<Widget extends WidgetModel, Store = StoreModel, Theme = any>() {
	return useContext<SdkContextModel<Widget, Store, Theme>>(SdkContext);
}

/**
 * Access to the entire SDK via selector
 * @param selector
 * @example
 * const data = useSdk(sdk => sdk.data);
 * const id = useSdk(sdk => sdk.data.id);
 */
export function useSdk<Widget extends WidgetModel, Store = StoreModel, Theme = any, Return = any>(
	selector: Selector<SdkModel<Widget, Store, Theme>, Return>
): Return {
	const context = useSdkContext<Widget, Store, Theme>();
	return selector(context.sdk);
}

/**
 * To prevent illegal hook calls we need to create a custom hook that subscribes to the main store.
 * The API is very limited and only allows a selector.
 * @param selector
 * @example
 * const count = useSdkStore(state => state.count)
 */
export function useSdkStore<Store extends PublicStoreModel, Return = any>(
	selector: Selector<Store, Return>
) {
	const store = useSdk(sdk => sdk.store);
	const id = useSdk(sdk => sdk.data.id);
	const [state, setState] = useState<StoreModel>(() => {
		const currentState = store.getState();
		return {
			...currentState,
			setWidgetData(draft) {
				return currentState.setWidgetData(id, draft);
			},
		};
	});

	useEffect(() => {
		const unsubscribe = store.subscribe(newState => {
			setState({
				...newState,
				setWidgetData(draft) {
					return newState.setWidgetData(id, draft);
				},
			});
		});
		return () => {
			unsubscribe();
		};
	}, [id, store]);

	return selector(state as Store);
}

/**
 * A provider for the SDK.
 * Gets the sdk from the window.
 * Renders fallback until the sdk is loaded
 * Performs retries until loaded or exhausted.
 * @param children
 * @param sdkKey
 * @param maxTries
 * @param delay
 * @param fallback
 * @example - Fallback
 * function App() {
 *   return (
 *   <SdkProvider sdkKey="MY_SDK" fallback="Loading SDK…">
 *     SDK loaded!
 *   </SdkProvider>
 *   );
 * }
 * @example - Retires
 * function App() {
 *   return (
 *   <SdkProvider sdkKey="MY_SDK" maxTries={100} delay={50}>
 *     SDK loaded!
 *   </SdkProvider>
 *   );
 * }
 */
export function SdkProvider({
	children,
	sdkKey,
	maxTries = 10,
	delay = 100,
	fallback = null,
}: SdkProviderProps) {
	// Options cannot be changed until remount
	const options = useRef({ delay, maxTries });
	const [tries, setTries] = useState(maxTries);
	const [sdk, setSdk] = useState(null);

	// Communicate SDK changes
	// Without this eventListener the child window does not register any updates
	// to the SDK.
	// On every event call the local state is updated, therefore communicating the
	// change to all descendants
	// The event is custom and triggered by the parent window
	useEffect(() => {
		function handleSdk(event) {
			setSdk(event.detail);
		}
		window.addEventListener("sdk", handleSdk);
		return () => {
			window.removeEventListener("sdk", handleSdk);
		};
	}, []);

	useEffect(() => {
		// Stop when the all tries are used or the sdk has been loaded.
		if (tries <= 0 || sdk) {
			return () => {
				/* Consistent behavior */
			};
		}
		// Set the sdk and trigger a rerun
		setSdk(window[sdkKey]);
		const timeout = setTimeout(() => {
			setTries(tries - 1);
		}, options.current.delay);
		return () => {
			clearTimeout(timeout);
		};
	}, [tries, sdk]);

	// Wait until the sdk is loaded.
	// Show the fallback until loaded.
	return sdk ? (
		<SdkContext.Provider value={{ sdk }}>{children}</SdkContext.Provider>
	) : (
		<>{fallback}</>
	);
}
