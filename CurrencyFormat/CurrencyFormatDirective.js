define(["require", "exports"], function (require, exports) {
    function currencyFormatDirective($filter, $browser, $locale) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModelCtrl) {
                var unformat = function (v) {
                    if (ngModelCtrl.$isEmpty(v)) {
                        return undefined;
                    }
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
                    if (ngModelCtrl.$isEmpty(v)) {
                        return undefined;
                    }
                    if (!v || v.length < 1) {
                        return '0';
                    }
                    if (typeof v === 'number') {
                        v = String(v);
                    }
                    return $filter('number')(v);
                };
                var listener = function () {
                    var origV = $element.val() || '0';
                    var v = format(unformat(origV));
                    var elem = $element.get(0);
                    var ratio = origV.length < 1 ? 0 : elem.selectionStart / origV.length;
                    if (v === undefined || v === null) {
                        return;
                    }
                    if (origV !== v) {
                        $element.val(v);
                        if (ratio > 0) {
                            var pos = Math.max(Math.ceil(ratio * v.length), 0);
                            elem.setSelectionRange(pos, pos);
                        }
                    }
                };
                ngModelCtrl.$parsers.push(function (viewValue) {
                    return unformat(viewValue);
                });
                ngModelCtrl.$render = function () {
                    var v = format(ngModelCtrl.$viewValue);
                    if (v !== undefined) {
                        $element.val(v);
                    }
                };
                $element.on('change', listener);
                $element.on('keydown', function (event) {
                    var key = event.keyCode;
                    if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40) || event.metaKey || event.ctrlKey) {
                        return;
                    }
                    $browser.defer(listener);
                });
                $element.on('paste cut', function () {
                    $browser.defer(listener);
                });
                $element.prop('pattern', '^[0-9\\s]*$');
            }
        };
    }
    return currencyFormatDirective;
});
