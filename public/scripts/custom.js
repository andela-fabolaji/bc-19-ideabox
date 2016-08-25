$(document).ready(function () {
  var signup = $('#signup');
  var signin = $('#signin');
  var signupLink = $('.signup');
  var signinLink = $('.signin');

  signupLink.click(function () {
    signin.css('display', 'none');
    signup.css('display', 'block');
  });

  signinLink.click(function () {
    signin.css('display', 'block');
    signup.css('display', 'none');
  });

  var newRequest = new GlobalRequest();

  var submit = $('.submit');
  submit.click(function (e) {

    e.preventDefault();

    if ($(this).attr('id') === 'signinBtn') {
      var formFields = ['email', 'password'];
      var userDetails = newRequest.formData(formFields);
      var returnMsgField = $(this).parents('.modal-body').children('.auth-msg');
      
      if (userDetails === 'null') {
        alert('1');
        returnMsgField.text() = 'All fields are compulsory';
      } else if(userDetails.fullname.split(' ').length < 2) {
        alert('2')
        returnMsgField.text() = 'Your fullname is required';
      } else {
        alert('3');
        var ajaxRes = newRequest.ajaxCall('POST', userDetails, '/signin/', $(this));
      }
    }

    if ($(this).attr('id') === 'signupBtn') {
      var formFields = ['fullname', 'regemail', 'regpassword', 'confirmpassword'];
      var userDetails = newRequest.formData(formFields);
      var returnMsgField = $(this).parents('.modal-body').children('.auth-msg');
      console.log(userDetails);
      if (userDetails === 'null') {
        alert('1');
        returnMsgField.text() = 'All fields are compulsory';
      } else if(userDetails['fullname'].split(' ').length < 2) {
        alert('2')
        returnMsgField.text() = 'Your fullname is required';
      } else {
        alert('3');
        var ajaxRes = newRequest.ajaxCall('POST', userDetails, '/signup/', $(this));
      }
    }


  });

});