import useCounter from "./hooks/use-counter";

export interface CounterProps {
	/**
	 * @default 0
	 */
	initialValue?: number;
}

export default function Counter({ initialValue = 0 }: CounterProps) {
	const { count, decrement, increment, setCount } = useCounter(initialValue);
	return (
		<div>
			<button aria-label="Decrement" onClick={decrement}>
				-
			</button>
			<input
				type="number"
				value={count.toString()}
				aria-label="Count"
				onChange={event => {
					setCount(parseInt(event.target.value || "0"));
				}}
			/>
			<button aria-label="Increment" onClick={increment}>
				+
			</button>
		</div>
	);
}
