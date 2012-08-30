function ApplicationWindow() {
	//declare module dependencies
	var MasterView = require('ui/common/MasterView'),
		DetailView = require('ui/common/DetailView'),
		NewItemView = require('ui/common/NewItemView');
		
	var books = require('lib/books');
		
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
		
  var buttonBar = Ti.UI.createButtonBar({
    labels: [L('ApplicationWindow_pullbuttontitle'), L('ApplicationWindow_pushbuttontitle'), L('ApplicationWindow_addbuttontitle')],
    style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
  });
  buttonBar.addEventListener('click', function(e) {
    switch (e.index) {
      case 0:
        books.pullFromServer(function(err, result) {
          if (!err) {
            Ti.App.fireEvent('books:replication_complete');
          }
        });
        break;        
      case 1:
        books.pushToServer(function(err, result) {
          if (!err) {
            Ti.App.fireEvent('books:replication_complete');
          }
        });
        break;
      case 2:
        navGroup.open(newItemContainerWindow);
        break;
    };
  });
	masterContainerWindow.rightNavButton = buttonBar;
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
