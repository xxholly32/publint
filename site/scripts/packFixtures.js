import cp from 'child_process'
import fs from 'fs/promises'
import path from 'path'

const fixtureDir = path.resolve('../pkg/tests/fixtures')
const fixtures = (await fs.readdir(fixtureDir, { withFileTypes: true }))
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)

console.log('Create ./public/temp/ dir')

await fs.mkdir('./public/temp', { recursive: true })

console.log('Packing fixtures', fixtures)

await Promise.all(
  fixtures.map((fixture) => {
    const fixturePath = path.resolve(fixtureDir, fixture)
    const proc = cp.exec(
      `npm pack ${fixturePath} --pack-destination=./public/temp/`
    )
    return new Promise((resolve, reject) => {
      proc.addListener('exit', () => resolve())
      proc.addListener('error', () => reject())
    })
  })
)

console.log('Done')
