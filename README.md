# mongoose-latinize

store the latin form of a String field for easy searching

### usage

```javascript
var mongoose_latinize = require('mongoose-latinize');
var user = new mongoose.Schema({ first_name: String });
user.plugin(mongoose_latinize, 'first_name');
```

This adds a new path to your schema, `latin_first_name`, storing the lower-case, [`latinize`d](https://www.npmjs.com/package/latenize) copy of `first_name`.

```javascript
var user1 = new user({ first_name : 'Björk' });
user1.save(function(err, doc) {
    console.log(doc.latin_first_name); // returns 'bjork'
});
```

### options

You can pass a simple string containing the property name (as above), or an object, with the following

 - `prop` - string, required - the data source for the `latin_`-prefixed property
 - `index` - bool, defaults `true` - creates index on the `latin_`-prefixed property
 - `json` - bool, defaults `false` - include the latinized property when calling `.toJSON()`

For example, to not use an index and to include the properties in JSON transforms:

```javascript
var user = new mongoose.Schema({ first_name: String });

user.plugin(mongoose_latinize, {
    prop: 'first_name',
    index: false,
    json: true
});
```
