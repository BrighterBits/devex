(function () {
	'use strict';
	angular.module ('teams')
	// -------------------------------------------------------------------------
	//
	// directive for listing teams
	//
	// -------------------------------------------------------------------------
	.directive ('teamList', function () {
		return {
			restrict     : 'E',
			controllerAs : 'vm',
			scope        : {
				program: '=',
				title: '@',
				context: '@'
			},
			templateUrl  : '/modules/teams/client/views/list.teams.directive.html',
			controller   : function ($scope, TeamsService, Authentication, Notification) {
				var vm     = this;
				vm.program = $scope.program;
				vm.context = $scope.context;
				var isUser = Authentication.user;
				vm.isAdmin = isUser && !!~Authentication.user.roles.indexOf ('admin');
				vm.isGov   = isUser && !!~Authentication.user.roles.indexOf ('gov');
				if (vm.context === 'program') {
					vm.programId = vm.program._id;
					vm.programTitle = vm.program.title;
				} else {
					vm.programId = null;
					vm.programTitle = null;
				}
				//
				// if a program is supplied, then only list teams under it
				// also allow adding a new team (because it has context)
				//
				if ($scope.program) {
					vm.title      = 'Teams for '+$scope.program.title;
					vm.programId  = $scope.program._id;
					vm.userCanAdd = $scope.program.userIs.admin || vm.isAdmin;
					vm.teams   = TeamsService.forProgram ({
						programId: $scope.program._id
					});
					vm.columnCount = 1;
				} else {
					vm.title      = 'All Teams';
					vm.programId  = null;
					vm.userCanAdd = (vm.isAdmin || vm.isGov);
					vm.teams   = TeamsService.query ();
					vm.columnCount = 1;
				}
				if ($scope.title) vm.title = $scope.title;
				vm.publish = function (team, state) {
					var publishedState = team.isPublished;
					var t = state ? 'Published' : 'Un-Published'
					team.isPublished = state;
					team.createOrUpdate ()
					//
					// success, notify and return to list
					//
					.then (function () {
						Notification.success ({
							message : '<i class="glyphicon glyphicon-ok"></i> Team '+t+' Successfully!'
						});
					})
					//
					// fail, notify and stay put
					//
					.catch (function (res) {
						team.isPublished = publishedState;
						Notification.error ({
							message : res.data.message,
							title   : '<i class=\'glyphicon glyphicon-remove\'></i> Team '+t+' Error!'
						});
					});
				};
				vm.request = function (team) {
					TeamsService.makeRequest ({
						teamId: team._id
					}).$promise
					.then (function () {
						team.userIs.request = true;
						Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Membership request sent successfully!' });
					})
					.catch (function (res) {
						Notification.error ({
							message : res.data.message,
							title   : '<i class=\'glyphicon glyphicon-remove\'></i> Membership Request Error!'
						});
					});
				};
			}
		}
	})
	;
}());
