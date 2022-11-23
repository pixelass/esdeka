/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Counter from "./counter";

describe("Counter", () => {
	test("should have two buttons", async () => {
		render(<Counter />);

		const buttons = await screen.getAllByRole("button");
		expect(buttons).toHaveLength(2);
	});

	test("should increment the counter if Increment is pressed", async () => {
		render(<Counter />);

		const input = await screen.getByLabelText("Count");

		await act(async () => {
			await userEvent.click(screen.getByLabelText("Increment"));
		});

		expect(input).toHaveValue(1);
	});

	test("should increment the counter if Decrement is pressed", async () => {
		render(<Counter />);

		const input = await screen.getByLabelText("Count");

		await act(async () => {
			await userEvent.click(screen.getByLabelText("Decrement"));
		});

		expect(input).toHaveValue(-1);
	});

	test("should set the counter if the input value is changed", async () => {
		render(<Counter />);

		const nextValue = 420;
		const input = await screen.getByLabelText("Count");

		await act(async () => {
			await userEvent.type(input, nextValue.toString());
		});

		expect(input).toHaveValue(nextValue);
	});
});
