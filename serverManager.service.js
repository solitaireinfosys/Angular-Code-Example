(function() {

	'use strict';

	angular
		.module('app.servers')
		.service('serverManager', serverManager);

	function serverManager($q,BaseUrl,$http,
												$localStorage,
												ServicePlatforms,
												dataGenerator) {

		this.getServerListData = getServerListData;
		this.getServersFromServerList = getServersFromServerList;
		this.toggleVerified = toggleVerified;
		this.toggleActive = toggleActive;
		
		this.getServerListChangeLogs = getServerListChangeLogs;

		//Stub data
		this.getServersDumpData = getServersDumpData;
		this.getServerListDumpData = getServerListDumpData;
		this.deleteServerList = deleteServerList;
		this.generateServerListData = generateServerListData;
		this.getServerListDatabyID = getServerListDatabyID;
		this.saveServerList = saveServerList;
		this.UpdateServerList  = UpdateServerList ;
		this.getCheckedServer = getCheckedServer;
		this.sortArray  = sortArray ;

		//add server 
		this.addServers = addServers;

		var list = [];
		function getServerListData(options, PageSize, PageIndex) {
			return $q(function(resolve, reject) {
				return $http.get(BaseUrl.url+'/Server/GetAllServerList?PageSize='+PageSize+'&PageIndex='+PageIndex)
					.success(function(result){
						list = result;
						if (options.keyword != undefined) {
							var keyword = options.keyword.toLowerCase();
							list = _.filter(list, function(server) {
								return server.ListName.toLowerCase().indexOf(keyword) > -1;
							});
						}
						if(options.varified ){
							list=_.filter(list,function(server){
								return server.IsVerified == true
							});
						}
						if(options.platform != null){
							list = _.filter(list,function(server){
								return server.Environment == options.platform;
							});
						}
						if(options.ListId != undefined){
							console.log(options.ListId)
							var ListId = parseInt(options.ListId);
							list = _.filter(list,function(server){
								return server.ListID == ListId;
							});
						}
						console.log(list)
						return resolve(list);
				});
				
				
			});
		}

		function getCheckedServer(array){
			array = _.filter(array, function(server) {
				return server.isChecked == true;
			});
			return array

		}

		function addServers(listID, serverlist){
			return $q(function(resolve){
				return $http.get(BaseUrl.url+'/Server/AddServers?ListId='+listID+'&serverEntry='+serverlist)
					.success(function(result){
						console.log(result)
						return resolve(result);
					})
			})
		}
		function UpdateServers(listID, serverlist){
			return $q(function(resolve){
				return $http.get(BaseUrl.url+'/Server/UpdateServers?ListId='+listID+'&serverEntry='+serverlist)
					.success(function(result){
						return resolve(result);
					})
			})
		}
		function saveServerList(server, serverlist) {
			return $q(function(resolve){
				return $http.get(BaseUrl.url+'/Server/AddServerList?ListName='+server.ListName)
					.success(function(result){
						return resolve(result);
					})
			})
		}
		function UpdateServerList(server, serverlist) {
			return $q(function(resolve){
				return $http.get(BaseUrl.url+'/Server/UpdateServerList?ListId='+server.ListID+'&ListName='+server.ListName)
					.success(function(result){
						return resolve(result);
					})
			})
		}

		function deleteServerList(selected){
			return $q(function(resolve){
				return $http.get(BaseUrl.url+'/Server/DeleteServerList?ListId='+selected.ListID)
					.success(function(result){
						console.log(result)
						return resolve(result);
					})
			})
		}
		function getServerListDatabyID(id) {
			return $q(function(resolve) {
				return $http.get(BaseUrl.url+'/Server/GetServerList?ListId='+id)
					.success(function(data){
						console.log(data)
						var list = data;
						
						return resolve(list);
					})
				});
		}
		function getServersFromServerList(serverList, options, PageSize, PageIndex) {
			//console.log(serverList, keyword)
			return $q(function(resolve) {
				return $http.get(BaseUrl.url+'/Server/GetServerCollection?ServiceList='+serverList.ListID+'&PageSize='+PageSize+'&PageIndex='+PageIndex)
					.success(function(data){
						var list = data;
						if (options.keyword) {
							var keyword = options.keyword.toLowerCase();
							list = _.filter(list, function(server) {
								return server.ServerName.toLowerCase().indexOf(keyword) > -1 ||
											 server.IPAddress.toLowerCase().indexOf(keyword) > -1;
							});
						}
						if(options.environment != null){
							list = _.filter(list, function(server) {
								return server.Environment ==  options.environment;
							});
						}
						if(options.platform != null){
							list = _.filter(list, function(server) {
								return server.Platform ==  options.platform;
							});
						}
						if(options.region != null){
							list = _.filter(list, function(server) {
								return server.Region ==  options.region;
							});
						}
						return resolve(list);
					})
			});
		}
		var sort_by = function(field, reverse, primer){

		   var key = primer ? 
		       function(x) {return primer(x[field])} : 
		       function(x) {return x[field]};

		   reverse = !reverse ? 1 : -1;

		   return function (a, b) {
		       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
		     } 
		}
		function sortArray(array,reverse, key){
			return array.sort(sort_by(key, reverse, function(a){
				if(typeof a == 'string'){
					return a.toUpperCase()
				}
				if(typeof a == 'object'){
					return a =''
				}
				
				return a;
			}));
		}
		function getCurrentUser() {
			return $q(function(resolve, reject) {
				return $http.get(BaseUrl.url+'/Home/GetCurrentUser')
					.success(function(author) {
						console.log(author)
						return resolve(author);
					});
			});
		}

		function generateServerListData(){
			
			return $q(function(resolve, reject) {
				return $http.get(BaseUrl.url+'/Home/GetCurrentUser')
					.success(function(user) {
						var data = {
						Author: user.Fname+' '+ user.Lname,
						DateCreated: new Date,
						Environment: 0,
						IsActive: false,
						IsDynamic: false,
						IsVerified: false,
						ListName: ""
					}
				return resolve(data);
					});
			});
		
	
			


			//console.log(getCurrentUser());
			
		}

		function toggleVerified(serverListItem) {
			return $q(function(resolve, reject) {
				serverListItem.IsVerified = serverListItem.IsVerified ? false : true;
				return resolve(serverListItem);
			});
		}
		function toggleActive(serverListItem) {
			return $q(function(resolve, reject) {
				serverListItem.IsActive = serverListItem.IsActive ? false : true;
				return resolve(serverListItem);
			});
		}


		function getServerListChangeLogs(serverListItem) {
			return $q(function(resolve) {
				return $http.get(BaseUrl.url+'/Server/GetChangeLog?Id='+serverListItem.ListID)
					.success(function(result){
						return resolve(result)
					});
			});
		}

		function generateServerListChangeLogs() {
			var result = [];
			for (var i = 0; i < 20; i++) {
				var active = faker.random.boolean() ? 'active' : 'inactive';
				var text = 'Changed status to ' + active;
				result.push({
					id: faker.random.number(),
					action: text,
					createdAt: faker.date.past(),
					author: faker.name.firstName()
				});
			}
			return result;
		}

		function getServerListDumpData() {
			return $q(function(resolve, reject) {
				return $http.get(BaseUrl.url+'/Server/GetAllServerList')
					.success(function(result){
						return resolve(result)
					});
				});
			
		}

		function getServersDumpData(serverListItem) {
			var key = 'servers_servers' + serverListItem.id;
			if (false === _.isEmpty($localStorage[key])) {
				return $localStorage[key];
			}
			$localStorage[key] = dataGenerator.servers(serverListItem);
			return $localStorage[key];
		}
	}

})();