let user = "";

let typing = false;
let gotName = false;
let users = [];

let time = new Date().getSeconds();

const blank = string => [...string].every(c => ' '.includes(c));

$(function () {
    const socket = io();
    
    $('form').submit(function(e){
        e.preventDefault();
        if(!blank($('#m').val())){
            let lastTime = time;
            time = new Date().getSeconds();
            if(time - lastTime >= 0){
                
                let message = $('#m').val();
                
                switch(message){

                    case "/dark":
                        $("#style").attr("href", "../styles/style.css");
                        break;
                    case "/light":
                        $("#style").attr("href", "../styles/light.css"); 
                        break;
                    case "/green":
                        $("#style").attr("href", "../styles/green.css"); 
                        break;
                    default:
                        socket.emit("chat message", user + ": " + message);
                        break
                }               
                $("#m").val("");
            }
        } 
        return false;
    });

    socket.on('chat message', function(msg){
        if(msg.split(":")[0] == "" || msg.split(":")[0] == null){
            return;
        }
        let strings = msg.split(" ");

        let userToPing;
        
        for(i in strings){
            if(strings[i].indexOf("@") == 0){
                userToPing = strings[i]
            }
        }

        let temp = "@" + user

        if(temp == userToPing){
            let messages = document.getElementById("messages");
            let newMessage = document.createElement("li");
            newMessage.classList.add("ping");
            newMessage.innerText = msg;
            messages.appendChild(newMessage);
            
            let audio = new Audio('../sounds/ping.mp3');
            audio.play();
        }else{
            $('#messages').append($('<li>').text(msg));
        }
        

        if ((window.innerHeight + window.scrollY) >=   document.body.offsetHeight-50) {
            $(document).scrollTop($(document).height());
        }
        
    });

    socket.on('get name', function(userArray){
        if(gotName == false){
            let theUserName;
            while(theUserName == "" || theUserName == null || userArray.includes(theUserName) || theUserName.includes(" ")){

                theUserName = prompt("Enter username");

                if(userArray.includes(theUserName)){
                    alert("That username is taken");
                }else if(theUserName.includes(" ")){
                    alert("Username has space");
                }else if(theUserName == "" || theUserName == null){
                    alert("Please enter a username");
                }

            }
            user = theUserName
            socket.emit('user joined', theUserName)
            gotName = true
        }
    });

    socket.on('user joined', function(theUser, newUsers){
        let notif = document.createElement("li")
        notif.classList.add("system-notification")
        notif.innerText = theUser + " has joined the chat at " + new Date().toLocaleString();
        document.getElementById("messages").appendChild(notif);

        $(document).scrollTop($(document).height());
        users = newUsers;  
        updateUsers();       
    });

    socket.on('closed tab', function(theUser, newList){
        let notif = document.createElement("li");
        notif.classList.add("system-notification");
        notif.innerText = theUser + " has left the chat at " + new Date().toLocaleString();
        document.getElementById("messages").appendChild(notif);
        users = newList;
        updateUsers();
    });


    /*window.addEventListener('beforeunload', function (e) {
        socket.emit('user closed tab', user);
    })*/

    $(window).bind('beforeunload', function(){
        socket.emit('user closed tab', user);
    });

});

$(document).ready(function(){
    $("#m").focus();
});

function openNav() {
    document.getElementById("mySidenav").style.width = "25%";
    document.getElementById("main").style.marginRight = "250px";
    $("#m").css("width", "75%");
    $(document).scrollTop($(document).height());
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
    $("#m").css("width", "100%");
    $(document).scrollTop($(document).height());
}

function updateUsers(){
    let userList = document.getElementById("mySidenav");
    let closeButton = document.getElementById("user-close-button");

    let lastChild = userList.lastChild;

    while(lastChild != closeButton){
        userList.removeChild(lastChild);
        lastChild = userList.lastChild;
    }

    for(theUser in users){
        let toAdd = document.createElement("p");
        toAdd.innerText = users[theUser];
        toAdd.onclick = () =>{
            document.getElementById("m").value = document.getElementById("m").value + "@" + toAdd.innerText + " ";
        };
        userList.appendChild(toAdd);
    }

}
