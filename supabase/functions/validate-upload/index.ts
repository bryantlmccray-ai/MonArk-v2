import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, verifyAuth, errorResponse } from '../_shared/security.ts'

// Allowed MIME types for profile photos
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

// Magic bytes for image format detection
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_FILE_SIZE = 1024 // 1KB — reject empty/tiny files

function detectMimeFromBytes(bytes: Uint8Array): string | null {
  for (const [mime, patterns] of Object.entries(MAGIC_BYTES)) {
    for (const pattern of patterns) {
      if (pattern.every((byte, i) => bytes[i] === byte)) {
        return mime
      }
    }
  }
  return null
}

function containsSvgScript(bytes: Uint8Array): boolean {
  // Check for SVG/XML with embedded script tags (common attack vector)
  const text = new TextDecoder().decode(bytes.slice(0, 4096))
  const lower = text.toLowerCase()
  return lower.includes('<svg') || lower.includes('<script') || lower.includes('javascript:') || lower.includes('onerror=')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authResult = await verifyAuth(req)
    if (authResult.error || !authResult.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const contentType = req.headers.get('content-type') || ''

    // Handle multipart form data
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/octet-stream')) {
      // JSON body with metadata only (pre-flight check)
      let body: Record<string, unknown>
      try {
        body = await req.json()
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { fileName, fileSize, mimeType } = body

      // Pre-flight validation (before upload)
      const errors: string[] = []

      if (typeof fileSize === 'number') {
        if (fileSize > MAX_FILE_SIZE) errors.push(`File too large: ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`)
        if (fileSize < MIN_FILE_SIZE) errors.push('File too small — may be corrupted')
      }

      if (typeof mimeType === 'string' && !ALLOWED_MIME_TYPES.has(mimeType)) {
        errors.push(`File type "${mimeType}" is not allowed. Accepted: JPEG, PNG, WebP, HEIC`)
      }

      if (typeof fileName === 'string') {
        // Check for dangerous extensions
        const ext = fileName.split('.').pop()?.toLowerCase()
        const dangerousExts = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'js', 'html', 'svg', 'php', 'py']
        if (ext && dangerousExts.includes(ext)) {
          errors.push(`File extension ".${ext}" is not allowed`)
        }
      }

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ valid: false, errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ valid: true, maxSize: MAX_FILE_SIZE, allowedTypes: [...ALLOWED_MIME_TYPES] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Full file validation (binary upload)
    const arrayBuffer = await req.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const errors: string[] = []

    // Size checks
    if (bytes.length > MAX_FILE_SIZE) {
      errors.push(`File size ${(bytes.length / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`)
    }
    if (bytes.length < MIN_FILE_SIZE) {
      errors.push('File too small — may be corrupted')
    }

    // Magic byte detection
    const detectedMime = detectMimeFromBytes(bytes)
    if (!detectedMime) {
      errors.push('Unable to verify file type from binary content — file may not be a valid image')
    }

    // SVG/script injection check
    if (containsSvgScript(bytes)) {
      errors.push('File contains potentially dangerous content (script injection detected)')
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ valid: false, errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ valid: true, detectedMime }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return errorResponse(error, 'File validation failed')
  }
})
