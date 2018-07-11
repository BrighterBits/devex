(function () {
  'use strict';

  var HomeController = [
    'Authentication',
    '$state',
    function (Authentication, $state) {
      var vm = this;
      vm.isUser = Authentication.user;
      if (sessionStorage.prevState) {
        var prevState = sessionStorage.prevState;
        delete sessionStorage.prevState;
        $state.go(prevState);
      }
    }
  ];

  angular
    .module('core')
    .controller('HomeController', HomeController);
}());
