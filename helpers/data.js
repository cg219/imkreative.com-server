class DataHelper {
    static transform(entry, helpers) {
        if (helpers.DateHelper) {
            let DateHelper = helpers.DateHelper;

            entry.fields.seasonDate = DateHelper.seasonize(entry.fields.date);

            return entry;
        }
    }
}

module.exports = DataHelper;
