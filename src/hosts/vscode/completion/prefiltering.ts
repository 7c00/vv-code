// VVCode Customization: Prefiltering logic to skip completions
// Ported from Continue's prefiltering logic
// Created: 2025-12-30

import * as vscode from "vscode"

/**
 * Determine if completion should be skipped for this document/position
 * @param document Current text document
 * @param position Current cursor position
 * @returns true if should skip completion
 */
export function shouldSkipCompletion(document: vscode.TextDocument, position: vscode.Position): boolean {
	const filepath = document.uri.fsPath

	// Skip in config files
	if (filepath.includes("config.json") || filepath.includes("settings.json")) {
		return true
	}

	// Skip in untitled empty files
	if (document.isUntitled && document.getText().trim() === "") {
		return true
	}

	// Skip in certain file patterns
	const skipPatterns = [/\.prompt$/, /\.continueignore$/, /\.gitignore$/]

	for (const pattern of skipPatterns) {
		if (pattern.test(filepath)) {
			return true
		}
	}

	return false
}
