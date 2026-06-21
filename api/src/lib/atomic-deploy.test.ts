import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, symlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('atomic-deploy — getCurrentSlot', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-deploy-'))
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    e.DIST_BLUE  = join(tmp, 'blue')
    e.DIST_GREEN = join(tmp, 'green')
    e.NGINX_ROOT = join(tmp, 'nginx')
    await mkdir(e.DIST_BLUE,  { recursive: true })
    await mkdir(e.DIST_GREEN, { recursive: true })
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('returns null when symlink does not exist', async () => {
    const { getCurrentSlot } = await import('./atomic-deploy.js')
    const slot = await getCurrentSlot()
    expect(slot).toBeNull()
  })

  it('returns "blue" when symlink points to DIST_BLUE', async () => {
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    await symlink(e.DIST_BLUE, e.NGINX_ROOT)
    const { getCurrentSlot } = await import('./atomic-deploy.js')
    const slot = await getCurrentSlot()
    expect(slot).toBe('blue')
  })

  it('returns "green" when symlink points to DIST_GREEN', async () => {
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    await symlink(e.DIST_GREEN, e.NGINX_ROOT)
    const { getCurrentSlot } = await import('./atomic-deploy.js')
    const slot = await getCurrentSlot()
    expect(slot).toBe('green')
  })
})

describe('atomic-deploy — atomicDeploy', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-deploy-'))
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    e.DIST_BLUE  = join(tmp, 'blue')
    e.DIST_GREEN = join(tmp, 'green')
    e.NGINX_ROOT = join(tmp, 'nginx')
    await mkdir(e.DIST_BLUE,  { recursive: true })
    await mkdir(e.DIST_GREEN, { recursive: true })
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('throws when distPath does not exist', async () => {
    const { atomicDeploy } = await import('./atomic-deploy.js')
    await expect(atomicDeploy('/tmp/nonexistent-dist')).rejects.toThrow()
  })

  it('throws when distPath is not a directory', async () => {
    const { atomicDeploy } = await import('./atomic-deploy.js')
    const file = join(tmp, 'not-a-dir.txt')
    await (await import('node:fs/promises')).writeFile(file, 'x')
    await expect(atomicDeploy(file)).rejects.toThrow()
  })

  it('deploys to blue when no active slot (first deploy — blue is default inactive)', async () => {
    const { atomicDeploy } = await import('./atomic-deploy.js')
    const srcDist = join(tmp, 'src-dist')
    await mkdir(srcDist, { recursive: true })

    const result = await atomicDeploy(srcDist)
    expect(result.from).toBeNull()
    // null !== 'blue', so nextSlot = 'blue' (the inactive default)
    expect(result.to).toBe('blue')
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('deploys to blue when green is active', async () => {
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    await symlink(e.DIST_GREEN, e.NGINX_ROOT)

    const { atomicDeploy } = await import('./atomic-deploy.js')
    const srcDist = join(tmp, 'src-dist2')
    await mkdir(srcDist, { recursive: true })

    const result = await atomicDeploy(srcDist)
    expect(result.from).toBe('green')
    expect(result.to).toBe('blue')
  })
})

describe('atomic-deploy — rollbackDeploy', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-rollback-'))
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    e.DIST_BLUE  = join(tmp, 'blue')
    e.DIST_GREEN = join(tmp, 'green')
    e.NGINX_ROOT = join(tmp, 'nginx')
    await mkdir(e.DIST_BLUE,  { recursive: true })
    await mkdir(e.DIST_GREEN, { recursive: true })
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('throws when no symlink exists', async () => {
    const { rollbackDeploy } = await import('./atomic-deploy.js')
    await expect(rollbackDeploy()).rejects.toThrow('Cannot rollback')
  })

  it('rolls back from blue → green', async () => {
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    await symlink(e.DIST_BLUE, e.NGINX_ROOT)

    const { rollbackDeploy } = await import('./atomic-deploy.js')
    const result = await rollbackDeploy()
    expect(result.from).toBe('blue')
    expect(result.to).toBe('green')
  })

  it('rolls back from green → blue', async () => {
    const envMod = await import('../env.js')
    const e = envMod.env as Record<string, string>
    await symlink(e.DIST_GREEN, e.NGINX_ROOT)

    const { rollbackDeploy } = await import('./atomic-deploy.js')
    const result = await rollbackDeploy()
    expect(result.from).toBe('green')
    expect(result.to).toBe('blue')
  })
})
