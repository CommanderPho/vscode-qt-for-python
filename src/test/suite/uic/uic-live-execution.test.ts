import * as assert from 'node:assert'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  E2E_TIMEOUT,
  setupE2EEnvironment,
  sleep,
  TEST_ASSETS_PATH,
} from '../utils'

suite('uic-live-execution/e2e', () => {
  const sampleFilenameNoExt = 'sample'

  const uiFilePath = path.resolve(
    TEST_ASSETS_PATH,
    'ui',
    `${sampleFilenameNoExt}.ui`,
  )

  let originalFullText: string

  suiteSetup(async function () {
    this.timeout(E2E_TIMEOUT)
    await setupE2EEnvironment()
  })

  setup(async () => {
    originalFullText = fs.readFileSync(uiFilePath, { encoding: 'utf-8' })

    removeGeneratedRcFile(sampleFilenameNoExt)
  })

  teardown(() => {
    fs.writeFileSync(uiFilePath, originalFullText, { encoding: 'utf-8' })

    removeGeneratedRcFile(sampleFilenameNoExt)
  })

  test('should recompile UI file changed', async () => {
    fs.writeFileSync(
      uiFilePath,
      originalFullText.replace(/My Window Title/gi, 'My New Window Title'),
    )

    await sleep() // wait for file watcher to trigger

    assert.ok(
      fs.existsSync(
        path.resolve(TEST_ASSETS_PATH, 'ui', `ui_${sampleFilenameNoExt}.py`),
      ),
    )
  }).timeout(E2E_TIMEOUT)
}).timeout(E2E_TIMEOUT)

function removeGeneratedRcFile(sampleFilenameNoExt: string) {
  return fs.rmSync(
    path.resolve(TEST_ASSETS_PATH, 'ui', `ui_${sampleFilenameNoExt}.py`),
    { force: true, recursive: true },
  )
}
