// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// Array to keep track of cursor positions over time
const cursorHistory: { documentUri: vscode.Uri; position: vscode.Position }[] = []

// Listen to cursor (selection) changes in any active text editor
const selectionListener = vscode.window.onDidChangeTextEditorSelection(event => {
  /* Skip if
  | no selection exists
  | cursor is in the same file
  | OR cursor position is too close to previous position
  */
  if (event.selections.length === 0) return
  if (cursorHistory.length === 0)
    cursorHistory.push({ documentUri: event.textEditor.document.uri, position: event.selections[0].active })
  if (
    cursorHistory.at(-1)?.documentUri.path === event.textEditor.document.uri.path &&
    Math.abs((cursorHistory.at(-1)?.position.line ?? 0) - event.selections[0].start.line) < 30
  )
    return
  cursorHistory.push({ documentUri: event.textEditor.document.uri, position: event.selections[0].active })
})

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(selectionListener)
  const disposable = vscode.commands.registerCommand('cursor-location-preview.peek-history', () => {
    const { document } = vscode.window.activeTextEditor!
    vscode.commands.executeCommand(
      'editor.action.peekLocations',
      document.uri,
      vscode.window.activeTextEditor?.selection.start,
      cursorHistory.map(({ documentUri, position }) => new vscode.Location(documentUri, position))
    )
  })
  context.subscriptions.push(disposable)
}

export function deactivate() {}
