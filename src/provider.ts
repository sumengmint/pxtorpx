import * as vscode from 'vscode';
import CssRpxProcess from "./process";


//实现代码提示
export default class CssRpxProvider implements vscode.CompletionItemProvider {

    constructor(private process: CssRpxProcess) { }

    provideCompletionItems (
        document: vscode.TextDocument, 
        position: vscode.Position, 
        token: vscode.CancellationToken
    ): Thenable<vscode.CompletionItem[]> {

        return new Promise((resolve, reject) => {
			
            let wordAtPosition = document.getWordRangeAtPosition(position);
            let currentWord = '';
            if (wordAtPosition && wordAtPosition.start.character < position.character) {
                var word = document.getText(wordAtPosition);
                currentWord = word.substr(0, position.character - wordAtPosition.start.character);
            }
            const res = this.process.convert(currentWord);
            if (!res) {
                return resolve([]);
            }
            
            //代码提示信息
            const item = new vscode.CompletionItem(`${res.pxValue}px -> ${res.rpx}`, vscode.CompletionItemKind.Snippet);
            // 要插入的文本
            item.insertText = res.rpx;
            item.detail = 'Value';
            
            return resolve([item]);
        });
    }
}