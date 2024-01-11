import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import moment from 'moment';

let sbItem: vscode.StatusBarItem;
let lastCommitTime: moment.Moment | undefined;

export function activate({ subscriptions }: vscode.ExtensionContext) {
    sbItem = vscode.window.createStatusBarItem("Loading..", vscode.StatusBarAlignment.Right, 99999);
    subscriptions.push(sbItem);

	setTimeout(() => {
		// Register a timer to update the status bar item every minute
		setInterval(updateStatusBarItem, 1000);

		// Initial update of the status bar item
		updateStatusBarItem();
	}, 5000);
}

function updateStatusBarItem(): void {
    updateLastCommitTime();
    const elapsedTime = lastCommitTime ? moment().diff(lastCommitTime, 'minutes') : undefined;

    if (elapsedTime !== undefined) {
        if (elapsedTime > 120) {
            sbItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            sbItem.color = 'black';
        } else if (elapsedTime > 60) {
            sbItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            sbItem.color = 'black';
        } else {
            sbItem.color = undefined;
        }
    }

    sbItem.text = `$(clock) ${elapsedTime !== undefined ? elapsedTime + ' min' : 'No Repo'}`;
    sbItem.show();
}

async function updateLastCommitTime(): Promise<void> {
    const git = simpleGit(vscode.workspace.rootPath); // Assumes a single root folder

    try {
        const log = await git.log();
        if (log.latest) {
            lastCommitTime = moment(log.latest.date);
        } else {
            lastCommitTime = undefined;
            sbItem.text = 'No Repo';
        }
    } catch (error) {
        console.error(error);
        lastCommitTime = undefined;
        sbItem.text = 'No Repo';
    }
}

export function deactivate() {
    if (sbItem) {
        sbItem.dispose();
    }
}
