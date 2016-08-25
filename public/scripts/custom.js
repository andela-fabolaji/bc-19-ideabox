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
      
      if (userDetails === null) {
        returnMsgField.text('All fields are compulsory').addClass('label label-danger'); 
      } else {
        var ajaxRes = newRequest.ajaxCall('POST', userDetails, '/signin', $(this));
        ajaxRes.done(function (res) {
          if (res.status === true) {
            alert(res.msg);
          }
        });
      }
    }

    if ($(this).attr('id') === 'signupBtn') {
      var formFields = ['fullname', 'regemail', 'regpassword', 'confirmpassword'];
      var userDetails = newRequest.formData(formFields);
      var returnMsgField = $(this).parents('.modal-body').children('.auth-msg');
      console.log(userDetails);
      if (userDetails === null) {
        returnMsgField.text('All fields are compulsory').addClass('label label-danger'); 
      } else if(userDetails['fullname'].split(' ').length < 2) {
        returnMsgField.text('Your fullname is required').addClass('label label-danger'); 
      } else {
        var ajaxRes = newRequest.ajaxCall('POST', userDetails, '/signup', $(this));
        ajaxRes.done(function (res) {
          if (res === '1') {
            returnMsgField.addClass('label label-success');
            returnMsgField.text('Account successfully created');
          } else {
            returnMsgField.addClass('label label-danger');
            returnMsgField.text('Process terminated. Unable to create account');
          }
        })
      }
    }


  });

});