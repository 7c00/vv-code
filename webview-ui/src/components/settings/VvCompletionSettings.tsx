// VVCode Customization: Inline completion settings component (Simplified)
// Created: 2025-12-29
// Modified: 2025-12-29 - Simplified to only show enable/disable toggle

import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useState } from "react"
import { VvCompletionServiceClient } from "@/services/grpc-client"

/**
 * VVCode 代码补全设置组件（简化版）
 * 只显示启用/禁用开关
 */
export const VvCompletionSettings = () => {
	const [enabled, setEnabled] = useState(false)
	const [loading, setLoading] = useState(true)

	// Load settings on mount
	useEffect(() => {
		loadSettings()
	}, [])

	const loadSettings = async () => {
		try {
			setLoading(true)
			const response = await VvCompletionServiceClient.vvGetCompletionSettings({})
			setEnabled(response.enabled)
		} catch (error) {
			console.error("Failed to load completion settings:", error)
		} finally {
			setLoading(false)
		}
	}

	const toggleEnabled = useCallback(async (newEnabled: boolean) => {
		try {
			setEnabled(newEnabled)
			await VvCompletionServiceClient.vvUpdateCompletionSettings({
				enabled: newEnabled,
				provider: "openai", // Use OpenAI protocol
				modelId: "deepseek-chat", // Use deepseek-chat model
				debounceMs: 400,
				useGroupApiKey: true, // Use default group API key
			})
		} catch (error) {
			console.error("Failed to update completion settings:", error)
			// Revert on error
			setEnabled(!newEnabled)
		}
	}, [])

	if (loading) {
		return null // Don't show anything while loading
	}

	return (
		<div className="flex flex-col gap-3 p-4 border border-input-border rounded bg-input-background">
			{/* Title and Toggle */}
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<h4 className="text-sm font-medium mb-1 flex items-center gap-2">
						行内代码补全
						<span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-normal">Beta</span>
					</h4>
				</div>
				<VSCodeCheckbox checked={enabled} onChange={(e: any) => toggleEnabled(e.target.checked)} />
			</div>
		</div>
	)
}
