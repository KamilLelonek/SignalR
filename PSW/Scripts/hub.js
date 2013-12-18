
// SignalR script to update the chat page, send messages and move shape.

// Reference the auto-generated proxy for the hub.
var chat = $.connection.chatHub,
    moveShapeHub = $.connection.moveShapeHub,
    $shape = $("#shape"),
    // Send a maximum of 10 messages per second
    // (mouse movements trigger a lot of messages)
    messageFrequency = 10,
    // Determine how often to send messages in
    // time to abide by the messageFrequency
    updateRate = 1000 / messageFrequency,
    // An object containing the properties top and left, which are integers
    // indicating the new top and left coordinates for the elements.
    shapeModel = {
        left: 0,
        top: 0
    },
    moved = false,
    sendMessageButton = $('#sendmessage'),
    sendMessageInput = $('#message'),
    userName = $('#displayname').val(),
    discussionList = $('#discussion');

function getShapeModel() {
    return this.shapeModel;
}

function setShapeModel(shapeModel) {
    this.shapeModel = shapeModel;
}

function increaseShapeModel(attr) {
    this.shapeModel[attr] += 10;
}

function decreaseShapeModel(attr) {
    this.shapeModel[attr] -= 10;
}

// Create a function that the hub can call back to display messages.
chat.client.addNewMessageToPage = function (name, message) {
    // Add the message to the page.
    discussionList.append('<li><strong>' + htmlEncode(name) + '</strong>: ' + htmlEncode(message) + '</li>');
};

moveShapeHub.client.updateShape = function (model) {
    setShapeModel(model);
    // Gradually move the shape towards the new location (interpolate)
    // The updateRate is used as the duration because by the time
    // we get to the next location we want to be at the "last" location
    // We also clear the animation queue so that we start a new
    // animation and don't lag behind.
    $shape.animate(model, {
        duration: updateRate,
        queue: false
    });
};

// Start the connection.
$.connection.hub.start().done(function () {
    sendMessageButton.click(function () {
        // Check if messagge is not empty
        var message = sendMessageInput.val();

        if (message) {
            // Call the Send method on the hub.
            chat.server.send(userName, message);
            // Clear text box and reset focus for next comment.
            sendMessageInput.val('').focus();
        }
    });
    $shape.draggable({
        drag: function () {
            setShapeModel($shape.position());
            moved = true;
        }
    });
    // Start the client side server update interval
    setInterval(updateServerModel, updateRate);
});

document.onkeydown = function (evt) {
    var arrowHit = false;
    evt = evt || window.event;

    switch (evt.keyCode) {
        case 37:
            decreaseShapeModel('left');
            arrowHit = true;
            break;
        case 38:
            decreaseShapeModel('top');
            arrowHit = true;
            break;
        case 39:
            increaseShapeModel('left');
            arrowHit = true;
            break;
        case 40:
            increaseShapeModel('top');
            arrowHit = true;
            break;
    }

    if (arrowHit) {
        $shape.animate(getShapeModel(), {
            duration: updateRate,
            queue: false
        });
        $shape.position(shapeModel);
        moved = true;
    }
};

function updateServerModel() {
    // Only update server if we have a new movement
    if (moved) {
        logMovement("update");
        moveShapeHub.server.updateModel(getShapeModel());
        moved = false;
    }
}

function logMovement(message) {
    console.log("-----------" + message + "------------");
    console.log(shapeModel);
    console.log($shape.position());
}

// This optional function html-encodes messages for display in the page.
function htmlEncode(value) {
    var encodedValue = $('<div />').text(value).html();
    return encodedValue;
}

$('#chat-form').submit(function (e) {
    e.preventDefault();
    sendMessageButton.click();
});