'use strict';

describe('Test Array Table Model', function() {

    beforeEach(module('spectrumArrayTableModelModule'));

    var rows = [{ data: { id: 1, name: "aaa" }}, { data: { id: 2, name: "bbb" }}, { data: { id: 3, name: "ccc" }}, { data: {id: 4, name: "ddd" }}, { data: { id: 5, name: "eee" }}];

    it('Validates arrayTableModelService', inject(function(arrayTableModelService, $timeout) {
        expect(arrayTableModelService).toBeDefined();
        expect(arrayTableModelService.createArrayTableModel).toBeDefined();

        var arrayTableModel = arrayTableModelService.createArrayTableModel(rows, function(item) { return item; }, false, [], 10);

        expect(arrayTableModel.undecoratedRows).toEqual(rows);
        $timeout.flush();
        var expectedRows = rows;
        expectedRows.totalLength = rows.length;
        expect(arrayTableModel.rows).toEqual(expectedRows);
        expect(arrayTableModel.rows.totalLength).toBe(5);

        // TODO: more validation
    }));
});
