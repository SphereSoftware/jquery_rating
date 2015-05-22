(function($) {

  var Rating = (function () {

    function Rating (element, settings) {
      this.element = $(element);
      this.settings = settings;
      this.selectedGrade = this.settings.grade;
      this.supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
      this.minified = !this.supportsTouch;

      this.switchTimeout = null;

      this.initalize();
    }

    Rating.prototype.initalize = function () {
      this.appendClasses();
      if (this.minified) {
        this.minify();
      } else {
        this.maximize()
      }

      this.bindActions();
      this.position = this.element.offset();
      this.element.append(
        this.generateMarking(),
        this.generateScale()
      );
      if (this.selectedGrade) {
        this.setGrade(this.selectedGrade, true);
      }
    };

    Rating.prototype.appendClasses = function () {
      var elementClass = "rating_meter " + this.settings.orientation;
      if (navigator.userAgent.toLowerCase().indexOf('msie 9') != -1) {
        elementClass += ' no_flex';
      }
      this.element.addClass(elementClass);
    };

    Rating.prototype.minify = function () {
      this.element.addClass('minified');
      this.element.css({
        width: this.settings.minifiedWidth,
        height: this.settings.minifiedHeight
      });
      this.position = this.element.offset();
      this.minified = true;
    };

    Rating.prototype.maximize = function () {
      this.element.removeClass('minified');
      this.element.css({
        width: this.settings.width,
        height: this.settings.height
      });
      this.position = this.element.offset();
      this.minified = false;
    };

    Rating.prototype.bindActions = function () {
      this.element.on('click', this.toggleState.bind(this));
      $(document).mousemove(this.changeScale.bind(this));
      $(document).on('touchmove', function(e) {
        var touchEvent = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        e.pageX = touchEvent.pageX;
        e.pageY = touchEvent.pageY;
        this.changeScale(e);
      }.bind(this));
    };

    Rating.prototype.toggleState = function (evt) {
      if (this.supportsTouch) { return false }
      if (this.minified) {
        this.maximize();
        this.changeScale(evt);
      } else {
        this.minify();
        this.setGrade(this.selectedGrade, true);
        this.reportValueChanged();
      }
    };

    Rating.prototype.generateMarking = function () {
      var ul = $('<ul class="marking">');
      this.settings.grades.forEach(function (grade) {
        var li = $('<li><span>' + grade + '</span></li>');
        ul.append(li);
      });
      return ul;
    };

    Rating.prototype.generateScale = function () {
      var scale = $('<div class="scale">'),
          filling = $('<div class="filling">');
      this.overlay = $('<div class="overlay">')
      scale.append(filling, this.overlay);
      return scale;
    };

    Rating.prototype.generateOverlay = function () {
      return $('<div class="overlay min">')
    };

    Rating.prototype.getCurrentDimensions = function () {
      var width = this.settings.width, height = this.settings.height;
      if (this.minified) {
        width = this.settings.minifiedWidth;
        height = this.settings.minifiedHeight;
      }
      return { width: width, height: height };
    };

    Rating.prototype.getElementBorders = function () {
      var position = this.position,
          dimensions = this.getCurrentDimensions();
      position.right = position.left + dimensions.width;
      position.bottom = position.top + dimensions.height;
      return position;
    };

    Rating.prototype.isOnElement = function (pageX, pageY) {
      var borders = this.getElementBorders();

      return ((borders.left + 2) <= pageX && pageX <= borders.right &&
        borders.top <= pageY && pageY <= borders.bottom - 2);
    };

    Rating.prototype.getCurrentGrade = function (pageX, pageY) {
      var position = this.position,
          dimensions = this.getCurrentDimensions(),
          grades = this.settings.grades,
          grade = null;
      if (this.settings.orientation === 'vertical') {
        var sizePerGrade = dimensions.height / grades.length;
        var inElementOverlap = pageY - position.top;
      } else {
        var sizePerGrade = dimensions.width / grades.length;
        var inElementOverlap = pageX - position.left;
      }

      return Math.ceil(inElementOverlap / sizePerGrade);
    };

    Rating.prototype.changeScale = function (evt, force) {
      if (!this.isOnElement(evt.pageX, evt.pageY) || this.minified) {
        return false;
      }

      evt.preventDefault();

      var currentGrade = this.getCurrentGrade(evt.pageX, evt.pageY);
      if (force || currentGrade !== this.selectedGrade) {
        this.setGrade(currentGrade, force);
      }
    };

    Rating.prototype.setGrade = function (grade, force) {
      var dimensions = this.getCurrentDimensions(),
          gradeSize = null,
          params = {};
      if (this.settings.orientation === 'vertical') {
        gradeSize = dimensions.height / this.settings.grades.length;
        params.bottom = gradeSize * (this.settings.grades.length + 1 - grade);
      } else {
        gradeSize = dimensions.width / this.settings.grades.length;
        params.left = gradeSize * grade;
      }
      this.selectedGrade = grade;
      if (force) { this.changeOverval(params) }
      else ( this.animateOverlay(params))
    };

    Rating.prototype.animateOverlay = function (params) {
      if (this.switchTimeout) {
        clearTimeout(this.switchTimeout);
      }

      var self = this;
      this.switchTimeout = setTimeout(function () {
        self.overlay.animate(params, 150)
      }, 100);
    };

    Rating.prototype.changeOverval = function (params) {
      this.overlay.css(params);
    };

    Rating.prototype.reportValueChanged = function () {
      if (!this.settings.onGradeChanged) { return false }

      var gradeValue = null, grade = this.selectedGrade;
      if (this.settings.orientation === 'vertical') {
        gradeValue = this.settings.grades[grade - 1];
      } else {
        gradeValue = this.settings.grades[this.settings.grades.length - grade];
      }

      if (gradeValue) {
        this.settings.onGradeChanged(gradeValue);
      }
    };

    return Rating;
  }());


  $.fn.rating = function (options) {

    var settings = $.extend({
      orientation: 'horizontal',
      width: 200,
      height: 30,
      scale: 1.5,
      grades: ['great', 'good', 'better', 'woops', 'bad']
    }, options);

    if (settings.orientation == 'vertical' &&
      !options.width || !options.height) {
        settings.width = 30;
        settings.height = 200;
    }

    if (options.grade !== null) {
      settings.grade = settings.grades.indexOf(options.grade) + 1;
    }

    if (!settings.minifiedHeight) {
      settings.minifiedHeight = settings.height / settings.scale;
    }

    if (!settings.minifiedWidth) {
      settings.minifiedWidth = settings.width / settings.scale;
    }

    this.each( function() {
      new Rating(this, settings);
    });

  }

}(jQuery));