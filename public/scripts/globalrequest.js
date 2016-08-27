var GlobalRequest = function () {
  this.ajaxCall = function (method, data, url, dom) {
    return $.ajax({
      type: method,
      url : url,
      data : data,
      headers:{
        'token-information':window.localStorage.getItem('authtoken')
      },
      beforeSend: function () {
        dom.addClass('disabled');
        dom.children('.loader').show();
      },

      complete: function () {
        dom.removeClass('disabled');
        dom.children('.loader').hide();
      }
    });
  }

  this.formData = function (formFields) {
    var formDetails = {};
    var isFieldEmpty = false;

    for (var i = 0; i < formFields.length; i++) {
      formDetails[formFields[i]] = $('#' + formFields[i]).val().trim();
      if (formDetails[formFields[i]] === '') {
        isFieldEmpty = true;
      }
    }

    if (isFieldEmpty) return null;
    return formDetails;
  };

  this.getNewPage = function(url) {
    return $.ajax({
      url: url,
      method:'GET',
      headers:{
        'token-information':window.localStorage.getItem('authtoken')
      }
    })
  }
}