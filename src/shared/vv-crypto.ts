// VVCode Customization: PKCE 加密工具
// Created: 2025-12-20

import * as crypto from "crypto"

/**
 * 生成加密安全的随机字符串
 * @param length 字符串长度
 * @returns Base64URL 编码的随机字符串
 */
export function generateRandomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
	let result = ""
	const randomBytes = crypto.randomBytes(length)

	for (let i = 0; i < length; i++) {
		result += chars[randomBytes[i] % chars.length]
	}

	return result
}

/**
 * 生成 PKCE code_verifier (RFC 7636)
 * @returns 43-128 个字符的随机字符串
 */
export function generateCodeVerifier(): string {
	return generateRandomString(64) // 推荐长度
}

/**
 * 生成 PKCE code_challenge (RFC 7636)
 * 使用 S256 方法：BASE64URL(SHA256(code_verifier))
 * @param codeVerifier code_verifier 字符串
 * @returns Base64URL 编码的 SHA256 哈希值
 */
export function generateCodeChallenge(codeVerifier: string): string {
	const hash = crypto.createHash("sha256").update(codeVerifier).digest("base64")

	// 转换为 Base64URL 编码
	return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

/**
 * 生成 CSRF 防护的 state 参数
 * @returns 32 个字符的随机字符串
 */
export function generateState(): string {
	return generateRandomString(32)
}
