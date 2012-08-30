function ApplicationWindow() {
	//declare module dependencies
	var MasterView = require('ui/common/MasterView'),
		DetailView = require('ui/common/DetailView'),
		NewItemView = require('ui/common/NewItemView');
	
	var books = require('lib/books');
		
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
			navBarHidden:false,
			backgroundColor:'#ffffff'
		});
		detailContainerWindow.add(detailView);
		detailView.fireEvent('itemSelected',e);
		detailContainerWindow.open();
	});
	
	self.activity.onCreateOptionsMenu = function(e) {
	  var menu = e.menu;
	  
	  var addItem = menu.add({
	    title: L('ApplicationWindow_addmenuitem')
	  });
	  addItem.addEventListener('click', function(e) {
      //create detail view container
      var newItemView = new NewItemView();
      var newItemContainerWindow = Ti.UI.createWindow({
        navBarHidden:false,
        backgroundColor:'#ffffff'
      });
      newItemContainerWindow.add(newItemView);
      newItemContainerWindow.open();
	  });
	  
	  var pushItem = menu.add({
	    title: L('ApplicationWindow_pushtoserver')
	  });
	  pushItem.addEventListener('click', function(e) {
	    books.pushToServer(function(err, result) {
	      if (!err) {
	        Ti.App.fireEvent('books:replication_complete');
	      }
	    })
	  });

    var pullItem = menu.add({
      title: L('ApplicationWindow_pullfromserver')
    });
    pullItem.addEventListener('click', function(e) {
      books.pullFromServer(function(err, result) {
        if (!err) {
          Ti.App.fireEvent('books:replication_complete');
        }
      })
    });

	};
	
	return self;
};

module.exports = ApplicationWindow;
