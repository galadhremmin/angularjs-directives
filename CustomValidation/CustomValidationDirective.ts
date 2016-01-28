﻿class ModelValidator {
  private rules_: ((modelValue, extremeValue) => boolean)[];
  private scope_: ng.IScope;
  private ctrl_: ng.INgModelController;
  private attr_: ng.IAttributes;
  private elem_: ng.IAugmentedJQuery;

  constructor(private validatorName_: string, private valueConverter_: (value: any) => any = null, private attributeName_: string = undefined) {
    this.rules_ = [];
  }

  /**
    * Creates a watcher for the attribute triggering the directive.
    */
  public watch(): void {
    this.scope_.$watch(() => this.attr_[this.attributeName_], () => {
      // Coerce the validation to trigger by refreshing the view value.
      this.ctrl_.$setViewValue(this.ctrl_.$viewValue);
    });
  }

  /**
    * Adds the specified validation rule. The _extremeValue_ variable represents the
    * evaluated validation value.
    */
  public addRule(expression: (modelValue, extremeValue) => boolean): void {
    this.rules_.push(expression);
  }

  /**
    * Validates the specified model value.
    */
  public validate(modelValue): boolean {
    let extremeValue = this.scope_.$eval(this.attr_[this.attributeName_]);

    if (this.isEmpty(modelValue)) {
      return true; // Empty = validation OK! Fall back to the required/ngRequired attribute instead.
    }

    for (var i = 0; i < this.rules_.length; i += 1) {
      let rule = this.rules_[i];

      if (!rule.call(this, modelValue, extremeValue)) {
        return false;
      }
    }

    return true;
  }

  private isEmpty(value: string): boolean {
    return value === undefined || value === null || /^\s*$/.test(value);
  }

  private link(scope, elem, attr, ctrl): void {
    var this_ = this;

    this.scope_ = scope;
    this.attr_ = attr;
    this.elem_ = elem;
    this.ctrl_ = ctrl;

    this.watch();

    var validator = (modelValue) => {
      let v = modelValue;
      if (v !== undefined && v !== null && this.valueConverter_) {
        v = this.valueConverter_.call(this, modelValue);
      }

      let result = this.validate(v);
      ctrl.$setValidity(this.validatorName_, result);

      return result ? modelValue : undefined;
    };

    ctrl.$parsers.push(function () {
      return validator.apply(this_, arguments);
    });

    ctrl.$formatters.push(function () {
      return validator.apply(this_, arguments);
    });
  }

  public clone(): ModelValidator {
    let validator = new ModelValidator(this.validatorName_, this.valueConverter_, this.attributeName_);
    validator.rules_ = this.rules_;

    return validator;
  }

  public toDirective(): ng.IDirective {
    var _this = this;
    return {
      restrict: 'A',
      require: 'ngModel',
      compile: function () {
        // Save the name of the property, as it will be watched for changes
        _this.attributeName_ = this.name;

        // Return the linking method
        return function () {
          let validator = _this.clone();
          validator.link.apply(validator, arguments);
        };
      }
    };
  }
}

function anyToNumberConverter(v): number {
  return parseInt(String(v).replace(/[^0-9]/g, ''));
}

/**
  * Applies Bootstrap's _has-error_ class to all form groups which contain an invalid input field.
  */
export function bootstrapValidationDirective(): ng.IDirective {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: (scope, elem, attr, ctrl: ng.INgModelController) => {
      let groupElem = elem.parent('.form-group');
      scope.$watch(() => {
        return !elem.is(':disabled') && ctrl.$invalid;
      }, function (isValid) {
        groupElem.toggleClass('has-error', isValid);
      });
    }
  };
}

export function minDirective($filter): ng.IDirective {
  var validator = new ModelValidator('min', anyToNumberConverter);
  validator.addRule((modelValue, extremeValue) => modelValue >= extremeValue);
  return validator.toDirective();
}

export function maxDirective($filter): ng.IDirective {
  var validator = new ModelValidator('max', anyToNumberConverter);
  validator.addRule((modelValue, extremeValue) => modelValue <= extremeValue);
  return validator.toDirective();
}