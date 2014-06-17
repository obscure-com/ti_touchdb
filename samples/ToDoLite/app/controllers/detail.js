var args = arguments[0] || {};

var imageForNewTask = null;
var list = null;

// data binding

function transform(model) {
   var result = model.toJSON();
   var att = model.attachmentNamed('image.jpg');
   result.image = (att && att.content) || "/images/Camera-Light.png";
   result.class = "incomplete";
   return result;
}

// helper functions

function displayAddImageActionSheet(task) {
  // TODO add image for existing task
  var options = [];
  if (Ti.Media.isCameraSupported) {
    options.push("Take Picture");
  }
  options.push("Choose Existing");
  if (imageForNewTask) {
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
      takePicture();
    }
    else if (selected == 'Choose Existing') {
      chooseExistingPhoto();
    }
    else if (selected == 'Delete') {
      imageForNewTask = null;
      updateAddImageButtonWithImage(null);
    }
  });
  dialog.show();  
}

function updateAddImageButtonWithImage(img) {
  $.addImageButton.image = img || '/images/Camera.png';
}

function takePicture() {
  Ti.Media.showCamera({
    success: function(e) {
      imageForNewTask = e.media;
      updateAddImageButtonWithImage(imageForNewTask);
    }
  });
}

function chooseExistingPhoto() {
  Ti.Media.openPhotoGallery({
    success: function(e) {
      imageForNewTask = e.media;
      updateAddImageButtonWithImage(imageForNewTask);
    }
  });
}


// event handlers

function windowOpen(e) {
  updateAddImageButtonWithImage();
  $.tasks.fetch({ startKey: [args.list_id], endKey: [args.list_id, {}] });
  list = Alloy.createModel('list');
  list.fetch({ id: args.list_id });
}

function windowClose(e) {
  $.destroy();
}

function shareButtonAction(e) {
  alert('TODO share');
}

// set image for new task
function addImageButtonAction(e) {
  displayAddImageActionSheet();
}

// set image for existing task
function imageButtonAction(e) {
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
