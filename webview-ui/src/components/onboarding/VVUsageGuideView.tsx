import { useEffect } from "react"
import { StateServiceClient } from "@/services/grpc-client"

const VVUsageGuideView = () => {
	useEffect(() => {
		// 页面加载时自动标记欢迎流程完成
		StateServiceClient.setWelcomeViewCompleted({ value: true }).catch(() => {})
	}, [])

	return (
		<div className="fixed inset-0 p-0 flex flex-col w-full bg-background">
			<div className="h-full flex flex-col items-center justify-center px-8">
				{/* 标题 */}
				<h1 className="text-3xl font-extralight text-foreground mb-8 tracking-wide">快速开始</h1>

				{/* 描述 */}
				<p className="text-sm font-light text-foreground/60 text-center max-w-md mb-10 leading-relaxed">
					AI 驱动的智能编程助手，所有操作安全可控
				</p>

				{/* 使用指南卡片 */}
				<div className="w-full max-w-md space-y-5">
					{/* 核心功能 */}
					<div className="border border-border/50 rounded-lg p-5 bg-background/50">
						<h2 className="text-base font-normal text-foreground mb-3">✨ 核心功能</h2>
						<ul className="space-y-1.5 text-sm text-foreground/70">
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>智能代码生成与重构</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>文件操作与终端集成</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>浏览器自动化测试</span>
							</li>
						</ul>
					</div>

					{/* 如何使用 */}
					<div className="border border-border/50 rounded-lg p-5 bg-background/50">
						<h2 className="text-base font-normal text-foreground mb-3">🚀 如何使用</h2>
						<ol className="space-y-1.5 text-sm text-foreground/70">
							<li className="flex items-start">
								<span className="mr-2 font-medium">1.</span>
								<span>在聊天框输入您的需求</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 font-medium">2.</span>
								<span>审核 AI 提供的解决方案</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 font-medium">3.</span>
								<span>批准后应用更改</span>
							</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	)
}

export default VVUsageGuideView
