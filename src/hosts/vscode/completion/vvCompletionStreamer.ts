// VVCode Customization: Completion streaming with filters
// Ported from Continue's CompletionStreamer
// Coordinates LLM streaming and filter application

import OpenAI from "openai"
import { VvStreamTransformPipeline } from "./streamFilters/VvStreamTransformPipeline"
import { VvHelperVars } from "./vvHelperVars"

/**
 * Completion streamer that applies filters to LLM output
 */
export class VvCompletionStreamer {
	private streamTransformPipeline = new VvStreamTransformPipeline()

	/**
	 * Stream completion with all filters applied
	 * @param signal Abort signal for cancellation
	 * @param client OpenAI client
	 * @param model Model name
	 * @param prefix Code before cursor
	 * @param suffix Code after cursor
	 * @param maxTokens Max tokens to generate
	 * @param stopTokens Stop tokens from template
	 * @param helper Helper variables
	 * @returns Filtered character stream
	 */
	async *streamCompletionWithFilters(
		signal: AbortSignal,
		client: OpenAI,
		model: string,
		prefix: string,
		suffix: string,
		maxTokens: number,
		stopTokens: string[],
		helper: VvHelperVars,
	): AsyncGenerator<string> {
		// Full stop means to stop the LLM's generation
		let abortController: AbortController | undefined
		const fullStop = () => {
			abortController?.abort()
		}

		// Create a new abort controller for this request
		abortController = new AbortController()

		// Forward cancellation from original signal
		signal.addEventListener("abort", () => {
			fullStop()
		})

		// Call LLM with FIM (using OpenAI completions API)
		const generator = this.streamFim(client, model, prefix, suffix, maxTokens, abortController.signal)

		// Apply stream filters
		const transformedGenerator = this.streamTransformPipeline.transform(
			generator,
			prefix,
			suffix,
			stopTokens,
			fullStop,
			helper,
		)

		for await (const update of transformedGenerator) {
			if (signal.aborted) {
				return
			}
			yield update
		}
	}

	/**
	 * Call FIM completion API (non-streaming)
	 * Returns the complete result at once
	 * @private
	 */
	private async *streamFim(
		client: OpenAI,
		model: string,
		prefix: string,
		suffix: string,
		maxTokens: number,
		signal: AbortSignal,
	): AsyncGenerator<string> {
		try {
			// Prepare request parameters
			const requestParams = {
				model,
				prompt: prefix,
				suffix,
				max_tokens: maxTokens,
				temperature: 0.01, // Low temperature for deterministic completions
				stream: false as const, // Use non-streaming API
			}

			// Log request parameters
			console.log("[VvCompletion] LLM 请求参数:")
			console.log("[VvCompletion]   model:", requestParams.model)
			console.log("[VvCompletion]   prompt (前缀) 长度:", requestParams.prompt.length)
			console.log("[VvCompletion]   prompt (前缀) 最后 100 字符:", requestParams.prompt.slice(-100))
			console.log("[VvCompletion]   suffix (后缀) 长度:", requestParams.suffix.length)
			console.log("[VvCompletion]   suffix (后缀) 前 100 字符:", requestParams.suffix.slice(0, 100))
			console.log("[VvCompletion]   max_tokens:", requestParams.max_tokens)
			console.log("[VvCompletion]   temperature:", requestParams.temperature)

			// Call API with non-streaming
			const response = await client.completions.create(requestParams, {
				signal,
			})

			console.log("[VvCompletion] LLM 响应完成")
			console.log("[VvCompletion]   完整响应:", JSON.stringify(response, null, 2))

			const text = response.choices?.[0]?.text || ""

			console.log("[VvCompletion] 从 LLM 获取的原始文本:")
			console.log("[VvCompletion]   长度:", text.length)
			console.log("[VvCompletion]   前 200 字符:", text.slice(0, 200))

			// Yield the complete text at once
			if (text) {
				yield text
			}
		} catch (error: any) {
			if (error.name === "AbortError" || signal.aborted) {
				console.log("[VvCompletion] 请求被取消（正常）")
				return // Normal cancellation
			}
			console.error("[VvCompletion] LLM 请求错误:", error)
			console.error("[VvCompletion] 错误详情:", {
				name: error.name,
				message: error.message,
				stack: error.stack,
			})
			throw error
		}
	}
}
