// VVCode Customization: Helper variables for autocomplete
// Simplified version based on Continue's HelperVars
// Caches commonly accessed variables to avoid redundant calculations

import * as vscode from "vscode"

export interface VvLanguageInfo {
	name: string
	singleLineComment?: string
	useMultiline?: (ctx: { prefix: string; suffix: string }) => boolean
}

/**
 * Get language info based on VSCode language ID
 */
function getLanguageInfo(languageId: string): VvLanguageInfo {
	const commentMap: Record<string, string> = {
		javascript: "//",
		typescript: "//",
		javascriptreact: "//",
		typescriptreact: "//",
		java: "//",
		c: "//",
		cpp: "//",
		csharp: "//",
		go: "//",
		rust: "//",
		swift: "//",
		kotlin: "//",
		scala: "//",
		php: "//",
		python: "#",
		ruby: "#",
		perl: "#",
		shell: "#",
		bash: "#",
		r: "#",
		yaml: "#",
		toml: "#",
		lua: "--",
		sql: "--",
		haskell: "--",
	}

	return {
		name: languageId,
		singleLineComment: commentMap[languageId],
	}
}

/**
 * Helper class that caches commonly used variables during autocomplete
 * Avoids redundant calculations and IDE calls
 */
export class VvHelperVars {
	public readonly lang: VvLanguageInfo
	public readonly fileContents: string
	public readonly fileLines: string[]
	public readonly fullPrefix: string
	public readonly fullSuffix: string
	public readonly prunedPrefix: string
	public readonly prunedSuffix: string
	public readonly pos: { line: number; character: number }

	private constructor(
		public readonly document: vscode.TextDocument,
		public readonly position: vscode.Position,
		public readonly selectedCompletionInfo: vscode.SelectedCompletionInfo | undefined,
		public readonly modelName: string,
	) {
		this.lang = getLanguageInfo(document.languageId)
		this.fileContents = document.getText()
		this.fileLines = this.fileContents.split("\n")

		const offset = document.offsetAt(position)
		this.fullPrefix = this.fileContents.substring(0, offset)
		this.fullSuffix = this.fileContents.substring(offset)

		// Prune prefix and suffix to reasonable lengths
		const { prunedPrefix, prunedSuffix } = this.prunePrefixSuffix()
		this.prunedPrefix = prunedPrefix
		this.prunedSuffix = prunedSuffix

		this.pos = {
			line: position.line,
			character: position.character,
		}
	}

	/**
	 * Create HelperVars instance
	 */
	static create(
		document: vscode.TextDocument,
		position: vscode.Position,
		selectedCompletionInfo: vscode.SelectedCompletionInfo | undefined,
		modelName: string,
	): VvHelperVars {
		return new VvHelperVars(document, position, selectedCompletionInfo, modelName)
	}

	/**
	 * Prune prefix and suffix to manageable token counts
	 * Based on Continue's token management logic
	 */
	private prunePrefixSuffix(): { prunedPrefix: string; prunedSuffix: string } {
		// For standard FIM models, use reasonable character limits
		// Roughly corresponds to ~2000 tokens for prefix, ~500 for suffix
		const maxPrefixChars = 8000 // ~2000 tokens
		const maxSuffixChars = 2000 // ~500 tokens

		let prunedPrefix = this.fullPrefix
		let prunedSuffix = this.fullSuffix

		// Prune prefix from top (keep bottom lines)
		if (prunedPrefix.length > maxPrefixChars) {
			prunedPrefix = prunedPrefix.substring(prunedPrefix.length - maxPrefixChars)
			// Trim to nearest newline to avoid partial lines
			const firstNewline = prunedPrefix.indexOf("\n")
			if (firstNewline > 0 && firstNewline < prunedPrefix.length / 2) {
				prunedPrefix = prunedPrefix.substring(firstNewline + 1)
			}
		}

		// Prune suffix from bottom (keep top lines)
		if (prunedSuffix.length > maxSuffixChars) {
			prunedSuffix = prunedSuffix.substring(0, maxSuffixChars)
			// Trim to nearest newline
			const lastNewline = prunedSuffix.lastIndexOf("\n")
			if (lastNewline > prunedSuffix.length / 2) {
				prunedSuffix = prunedSuffix.substring(0, lastNewline)
			}
		}

		return { prunedPrefix, prunedSuffix }
	}

	/**
	 * Get the line below the cursor (for similarity checks)
	 */
	getLineBelowCursor(): string {
		let lineBelowCursor = ""
		let i = 1
		while (lineBelowCursor.trim() === "" && this.pos.line + i < this.fileLines.length) {
			lineBelowCursor = this.fileLines[this.pos.line + i]
			i++
		}
		return lineBelowCursor
	}
}
