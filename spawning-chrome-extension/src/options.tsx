document.addEventListener('DOMContentLoaded', () => {
    const saveOptions = () => {
        const images = document.getElementById('images') as HTMLInputElement;
        const audio = document.getElementById('audio') as HTMLInputElement;
        const video = document.getElementById('video') as HTMLInputElement;
        const text = document.getElementById('text') as HTMLInputElement;
        const code = document.getElementById('code') as HTMLInputElement;

        if (images && audio && video && text && code) {
            chrome.storage.sync.set(
                { images: images.checked, audio: audio.checked, video: video.checked, text: text.checked, code: code.checked },
                () => {
                    // Update status to let user know options were saved.
                    const status = document.getElementById('status');
                    if (status) {
                        status.textContent = 'Options saved.';
                        setTimeout(() => {
                            status.textContent = '';
                        }, 750);
                    }
                }
            );
        }
    };

    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    const restoreOptions = () => {
        chrome.storage.sync.get(
            { images: true, audio: true, video: true, text: true, code: true },
            (items) => {
                const images = document.getElementById('images') as HTMLInputElement;
                const audio = document.getElementById('audio') as HTMLInputElement;
                const video = document.getElementById('video') as HTMLInputElement;
                const text = document.getElementById('text') as HTMLInputElement;
                const code = document.getElementById('code') as HTMLInputElement;

                if (images && audio && video && text && code) {
                    images.checked = items.images;
                    audio.checked = items.audio;
                    video.checked = items.video;
                    text.checked = items.text;
                    code.checked = items.code;
                }
            }
        );
    };

    restoreOptions();
    const saveButton = document.getElementById('save');
    if (saveButton) {
        saveButton.addEventListener('click', saveOptions);
    }
});
