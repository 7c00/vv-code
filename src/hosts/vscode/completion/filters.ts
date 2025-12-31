// VVCode Customization: Completion postprocessing filters
// Ported from Continue's postprocessing logic
// Validates and cleans up completions before displaying

import * as levenshtein from "fast-levenshtein"

// ============================================================================
// BASIC VALIDATION
// ============================================================================

export function isBlank(completion: string): boolean {
	return completion.trim().length === 0
}

export function isOnlyWhitespace(completion: string): boolean {
	return /^[\s]+$/.test(completion)
}

// ============================================================================
// LINE REPETITION DETECTION
// ============================================================================

export function lineIsRepeated(a: string, b: string): boolean {
	if (a.length <= 4 || b.length <= 4) {
		return false
	}

	const aTrim = a.trim()
	const bTrim = b.trim()
	const distance = levenshtein.get(aTrim, bTrim)
	return distance / bTrim.length < 0.1 // Less than 10% difference
}

export function rewritesLineAbove(completion: string, prefix: string): boolean {
	const lineAbove = prefix
		.split("\n")
		.filter((line) => line.trim().length > 0)
		.slice(-1)[0]

	if (!lineAbove) {
		return false
	}

	const firstLineOfCompletion = completion.split("\n").find((line) => line.trim().length > 0)

	if (!firstLineOfCompletion) {
		return false
	}

	return lineIsRepeated(lineAbove, firstLineOfCompletion)
}

// ============================================================================
// EXTREME REPETITION DETECTION
// ============================================================================

function longestCommonSubsequence(a: string, b: string): string {
	const m = a.length
	const n = b.length
	const dp: number[][] = Array(m + 1)
		.fill(0)
		.map(() => Array(n + 1).fill(0))

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (a[i - 1] === b[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1] + 1
			} else {
				dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
			}
		}
	}

	// Reconstruct LCS
	let lcs = ""
	let i = m
	let j = n
	while (i > 0 && j > 0) {
		if (a[i - 1] === b[j - 1]) {
			lcs = a[i - 1] + lcs
			i--
			j--
		} else if (dp[i - 1][j] > dp[i][j - 1]) {
			i--
		} else {
			j--
		}
	}

	return lcs
}

export function isExtremeRepetition(completion: string): boolean {
	const lines = completion.split("\n")
	if (lines.length < 6) {
		return false
	}

	const MAX_REPETITION_FREQ_TO_CHECK = 3

	for (let freq = 1; freq < MAX_REPETITION_FREQ_TO_CHECK; freq++) {
		const lcs = longestCommonSubsequence(lines[0], lines[freq])
		if (lcs.length > 5 || lcs.length > lines[0].length * 0.5) {
			let matchCount = 0
			for (let i = 0; i < lines.length; i += freq) {
				if (lines[i].includes(lcs)) {
					matchCount++
				}
			}
			if (matchCount * freq > 8 || (matchCount * freq) / lines.length > 0.8) {
				return true
			}
		}
	}

	return false
}

// ============================================================================
// MARKDOWN CODE BLOCK REMOVAL
// ============================================================================

/**
 * Removes markdown code block delimiters from completion
 * Ported from Continue's postprocessing
 */
function removeBackticks(completion: string): string {
	const lines = completion.split("\n")

	if (lines.length === 0) {
		return completion
	}

	let startIdx = 0
	let endIdx = lines.length

	// Remove first line if it starts with backticks (``` or ```language)
	const firstLineTrimmed = lines[0].trim()
	if (firstLineTrimmed.startsWith("```")) {
		startIdx = 1
	}

	// Remove last line if it contains only backticks
	if (lines.length > startIdx) {
		const lastLineTrimmed = lines[lines.length - 1].trim()
		if (lastLineTrimmed.length > 0 && /^`+$/.test(lastLineTrimmed)) {
			endIdx = lines.length - 1
		}
	}

	// If we removed lines, return the modified completion
	if (startIdx > 0 || endIdx < lines.length) {
		return lines.slice(startIdx, endIdx).join("\n")
	}

	return completion
}

// ============================================================================
// MAIN POSTPROCESSING FUNCTION
// ============================================================================

/**
 * Postprocess completion after LLM generation
 * Ported from Continue's postprocessing logic
 * Applies generic filters (no model-specific fixes for standard FIM)
 */
export function postprocessCompletion(completion: string, prefix: string, suffix: string): string | undefined {
	// Don't return empty
	if (isBlank(completion)) {
		return undefined
	}

	// Don't return whitespace
	if (isOnlyWhitespace(completion)) {
		return undefined
	}

	// Don't return if it's just a repeat of the line above
	if (rewritesLineAbove(completion, prefix)) {
		return undefined
	}

	// Filter out repetitions of many lines in a row
	if (isExtremeRepetition(completion)) {
		return undefined
	}

	// Remove duplicate leading space if prefix ends with space
	if (prefix.endsWith(" ") && completion.startsWith(" ")) {
		completion = completion.slice(1)
	}

	// Remove markdown code block delimiters
	completion = removeBackticks(completion)

	return completion
}
