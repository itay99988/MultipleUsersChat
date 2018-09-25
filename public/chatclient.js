/*
Client side code (written with vue js V1)
Note:
The chat-page design is pretty simple, since the assignment goal was to practice in vue js,
and generally in javascript.
*/

//by default, the address below is the server address
var socket = io.connect('http://localhost:8000');
//when someone new is connected, a random nickname is generated
var randnum = Math.floor(Math.random() * 1000);

//decleartion of the vue object
var vm = new Vue({
    el: '#chat',
    data:{
        messages:[],
        mymessage:null,
        mynickname: null,
        lastnickname: null, //will be used in order to check if the user changed his nickname
        onlineusers:0, //online users counter
    },
    //all the socket events are defined under the created lifecycle of the vue object
    //we want that the object will be fully created first, and then listen to socket events
    created: function(){
        //I had to remember this reference to "this", since it changes in the inner functions
        var newThis = this;
        this.mynickname = "Guest" + randnum; //initial random nickname
        this.lastnickname = this.mynickname;
        socket.on('connect',function(){
            socket.emit('user_joined',{ //let the server know that a new user is connected
                nickname:newThis.mynickname
            })
            //user's nickname has changed - update the ui  
            socket.on('nick_changed',function(data){
                newThis.messages.push(data.prevnickname + " changed his nickname to: " + data.nickname);
                newThis.scrollToEnd();
            });
            //new message received - update the ui
            socket.on('message',function(data){
                newThis.messages.push(data.nickname + ": " + data.content);
                newThis.scrollToEnd();
            });
            //new user joined - update the ui
            socket.on('user_joined',function(data){
                newThis.messages.push(data.nickname + " has joined!");
                newThis.onlineusers = data.onlineusers;
                newThis.scrollToEnd();
            });
            //user has left - update the ui
            socket.on('user_left',function(data){
                newThis.onlineusers = data.onlineusers;
            });
        });
    },
    //the relevant client methods were written below
    methods:{
        sendMessage: function(){ //deals with sending a chat message
            //basic validity check (checks if the two fields are not empty)
            if(this.validateInputs()){
                //inform the server that a specific user sent a new message, and check if the nickname has changed
                if(this.mynickname!=this.lastnickname){
                    socket.emit('nick_changed',{
                        prevnickname:this.lastnickname,
                        nickname:this.mynickname
                    })
                    this.lastnickname = this.mynickname;
                }
                socket.emit('message',{
                    nickname:this.mynickname,
                    content:this.mymessage
                })
                this.mymessage="";
            }
        },
        scrollToEnd: function() {
            //fucntion that makes sure that div will be scrolled down when someoves invokes it
            var container = this.$el.querySelector("#messages");
            container.scrollTop = container.scrollHeight;
        },
        validateInputs: function(){
            if ((this.mymessage==null || this.mymessage=="") || (this.mynickname==null || this.mynickname==""))
            {
                return false;
            }
            return true;
        }
    }
  })