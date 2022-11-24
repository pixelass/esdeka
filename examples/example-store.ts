import { PublicStoreModel, StoreModel, storeSlice } from "esdeka";
import create from "zustand";

export interface CounterStore {
	counter: number;
	increment(): void;
	decrement(): void;
}

export type PublicCounterStore = CounterStore & PublicStoreModel;
export type InternalCounterStore = CounterStore & StoreModel;

/**
 * A custom store with a counter. Access to widgets is given by the storeSlice
 */
export const useStore = create<InternalCounterStore>(set => ({
	...storeSlice<StoreModel>(set),
	counter: 10,
	decrement() {
		set(state => ({ counter: state.counter - 1 }));
	},
	increment() {
		set(state => ({ counter: state.counter + 1 }));
	},
}));
