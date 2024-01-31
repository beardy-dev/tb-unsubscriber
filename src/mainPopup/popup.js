async function main() {
    const accountList = await messenger.accounts.list();
    const tags = await messenger.messages.listTags();

    console.log(tags);

    if (!tags.find(tag => tag.key === 'test')) {
        await messenger.messages.createTag('test', 'test', '#ffa500');
    }

    // messenger.messages.list(accountList[0].folders[0]).then(page => processPageMessages(page, accountList[0]));

    for (const account of accountList) {
        console.groupCollapsed(account);
        await messenger.messages.list(account.folders[0]).then(page => processPageMessages(page, account));
        console.groupEnd();

    }
}

async function processPageMessages(page, account) {
    console.group('processPageMessages: ', page.id, account.name);
    for (const message of page.messages) {

        let isSubscription = await messenger.messages.getFull(message.id).then(fullMessage => {
            const messageParts = fullMessage.parts[0];
            if (messageParts) {
                if (hasUnsubscribeLink(diveMessageParts(messageParts))) {
                    return true
                }
            }
        });

        if(isSubscription) {
            console.log('can unsubscribe: ', message.id, message.date.toISOString(), message.author);
            await messenger.messages.update(message.id, {tags: ['test']});
        }
    }
    if (!page.id) {
        console.log('returning...',account.name);
        console.groupEnd();
        return;
    }
    console.log('continueList......');
    await messenger.messages.continueList(page.id).then(page => processPageMessages(page, account));
    console.groupEnd();
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

main();