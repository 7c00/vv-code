import { useState } from "react"
import { useApiConfigurationHandlers } from "@/components/settings/utils/useApiConfigurationHandlers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface VVApiConfigViewProps {
	onComplete: () => void
}

// 固定的 Base URL
const FIXED_BASE_URL = "http://vvcode.top/"

const VVApiConfigView = ({ onComplete }: VVApiConfigViewProps) => {
	const [apiKey, setApiKey] = useState("")
	const [isSaving, setIsSaving] = useState(false)
	const { handleFieldsChange } = useApiConfigurationHandlers()

	const handleSave = async () => {
		if (apiKey.trim()) {
			try {
				setIsSaving(true)
				// 保存 API Key 和固定的 Base URL 到配置中
				await handleFieldsChange({
					apiKey: apiKey.trim(),
					anthropicBaseUrl: FIXED_BASE_URL,
					actModeApiProvider: "anthropic",
					planModeApiProvider: "anthropic",
					actModeApiModelId: "claude-sonnet-4-5-20250929",
					planModeApiModelId: "claude-sonnet-4-5-20250929",
				})
				// 跳转到下一页
				onComplete()
			} catch (error) {
				console.error("Failed to save API configuration:", error)
			} finally {
				setIsSaving(false)
			}
		}
	}

	return (
		<div className="fixed inset-0 p-0 flex flex-col w-full bg-background">
			<div className="h-full flex flex-col items-center justify-center px-8">
				{/* 标题 */}
				<h1 className="text-3xl font-extralight text-foreground mb-4 tracking-wide">配置 API Key</h1>

				{/* 描述 */}
				<p className="text-sm font-light text-foreground/60 text-center max-w-md mb-12 leading-relaxed">
					请输入您的 Anthropic API Key 以开始使用 VV Code
				</p>

				{/* 输入框 */}
				<div className="w-full max-w-md mb-8">
					<Input
						className="w-full px-4 py-3 text-base"
						disabled={isSaving}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="sk-ant-..."
						type="password"
						value={apiKey}
					/>
				</div>

				{/* 保存按钮 */}
				<Button
					className="w-full max-w-md py-6 text-base font-normal rounded-full"
					disabled={!apiKey.trim() || isSaving}
					onClick={handleSave}
					variant="default">
					{isSaving ? "保存中..." : "保存并继续"}
				</Button>

				{/* 底部提示 */}
				<p className="text-xs text-foreground/40 text-center mt-8 max-w-md">您可以随时在设置中修改 API Key 配置</p>
			</div>
		</div>
	)
}

export default VVApiConfigView
