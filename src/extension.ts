// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CssRpxProcess from './process';
import CssRpxProvider from './provider';

let config = null;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// create a decorator type that we use to decorate small numbers
	const highLightDecorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(98, 139, 179, 1)',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
    });
    
    const nullDecorationType = vscode.window.createTextEditorDecorationType({});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations(arr: any) {
		if (!activeEditor) {
			return;
        }
        const highlights: vscode.DecorationOptions[] = [];

        const doc = activeEditor.document;
        arr.forEach((e: { index: number; length: any; }) => {
            const startPos = doc.positionAt(e.index);
            const endPos = doc.positionAt(e.index+e.length);
            const decoration = { range: new vscode.Range(startPos, endPos)};
            highlights.push(decoration);

        });
        activeEditor.setDecorations(highLightDecorationType, highlights);
        clearDecorations();
    }

    function clearDecorations() {
        setTimeout(() => {
            activeEditor?.setDecorations(highLightDecorationType, []);
        }, 3000);
    }

    // vscode.workspace.onDidChangeTextDocument(event => {
	// 	if (activeEditor && event.document === activeEditor.document) {
    //         console.log('changed', event);
	// 		clearDecorations();
	// 	}
	// }, null, context.subscriptions);

    config = vscode.workspace.getConfiguration("px-to-rpx");
    const process = new CssRpxProcess(config);
    let provider = new CssRpxProvider(process);
    const LANS = ["axml", 'css', "acss", 'less', 'scss', 'sass'];
    for (let lan of LANS) {
        //为对应类型文件添加代码提示
        let providerDisposable = vscode.languages.registerCompletionItemProvider(lan, provider);
        context.subscriptions.push(providerDisposable);
    }

    //注册pxTorpx命令
    vscode.commands.registerTextEditorCommand('extension.pxTorpx', (textEditor, edit) => {
        //todo 
        const doc = textEditor.document;
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);


        //获取全部文本区域
        const selection = new vscode.Range(start, end);
        let text = doc.getText(selection);
        //替换文件内容
        textEditor.edit(builder => {
            const res = process.convertAll(text,0);
            builder.replace(selection, res.text);

            updateDecorations(res.arr);
            
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
