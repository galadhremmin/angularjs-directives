function currencyFormatDirective($filter: ng.IFilterService, $browser: any, $locale: ng.ILocaleService) {
  const CURRENCY_SYMBOL = ' kr';

  return {
    restrict: 'A',
    require: 'ngModel',
    link: ($scope: ng.IScope, $element: ng.IAugmentedJQuery, $attrs: ng.IAttributes, ngModelCtrl: ng.INgModelController) => {

      // Removes currency format
      var applySymbol = (v: string, add: boolean) => {
        if (CURRENCY_SYMBOL === null || ngModelCtrl.$isEmpty(v)) {
          return v;
        }

        if (!add) {
          if (v.substr(-CURRENCY_SYMBOL.length) === CURRENCY_SYMBOL) {
            v = v.substr(0, v.length - CURRENCY_SYMBOL.length);
          }
        } else {
          v = v + CURRENCY_SYMBOL;
        }

        return v;
      };

      // Removes formatting
      var unformat = (v) => {
        if (ngModelCtrl.$isEmpty(v)) {
          return undefined;
        }

        var vs = String(v);
        let parts = vs.split($locale.NUMBER_FORMATS.DECIMAL_SEP);
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
      var format = (v) => {
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
        // Retrieve the original value, or default to zero if none is present.
        let origV = $element.val() || '0';

        // Examine where the caret is currently positioned and calculate the carets position in 
        // a percentage based on the length of the string. This is a hacky solution to figure out
        // where to position the caret after the string has been reformatted (and thus, in all likelihood
        // lengthened).
        let v = format(unformat(origV));
        let elem = <HTMLInputElement> $element.get(0);
        let ratio = origV.length < 1 ? 0 : elem.selectionStart / origV.length; // the 0-check to avoid NaN by division by zero
        if (v === undefined || v === null) { // Ignore undefined / null model values
          return;
        }

        // Only change the element's current value if it doesn't match the formatted value.
        if (origV !== v) {
          $element.val(v);

          if (ratio > 0) {
            // Calculate where to position the caret based on the ratio calculated above.
            let pos = Math.max(Math.ceil(ratio * v.length), 0);
            // The _setSelectionRange_ is a bit special. The second argument isn't the length of the 
            // selection, but rather the end position. This is why _pos_ is passed twice.
            elem.setSelectionRange(pos, pos);
          }
        }
      };
            
      // This runs when we update the text field
      ngModelCtrl.$parsers.push(function (viewValue) {
        return unformat(viewValue);
      });
            
      // This runs when the model gets updated on the scope directly and keeps our view in sync
      ngModelCtrl.$render = function () {
        let v = format(ngModelCtrl.$viewValue);
        if (v !== undefined) {
          $element.val(applySymbol(v, true));
        }
      };

      $element.on('blur', function () {
        $(this).val(applySymbol($(this).val(), true));
      });

      $element.on('focus', function () {
        $(this).val(applySymbol($(this).val(), false));
      });
      
      $element.on('change', listener);
      $element.on('keydown', function (event) {
        var key = event.keyCode
        // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
        // This lets us support copy and paste too
        if (key == 9 || key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40) || event.metaKey || event.ctrlKey) {
          return;
        }

        $browser.defer(listener); // Have to do this or changes don't get picked up properly
      });
      
      $element.on('paste cut', function () {
        $browser.defer(listener);
      });

      $element.prop('pattern', '^[0-9\\s]*(\\skr)?$');
    }
  };
}

export = currencyFormatDirective;
