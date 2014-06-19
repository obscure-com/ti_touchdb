var args = arguments[0] || {};

var imageForNewTask = null;
var list = null;

// data binding

function transform(model) {
   var result = model.toJSON();
   var att = model.attachmentNamed('image.jpg');
   result.image = (att && att.content) || "/images/Camera-Light.png";
   result.template = result.checked ? 'complete' : 'incomplete';
   return result;
}

// helper functions

function displayAddImageActionSheet(listItem) {
  var task = listItem ? $.tasks.at(listItem.itemIndex) : null;

  var options = [];
  if (Ti.Media.isCameraSupported) {
    options.push("Take Picture");
  }
  options.push("Choose Existing");
  if (imageForNewTask || (task && task.attachmentNamed('image.jpg'))) {
    options.push("Delete");
  }
  options.push("Cancel");
  var dialog = Ti.UI.createOptionDialog({
    options: options,
    cancel: options.length - 1,
  });
  dialog.addEventListener('click', function(e) {
    var selected = options[e.index];
    if (selected === 'Take Picture') {
      takePicture(listItem);
    }
    else if (selected == 'Choose Existing') {
      chooseExistingPhoto(listItem);
    }
    else if (selected == 'Delete') {
      if (task) {
        task.removeAttachment('image.jpg');
      }
      else {
        imageForNewTask = null;
        updateAddImageButtonWithImage(null);        
      }
    }
  });
  dialog.show();  
}

function updateAddImageButtonWithImage(img) {
  $.addImageButton.image = img || '/images/Camera.png';
}

function takePicture(listItem) {
  Ti.Media.showCamera({
    success: function(e) {
      if (listItem) {
        var task = $.tasks.at(listItem.itemIndex);
        task.addAttachment('image.jpg', e.media.mimeType, e.media);
        listItem.image = e.media;
      }
      else {
        imageForNewTask = e.media;
        updateAddImageButtonWithImage(imageForNewTask);
      }
    }
  });
}

function chooseExistingPhoto(listItem) {
  Ti.Media.openPhotoGallery({
    success: function(e) {
      if (listItem) {
        var task = $.tasks.at(listItem.itemIndex);
        task.addAttachment('image.jpg', e.media.mimeType, e.media);
        listItem.image = e.media;
      }
      else {
        imageForNewTask = e.media;
        updateAddImageButtonWithImage(imageForNewTask);
      }
    }
  });
}

function updateModels() {
  $.tasks.fetch({ startKey: [args.list_id], endKey: [args.list_id, {}] });
  list = Alloy.createModel('list');
  list.fetch({ id: args.list_id });
}

// event handlers

function windowOpen(e) {
  updateAddImageButtonWithImage();
  updateModels();
}

function windowClose(e) {
  $.destroy();
}

function shareButtonAction(e) {
  alert('TODO share');
}

// set image for new task
function addImageButtonAction(e) {
  e.cancelBubble = true;
  displayAddImageActionSheet();
}

// set image for existing task
function imageButtonAction(e) {
  e.cancelBubble = true;
  var task = $.tasks.at(e.itemIndex);
  if (task.attachmentNamed('image.jpg')) {
    var controller = Alloy.createController('image', { task_id: task.id });
    controller.getView().open({ modal:true });
  }
  else {
    displayAddImageActionSheet(task);
  }
}

function textFieldShouldReturn(e) {
  var title = e.value;
  if (title.length == 0) {
    return;
  }
  
  // create and save a new task
  var task = list.addTask(title, imageForNewTask);
  if (task) {
    imageForNewTask = null;
    updateAddImageButtonWithImage(null);
    $.addItemTextField.value = '';
    $.tasks.add(task);
  }
}

function didSelectRow(e) {
  var task = $.tasks.at(e.itemIndex);
  task.set({ checked: !task.get('checked') });
  task.save();
  
  var checked = task.get('checked');
  
  var listItem = e.section.items[e.itemIndex];
  listItem.template = checked ? 'complete' : 'incomplete';
  e.section.updateItemAt(e.itemIndex, listItem, { animated: true });
}

function didDelete(e) {
  alert('delete '+e.itemId);
  var doomed = $.tasks.at(e.itemIndex);
  doomed.deleteTask();
  updateModels();
}
