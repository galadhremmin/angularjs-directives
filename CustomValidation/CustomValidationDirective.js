define(["require", "exports"], function (require, exports) {
    var ModelValidator = (function () {
        function ModelValidator(validatorName_, valueConverter_, attributeName_) {
            if (valueConverter_ === void 0) { valueConverter_ = null; }
            if (attributeName_ === void 0) { attributeName_ = undefined; }
            this.validatorName_ = validatorName_;
            this.valueConverter_ = valueConverter_;
            this.attributeName_ = attributeName_;
            this.rules_ = [];
        }
        ModelValidator.prototype.watch = function () {
            var _this = this;
            this.scope_.$watch(function () { return _this.attr_[_this.attributeName_]; }, function () {
                _this.ctrl_.$setViewValue(_this.ctrl_.$viewValue);
            });
        };
        ModelValidator.prototype.addRule = function (expression) {
            this.rules_.push(expression);
        };
        ModelValidator.prototype.validate = function (modelValue) {
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
        ModelValidator.prototype.isEmpty = function (value) {
            return value === undefined || value === null || /^\s*$/.test(value);
        };
        ModelValidator.prototype.link = function (scope, elem, attr, ctrl) {
            var _this = this;
            var this_ = this;
            this.scope_ = scope;
            this.attr_ = attr;
            this.elem_ = elem;
            this.ctrl_ = ctrl;
            this.watch();
            var validator = function (modelValue) {
                var v = modelValue;
                if (v !== undefined && v !== null && _this.valueConverter_) {
                    v = _this.valueConverter_.call(_this, modelValue);
                }
                var result = _this.validate(v);
                ctrl.$setValidity(_this.validatorName_, result);
                return result ? modelValue : undefined;
            };
            ctrl.$parsers.push(function () {
                return validator.apply(this_, arguments);
            });
            ctrl.$formatters.push(function () {
                return validator.apply(this_, arguments);
            });
        };
        ModelValidator.prototype.clone = function () {
            var validator = new ModelValidator(this.validatorName_, this.valueConverter_, this.attributeName_);
            validator.rules_ = this.rules_;
            return validator;
        };
        ModelValidator.prototype.toDirective = function () {
            var _this = this;
            return {
                restrict: 'A',
                require: 'ngModel',
                compile: function () {
                    _this.attributeName_ = this.name;
                    return function () {
                        var validator = _this.clone();
                        validator.link.apply(validator, arguments);
                    };
                }
            };
        };
        return ModelValidator;
    })();
    function anyToNumberConverter(v) {
        return parseInt(String(v).replace(/[^0-9]/g, ''));
    }
    function bootstrapValidationDirective() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                var groupElem = elem.parent('.form-group');
                scope.$watch(function () {
                    return !elem.is(':disabled') && ctrl.$invalid;
                }, function (isValid) {
                    groupElem.toggleClass('has-error', isValid);
                });
            }
        };
    }
    exports.bootstrapValidationDirective = bootstrapValidationDirective;
    function minDirective($filter) {
        var validator = new ModelValidator('min', anyToNumberConverter);
        validator.addRule(function (modelValue, extremeValue) { return modelValue >= extremeValue; });
        return validator.toDirective();
    }
    exports.minDirective = minDirective;
    function maxDirective($filter) {
        var validator = new ModelValidator('max', anyToNumberConverter);
        validator.addRule(function (modelValue, extremeValue) { return modelValue <= extremeValue; });
        return validator.toDirective();
    }
    exports.maxDirective = maxDirective;
});
