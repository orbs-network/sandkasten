class FileManager {
    constructor() {
        this.files = {}
    }

    new(name) {
        this.files[name] = new File()
    }

    save(name, code) {
        const file = this.load(name)
        file.code = code
    }

    load(name) {
        const file = this.files[name]
        if (file) {
            return file
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
    constructor() {
        this.lastContractIdInGamma = null
        this.code = ""
    }
}

module.exports = {
    FileManager,
}
