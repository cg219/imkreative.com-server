class TagHelper {
    static check(term, tags) {
        return tags.some(tag => tag.name.toLowerCase().indexOf(term.toLowerCase()) >= 0);
    }
}

module.exports = TagHelper;
