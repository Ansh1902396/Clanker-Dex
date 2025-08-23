import { z } from "zod"

// Social Media URL Schema
export const socialMediaUrlSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
})

// Metadata Schema
export const metadataSchema = z.object({
  auditUrls: z.array(z.string().url()).optional(),
  description: z.string().optional(),
  socialMediaUrls: z.array(socialMediaUrlSchema).optional(),
})

// Pool Config Schema
export const poolConfigSchema = z.object({
  pairedToken: z.string(),
  tickIfToken0IsNewToken: z.number(),
})

// Tags Schema
export const tagsSchema = z.object({
  champagne: z.boolean().optional(),
})

// Extensions Schema
export const extensionsSchema = z.object({
  fees: z.object({
    type: z.string(),
    baseFee: z.number().optional(),
    maxFee: z.number().optional(),
    clankerFee: z.number().optional(),
    pairedFee: z.number().optional(),
    hook_address: z.string().optional(),
  }).optional(),
  vault: z.object({
    amount: z.string(),
    lockup: z.object({
      startedAt: z.number(),
      lockDuration: z.number(),
      vestDuration: z.number(),
    }),
  }).optional(),
  devBuy: z.object({
    amount: z.string(),
    amountEth: z.string(),
    recipient: z.string(),
  }).optional(),
}).optional()

// User Schema (for related.user)
export const userSchema = z.object({
  fid: z.number(),
  username: z.string(),
  displayName: z.string().optional(),
  pfpUrl: z.string().url().optional(),
  bio: z.string().optional(),
}).optional()

// Market Schema (for related.market)
export const marketSchema = z.object({
  marketCap: z.number().optional(),
  price: z.number().optional(),
  priceChangePercent1h: z.number().optional(),
  priceChangePercent6h: z.number().optional(),
  priceChangePercent24h: z.number().optional(),
  priceChange24h: z.number().optional(), // Alternative field name
  volume24h: z.number().optional(),
  liquidity: z.number().optional(),
}).optional()

// Related Schema
export const relatedSchema = z.object({
  user: userSchema.optional(),
  market: marketSchema.optional(),
})

// Social Context Schema
export const socialContextSchema = z.object({
  platform: z.string(),
  messageId: z.string().optional(),
  channelId: z.string().optional(),
})

// Token Schema
export const tokenSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  last_indexed: z.string().optional(),
  admin: z.string().optional(),
  tx_hash: z.string(),
  contract_address: z.string(),
  name: z.string(),
  symbol: z.string(),
  description: z.string().optional().nullable(),
  supply: z.string(),
  img_url: z.string().optional().nullable(),
  pool_address: z.string().optional(),
  cast_hash: z.string().optional(),
  type: z.string(),
  pair: z.string(),
  chain_id: z.number(),
  metadata: z.record(z.any()).optional(), // More flexible metadata
  social_context: z.object({
    interface: z.string().optional(),
    platform: z.string().optional(),
    messageId: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  requestor_fid: z.number().optional(),
  deployed_at: z.string(),
  msg_sender: z.string(),
  factory_address: z.string().optional(),
  locker_address: z.string().optional(),
  position_id: z.string().optional(),
  warnings: z.array(z.string()).optional().default([]),
  pool_config: poolConfigSchema.optional(),
  starting_market_cap: z.number().optional(),
  tags: tagsSchema.optional(),
  extensions: extensionsSchema.optional(),
  related: relatedSchema.optional(),
})

// API Response Schema
export const tokensResponseSchema = z.object({
  data: z.array(tokenSchema),
  total: z.number(),
  cursor: z.string().optional(),
})

// API Request Parameters Schema
export const tokensRequestSchema = z.object({
  q: z.string().optional(),
  fids: z.string().optional(), // comma-separated numbers
  pairAddress: z.string().optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
  socialInterface: z.string().optional(),
  limit: z.number().min(1).max(20).default(5),
  cursor: z.string().optional(),
  includeUser: z.boolean().default(false),
  includeMarket: z.boolean().default(true),
  startDate: z.number().optional(),
})

// Type exports
export type Token = z.infer<typeof tokenSchema>
export type TokensResponse = z.infer<typeof tokensResponseSchema>
export type TokensRequest = z.infer<typeof tokensRequestSchema>
export type SocialMediaUrl = z.infer<typeof socialMediaUrlSchema>
export type User = z.infer<typeof userSchema>
export type Market = z.infer<typeof marketSchema>
