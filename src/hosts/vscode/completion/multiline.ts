// VVCode Customization: Multiline completion classification
// Ported from Continue's shouldCompleteMultiline logic

import { VvHelperVars } from "./vvHelperVars"

/**
 * Configuration for multiline completions
 * - "always": Always generate multiline completions
 * - "never": Never generate multiline completions
 * - "auto": Decide based on context (default)
 */
export type MultilineCompletionMode = "always" | "never" | "auto"

/**
 * Determine if completion should be multiline or single-line
 * Ported from Continue's classification logic
 *
 * @param helper Helper variables with context
 * @param mode Multiline mode configuration
 * @returns true for multiline, false for single-line
 */
export function shouldCompleteMultiline(helper: VvHelperVars, mode: MultilineCompletionMode = "auto"): boolean {
	// Respect explicit configuration
	if (mode === "always") {
		return true
	}
	if (mode === "never") {
		return false
	}

	// Always single-line if intellisense option selected
	if (helper.selectedCompletionInfo) {
		return false
	}

	// Don't complete multi-line for single-line comments
	if (helper.lang.singleLineComment) {
		const lastLine = helper.fullPrefix.split("\n").slice(-1)[0]
		if (lastLine?.trimStart().startsWith(helper.lang.singleLineComment)) {
			return false
		}
	}

	// Use language-specific multiline logic if available
	if (helper.lang.useMultiline) {
		return helper.lang.useMultiline({
			prefix: helper.prunedPrefix,
			suffix: helper.prunedSuffix,
		})
	}

	// Default: allow multiline
	return true
}
