define(["require", "exports"], function (require, exports) {
    function currencyFormatDirective($filter, $browser, $locale) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModelCtrl) {
                var unformat = function (v) {
                    return !v ? v : String(v).replace(/\-/g, '');
                };
                var format = function (v) {
                    v = unformat(v);
                    if (v && v.length > 6) {
                        v = v.substr(0, 6) + '-' + v.substr(6, 4);
                    }
                    return v;
                };
                var listener = function () {
                    var value = unformat($element.val() || '');
                    $element.val(format(value));
                };
                ngModelCtrl.$render = function () {
                    $element.val(format(ngModelCtrl.$viewValue));
                };
                $element.bind('change', listener);
                $element.bind('keydown', function (event) {
                    var key = event.keyCode;
                    if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40) || event.metaKey || event.ctrlKey) {
                        return;
                    }
                    $browser.defer(listener);
                });
                $element.bind('paste cut', function () {
                    $browser.defer(listener);
                });
                $element.prop('placeholder', 'ÅÅMMDD-XXXX');
            }
        };
    }
    return currencyFormatDirective;
});
