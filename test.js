var assert = require('assert');
var mongoose = require('mongoose');
var async = require('async');
var mongoose_latinize = require('./');

var user;

function models() {

    user = new mongoose.Schema({ 
        first_name: String,
        last_name: String,
        empty: String,
    });

    // utilize simple spec
    user.plugin(mongoose_latinize, 'first_name');

    // utilize complex call
    user.plugin(mongoose_latinize, { prop: 'last_name', json : true, index: false });

    // used to test undefined or null
    user.plugin(mongoose_latinize, 'empty');

    user = mongoose.model('user', user);

}

function test() {

    // verify schema paths
    var paths = user.schema.paths;
    assert.equal(typeof paths.latin_first_name, 'object', 'schema not modified properly');
    assert.equal(typeof paths.latin_last_name, 'object', 'schema not modified properly');

    // verify indexes
    assert.equal(paths.latin_first_name._index, true, 'index not set properly');
    assert.equal(paths.latin_last_name._index, false, 'index set improperly');


    async.waterfall([

        // save document
        function(cb) {

            var user1 = new user({
                first_name : 'José',
                last_name : 'Martínez',
            });

            user1.save(function(err, doc) {

                assert.equal(err, null);

                // verify values are set
                assert.equal(typeof doc.latin_first_name, 'string', 'latin path not set');
                assert.equal(typeof doc.latin_last_name, 'string', 'latin path not set');

                // verify values are appropriately transformed
                assert.equal(doc.latin_first_name, 'jose', 'latinize transform failed');
                assert.equal(doc.latin_last_name, 'martinez', 'latinize transform failed');

                // verify JSON representation contains appropriate props
                var json = doc.toJSON();
                assert.equal(typeof json.latin_first_name, 'undefined', '.toJSON() not removed properly');
                assert.equal(typeof json.latin_last_name, 'string', '.toJSON() removed improperly');

                cb(null, doc);
            });

        },

        // update document
        function(doc, cb) {

            user.update({ _id : doc._id }, {
                first_name : 'Björk',
                last_name : 'Sigur Rós',
            }, { upsert : true }, function(err, _doc) {

                assert.equal(err, null);

                user.findOne({ _id : doc._id }, function(err, doc) {

                    assert.equal(err, null);

                    // verify values are appropriately transformed
                    assert.equal(doc.latin_first_name, 'bjork', 'latinize transform failed');
                    assert.equal(doc.latin_last_name, 'sigur ros', 'latinize transform failed');

                    cb(null, doc);

                });

            });
        },

        function(doc, cb) {
            doc.remove(cb);
        }

    ], function(err) {
        assert.equal(null, err);

        if (!/node-dev$/.test(process.env._)) {
            mongoose.disconnect();
            process.exit(0);
        }
    });

}

// connect and test
mongoose.connect('mongodb://localhost/ml-test', function() {
    models();
    test();
});
