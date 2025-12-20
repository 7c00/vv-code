import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useVVAuth } from "@/hooks/useVVAuth"
import VVUsageGuideView from "./VVUsageGuideView"

type OnboardingStep = "welcome" | "usageGuide"

const VVWelcomeView = () => {
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
	const { isAuthenticated, isLoggingIn, login, user } = useVVAuth()

	// 欢迎页
	if (currentStep === "welcome") {
		return (
			<div className="fixed inset-0 p-0 flex flex-col w-full bg-background">
				<div className="h-full flex flex-col items-center justify-center">
					{/* Logo - 极简设计，更大的尺寸 */}
					<div className="size-32 rounded-full bg-button-background flex items-center justify-center mb-16 shadow-sm">
						<span className="text-5xl font-light tracking-wider text-white">VV</span>
					</div>

					{/* 品牌名称 - 简洁优雅 */}
					<h1 className="text-4xl font-extralight text-foreground mb-8 tracking-wide">VV Code</h1>

					{/* 品牌介绍 - 极简文案 */}
					<p className="text-base font-light text-foreground/60 text-center max-w-sm mb-8 leading-relaxed">
						AI 驱动的智能编程助手
					</p>

					{/* 登录状态/按钮 */}
					{isAuthenticated && user ? (
						<div className="mb-8 text-center">
							<p className="text-sm text-foreground/70 mb-2">
								欢迎回来，<span className="font-medium">{user.username}</span>
							</p>
						</div>
					) : (
						<Button
							className="px-10 py-5 text-sm font-normal rounded-full mb-8"
							disabled={isLoggingIn}
							onClick={login}
							variant="outline">
							{isLoggingIn ? (
								<>
									<span className="codicon codicon-loading codicon-modifier-spin mr-2"></span>
									正在跳转浏览器...
								</>
							) : (
								<>
									<span className="codicon codicon-sign-in mr-2"></span>
									登录 VVCode 账号
								</>
							)}
						</Button>
					)}

					{/* 开始按钮 - 简洁设计 */}
					<Button
						className="px-12 py-6 text-base font-normal rounded-full"
						onClick={() => setCurrentStep("usageGuide")}
						variant="default">
						开始体验
					</Button>
				</div>
			</div>
		)
	}

	// 使用指南页
	return <VVUsageGuideView />
}

export default VVWelcomeView
