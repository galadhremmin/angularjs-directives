define(["require", "exports"], function (require, exports) {
    function currencyFormatDirective($filter, $browser, $locale) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModelCtrl) {
                var unformat = function (v) {
                    var parts = String(v).split($locale.NUMBER_FORMATS.DECIMAL_SEP);
                    var s = '';
                    for (var i = 0; i < parts[0].length; i += 1) {
                        var c = parts[0].charCodeAt(i);
                        if (c >= 48 && c <= 48 + 9) {
                            s += parts[0][i];
                        }
                    }
                    return parseInt(s || '0');
                };
                var format = function (v) {
                    if (!v || v.length < 1) {
                        return v;
                    }
                    if (typeof v === 'number') {
                        v = String(v);
                    }
                    return $filter('number')(v);
                };
                var listener = function () {
                    var value = unformat($element.val() || '0');
                    $element.val(format(value));
                };
                ngModelCtrl.$parsers.push(function (viewValue) {
                    return unformat(viewValue);
                });
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
                $element.prop('pattern', '^[0-9\\s]*$');
            }
        };
    }
    return currencyFormatDirective;
});
