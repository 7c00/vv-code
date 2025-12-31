// VVCode Customization: Process single-line completion
// Based on Continue's implementation
// Created: 2025-12-30

import * as Diff from "diff"

interface SingleLineCompletionResult {
	completionText: string
	range?: {
		start: number
		end: number
	}
}

interface DiffType {
	count?: number
	added?: boolean
	removed?: boolean
	value: string
}

type DiffPartType = "+" | "-" | "="

function diffPatternMatches(diffs: DiffType[], pattern: DiffPartType[]): boolean {
	if (diffs.length !== pattern.length) {
		return false
	}

	for (let i = 0; i < diffs.length; i++) {
		const diff = diffs[i]
		const diffPartType: DiffPartType = !diff.added && !diff.removed ? "=" : diff.added ? "+" : "-"

		if (diffPartType !== pattern[i]) {
			return false
		}
	}

	return true
}

export function processSingleLineCompletion(
	lastLineOfCompletionText: string,
	currentText: string,
	cursorPosition: number,
): SingleLineCompletionResult | undefined {
	const diffs: DiffType[] = Diff.diffWords(currentText, lastLineOfCompletionText)

	console.log("[VvCompletion] ===== Diff 详细分析 =====")
	console.log("[VvCompletion]   currentText (光标后到行尾):", JSON.stringify(currentText))
	console.log("[VvCompletion]   lastLineOfCompletionText:", JSON.stringify(lastLineOfCompletionText))
	console.log("[VvCompletion]   cursorPosition:", cursorPosition)
	console.log(
		"[VvCompletion]   Diff 结果:",
		diffs.map((d) => ({ value: JSON.stringify(d.value), added: d.added, removed: d.removed })),
	)

	if (diffPatternMatches(diffs, ["+"])) {
		// Just insert, we're already at the end of the line
		console.log("[VvCompletion] 📝 模式 [+]: 简单插入")
		console.log("[VvCompletion]   返回: completionText =", JSON.stringify(lastLineOfCompletionText))
		console.log("[VvCompletion]   返回: range = undefined (使用默认空范围)")
		return {
			completionText: lastLineOfCompletionText,
		}
	}

	if (diffPatternMatches(diffs, ["+", "="]) || diffPatternMatches(diffs, ["+", "=", "+"])) {
		// The model repeated the text after the cursor to the end of the line
		console.log("[VvCompletion] 📝 模式 [+,=] 或 [+,=,+]: 模型重复了后缀")
		console.log("[VvCompletion]   返回: completionText =", JSON.stringify(lastLineOfCompletionText))
		console.log("[VvCompletion]   返回: range = { start:", cursorPosition, ", end:", currentText.length + cursorPosition, "}")
		return {
			completionText: lastLineOfCompletionText,
			range: {
				start: cursorPosition,
				end: currentText.length + cursorPosition,
			},
		}
	}

	if (diffPatternMatches(diffs, ["+", "-"]) || diffPatternMatches(diffs, ["-", "+"])) {
		// We are midline and the model just inserted without repeating to the end of the line
		console.log("[VvCompletion] 📝 模式 [+,-] 或 [-,+]: 行中插入")
		console.log("[VvCompletion]   返回: completionText =", JSON.stringify(lastLineOfCompletionText))
		console.log("[VvCompletion]   返回: range = undefined (使用默认空范围)")
		console.log("[VvCompletion]   ⚠️  注意：这会在光标位置插入，不会删除 currentText")
		return {
			completionText: lastLineOfCompletionText,
		}
	}

	// For any other diff pattern, just use the first added part if available
	if (diffs[0]?.added) {
		console.log("[VvCompletion] 📝 使用 diff 中的第一个新增部分")
		console.log("[VvCompletion]   返回: completionText =", JSON.stringify(diffs[0].value))
		return {
			completionText: diffs[0].value,
		}
	}

	// Default case: treat as simple insertion
	console.log("[VvCompletion] 📝 默认：作为简单插入处理")
	console.log("[VvCompletion]   返回: completionText =", JSON.stringify(lastLineOfCompletionText))
	return {
		completionText: lastLineOfCompletionText,
	}
}
