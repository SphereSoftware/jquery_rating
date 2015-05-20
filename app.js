$(document).ready(function () {

  // orientation: 'horizontal/vertical',
  // width: 200,
  // height: 30,
  // scale: 1.5,
  // grades: ['great', 'good', 'better', 'woops', 'bad'],
  // grade: 1,
  // onGradeChanged: function () {}

  $('.num').rating({
    width: 300, height: 30,
    grades: ['5','4','3','2','1'],
    onGradeChanged: function (grade) {
      console.log('changed grade ', grade);
    }
  });

  $('.def').rating({
    orientation: "vertical",
    grade: 1,
    onGradeChanged: function (grade) {
      console.log('changed grade ', grade);
    }
  });
});