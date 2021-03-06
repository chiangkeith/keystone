var demand = require('must');
var SelectType = require('../SelectType');

exports.initList = function (List) {
	List.add({
		select: { type: SelectType, options: 'one, two, three' },
		nested: {
			select: { type: SelectType, options: 'one, two, three' },
		},
	});
};

exports.testFieldType = function (List) {
	var testItem = new List.model();

	it('should update top level fields', function (done) {
		List.fields.select.updateItem(testItem, {
			select: 'one',
		}, function () {
			demand(testItem.select).be('one');
			testItem.select = undefined;
			done();
		});
	});

	it('should update nested fields', function (done) {
		List.fields['nested.select'].updateItem(testItem, {
			nested: {
				select: 'one',
			},
		}, function () {
			demand(testItem.nested.select).be('one');
			testItem.nested.select = undefined;
			done();
		});
	});

	it('should update nested fields with flat paths', function (done) {
		List.fields['nested.select'].updateItem(testItem, {
			'nested.select': 'one',
		}, function () {
			demand(testItem.nested.select).be('one');
			testItem.nested.select = undefined;
			done();
		});
	});

	it('should format values with the label of the option', function () {
		testItem.select = 'one';
		demand(List.fields.select.format(testItem)).be('One');
		testItem.select = undefined;
	});

	it('should return a blank string when formatting an undefined value', function () {
		demand(List.fields.select.format(testItem)).be('');
	});

	it('should validate a valid option has been provided', function () {
		testItem.select = 'one';
		demand(List.fields.select.inputIsValid(testItem)).be(true);
		testItem.select = 'undefined';
	});

	it('should return a shallow clone of the options', function () {
		var clonedOps = List.fields.select.cloneOps();
		demand(clonedOps).eql(List.fields.select.ops);
		demand(clonedOps).not.equal(List.fields.select.ops);
	});
};
