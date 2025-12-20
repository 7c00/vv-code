// VVCode Customization: VVCode 获取用户配置处理器
// Created: 2025-12-20

import { EmptyRequest } from "@shared/proto/cline/common"
import { VVUserConfig } from "@shared/proto/cline/vv_account"
import { VVAuthService } from "@/services/auth/vv/VVAuthService"
import { Controller } from "../index"

/**
 * 获取 VVCode 用户配置
 *
 * @param controller Controller 实例
 * @returns 用户配置
 */
export async function vvGetUserConfig(_controller: Controller, _: EmptyRequest): Promise<VVUserConfig> {
	const config = VVAuthService.getInstance().getUserConfig()

	return VVUserConfig.create({
		settings: config?.settings || [],
		features: config?.features || [],
		apiBaseUrl: config?.apiBaseUrl,
	})
}
