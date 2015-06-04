(function($) {

  var Rating = (function () {

    window.Smiley = (function () {

      function Smiley (maxGrades, currentGrade) {
        this.smileyColor = ['#02EECA', '#0AC2D4', '#0DB0D8', '#157DE3', '#186EE7', '#3254E6', '#4852E1', '#754DD7', '#8E4AD1', '#BF44C5'];
        this.html = {};
        this.maxGrades = maxGrades;
        this.render();
        this.changeMood(currentGrade);
      }

      Smiley.prototype.getHtml = function () {
        var svg = this.html.svg[0];
        svg.appendChild(this.html.border);
        svg.appendChild(this.html.face);
        svg.appendChild(this.html.leftEye);
        svg.appendChild(this.html.rightEye);
        svg.appendChild(this.html.mouth);
        return svg;
      };

      Smiley.prototype.render = function () {
        this.html.svg = $('<svg viewBox="0 0 150 150" width="75px" height="75px"></svg>');
        this.html.border = this.createCycle(75, 75, 75);
        this.html.face = this.createCycle(75, 75, 68);
        this.html.leftEye = this.createCycle(53, 65, 8.5);
        this.html.rightEye = this.createCycle(97, 65, 8.5);
        this.html.mouth = this.createPath();
      };

      Smiley.prototype.createCycle = function (cx, cy, r) {
        var obj = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        obj.setAttributeNS(null, "cx", cx);
        obj.setAttributeNS(null, "cy", cy);
        obj.setAttributeNS(null, "r",  r);
        return obj;
      };

      Smiley.prototype.createPath = function () {
        var obj = document.createElementNS("http://www.w3.org/2000/svg", "path"),
            baseCurve = 'M99.9,103.8 c0,0-22.5,-22.5-53,0';
        obj.setAttributeNS(null, "fill", 'none');
        obj.setAttributeNS(null, "stroke", '#ae4d51');
        obj.setAttributeNS(null, "stroke-linecap", 'round');
        obj.setAttributeNS(null, "stroke-miterlimit",  '10');
        obj.setAttributeNS(null, "stroke-width",  '6');
        obj.setAttributeNS(null, "d",  baseCurve);
        return obj;
      };

      Smiley.prototype.applyColor = function (color) {
        var lumColor = this.colorLuminance(color, -0.2);
        this.html.face.setAttributeNS(null, "fill", '#fff' );
        this.html.border.setAttributeNS(null, "fill", color );
        this.html.leftEye.setAttributeNS(null, "fill", color );
        this.html.rightEye.setAttributeNS(null, "fill", color  );
        this.html.mouth.setAttributeNS(null, "stroke", color  );
      };

      Smiley.prototype.changeMood = function (mood) {
        console.log()
        var value = (22.5 - 22.5 * 2 / this.maxGrades * mood);
        var color = this.smileyColor[
          Math.floor(mood*(this.smileyColor.length-1)/(this.maxGrades-1))
        ];
        this.applyColor(color);

        var basePath = "M99.9,103.8 c0,0-22.5,%curve-53,0";
        this.html.mouth.setAttributeNS(null, "d", basePath.replace(/\%curve/, value));
      };

      Smiley.prototype.colorLuminance = function (hex, lum) {
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
          hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
          c = parseInt(hex.substr(i*2,2), 16);
          c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
          rgb += ("00"+c).substr(c.length);
        }

        return rgb;
      };

      Smiley.prototype.setSize = function (size) {
        console.log(size);
        this.html.svg.attr({height: Math.floor(size), width:  Math.floor(size)});
      };

      return Smiley;
    }());

    function Rating (element, settings) {
      this.element = $(element);
      this.settings = settings;
      this.selectedGrade = this.settings.grade;
      this.supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
      this.minified = !this.supportsTouch;

      this.smiley = new Smiley(this.settings.grades.length, this.settings.grade);

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
        this.generateScale(),
        this.smiley.getHtml(),
        this.generateGradeTitle()
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
      var size = {
        width: this.settings.minifiedWidth,
        height: this.settings.minifiedHeight
      };
      this.element.css(size);
      this.position = this.element.offset();
      this.updateSmileySize(size);
      this.minified = true;
    };

    Rating.prototype.maximize = function () {
      this.element.removeClass('minified');
      var size = {
        width: this.settings.width,
        height: this.settings.height
      };
      this.element.css(size);
      this.position = this.element.offset();
      this.updateSmileySize({width: size.width/1.5, height: size.height/1.5});
      this.minified = false;
    };

    Rating.prototype.updateSmileySize = function (size) {
      console.log(size, this.settings);
      var orientation = this.settings.orientation;
          size =  (orientation === 'horizontal') ? size.height : size.width
      this.smiley.setSize(size);
    };

    Rating.prototype.bindActions = function () {
      this.element.on('click', this.toggleState.bind(this));
      $(document).on('touchend', function(e) {
        var touchEvent = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        if (this.isOnElement(touchEvent.pageX, touchEvent.pageY)) {
          this.reportValueChanged();
        }
      }.bind(this));
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
        var li = $('<li></li>');
        ul.append(li);
      });
      return ul;
    };

    Rating.prototype.generateScale = function () {
      var scale = $('<div class="scale">'),
          filling = $('<div class="filling">');
      this.overlay = $('<div class="overlay">')
      scale.append(filling, this.overlay, this.generateMarking());
      return scale;
    };

    Rating.prototype.generateGradeTitle = function () {
      var settings = this.settings;
      this.currentGradeHtml = $('<div class="currentGrade">' + settings.grade +
       '/' + settings.grades.length + '</div>');
      return this.currentGradeHtml;
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
      this.reportGradeChange();
      this.updateGradeTitle();
      if (force) { this.changeOverval(params) }
      else { this.animateOverlay(params) }
    };

    Rating.prototype.animateOverlay = function (params) {
      this.overlay.animate(params, 50);
    };

    Rating.prototype.changeOverval = function (params) {
      this.overlay.css(params);
    };

    Rating.prototype.updateGradeTitle = function () {
      this.currentGradeHtml.html(this.getCurrentGradeValue() + '/' + this.settings.grades.length);
    };

    Rating.prototype.reportGradeChange = function () {
      var grade = this.selectedGrade;
      console.log(grade);
      if (this.settings.orientation === 'vertical') {
        grade = grade - 1;
      } else {
        grade = this.settings.grades.length - grade;
      }
      this.smiley.changeMood(grade);
    };

    Rating.prototype.reportValueChanged = function () {
      if (!this.settings.onGradeChanged) { return false }

      var gradeValue = this.getCurrentGradeValue();
      this.settings.onGradeChanged(gradeValue);
    };

    Rating.prototype.getCurrentGradeValue = function () {
      var gradeValue = null, grade = this.selectedGrade;
      if (this.settings.orientation === 'vertical') {
        gradeValue = this.settings.grades[grade - 1];
      } else {
        gradeValue = this.settings.grades[this.settings.grades.length - grade];
      }
      return gradeValue;
    }

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