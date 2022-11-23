import { produce } from "immer";

import { SetStateInternal, StoreModel } from "./types";

export function storeSlice<T extends StoreModel>(set: SetStateInternal<T>) {
	return {
		widgets: {},
		setWidgetData(id, callback) {
			set(
				produce<T>(draft => {
					draft.widgets[id] = draft.widgets[id] ?? {};
					callback(draft.widgets[id]);
				})
			);
		},
	};
}
