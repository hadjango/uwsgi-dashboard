import $ from 'jquery';
import ko from 'knockout';
import 'bootstrap';

ko.bindingHandlers.popover = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $element = $(element);
        var popoverBindingValues = ko.utils.unwrapObservable(valueAccessor());
        var template = popoverBindingValues.template || false;
        var options = popoverBindingValues.options || {title: 'popover'};
        var data = popoverBindingValues.data || false;
        if (template !== false) {
            if (data) {
                options.content = "<!-- ko template: { name: template, if: data, data: data } --><!-- /ko -->";
            } else {
                options.content = $('#' + template).html();
            }
            options.html = true;
        }
        $element.on('shown.bs.popover', function(event) {
            var popoverData = $(event.target).data();
            var popoverEl = popoverData['bs.popover'].$tip;
            var options = popoverData['bs.popover'].options || {};
            var button = $(event.target);
            var buttonPosition = button.position();
            var buttonDimensions = {
                x: button.outerWidth(),
                y: button.outerHeight()
            };

            ko.cleanNode(popoverEl[0]);
            if (data) {
                ko.applyBindings({template: template, data: data}, popoverEl[0]);
            } else {
                ko.applyBindings(viewModel, popoverEl[0]);
            }

            var popoverDimensions = {
                x: popoverEl.outerWidth(),
                y: popoverEl.outerHeight()
            };

            popoverEl.find('button[data-dismiss="popover"]').click(function() {
                button.popover('hide');
            });

            switch (options.placement) {
                case 'right':
                    popoverEl.css({
                        left: buttonDimensions.x + buttonPosition.left,
                        top: (buttonDimensions.y / 2 + buttonPosition.top) - popoverDimensions.y / 2
                    });
                    break;
                case 'left':
                    popoverEl.css({
                        left: buttonPosition.left - popoverDimensions.x,
                        top: (buttonDimensions.y / 2 + buttonPosition.top) - popoverDimensions.y / 2
                    });
                    break;
                case 'top':
                    popoverEl.css({
                        left: buttonPosition.left + (buttonDimensions.x / 2 - popoverDimensions.x / 2),
                        top: buttonPosition.top - popoverDimensions.y
                    });
                    break;
                case 'bottom':
                    popoverEl.css({
                        left: buttonPosition.left + (buttonDimensions.x / 2 - popoverDimensions.x / 2),
                        top: buttonPosition.top + buttonDimensions.y
                    });
                    break;
            }
        });

        $element.popover(options);

        return { controlsDescendantBindings: true };
    }
};
