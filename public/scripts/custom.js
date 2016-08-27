$(document).ready(function () {

  var newRequest = new GlobalRequest();

  var signup = $('#signup');
  var signin = $('#signin');
  var signupLink = $('.signup');
  var signinLink = $('.signin');
  var submit = $('.submit');

  signupLink.click(function () {
    signin.css('display', 'none');
    signup.css('display', 'block');
  });

  signinLink.click(function () {
    signin.css('display', 'block');
    signup.css('display', 'none');
  });

  
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
            window.localStorage.setItem('authtoken', res.authtoken);
            window.location.href = '/home?q='+window.localStorage.getItem('authtoken');
            /*var redir = newRequest.getNewPage('/home');
            redir.done(function(page) {
              $('html').html(page);
            })*/
          } else {
            //invalid user
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
          if (res.status === true) {
            returnMsgField.removeClass('label-danger').addClass('label label-success');
            returnMsgField.text('Account successfully created');
            window.localStorage.setItem('authtoken', res.authtoken);
            window.location.href = '/home?q='+window.localStorage.getItem('authtoken');
          } else {
            returnMsgField.addClass('label label-danger');
            returnMsgField.text('Process terminated. Unable to create account');
          }
        })
      }
    }

    if ($(this).attr('id') === 'publish') {
      var formFields = ['postTitle', 'postContent'];
      var postDetails = newRequest.formData(formFields);
      if (postDetails === null) {
        alert('Post must contain a title and a description');
      } else {
        var ajaxRes = newRequest.ajaxCall('POST', postDetails, '/publish', $(this));
        ajaxRes.done(function (res) {
          alert(res);
          if(res === 1) {
            alert('shouldreload')
            location.reload();
          }
        });
      }
    }

    if ($(this).hasClass('commentbtn')) {
      var commentDetails = {};
      commentDetails.user_comment = $(this).siblings('.commentText').val();
      commentDetails.ideas_id = $(this).siblings('.ideaId').val();
      var commentdom = $(this).siblings('ul');
      var ideaId = $(this).siblings('.ideaId').val();
      if (commentDetails.user_comment === '') {
        alert('Comment box cannot be empty');
      } else {
        var ajaxRes = newRequest.ajaxCall('POST', commentDetails, '/comment', $(this));
        ajaxRes.done(function (res) {
          console.log(res);
          if(res == 1) {
            fetchComments(commentdom, ideaId);
          } else {
            alert('Unable to post comment.+ Please try again.')
          }
        });
      }
    }

  });

$('.viewcomments').click(function() {
  var commentdom = $(this).parents('.post-votes').siblings('.post-comment').find('ul');
  fetchComments(commentdom, $(this).attr('id'));
})

function fetchComments(commentdom, ideaId) {
  var ajaxRes = newRequest.ajaxCall('GET', {}, '/getcomments/'+ideaId, $('.commentBtn'));
  ajaxRes.done(function(comments) {
    commentdom.empty();
    for(key in comments){
      commentdom.append('<li>'+comments[key].user_comment+'<h6>'+comments[key].firstname+' '+comments[key].lastname+'</h6></li>')
    }
  })
}
});