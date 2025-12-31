// VVCode Customization: Line-level stream filters
// Ported from Continue's lineStream.ts
// Filters completion stream at line level

import * as levenshtein from "fast-levenshtein"

/**
 * Helper to convert character stream to line stream
 */
export async function* streamLines(charStream: AsyncGenerator<string>): AsyncGenerator<string> {
	let buffer = ""

	for await (const chunk of charStream) {
		buffer += chunk

		// Yield complete lines
		while (buffer.includes("\n")) {
			const newlineIndex = buffer.indexOf("\n")
			const line = buffer.substring(0, newlineIndex)
			buffer = buffer.substring(newlineIndex + 1)
			yield line
		}
	}

	// Yield remaining buffer as final line
	if (buffer.length > 0) {
		yield buffer
	}
}

/**
 * Re-add newlines to line stream
 */
export async function* streamWithNewLines(lineStream: AsyncGenerator<string>): AsyncGenerator<string> {
	let isFirst = true
	for await (const line of lineStream) {
		if (!isFirst) {
			yield "\n"
		}
		isFirst = false
		yield line
	}
}

/**
 * Check if two lines are similar (repeated)
 * Uses Levenshtein distance
 */
export function lineIsRepeated(a: string, b: string): boolean {
	if (a.length <= 4 || b.length <= 4) {
		return false
	}

	const aTrim = a.trim()
	const bTrim = b.trim()
	const distance = levenshtein.get(aTrim, bTrim)
	return distance / bTrim.length < 0.1 // Less than 10% difference
}

/**
 * Stop when lines start repeating (3+ consecutive similar lines)
 */
export async function* stopAtRepeatingLines(stream: AsyncGenerator<string>, fullStop: () => void): AsyncGenerator<string> {
	let previousLine: string | undefined
	let repeatCount = 0
	const MAX_REPEATS = 3

	for await (const line of stream) {
		if (previousLine && lineIsRepeated(line, previousLine)) {
			repeatCount++
			if (repeatCount >= MAX_REPEATS) {
				fullStop()
				return
			}
		} else {
			repeatCount = 0
		}

		yield line
		previousLine = line
	}
}

/**
 * Avoid double newlines (two consecutive empty lines)
 */
export async function* noDoubleNewLine(stream: AsyncGenerator<string>): AsyncGenerator<string> {
	let previousWasEmpty = false

	for await (const line of stream) {
		const isEmpty = line.trim().length === 0

		if (isEmpty && previousWasEmpty) {
			continue // Skip second empty line
		}

		yield line
		previousWasEmpty = isEmpty
	}
}

/**
 * Stop at similar line to the line below cursor
 * Prevents regenerating existing code
 */
export async function* stopAtSimilarLine(
	stream: AsyncGenerator<string>,
	lineBelowCursor: string,
	fullStop: () => void,
): AsyncGenerator<string> {
	if (lineBelowCursor.trim().length === 0) {
		for await (const line of stream) {
			yield line
		}
		return
	}

	for await (const line of stream) {
		if (lineIsRepeated(line, lineBelowCursor)) {
			fullStop()
			return
		}
		yield line
	}
}

/**
 * Avoid generating empty comments (e.g., "//", "#", etc.)
 */
export async function* avoidEmptyComments(
	stream: AsyncGenerator<string>,
	singleLineComment: string | undefined,
): AsyncGenerator<string> {
	if (!singleLineComment) {
		for await (const line of stream) {
			yield line
		}
		return
	}

	for await (const line of stream) {
		const trimmed = line.trim()
		if (trimmed === singleLineComment || trimmed === singleLineComment + " ") {
			continue // Skip empty comment lines
		}
		yield line
	}
}

/**
 * Stop when reaching certain syntax patterns that indicate completion should end
 * E.g., closing brackets at lower indentation, markdown code blocks, etc.
 */
export async function* stopAtLines(stream: AsyncGenerator<string>, fullStop: () => void): AsyncGenerator<string> {
	let firstLine = true
	let firstLineIndentation = 0

	for await (const line of stream) {
		// Calculate indentation
		const indentation = line.length - line.trimStart().length

		if (firstLine) {
			firstLineIndentation = indentation
			firstLine = false
			yield line
			continue
		}

		const trimmed = line.trim()

		// Stop at markdown code block markers
		if (trimmed.startsWith("```")) {
			fullStop()
			return
		}

		// Stop at closing brackets with less indentation (end of block)
		if (indentation < firstLineIndentation && /^[}\])]/.test(trimmed)) {
			fullStop()
			return
		}

		yield line
	}
}
