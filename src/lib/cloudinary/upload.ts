// Cloudinary direct browser upload (unsigned preset — no server required)

const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''
const BASE_URL     = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  original_filename: string
  format: string
  resource_type: string
  bytes: number
  width?: number
  height?: number
  created_at: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface UploadOptions {
  folder?: string
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

// ── Core upload ────────────────────────────────────────────────────────────
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<{ result: CloudinaryUploadResult | null; error: string | null }> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return { result: null, error: 'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.' }
  }

  const { folder = 'jootacee-cms', onProgress, signal } = options
  const resourceType = file.type.startsWith('video/') ? 'video' : 'auto'
  const endpoint = `${BASE_URL}/${resourceType}/upload`

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', folder)

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) })
        }
      })
    }

    if (signal) {
      signal.addEventListener('abort', () => xhr.abort())
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as CloudinaryUploadResult
          resolve({ result, error: null })
        } catch {
          resolve({ result: null, error: 'Failed to parse Cloudinary response' })
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText)
          resolve({ result: null, error: body?.error?.message ?? `Upload failed (${xhr.status})` })
        } catch {
          resolve({ result: null, error: `Upload failed (${xhr.status})` })
        }
      }
    }

    xhr.onerror = () => resolve({ result: null, error: 'Network error during upload' })
    xhr.onabort = () => resolve({ result: null, error: 'Upload cancelled' })

    xhr.open('POST', endpoint)
    xhr.send(form)
  })
}

// ── Transform URL helpers ──────────────────────────────────────────────────
type Fit = 'fill' | 'scale' | 'crop' | 'thumb' | 'pad'

export interface TransformOptions {
  width?: number
  height?: number
  fit?: Fit
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
}

export function buildCloudinaryUrl(
  publicId: string,
  options: TransformOptions = {}
): string {
  const {
    width,
    height,
    fit = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options

  const parts: string[] = [`c_${fit}`, `q_${quality}`, `f_${format}`]
  if (width) parts.push(`w_${width}`)
  if (height) parts.push(`h_${height}`)

  const transforms = parts.join(',')
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

export function thumbnailUrl(publicId: string, size = 120): string {
  return buildCloudinaryUrl(publicId, { width: size, height: size, fit: 'thumb', quality: 'auto', format: 'auto' })
}

export function responsiveUrl(publicId: string, width: number): string {
  return buildCloudinaryUrl(publicId, { width, fit: 'scale', quality: 'auto', format: 'auto' })
}

// ── Validate file before upload ────────────────────────────────────────────
export interface FileValidation {
  valid: boolean
  error?: string
}

const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 100
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm',
  'application/pdf',
]

export function validateFile(file: File): FileValidation {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed.` }
  }
  const maxBytes = file.type.startsWith('video/') ? MAX_VIDEO_MB * 1024 * 1024 : MAX_IMAGE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    const maxLabel = file.type.startsWith('video/') ? `${MAX_VIDEO_MB}MB` : `${MAX_IMAGE_MB}MB`
    return { valid: false, error: `File exceeds max size of ${maxLabel}.` }
  }
  return { valid: true }
}
