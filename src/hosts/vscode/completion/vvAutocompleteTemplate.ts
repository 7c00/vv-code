// VVCode Customization: FIM template system
// Ported from Continue's AutocompleteTemplate.ts
// Supports standard FIM models for code completion

export interface VvAutocompleteTemplate {
	template: string
	stopTokens: string[]
}

// https://huggingface.co/stabilityai/stable-code-3b
const stableCodeFimTemplate: VvAutocompleteTemplate = {
	template: "<fim_prefix>{prefix}<fim_suffix>{suffix}<fim_middle>",
	stopTokens: ["<fim_prefix>", "<fim_suffix>", "<fim_middle>", "<file_sep>", "<|endoftext|>", "</fim_middle>", "</code>"],
}

// https://github.com/QwenLM/Qwen2.5-Coder
const qwenCoderFimTemplate: VvAutocompleteTemplate = {
	template: "<|fim_prefix|>{prefix}<|fim_suffix|>{suffix}<|fim_middle|>",
	stopTokens: [
		"<|endoftext|>",
		"<|fim_prefix|>",
		"<|fim_middle|>",
		"<|fim_suffix|>",
		"<|fim_pad|>",
		"<|repo_name|>",
		"<|file_sep|>",
		"<|im_start|>",
		"<|im_end|>",
	],
}

// https://www.ibm.com/granite/docs/models/granite#fim
const granite4FimTemplate: VvAutocompleteTemplate = {
	template: "<|fim_prefix|>{prefix}<|fim_suffix|>{suffix}<|fim_middle|>",
	stopTokens: ["<|end_of_text|>", "<|fim_prefix|>", "<|fim_middle|>", "<|fim_suffix|>", "<|fim_pad|>"],
}

const codestralFimTemplate: VvAutocompleteTemplate = {
	template: "[SUFFIX]{suffix}[PREFIX]{prefix}",
	stopTokens: ["[PREFIX]", "[SUFFIX]"],
}

// DeepSeek Coder
const deepseekFimTemplate: VvAutocompleteTemplate = {
	template: "<｜fim▁begin｜>{prefix}<｜fim▁hole｜>{suffix}<｜fim▁end｜>",
	stopTokens: ["<｜fim▁begin｜>", "<｜fim▁hole｜>", "<｜fim▁end｜>", "<｜end▁of▁sentence｜>"],
}

// Code Llama
const codeLlamaFimTemplate: VvAutocompleteTemplate = {
	template: "<PRE> {prefix} <SUF>{suffix} <MID>",
	stopTokens: ["<PRE>", "<SUF>", "<MID>", ""],
}

// StarCoder
const starCoderFimTemplate: VvAutocompleteTemplate = {
	template: "<fim_prefix>{prefix}<fim_suffix>{suffix}<fim_middle>",
	stopTokens: ["<fim_prefix>", "<fim_suffix>", "<fim_middle>", "<|endoftext|>", "<file_sep>"],
}

// Default generic template (matches Stable Code)
const genericFimTemplate: VvAutocompleteTemplate = stableCodeFimTemplate

/**
 * Get FIM template based on model name
 * @param modelName The model name (e.g., "deepseek-coder", "qwen", "codestral")
 * @returns FIM template with prompt format and stop tokens
 */
export function getTemplateForModel(modelName: string): VvAutocompleteTemplate {
	const lowerModel = modelName.toLowerCase()

	if (lowerModel.includes("deepseek")) {
		return deepseekFimTemplate
	}
	if (lowerModel.includes("qwen")) {
		return qwenCoderFimTemplate
	}
	if (lowerModel.includes("granite")) {
		return granite4FimTemplate
	}
	if (lowerModel.includes("codestral")) {
		return codestralFimTemplate
	}
	if (lowerModel.includes("llama") || lowerModel.includes("code-llama")) {
		return codeLlamaFimTemplate
	}
	if (lowerModel.includes("starcoder") || lowerModel.includes("star-coder")) {
		return starCoderFimTemplate
	}

	// Default to generic (Stable Code format)
	return genericFimTemplate
}

/**
 * Render FIM prompt from template
 * @param template FIM template
 * @param prefix Code before cursor
 * @param suffix Code after cursor
 * @returns Rendered prompt string
 */
export function renderFimPrompt(template: VvAutocompleteTemplate, prefix: string, suffix: string): string {
	return template.template.replace("{prefix}", prefix).replace("{suffix}", suffix)
}
