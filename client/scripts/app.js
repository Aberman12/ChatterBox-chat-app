var app = {
  server: 'http://parse.la.hackreactor.com/chatterbox/classes/messages',

  friends: [],

  rooms: [],

  user: function() {
    var getUrl = window.location;
    return getUrl.search.split('=')[1];
  },

  safeData: function(unsafe) {
    unsafe = unsafe || 'N/A';
    return he.encode(unsafe);
  },

  init: function() {
    this.user();
    this.fetch();
    this.handleUsernameClick();
    this.handleSubmit();
  },

  send: function(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
        app.clearMessages();
        app.fetch();
      },

      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  fetch: function() {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'GET',
      data:'order=-createdAt',
      success: function (data) {
        console.log('chatterbox: Message received');
        app.renderRoom(data);
        var room = $('#select :selected').text();
        app.renderMessage(data, room);
      },

      error: function (data) {
        // See: https://developer.mozil4la.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message', data);
      }
    });
  },

  clearMessages: function() {
    var clear = document.getElementById('chats');
    while(clear.firstChild){
      clear.removeChild(clear.firstChild);
    }
  },

  renderMessage: function(data, room) {
    app.clearMessages();
    var chat = $('#chats');
    for(var m = 0; m < data.results.length; m++) {
      if(data.results[m].roomname === room && data.results[m].username && data.results[m].text && !data.results[m].username.includes('%') && !data.results[m].text.includes('%')&& !data.results[m].username.includes('<script>') && !data.results[m].text.includes('<script>')) {
        var userMessage = $('<div class="userMessage"></div>');
        var user;
        if(app.friends.includes(app.safeData(data.results[m].username))) {
          user = $('<div class="userInfo"><strong>' + app.safeData(data.results[m].username) + '</strong></div>')
        } else {
          user = $('<div class="userInfo">' + app.safeData(data.results[m].username) + '</div>');
        }
        var message = $('<div class="messageInfo">' + app.safeData(data.results[m].text) + '</div>');
        userMessage.append(user);
        userMessage.append(message);
        chat.append(userMessage);
      }
    }
  },

  renderRoom: function(data) {
    var allRooms = [];
    var getRoom = $("#select");
    var room;
    var selectKids = $('#select').children();
    var isRoomFound;

    for(var m = 0; m < data.results.length; m++) {
      if(data.results[m].username && data.results[m].text && !data.results[m].username.includes('%') && !data.results[m].text.includes('%')&& !data.results[m].username.includes('<script>') && !data.results[m].text.includes('<script>')) {
        allRooms.push(app.safeData(data.results[m].roomname));
      }
    }
    for(var r = 0; r < allRooms.length; r++) {
      if(!app.rooms.includes(allRooms[r])) {
        app.rooms.push(allRooms[r]);
      }
    }
    for(var r = 0; r < app.rooms.length; r++) {
      isRoomFound = false;
      for(var h = 0; h < selectKids.length; h++) {
        if(selectKids[h] === app.rooms[r]) {
          isRoomFound = true;
        }
      }
      if(isRoomFound || selectKids.length === 0) {
        room = $('<option class="option" value="val">' + app.rooms[r] + '</option>');
        getRoom.append(room);
      }
    }
  },

  handleUsernameClick: function() {
    $(document).on('click','.userInfo', function(event){
      app.friends.push(event.target.textContent);
      app.fetch();
    });
  },

  handleSubmit: function() {
    $('#submit').on('click', function(event) {
      var input = $('#input').val();
      var message = {
        roomname: $('#select :selected').text(),
        text: input,
        username: app.user()
      }
      $('#input').val('');
      app.send(message);
    });
  }
}
$(document).ready(function(){
  app.init();
});
