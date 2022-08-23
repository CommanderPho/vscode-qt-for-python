import * as assert from 'node:assert'
import * as path from 'node:path'
import type { RunResult } from '../../run'
import { run } from '../../run'

suite('run', () => {
  suite('when execute non-exist program', () => {
    let result: RunResult

    setup(async () => (result = await run({ command: ['non-exist'] })))

    test('should return ExecError', async () =>
      assert.strictEqual(result.kind, 'ExecError'))
  })

  suite(
    'when execute cat command to read exist file with spaces in filename',
    () => {
      let result: RunResult

      setup(async () => {
        const filePath = path.join(
          '.',
          'src',
          'test',
          'assets',
          'filename with spaces.txt',
        )
        result = await run({ command: ['cat', filePath] })
      })

      test('should return Success with contents', async () => {
        const expected: RunResult = { kind: 'Success', value: 'hello' }
        assert.deepStrictEqual(result, expected)
      })
    },
  )
})
