import { RefObject, useCallback, useEffect, useRef } from "react";

import { useSdkContext } from "./sdk";
import { FrameWidgetProps, UseFrameWidgetProps } from "./types";

export function useFrameWidget<S, T, W>(
	ref: RefObject<HTMLIFrameElement>,
	sdkKey: string,
	{ store, theme, data }: UseFrameWidgetProps<S, T, W>
) {
	useEffect(() => {
		const sdk = {
			store,
			theme,
			data,
		};
		const contentWindow = ref.current.contentWindow;
		contentWindow[sdkKey] = sdk;
		const event = new CustomEvent("sdk", { detail: sdk });
		contentWindow.dispatchEvent(event);
	}, [theme, store, data, sdkKey]);

	const handleLoad = useCallback(() => {
		const sdk = { store, theme, data };
		const contentWindow = ref.current.contentWindow;
		contentWindow[sdkKey] = sdk;
		const event = new CustomEvent("sdk", { detail: sdk });
		contentWindow.dispatchEvent(event);
	}, [theme, store, data, sdkKey]);

	return { handleLoad };
}

export function FrameWidget<W>({ sdkKey, data, ...props }: FrameWidgetProps<W>) {
	const ref = useRef<HTMLIFrameElement>(null);
	const {
		sdk: { theme, store },
	} = useSdkContext();
	const { handleLoad } = useFrameWidget(ref, sdkKey, { theme, store, data });
	return <iframe ref={ref} onLoad={handleLoad} src={data.widget.data.src} {...props} />;
}
