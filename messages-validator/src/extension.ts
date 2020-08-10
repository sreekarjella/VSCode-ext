import * as vscode from 'vscode';
import { Message } from './model';

export function activate(context: vscode.ExtensionContext) {

	let messages: Message[] = [];

	let disposable = vscode.commands.registerCommand('messages-validator.validateMessages', () => {

		suite().then((data: any) => {
			messages = data;
			let keyCount = 0;
			const outputChannel = vscode.window.createOutputChannel('Messages Validator');
			messages.forEach((message: Message) => {
				keyCount += 1;
				outputChannel.append(message.key + '\n');
			});
			outputChannel.append(`Found ${keyCount} unused message keys`);
			outputChannel.show();
		});

		vscode.window.showInformationMessage('Checking for unused messages!');
	});
	context.subscriptions.push(disposable);
}

export function deactivate() { }

function suite() {
	let promise = new Promise((resolve, reject) => {
		collectMessages().then((collectedMessages: any) => {
			checkUnusedKeys(collectedMessages).then((unusedKeys: any) => {
				resolve(unusedKeys);
			});
		}).then(undefined, err => {
			const errorMessage = 'Some error occurred. Please reopen VSCode and try again!';
			showErrorMessage(errorMessage, err, reject);
		});
	});
	return promise;
}


function checkUnusedKeys(messagesKeys: Message[]) {
	let promise = new Promise((resolve, reject) => {
		let fileText: string;
		vscode.workspace.findFiles('src/app/**/*.{html,ts}').then((filesPath) => {
			filesPath.forEach((path) => {
				vscode.workspace.openTextDocument(path).then((document) => {
					fileText = document.getText();
					for (let index = messagesKeys.length - 1; index >= 0; index--) {
						if (fileText.includes(messagesKeys[index].key)) {
							messagesKeys.splice(index, 1);
							resolve(messagesKeys);
						}
					}
				}).then(undefined, err => {
					const errorMessage = 'Some error occurred. Please reopen VSCode and try again!';
					showErrorMessage(errorMessage, err, reject);
				});
			});
		});
	});
	return promise;
}

function collectMessages() {
	let promise = new Promise((resolve, reject) => {
		let messages: Message[] = [];
		let messageId: number = 0;
		vscode.workspace.findFiles('src/assets/messages**/*.json', '**/node_modules').then((filesPath) => {
			filesPath.forEach((path) => {
				if (!path.toString().includes('module')) {
					vscode.workspace.openTextDocument(path).then((document) => {
						let jsonMessages: Object[] = JSON.parse(document.getText());
						setTimeout(() => {
							jsonMessages.forEach((value: any) => {
								if (value.key) {
									const message = new Message(messageId, value.text, value.locale, value.key, value.type);
									messageId += 1;
									messages.push(message);
									resolve(messages);
								}
							});
						}, 50);
					}).then(undefined, err => {
						const errorMessage = 'Some error occurred. Please reopen VSCode and try again!';
						showErrorMessage(errorMessage, err, reject);
					});
				}
			});
		});
	});
	return promise;
}

function showErrorMessage(message: string, error?: any, reject?: any) {
	reject(error);
	console.log(error);
	vscode.window.showErrorMessage(message);
}

