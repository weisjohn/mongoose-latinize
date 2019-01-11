var latinize = require('latinize');

function _latinize(str) {
    return latinize(str || '').toLowerCase();
}

module.exports = function(schema, config) {

    // optional simple/complex config spec
    var prop = (typeof config === 'string') ? config : config.prop;
    if (!prop) throw new Error('prop must be specified');

    // token virtual references
    var latin_prop = 'latin_' + prop;

    // extend the schema with a new field, turn on indexing
    var extension = {};
    var index = (typeof config.index !== 'undefined') ? config.index : true;

    extension[latin_prop] = { type: String, index: index };
    schema.add(extension);
    if (index) schema.path(latin_prop).index(true);

    // a simple pre-validate hook to store the latinize copy
    schema.pre('validate', function latinize_validate_hook(next) {
        if (this[prop] !== undefined) this[latin_prop] = _latinize(this[prop]);
        return next();
    });

    // utilizing mongoose internals to modify the update command
    schema.pre('update', function latinize_update_hook() {
        if (this._update && this._update.$set && this._update.$set[prop]) {
            this._update.$set[latin_prop] = _latinize(this._update.$set[prop]);
        }
    });

    // hide these properties when calling toJSON
    if (config.json) return;
    if (!schema.options.toJSON) schema.options.toJSON = {};
    var fn = schema.options.toJSON.transform;
    schema.options.toJSON.transform = function (doc, ret, options) {
        // remove the latin_prop before returning the result
        delete ret[latin_prop];
        if (typeof fn === 'function') fn(doc, ret, options);
    };

};

module.exports.latinize = _latinize;
