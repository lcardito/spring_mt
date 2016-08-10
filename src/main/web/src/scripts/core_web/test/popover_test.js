'use strict';

describe('account', function() {
    beforeEach(module('spectrumPopoverModule'));

    var $compile,
        $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    var POPOVER_TEXT = "Filter options",
        POPOVER_PLACEMENT = "bottom",
        VALID_ELEMENT = '<a spectrum-popover popover-text="' + POPOVER_TEXT + '" popover-placement="' + POPOVER_PLACEMENT + '">some text</a>',
        INVALID_ELEMENT = '<div spectrumpopover popover-text="' + POPOVER_TEXT + '" popover-placement="' + POPOVER_PLACEMENT + '">some text</div>';

    it('Tests valid popover element', function() {
        var element = $compile(VALID_ELEMENT)($rootScope);
        $rootScope.$digest();

        // Checks that the compiled element is popover object and contains defined options
        expect(element.data('bs.popover')).not.toBeUndefined();
        expect(element.data('bs.popover').options.content).toEqual(POPOVER_TEXT);
        expect(element.data('bs.popover').options.placement).toEqual(POPOVER_PLACEMENT);
    });

    it('Tests invalid popover element', function() {
        var element = $compile(INVALID_ELEMENT)($rootScope);
        $rootScope.$digest();

        // Check that the compiled element is not popover object
        expect(element.data('bs.popover')).toBeUndefined();
    });
});