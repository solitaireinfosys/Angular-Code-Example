(function() {

	'use strict';

	angular
		.module('app.servers.new')
		.directive('newServerListServers', serverListServers);

	function serverListServers(serverManager, ITEM_PER_PAGE, ServerPlatforms, Environments, ServerRegion, $state) {
		return {
			restrict: 'E',
			templateUrl: 'app/servers/NewServer/NewServerListServers.html',
			scope: {
				selectedServerList: '=',
				serversList:'='
			},
			link: link
		};

		function link(scope, element, attrs) {
			var serverArray = [];
			scope.ServerRegion = ServerRegion;
			scope.Environments = Environments;
			scope.servers = [];
			scope.totalPages = 0;
			scope.pages = [];
			scope.serverName = null;
			scope.ServerPlatforms = ServerPlatforms;

			scope.changePage = changePage;
			scope.next = next;
			scope.previous = previous;
			scope.filterByPlatform = filterByPlatform;
			scope.filterByEnv = filterByEnv;
			scope.filterByRegion = filterByRegion;
			scope.selectedPlatform = null;
			scope.selectedEnvironment = null;
			scope.selectedRegion = null;
			scope.saveServerList = saveServerList;
			scope.checkAllServer = checkAllServer;
			scope.hidebulkEditbtn = hidebulkEditbtn;
			scope.showbulkEdit = false;
			scope.showbulkEditfn = showbulkEditfn;
			var reversed = false;
			scope.sortServersby = sortServersby;

			scope.search = refreshServers;

			scope.$watch('selectedServerList', function() {
				if (_.isEmpty(scope.selectedServerList)) return;
				refreshServers();
			}, true);

			scope.$watch('serversList',function(){
				angular.forEach(scope.serversList,function(item){
					item.isChecked = false;
				})
				serverArray = serverArray.concat(scope.serversList);
				setupPagination();
			})
			function sortby(array,reversed,key) {
				return serverManager.sortArray(array, reversed, key)
			}
			function sortServersby(arg){
				serverArray = sortby(serverArray, reversed, arg)
				reversed = !reversed;
				console.log(serverArray)
				setupPagination();
			}

			//filter by platform
			function filterByPlatform(platform){
				scope.selectedPlatform = platform;
				refreshServers();
			}
			function filterByEnv(env){
				scope.selectedEnvironment = env;
				refreshServers();
			}
			function filterByRegion(region){
				scope.selectedRegion = region;
				refreshServers();
			}



			function refreshServers() {
				if(scope.selectedServerList.ListID != undefined){
					var options = {
						keyword: scope.keyword || null,
						platform:scope.selectedPlatform != null  ? scope.selectedPlatform.id : null,
						environment:scope.selectedEnvironment != null ? scope.selectedEnvironment.id : null,
						region:scope.selectedRegion != null ? scope.selectedRegion.id : null
					}
					serverManager
						.getServersFromServerList(scope.selectedServerList, options)
						.then(function(_serverArray) {
							//console.log(_serverArray)
							console.log(_serverArray)
							serverArray = _serverArray;
							console.log(serverArray)
							setupPagination();
						});
					}
					else{
						console.log(serverArray)
					}
			}

			//submit server 
			function saveServerList(server , serverlist) {
				angular.forEach(serverlist,function(item){
					delete item.isChecked;
				})
				console.log(serverlist)
				/*console.log(server, serverlist)*/
				if(server.ListID != undefined){
					serverManager.UpdateServerList(server, serverlist).then(function(data){
						console.log(data);
						serverManager.UpdateServers(data.ListID, serverlist).then(function(fdata){
							console.log(data)
							$state.go('main.servers.manager')
						})
					})
				}
				else{
					serverManager.saveServerList(server, serverlist).then(function(data){
						console.log(data);

						serverManager.addServers(data.ListID, serverlist).then(function(fdata){
							console.log(fdata)
							$state.go('main.servers.manager')
						})
					})
				}
			}

			function setupPagination() {
				scope.servers = [];
				scope.totalPages = Math.ceil(serverArray.length / ITEM_PER_PAGE)
				changePage(0);
				console.log(scope.servers)
			}

			function changePage(pageNumber) {
				if (pageNumber < 0 || pageNumber > scope.totalPages) return;
				scope.pageNumber = pageNumber;
				var offset = pageNumber * ITEM_PER_PAGE;
				scope.servers = serverArray.slice(offset, offset + ITEM_PER_PAGE);
				//console.log(scope.servers)
			}

			function next() {
				if (scope.pageNumber > scope.totalPages) return;
				changePage(scope.pageNumber + 1);
			}

			function previous() {
				if (scope.pageNumber === 0) return;
				changePage(scope.pageNumber - 1);
			}
			function checkAllServer(){
				console.log('checked')
				if (scope.SelectallServer) {
		            scope.SelectallServer = true;
		        } else {
		            scope.SelectallServer = false;
		        }
		        angular.forEach(scope.servers, function (item) {
		            item.isChecked = scope.SelectallServer;
		        });
			}
			function hidebulkEditbtn(){
				scope.showbulkEdit = false;
			}
			function showbulkEditfn(){
				scope.showbulkEdit = true;
			}
		}
	}

})();