var ws;
var d = document;
var username;
var uid;

function createChatEntry(username, uid, message) {
  var entry = document.createElement("div");
  entry.setAttribute("id","chat_list");
  
  if (username == "SYSTEM") {
    // var dom_uname = document.createElement("span");
    // dom_uname.setAttribute("class","chat_username"); 
    // dom_uname.innerHTML = username + "(" + uid + "): ";
    // entry.appendChild(dom_uname);
    var sys_msg = document.createElement("span");
    sys_msg.setAttribute("class","sys_message"); 
    sys_msg.innerHTML = username + "(" + uid + "): " + message;
    entry.appendChild(sys_msg);
  }
  else {
    var dom_uname = document.createElement("span");
    dom_uname.setAttribute("class","chat_username"); 
    dom_uname.innerHTML = username + "(" + uid + "): ";
    entry.appendChild(dom_uname);
    
    var dom_msg = document.createElement("span");
    dom_msg.setAttribute("class","chat_message"); 
    dom_msg.innerHTML = message;
    entry.appendChild(dom_msg);
  }

  return entry;
}

function createUserlist(total, userlist){
  document.getElementById("userlist").innerHTML="";
  var entry = document.createElement("div");

  var dom_num = document.createElement("span");
  dom_num.setAttribute("class","chat_username"); 
  dom_num.innerHTML = 'Online Users(' + total +')';
  entry.appendChild(dom_num);

  var dom_ul = document.createElement("ul");
  for (var i = 0; i < userlist.length; i++){
    var dom_user = document.createElement("li");
    dom_user.innerHTML = userlist[i];
    dom_ul.appendChild(dom_user);
  }
  entry.appendChild(dom_ul);
  return entry
}

function scrollToBottom(){
  // w.scrollTo(0, window.getElementById("chatbox").innerHeight);
  var obj = document.getElementById('chatbox');
  obj.scrollTop = obj.scrollHeight;
  document.getElementById("message").value="";
}

function genUid(){
  var uid = "";
  for(var i=0;i<4;i++)
    uid+=Math.floor(Math.random()*10);
  return uid
  }

function usernameSubmit(){
  uid = genUid()
  username = d.getElementById("username").value;
  if(username != ""){
    d.getElementById("username").value = '';
    d.getElementById("loginbox").style.display = 'none';
    d.getElementById("chatlog").style.display = 'block';
    this.init(username);
  }
  return false;
}

function init(username) {

  d.getElementById("showusername").innerHTML = '<a href="javascript:;" onclick="logout()">logout</a>';
  var messageContainer = document.getElementById("chatbox");
  var userListContainer = document.getElementById("userlist");
  if("WebSocket" in window) {
    messageContainer.appendChild(createChatEntry("SYSTEM", "1000", "WebSocket is supported by your browser!"));
    openWS(messageContainer, userListContainer);
    reg();
  }
  else {
    messageContainer.appendChild(createChatEntry("SYSTEM","1000", "WebSocket is NOT supported by your browser!"));
  }
}

function openWS(messageContainer, userListContainer) {
  ws = new WebSocket("ws://"+window.location.host+"/chat");
  ws.onopen = function(e){
    // init();
  };
  ws.onmessage = function(e) {
    var data = JSON.parse(e.data);
    if (data.type == 'msg' || data.type == 'sys'){
      messageContainer.appendChild(createChatEntry(data.username, data.uid, data.message));
    }
    if (data.type == 'list'){
      userListContainer.appendChild(createUserlist(data.total, data.userlist));
    }
    scrollToBottom();
  };
  ws.onclose = function(e) {
    messageContainer.appendChild(createChatEntry("SYSTEM","1000", "Cannot Connect to WebSocket Server! Please Press F5 key."));
    // sleep(5000);
    window.setTimeout("logout();",5000);
    // logout();
  };
  ws.onerror = function(e) {
    console.log('Error occured: ' + e.data);
  }

}

function reg(){
  var data = { 
               type: "reg",
               username: username,
               uid: uid};
  sendMsg(JSON.stringify(data));
}

//Tornado WebSockets - InvalidStateError “Still in CONNECTING State”
function sendMsg(msg) {
        waitForSocketConnection(ws, function() {
            ws.send(msg);
        });
    };

function waitForSocketConnection(socket, callback){
        setTimeout(
            function(){
                if (socket.readyState === 1) {
                    if(callback !== undefined){
                        callback();
                    }
                    return;
                } else {
                    waitForSocketConnection(socket,callback);
                }
            }, 5);
    };

function sendMessage() {
  var data = { 
               type: "msg",
               username: username,
               uid: uid,
               message: document.getElementById("message").value };
  
  if(data.username && data.message) {
    sendMsg(JSON.stringify(data));
  }
}

function logout(){
  location.reload();
}
