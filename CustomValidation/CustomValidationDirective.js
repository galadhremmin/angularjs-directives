define(["require", "exports"], function (require, exports) {
    var ModelValidatior = (function () {
        function ModelValidatior(validatorName_, filter_) {
            if (filter_ === void 0) { filter_ = null; }
            this.validatorName_ = validatorName_;
            this.filter_ = filter_;
            this.rules_ = [];
        }
        ModelValidatior.prototype.watch = function () {
            var _this = this;
            this.scope_.$watch(function () { return _this.attr_[_this.attributeName_]; }, function () {
                _this.ctrl_.$setViewValue(_this.ctrl_.$viewValue);
            });
        };
        ModelValidatior.prototype.addRule = function (expression) {
            this.rules_.push(expression);
        };
        ModelValidatior.prototype.validate = function (modelValue) {
            var extremeValue = this.scope_.$eval(this.attr_[this.attributeName_]);
            if (this.isEmpty(modelValue)) {
                return true;
            }
            for (var i = 0; i < this.rules_.length; i += 1) {
                var rule = this.rules_[i];
                if (!rule.call(this, modelValue, extremeValue)) {
                    return false;
                }
            }
            return true;
        };
        ModelValidatior.prototype.isEmpty = function (value) {
            return value === undefined || value === null || /^\s*$/.test(value);
        };
        ModelValidatior.prototype.link = function (scope, elem, attr, ctrl) {
            var _this = this;
            this.scope_ = scope;
            this.attr_ = attr;
            this.ctrl_ = ctrl;
            this.elem_ = elem;
            this.watch();
            var validator = function (modelValue) {
                var v = modelValue;
                if (v !== undefined && v !== null && _this.filter_) {
                    v = _this.filter_.call(_this, modelValue);
                }
                var result = _this.validate(v);
                ctrl.$setValidity(_this.validatorName_, result);
                var formGroup = elem.parent('.form-group');
                formGroup[result ? 'removeClass' : 'addClass'].call(formGroup, 'has-error');
                return result ? modelValue : undefined;
            };
            ctrl.$parsers.push(validator);
            ctrl.$formatters.push(validator);
        };
        ModelValidatior.prototype.toDirective = function () {
            var this_ = this;
            return {
                restrict: 'A',
                require: 'ngModel',
                compile: function () {
                    this_.attributeName_ = this.name;
                    return function () {
                        this_.link.apply(this_, arguments);
                    };
                }
            };
        };
        return ModelValidatior;
    })();
    function minDirective($filter) {
        var validator = new ModelValidatior('min', function (v) { return String(v).replace(/[^0-9]/g, ''); });
        validator.addRule(function (modelValue, extremeValue) { return modelValue >= extremeValue; });
        return validator.toDirective();
    }
    exports.minDirective = minDirective;
    function maxDirective($filter) {
        var validator = new ModelValidatior('max', function (v) { return String(v).replace(/[^0-9]/g, ''); });
        validator.addRule(function (modelValue, extremeValue) { return modelValue <= extremeValue; });
        return validator.toDirective();
    }
    exports.maxDirective = maxDirective;
});