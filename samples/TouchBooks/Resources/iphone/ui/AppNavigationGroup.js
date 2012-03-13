
function AppNavigationGroup(server) {
  var BasicWindow = require('/ui/BasicWindow'),
      BookListView = require('/ui/BookListView');
  
  var listWindow = new BasicWindow();
  var listView = new BookListView(server);
  listWindow.addEventListener('open', function(e) {
    listView.fireEvent('refresh');
  });
  listWindow.add(listView);
  
  var result = Ti.UI.iPhone.createNavigationGroup({
     window: listWindow
  });

  return result;
};

module.exports = AppNavigationGroup;
