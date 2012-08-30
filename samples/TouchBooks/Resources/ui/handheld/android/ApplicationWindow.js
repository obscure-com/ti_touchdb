function ApplicationWindow() {
	//declare module dependencies
	var MasterView = require('ui/common/MasterView'),
		DetailView = require('ui/common/DetailView'),
		NewItemView = require('ui/common/NewItemView');
		
	//create object instance
	var self = Ti.UI.createWindow({
		title: L('MasterWindow_title'),
		exitOnClose:true,
		navBarHidden:false,
		backgroundColor:'#ffffff',
	});
		
	//construct UI
	var masterView = new MasterView();
	self.add(masterView);

	//add behavior for master view
	masterView.addEventListener('itemSelected', function(e) {
		//create detail view container
		var detailView = new DetailView();
		var detailContainerWindow = Ti.UI.createWindow({
			title:'Product Details',
			navBarHidden:false,
			backgroundColor:'#ffffff'
		});
		detailContainerWindow.add(detailView);
		detailView.fireEvent('itemSelected',e);
		detailContainerWindow.open();
	});
	
	self.activity.onCreateOptionsMenu = function(e) {
	  var menu = e.menu;
	  var menuItem = menu.add({
	    title: L('ApplicationWindow_addmenuitem')
	  });
	  menuItem.addEventListener('click', function(e) {
      //create detail view container
      var newItemView = new NewItemView();
      var newItemContainerWindow = Ti.UI.createWindow({
        navBarHidden:false,
        backgroundColor:'#ffffff'
      });
      newItemContainerWindow.add(newItemView);
      newItemContainerWindow.open();
	  });
	};
	
	return self;
};

module.exports = ApplicationWindow;
