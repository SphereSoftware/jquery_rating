# Rating
jQuery plugin to display rating component 

## Installation
Include script after the jQuery library:

```html
<script src="/path/to/jquery.rating.js"></script>
```

## Usage

Create an html element on the page

```html
<div class="rating_element"></div>
```
Initialize rating component when scripts loaded:
```javascript
$('.rating_element').rating();
```

This will create rating component with default settings.

Plugin has next options:
```javascript 
$('.rating_element').rating({
    width: 300, 
    height: 30,
    scale: 1.5,
    grades: ['5','4','3','2','1'],
    grade: 1,
    onGradeChanged: function () {}
  });
```

```javascript
width: 200 // define width of maximized component
height: 20 // define height of maximized component
```

```javascript
scale: 1.5 // define how many times minified component will be related to maximized component. eg. 300/1.5 = 200
```

```javascript
grades: ['great', 'good', 'better', 'woops', 'bad'] // define grades that will be displayed on the page.
```

```javascript
grade: 2 // Define at which grade component will be initialized. eg. 2 => good
```

```javascript
onGradeChanged: function () {} // callback to be called when user confirm selection of grade (click on grade in maximized view)
```

