import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useDebouncedInput } from "../utils/useDebouncedInput"

/**
 * Props for the ApiKeyField component
 */
interface ApiKeyFieldProps {
	initialValue: string
	onChange: (value: string) => void
	providerName: string
	signupUrl?: string
	placeholder?: string
	helpText?: string
}

/**
 * A reusable component for API key input fields with standard styling and help text for signing up for key
 */
export const ApiKeyField = ({
	initialValue,
	onChange,
	providerName,
	signupUrl,
	placeholder = "Enter API Key...",
	helpText,
}: ApiKeyFieldProps) => {
	const [localValue, setLocalValue] = useDebouncedInput(initialValue, onChange)
	const [showKey, setShowKey] = useState(false)

	return (
		<div>
			<div style={{ position: "relative" }}>
				<VSCodeTextField
					onInput={(e: any) => setLocalValue(e.target.value)}
					placeholder={placeholder}
					required={true}
					style={{ width: "100%" }}
					type={showKey ? "text" : "password"}
					value={localValue}>
					<span style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
						{providerName} API Key
						{localValue && (
							<button
								onClick={() => setShowKey(!showKey)}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
									padding: "2px",
									color: "var(--vscode-descriptionForeground)",
									display: "flex",
									alignItems: "center",
								}}
								title={showKey ? "隐藏" : "显示"}
								type="button">
								{showKey ? <EyeOff size={14} /> : <Eye size={14} />}
							</button>
						)}
					</span>
				</VSCodeTextField>
			</div>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{helpText || "This key is stored locally and only used to make API requests from this extension."}
				{!localValue && signupUrl && (
					<VSCodeLink
						href={signupUrl}
						style={{
							display: "inline",
							fontSize: "inherit",
						}}>
						You can get a{/^[aeiou]/i.test(providerName) ? "n" : ""} {providerName} API key by signing up here.
					</VSCodeLink>
				)}
			</p>
		</div>
	)
}
