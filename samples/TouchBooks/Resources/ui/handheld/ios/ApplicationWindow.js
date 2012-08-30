function ApplicationWindow() {
	//declare module dependencies
	var MasterView = require('ui/common/MasterView'),
		DetailView = require('ui/common/DetailView'),
		NewItemView = require('ui/common/NewItemView');
		
	//create object instance
	var self = Ti.UI.createWindow({
		backgroundColor:'#ffffff'
	});
		
	//construct UI
	var masterView = new MasterView(),
		detailView = new DetailView(),
		newItemView = new NewItemView();
		
	//create master view container
	var masterContainerWindow = Ti.UI.createWindow({
		title:L('MasterWindow_title')
	});
	
	var addButton = Ti.UI.createButton({
	  systemButton: Ti.UI.iPhone.SystemButton.ADD
	});
	addButton.addEventListener('click', function(e) {
    navGroup.open(newItemContainerWindow);
	});
	masterContainerWindow.rightNavButton = addButton;
	
	masterContainerWindow.add(masterView);
	
	//create detail view container
	var detailContainerWindow = Ti.UI.createWindow({
	});
	detailView.parent = detailContainerWindow;
	detailContainerWindow.add(detailView);

  // create new item view container	
  var newItemContainerWindow = Ti.UI.createWindow({
    title:L('NewItemWindow_title')
  });
  newItemView.parent = newItemContainerWindow;
  newItemContainerWindow.add(newItemView);
	
	
	//create iOS specific NavGroup UI
	var navGroup = Ti.UI.iPhone.createNavigationGroup({
		window:masterContainerWindow
	});
	self.add(navGroup);
	
	//add behavior for master view
  masterView.addEventListener('itemSelected', function(e) {
    detailView.fireEvent('itemSelected',e);
    navGroup.open(detailContainerWindow);
  });
  
  masterView.addEventListener('itemCreated', function(e) {
    navGroup.open(newItemContainerWindow);
  });
  
	return self;
};

module.exports = ApplicationWindow;
