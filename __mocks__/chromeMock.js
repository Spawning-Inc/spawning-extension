const storageData = {
    images: true,
    audio: true,
    video: true,
    text: true,
    code: true
};

global.chrome = {
    storage: {
        sync: {
            get: function (items, callback) {
                callback(storageData);
            },
            set: function (items, callback) {
                callback();
            }
        }
    }
};
