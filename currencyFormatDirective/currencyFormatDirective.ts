function currencyFormatDirective($filter: ng.IFilterService, $browser: ng.IBrowserService, $locale: ng.ILocaleService) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: ($scope: ng.IScope, $element: ng.IRootElementService, $attrs: ng.IAttributes,ngModelCtrl: ng.INgModelController) => {
      // Removes formatting
      let unformat = (v) => {
        let parts = String(v).split($locale.NUMBER_FORMATS.DECIMAL_SEP);
        let s = '';
        for (var i = 0; i < parts[0].length; i += 1) {
          let c = parts[0].charCodeAt(i);
          if (c >= 48 && c <= 48 + 9) {
            s += parts[0][i];
          }
        }

        return parseInt(s || '0');
      };

      // Applies formatting
      let format = (v) => {
        if (!v || v.length < 1) {
          return v;
        }

        if (typeof v === 'number') {
          v = String(v);
        }

        return $filter('number')(v);
      };

      let listener = function () {
        let value = unformat($element.val() || '0');
        $element.val(format(value));
      };
            
      // This runs when we update the text field
      ngModelCtrl.$parsers.push(function (viewValue) {
        return unformat(viewValue);
      });
            
      // This runs when the model gets updated on the scope directly and keeps our view in sync
      ngModelCtrl.$render = function () {
        $element.val(format(ngModelCtrl.$viewValue))
      };

      $element.bind('change', listener)
      $element.bind('keydown', function (event) {
        var key = event.keyCode
        // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
        // This lets us support copy and paste too
        if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
          return;
        }

        $browser.defer(listener); // Have to do this or changes don't get picked up properly
      });

      $element.bind('paste cut', function () {
        $browser.defer(listener);
      });
    }
  };
}

export = currencyFormatDirective;
