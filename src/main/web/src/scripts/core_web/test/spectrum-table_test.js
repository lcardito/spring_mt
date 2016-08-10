'use strict';

describe('Spectrum Table', function() {

    var element = '<spectrum-table id="widget-result-table-1" rows="rows" order-by-initial="updated"></spectrum-table>';

    beforeEach(module("restangular"));

    beforeEach(module('spectrumTableModule', function() {
    }));

    var $compile,
        $rootScope,
        $httpBackend,
        $scope,
        Restangular;

    beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _Restangular_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        Restangular = _Restangular_;

        $httpBackend.whenGET('partials/spectrum-table.html').respond("<table><thead></thead><tbody><tr id='row'><td><a href='javascript:void(0)'>test</a></td></tr></tbody></table>");

        jasmine.clock().install();
    }));

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    var spectrumTable;

    var initSpectrumTable = function() {
        spectrumTable = $compile(element)($scope);
        $('body').append(spectrumTable);
        $httpBackend.flush();
        $scope.$digest();
        return spectrumTable.isolateScope();
    };

    it('Validates static preview content', function() {
        var scope = initSpectrumTable();
        var tableRow =  $("#row", spectrumTable);

        var $event = {
            target: $("a", tableRow)
        };
        var row = {
            data: {
                preview: {
                    title: "Test title preview",
                    content: function() {
                        return "static content";
                    }
                }
            }
        };

        expect(tableRow.data('bs.popover')).toBeUndefined();
        scope.itemEntered($event, row);

        expect(tableRow.data('bs.popover')).toBeDefined();
        expect(tableRow.data('bs.popover').options.trigger).toBe("hover");
        expect(tableRow.data('bs.popover').options.title).toBe("Test title preview");
        expect(tableRow.data('bs.popover').options.html).toBe(true);
        expect(tableRow.data('bs.popover').options.placement).toBe("auto top");
        expect(tableRow.data('bs.popover').options.container).toBe("body");
        expect(tableRow.data('bs.popover').options.delay).toEqual({ "show": 500, "hide": 0 });
        expect(tableRow.data('bs.popover').options.content).toBe('<div class="spectrum-table-row-preview" for="widget-result-table-1"><div class="overlay"></div></div>');

        // we need to wait 500ms for popover debounce and currently 150ms when the popover is shown as we listen for shown.bs.popover event in the functionality
        jasmine.clock().tick(1000);

        expect($(".spectrum-table-row-preview[for='widget-result-table-1']").size()).toBe(1);
        var popoverElement = tableRow.data('bs.popover').$tip;
        expect(popoverElement.find(".popover-title").html()).toBe("Test title preview");
        expect(popoverElement.find(".popover-content").html()).toBe('<div class="spectrum-table-row-preview" for="widget-result-table-1">static content</div>');
    });

    it('tests preview not defined', function() {
        var scope = initSpectrumTable();
        var tableRow =  $("#row", spectrumTable);
        var $event = {
            target: $("a", tableRow)
        };
        var row = {
            data: {}
        };

        expect(tableRow.data('bs.popover')).toBeUndefined();
        scope.itemEntered($event, row);
        expect(tableRow.data('bs.popover')).toBeUndefined();
        expect($(".popover", spectrumTable).size()).toBe(0);
    });

    it('Validates Restangular content', function() {
        $httpBackend.whenGET("/application/1/confluence/page/1/preview").respond('<html><body>test</body></html>');

        var scope = initSpectrumTable();

        var tableRow =  $("#row", spectrumTable);

        var $event = {
            target: $("a", tableRow)
        };
        var row = {
            data: {
                preview: {
                    title: "Test title preview",
                    content: function() {
                        return Restangular.one("application/1/confluence/page/1/preview").get();
                    }
                }
            }
        };

        expect(tableRow.data('bs.popover')).toBeUndefined();
        scope.itemEntered($event, row);

        expect(tableRow.data('bs.popover')).toBeDefined();
        expect(tableRow.data('bs.popover').options.trigger).toBe("hover");
        expect(tableRow.data('bs.popover').options.title).toBe("Test title preview");
        expect(tableRow.data('bs.popover').options.html).toBe(true);
        expect(tableRow.data('bs.popover').options.placement).toBe("auto top");
        expect(tableRow.data('bs.popover').options.container).toBe("body");
        expect(tableRow.data('bs.popover').options.delay).toEqual({ "show": 500, "hide": 0 });
        expect(tableRow.data('bs.popover').options.content).toBe('<div class="spectrum-table-row-preview" for="widget-result-table-1"><div class="overlay"></div></div>');

        // we need to wait 500ms for popover debounce and currently 150ms when the popover is shown as we listen for shown.bs.popover event in the functionality
        jasmine.clock().tick(1000);
        $httpBackend.flush();

        expect($(".spectrum-table-row-preview[for='widget-result-table-1']").size()).toBe(1);
        var popoverElement = tableRow.data('bs.popover').$tip;
        expect(popoverElement.find(".popover-title").html()).toBe("Test title preview");
        expect(popoverElement.find(".popover-content").html()).toContain('<iframe src="about:blank" scrolling="no"></iframe>');
    });

    it('Validates error of Restangular content', function() {
        $httpBackend.whenGET("/application/1/confluence/page/1/preview").respond(500);
        var scope = initSpectrumTable();

        var tableRow =  $("#row", spectrumTable);

        var $event = {
            target: $("a", tableRow)
        };
        var row = {
            data: {
                preview: {
                    title: "Test title preview",
                    content: function() {
                        return Restangular.one("application/1/confluence/page/1/preview").get();
                    }
                }
            }
        };

        expect(tableRow.data('bs.popover')).toBeUndefined();
        scope.itemEntered($event, row);

        expect(tableRow.data('bs.popover')).toBeDefined();
        expect(tableRow.data('bs.popover').options.trigger).toBe("hover");
        expect(tableRow.data('bs.popover').options.title).toBe("Test title preview");
        expect(tableRow.data('bs.popover').options.html).toBe(true);
        expect(tableRow.data('bs.popover').options.placement).toBe("auto top");
        expect(tableRow.data('bs.popover').options.container).toBe("body");
        expect(tableRow.data('bs.popover').options.delay).toEqual({ "show": 500, "hide": 0 });
        expect(tableRow.data('bs.popover').options.content).toContain('<div class="spectrum-table-row-preview" for="widget-result-table-1"><div class="overlay"></div></div>');

        // we need to wait 500ms for popover debounce and currently 150ms when the popover is shown as we listen for shown.bs.popover event in the functionality
        jasmine.clock().tick(1000);
        $httpBackend.flush();

        expect($(".spectrum-table-row-preview[for='widget-result-table-1']").size()).toBe(1);
        var popoverElement = tableRow.data('bs.popover').$tip;
        expect(popoverElement.find(".popover-title").html()).toBe("Test title preview");
        expect(popoverElement.find(".popover-content").html()).toBe('<div class="spectrum-table-row-preview" for="widget-result-table-1"><div class="alert alert-danger"><strong>Error!</strong> The page preview could not be loaded.</div></div>');
    });

    it('tests popover removed after row update', function() {
            var scope = initSpectrumTable();

            var tableRow =  $("#row", spectrumTable);

            var $event = {
                target: $("a", tableRow)
            };
            var row = {
                data: {
                    preview: {
                        title: "Test title preview",
                        content: "Test content"
                    }
                }
            };

            expect(tableRow.data('bs.popover')).toBeUndefined();
            scope.itemEntered($event, row);


            // we need to wait 500ms for popover debounce and currently 150ms when the popover is shown as we listen for shown.bs.popover event in the functionality
            jasmine.clock().tick(1000);

            expect($(".spectrum-table-row-preview[for='widget-result-table-1']").size()).toBe(1);
            var popoverElement = tableRow.data('bs.popover').$tip;
            expect(popoverElement.find(".popover-title").html()).toBe("Test title preview");
            expect(popoverElement.find(".popover-content").html()).toBe('<div class="spectrum-table-row-preview" for="widget-result-table-1">Test content</div>');
            $scope.rows = [];
            scope.$digest();
            expect($(".spectrum-table-row-preview[for='widget-result-table-1']").size()).toBe(0);
        });
});
