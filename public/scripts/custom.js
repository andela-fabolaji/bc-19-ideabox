$(document).ready(function () {

  var newRequest = new GlobalRequest();
  var signup = $('#signup');
  var signin = $('#signin');
  var signupLink = $('.signup');
  var signinLink = $('.signin');
  var submit = $('.submit');
  var trend = $('.trend');
  var logout = $('#logout');

  signupLink.click(function () {
    signin.css('display', 'none');
    signup.css('display', 'block');
  });

  signinLink.click(function () {
    signin.css('display', 'block');
    signup.css('display', 'none');
  });

  trend.click(function () {

  });

  
  submit.click(function ( e ) {
    e.preventDefault();

    if ($(this).attr('id') === 'signinBtn' ) {
      var formFields = ['email', 'password'];
      var userDetails = newRequest.formData(formFields);
      var returnMsgField = $(this).parents('.modal-body').children('.auth-msg');
      
      if ( userDetails === null ) {
        returnMsgField.text('All fields are compulsory').addClass('label label-danger'); 
      } else {
        var ajaxRes = newRequest.ajaxCall('POST', userDetails, '/signin', $(this));
        ajaxRes.done(function ( res ) {
          if ( res.status === true ) {
            returnMsgField.text('User verified').addClass('label label-success'); 
            window.localStorage.setItem('authtoken', res.authtoken);
            window.location.href = '/home?q='+window.localStorage.getItem('authtoken');
          } else {
            returnMsgField.text('Incorrect username or password!')
            .addClass('label label-danger');
          }
        });
      }
    }

    if ( $(this).attr('id') === 'signupBtn' ) {
      var formFields = ['fullname', 'regemail', 'regpassword', 'confirmpassword'];
      var userDetails = newRequest.formData(formFields);
      var returnMsgField = $(this).parents('.modal-body').children('.auth-msg');
      
      if ( userDetails === null ) {
        returnMsgField.text('All fields are compulsory').addClass('label label-danger'); 
      } else if( userDetails['fullname'].split(' ').length < 2 ) {
        returnMsgField.text('Your fullname is required').addClass('label label-danger'); 
      } else {
        var ajaxRes = newRequest.ajaxCall('POST', userDetails, '/signup', $(this));
        ajaxRes.done(function ( res ) {
          if (res.status === true) {
            returnMsgField.text('Account successfully created')
            .removeClass('label-danger')
            .addClass('label label-success');
            window.localStorage.setItem('authtoken', res.authtoken);
            window.location.href = '/home?q='+window.localStorage.getItem('authtoken');
          } else {
            returnMsgField.text('Process terminated. Unable to create account')
            .addClass('label label-danger');
          }
        })
      }
    }

    var convert = function (postDetails) {
      var postContent = postDetails['postContent'];
      var converter = new showdown.Converter();
      var defaultOptions = showdown.getDefaultOptions();

      postDetails['postContent'] = converter.makeHtml(postContent);
      return postDetails;
    };

    if ( $(this).attr('id') === 'publish' ) {
      var formFields = ['postTitle', 'postContent'];
      var postDetails = newRequest.formData(formFields);
      if (postDetails === null ) {
        alert('Post must contain a title and a description');
      } else {

        var ajaxRes = newRequest.ajaxCall('POST', convert(postDetails), '/publish', $(this));
        ajaxRes.done(function ( res ) {
          if(res == 1) {
            location.reload();
          }
        });
      }
    }

    if ( $(this).hasClass('commentbtn') ) {
      var commentDetails = {};
      var commentdom = $(this).siblings('ul');
      var ideaId = $(this).siblings('.ideaId').val();
      var _this = this;

      commentDetails.user_comment = $(this).siblings('.commentText').val();
      commentDetails.ideas_id = $(this).siblings('.ideaId').val();
      
      if ( commentDetails.user_comment === '' ) {
        alert('Comment box cannot be empty');
      } else {
        var ajaxRes = newRequest.ajaxCall('POST', commentDetails, '/comment', $(this));
        ajaxRes.done(function ( res ) {
          console.log(res);
          if ( res == 1 ) {
            fetchComments(commentdom, ideaId);
            $(_this).siblings('.commentText').val('');
          } else {
            alert('Unable to post comment.+ Please try again.')
          }
        });
      }
    }

  });

  $('.viewcomments').click(function () {
    var commentdom = $(this).parents('.post-votes').siblings('.post-comment').find('ul');
    fetchComments(commentdom, $(this).attr('id'));
  });

  $('.vote').click(function ( e ) {
    e.preventDefault();

    var dom = $(this)
    var domid = $(this).attr('id');
    var dataDetails = {'type':domid};
    
    var ajaxRes = newRequest.ajaxCall('POST', dataDetails, '/votes/'+$(this).attr('ideaId'), $(this));
    ajaxRes.done(function ( reply ) {
      if ( domid === 'upvotes' ) {
        dom.siblings('.upvotenumber').text(parseInt(dom.siblings('.upvotenumber').text()) + reply.value);
        
        if ( reply.type === 'both' ){
          dom.siblings('.downvotenumber').text(parseInt(dom.siblings('.downvotenumber').text()) - 1)
        }
      } else {
        dom.siblings('.downvotenumber').text(parseInt(dom.siblings('.downvotenumber').text()) + reply.value);
        
        if ( reply.type === 'both' ){
          dom.siblings('.upvotenumber').text(parseInt(dom.siblings('.upvotenumber').text()) - 1)
        }
      }
    });
  });

  $('.upvotenumber, .downvotenumber').each(function () {
    if ( $(this).text().trim() == '' ) {
      $(this).text('0');
    }
  });

  var fetchComments = function ( commentdom, ideaId ) {
    var ajaxRes = newRequest.ajaxCall('GET', {}, '/getcomments/'+ideaId, $('.commentBtn'));
    ajaxRes.done(function ( comments ) {
      commentdom.empty();
      
      for(key in comments){
        commentdom.append(
          '<li>'+comments[key].user_comment
          +'<h6>'+comments[key].firstname+' '+comments[key].lastname
          +'</h6></li>'
        );
      }
    });
  };

  logout.click(function () {
    window.localStorage.removeItem('authtoken');
    window.location.href = '/';
  });
});