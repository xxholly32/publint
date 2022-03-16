const ESM_CONTENT_RE =
  /\bimport\s+|\bimport\(|\bexport\s+default\s+|\bexport\s+const\s+|\bexport\s+function\s+|\bexport\s+default\s+/
export function isCodeEsm(code) {
  return ESM_CONTENT_RE.test(code)
}

const CJS_CONTENT_RE =
  /\bmodule\.exports\b|\bexports[.\[]|\brequire\s*\(|\bObject\.(defineProperty|defineProperties|assign)\s*\(\s*exports\b/
export function isCodeCjs(code) {
  return CJS_CONTENT_RE.test(code)
}

/**
 * @typedef {'ESM' | 'CJS' | 'unknown'} CodeFormat
 */

/**
 * @param {string} code
 * @returns {CodeFormat}
 */
export function getCodeFormat(code) {
  if (isCodeEsm(code)) {
    return 'ESM'
  } else if (isCodeCjs(code)) {
    return 'CJS'
  } else {
    return 'unknown'
  }
}

export function isCodeMatchingFormat(code, format) {
  const f = getCodeFormat(code)
  // If we can't determine the format, it's likely that it doesn't import/export and require/exports.
  // Meaning it's a side-effectful file, which would always match the `format`
  return f === 'unknown' || f === format
}

/**
 * Handle `exports` glob
 * @param {string} globStr An absolute glob string that must contain one `*`
 * @param {import('types').Vfs} vfs
 * @returns {Promise<string[]>} Matched file paths
 */
export async function exportsGlob(globStr, vfs) {
  let filePaths = []
  const [dir, ext] = globStr.split('*')
  await scanDir(dir)
  return filePaths

  async function scanDir(dirPath) {
    const items = await vfs.readDir(dirPath)
    for (const item of items) {
      const itemPath = vfs.pathJoin(dirPath, item)
      if (await vfs.isPathDir(itemPath)) {
        await scanDir(itemPath)
      } else if (!ext || itemPath.endsWith(ext)) {
        filePaths.push(itemPath)
      }
    }
  }
}
