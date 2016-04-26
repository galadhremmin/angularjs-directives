function currencyFormatDirective($filter: ng.IFilterService, $browser: any, $locale: ng.ILocaleService) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: ($scope: ng.IScope, $element: ng.IRootElementService, $attrs: ng.IAttributes, ngModelCtrl: ng.INgModelController) => {
      // Removes formatting
      let unformat = (v) => {
        return !v ? v : String(v).replace(/\-/g, '');
      };

      // Applies formatting
      let format = (v) => {
        v = unformat(v);

        if (v && v.length > 6) {
          v = v.substr(0, 6) + '-' + v.substr(6, 4);
        }
        return v;
      };

      let listener = function () {
        let value = unformat($element.val() || '');
        $element.val(format(value));
      };
            
      // This runs when the model gets updated on the scope directly and keeps our view in sync
      ngModelCtrl.$render = function () {
        $element.val(format(ngModelCtrl.$viewValue));
      };

      ngModelCtrl.$validators['CivicRegistrationNumber'] = (v) => new RegExp($element.prop('pattern')).test(v);

      $element.on('change', listener);
      $element.on('keydown', function (event) {
        var key = event.keyCode;
        // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
        // This lets us support copy and paste too
        if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40) || event.metaKey || event.ctrlKey) {
          return;
        }

        $browser.defer(listener); // Have to do this or changes don't get picked up properly
      });

      $element.on('paste cut', function () {
        $browser.defer(listener);
      });

      $element.prop('placeholder', 'ÅÅMMDD-XXXX');
      $element.prop('pattern', '^[0-9]{6}\\-[0-9]{4}$');
    }
  };
}

export = currencyFormatDirective;
