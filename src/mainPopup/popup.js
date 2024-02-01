let globalAuthorMap = new Map();

async function main() {
    const accountList = await messenger.accounts.list();
    const tags = await messenger.messages.listTags();

    if (!tags.find(tag => tag.key === 'test')) {
        await messenger.messages.createTag('test', 'test', '#ffa500');
    }

    for (const account of accountList) {
        messenger.messages.list(account.folders[0])
        .then(page => processPageMessages(page, account))
        .catch(err => console.error("Some shit went wrong...",err));
    }
}

async function processPageMessages(page, account) {
    for (const message of page.messages) {
        let messageAuthor = await messenger.messages.get(message.id);
        let isSubscription = await messenger.messages.getFull(message.id).then(fullMessage => {
            const messageParts = fullMessage.parts[0];
            if (messageParts) {
                if (hasUnsubscribeLink(diveMessageParts(messageParts))) {
                    return true
                }
            }
        });
        if(isSubscription) {
            // let authorCounts = await messenger.storage.local.get({authorCounts: {}});
            let authorCounts = new Map();
            if(authorCounts && authorCounts.get(messageAuthor)){
                let temp = authorCounts.get(messageAuthor) + 1;
                authorCounts.set(messageAuthor, temp);
            } else {
                authorCounts.set(messageAuthor, 1);
            }
            console.log('authorCounts: ', authorCounts);
            await messenger.storage.local.set({authorCounts});
            await messenger.messages.update(message.id, {tags: ['test']});
        }
    }
    if (!page.id) {
        return;
    }
    await messenger.messages.continueList(page.id).then(page => processPageMessages(page, account));
    return;
}



function diveMessageParts(messageParts) {
    if (messageParts.body) {
        return messageParts.body;
    } else if (messageParts.parts) {
        return diveMessageParts(messageParts.parts[0]);
    } else {
        return '';
    }
}


function hasUnsubscribeLink(textHtml) {
    let unsubscribePresent = String(textHtml).toLowerCase().includes('unsubscribe');
    if (unsubscribePresent) {
        return true;
    }
    return false;
}

console.log('check them emails...');
main();

