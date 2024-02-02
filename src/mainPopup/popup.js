let messageStorage;;

async function main() {
    messageStorage = await messenger.storage.local.get(messageStorage);
    console.log('messageStorage init: ', messageStorage);
    // const accountList = await messenger.accounts.list();
    const gmail = await messenger.accounts.getDefault();
    const tags = await messenger.messages.listTags();

    if (!tags.find(tag => tag.key === 'test')) {
        await messenger.messages.createTag('test', 'test', '#ffa500');
    }

    await messenger.messages.list(gmail.folders[0])
    .then(page => processPageMessages(page, gmail))
    .catch(err => console.error("Some shit went wrong...",err));

    console.log('messageStorage Final: ', messageStorage);
    await messenger.storage.local.set(messageStorage);
    console.log(await messenger.storage.local.get(messageStorage));

    // for (const account of accountList) {
    //     console.log('working with account: ', account.name, account.id);
    //     messenger.messages.list(account.folders[0])
    //     .then(page => processPageMessages(page, account))
    //     .catch(err => console.error("Some shit went wrong...",err));
    // }
}

async function processPageMessages(page, account) {
    for (const message of page.messages) {
        let messageHeader = await messenger.messages.get(message.id);
        let isSubscription = await messenger.messages.getFull(message.id).then(fullMessage => {
            const messageParts = fullMessage.parts[0];
            if (messageParts) {
                if (hasUnsubscribeLink(diveMessageParts(messageParts))) {
                    return true
                }
            }
        });
        if(isSubscription) {
            if(messageHeader.author) {
                if(messageHeader.author in messageStorage) {
                    messageStorage[messageHeader.author].add(messageHeader.id);
                } else {
                    messageStorage[messageHeader.author] = new Set();
                }
            }
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


function debug_ClearLocalStorage() {
    messenger.storage.local.clear();
    console.log('cleared that shit');
}

const clearStorageBtn = document.getElementById('clearStorageBtn');
clearStorageBtn.addEventListener('click', async() => {
    console.log('Button Clicked');
    debug_ClearLocalStorage();
})

const detectSubsBtn = document.getElementById('detectSubsBtn');
detectSubsBtn.addEventListener('click', async() => {
    console.log('tagging subs...');
    main();
});
