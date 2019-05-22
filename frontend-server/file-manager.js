class FileManager {
    constructor() {
        this.files = {}
    }

    new(name) {
        this.files[name] = new File(name);
    }
    
    save(file) {
        this.files[file.name] = file;
    }

    load(name) {
        const file = this.files[name];
        if (file) {
            return file;
        } else {
            this.new(name)
            return this.files[name];
        }
    }

    list() {
        return this.files;
    }
}

class File {
    constructor(name) {
        this.lastContractIdInGamma = null;
        this.code = "";
        this.name = name;
    }
}

module.exports = {
    FileManager,
};
