import * as path from 'node:path'
import type { ExtensionContext } from 'vscode'
import type {
  Disposable,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'
import { resolveScriptCommand } from '../python'
import type { ErrorResult, SuccessResult } from '../result-types'
import type { QmlLintNotification } from './server/notifications'
import { QmlLintNotificationType } from './server/notifications'
import { QmlScriptCommandRequestType } from './server/requests'

export async function startClient({
  asAbsolutePath,
  extensionPath,
  onNotification,
}: StartClientArgs): Promise<StartClientResult> {
  const serverModule = asAbsolutePath(
    path.join('out', 'qmllint', 'server', 'main.js'),
  )

  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] }

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'qml' }],
  }

  const client = new LanguageClient('qmllint', serverOptions, clientOptions)

  const disposables = [
    client,
    client.onNotification(QmlLintNotificationType, onNotification),
    client.onRequest(QmlScriptCommandRequestType, ({ resource }) =>
      resolveScriptCommand({ scriptName: 'qmllint', extensionPath, resource }),
    ),
  ]

  await client.start()

  return {
    kind: 'Success',
    value: client,
    dispose: () => disposables.forEach(d => d.dispose()),
  }
}

type StartClientArgs = Pick<
  ExtensionContext,
  'asAbsolutePath' | 'extensionPath'
> & {
  readonly onNotification: (n: QmlLintNotification) => void
}

type StartClientResult =
  | (SuccessResult<LanguageClient> & Disposable)
  | ErrorResult<'NotFound'>

export async function stopClient(client: LanguageClient) {
  return client.stop()
}
