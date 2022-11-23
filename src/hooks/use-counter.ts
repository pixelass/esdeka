import { useCallback, useState } from "react";

/**
 * A hook to count a number up or down.
 * Allows to set an initial value and set a definite value.
 * All exported methods are memoized and can be used in dependency arrays.
 *
 * @param [initialValue=0]
 * The initial value of the counter.
 *
 * @example - Initial value
 * const { count } = useCounter(420);
 * console.log(count); // 420
 *
 * @example - Dependency array
 * const { increment } = useCounter();
 * // Increment once on mount.
 * useEffect(() => {
 *     increment();
 * }, [increment])
 */
export default function useCounter(initialValue = 0) {
	const [count, setCount] = useState(initialValue);

	const increment = useCallback(() => {
		setCount(previousState => previousState + 1);
	}, []);

	const decrement = useCallback(() => {
		setCount(previousState => previousState - 1);
	}, []);

	const setCount_ = useCallback((value: number) => {
		setCount(value);
	}, []);

	return { count, increment, decrement, setCount: setCount_ };
}
