
function loadBookList(e) {
  // TODO
}

function changeGrouping(e) {
  if (OS_ANDROID) {
    if (e.source.id === 'authorSwitch') {
      $.copyrightSwitch.value = !e.source.value;
    }
    else if (e.source.id === 'copyrightSwitch') {
      $.authorSwitch.value = !e.source.value;
    }
  }
}

Ti.App.addEventListener('books:show_book', function(e) {
  
});

Ti.App.addEventListener('books:edit_book', function(e) {
  
}); 

Ti.App.addEventListener('books:create_book', function(e) {
  
}); 

$.main.open();
