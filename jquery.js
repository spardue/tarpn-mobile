$(document).ready(function () {
	var txt_info = $("#txt_info");
	var txt_node = $("#txt_node");
	var txt_chat = $("#txt_chat");
	var strMessage = "";
	var socket = new WebSocket("ws://" + location.hostname + ":8085/ws");
	const NODE_PREFIX = '\x10';
	const CHAT_PREFIX = '\x11';
	const HIDDEN_PREFIX = '\x12';
	const DATA_PREFIX = '\x13';
	var intNodeCode = 16;
	var intChatCode = 17;
	var intHiddenCode = 18;	
	var intDataCode = 19;
	var strBBS_list_JSON = '';
	var lst_BBS_msg = [];
	var BBS_Table;
	
	document.getElementById("txt_chat").addEventListener("focus", turnOffVisualAlert);
	document.getElementById("txt_chat").addEventListener("mousedown", setAutoScrollOff);
	document.getElementById("txt_chat_send").addEventListener("focus", setAutoScrollOn);
	document.getElementById("btn_chat").addEventListener("click", turnOffVisualAlert);

	document.getElementById('Chat').onclick = function(e) {
		strTarget = e.target.id
		if (strTarget != 'txt_chat') { 
			setAutoScrollOn();          
		}
		turnOffVisualAlert();
	}

	var emoticon_map = {
	":-D": "\uD83D\uDE00",
	":)": "\uD83D\uDE03",
	":'(": "\uD83D\uDE03",
	";)": "\uD83D\uDE09",
	":(": "\uD83D\uDE12",
	":-p": "\uD83D\uDE1B",
	";-p": "\uD83D\uDE1C",
	":-O": "😮",
	':-D': "😁",
	':-P': "😜",
	":o)" :"🐵",
	":'(": "\uD83D\uDE22",
	  ':smile:': '😄',
	  ':laugh:': '😆',
	  ':blush:': '😊',
	  ':smile:': '😃',
	  ':relaxed:': '☺️',
	  ':smirk:': '😏',
	  ':relieved:': '😌',
	  ':satisfied:': '😆',
	  ':grin:': '\uD83D\uDE00',
	  ':wink:': '😉',
	  ':grin:': '😀',
	  ':kiss:': '😗',
	  ':tongue_out:': '😛',
	  ':sleepy:': '😴',
	  ':worried:': '😟',
	  ':frown:': '😦',
	  ':grimace:': '😬',
	  ':confused:': '😕',
	  ':hushed:': '😯',
	  ':unamused:': '😒',
	  ':sweat:': '😓',
	  ':weary:': '😩',
	  ':pensive:': '😔',
	  ':sad:': '😞',
	  ':sick:': '🤢',
	  ':fear:': '😨',
	  ':cry:': '😢',
	  ':sob:': '😭',
	  ':joy:': '😂',
	  ':wow:': '😲',
	  ':scream:': '😱',
	  ':tired': '😫',
	  ':angry:': '😠',
	  ':rage:': '😡',
	  ':sleepy:': '😪',
	  ':yum:': '😋',
	  ':mask:': '😷',
	  ':sunglasses:': '😎',
	  ':dizzy:': '😵',
	  ':neutral:': '😐',
	  ':no_mouth:': '😶',
	  ':innocent:': '😇',
	  ':alien:': '👽',
	  ':heart:': '❤️',
	  ':star:': '⭐',
	  ':boom:': '💥',
	  ':!:': '❗',
	  ':?:': '❓',
	  ':zzz:': '💤',
	  ':dash:': '🐶',
	  ':music:': '🎵',
	  ':fire:': '🔥',
	   ':+1:': '👍',
	  ':thumbsup:': '👍',
	  ':-1:': '👎',
	  ':thumbsdown:': '👎',
	  ':ok:': '👌',
	  ':punch:': '👊',
	  ':wave:': '👋',
	  ':hand:': '✋',
	  ':pray:': '🙏',
	  ':clap:': '👏',
	  ':muscle:': '💪',
	  ':walk:': '🚶',
	  ':run:': '🏃',
	  ':boy:': '👦',
	  ':girl:': '👧',
	  ':woman:': '👩',
	  ':man:': '👨',
	  ':baby:': '👶',
	  ':sun:': '☀️',
	  ':cloud:': '☁️',
	  ':snow:': '❄️',
	  ':zap:': '⚡',
	  ':cat:': '🐱',
	  ':dog:': '🐶',
	  ':bear:': '🐻',
	  ':pig:': '🐷',
	  ':cow:': '🐮',
	  ':monkey:': '🐵',
	  ':snake:': '🐍',
	  ':bird:': '🐦',
	  ':bug:': '🐛',
	  ':bee:': '🐝',
	  ':snail:': '🐌',
	  ':fish:': '🐟',
	  ':dolphin:': '🐬',
	  ':maple:': '🐕',
	  ':moon:': '🌔',
	  ':ghost:': '👻',
	  ':bell:': '🔔',
	  ':computer:': '💻',
	  ':tv:': '📺',
	  ':iphone:': '📱',
	  ':phone:': '☎️',
	  ':watch:': '⌚',
	  ':radio:': '📻',
	  ':satellite:': '📡',
	  ':loop:': '➿',
	  ':mag:': '🔍',
	  ':unlock:': '🔓',
	  ':lock:': '🔒',
	  ':key:': '🔑',
	  ':bulb:': '💡',
	  ':battery:': '🔋',
	  ':email:': '✉️',
	  ':mailbox:': '📫',
	  ':bath:': '🛀',
	  ':shower:': '🚿',
	  ':toilet:': '🚽',
	  ':wrench:': '🔧',
	  ':hammer:': '🔨',
	  ':dollar:': '💵',
	  ':bomb:': '💣',
	  ':gun:': '🔫',
	  ':coffee:': '☕',
	  ':tea:': '🍵',
	  ':beer:': '🍺',
	  ':pizza:': '🍕',
	  ':hamburger:': '🍔',
	  ':fries:': '🍟',
	  ':sunrise:': '🌅',
	  ':stars:': '🌠',
	  ':boat:': '⛵',
	  ':sailboat:': '⛵',
	  ':rocket:': '🚀',
	  ':plane:': '✈️',
	  ':bike:': '🚲',
	  ':car:': '🚗'
	 };

	 function escapeSpecialChars(regex) {
	   return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
	 }

	 // swaps text for emojis
	 document.getElementById("txt_chat_send").oninput = function() {
	   for (var i in emoticon_map) {
		 var regex = new RegExp(escapeSpecialChars(i), 'gim');
		 this.value = this.value = this.value.replace(regex, emoticon_map[i]);
	   }
	 };

	const btn_emoji = document.getElementById("btn_emoji");

	const picker = new EmojiButton({
		position: "auto-start",
		showVariants: false
	});
	picker.on("emoji", emoji => {
		var txt = document.getElementById("txt_chat_send");
		txt.value += emoji;
		txt.focus();
	  });
	btn_emoji.addEventListener("click", () => {
	  picker.togglePicker(btn_emoji);
	});	
			
	function turnOffVisualAlert() {
		if (document.getElementById("btn_chat").className.indexOf("yellow") > -1) {
			document.getElementById("btn_chat").className = 
			document.getElementById("btn_chat").className.replace("w3-yellow", "myMainColor");  
		}
	}		

	function setAutoScrollOn() {
		if (sessionStorage.getItem("blAutoscroll") == "false") {
			//console.log("Autoscroll on");
			sessionStorage.setItem("blAutoscroll", true);
			// scroll to bottom
			var textarea = document.getElementById("txt_chat");
			textarea.scrollTop = textarea.scrollHeight;
		}
	}	

	function setAutoScrollOff() {
		if (sessionStorage.getItem("blAutoscroll") == "true") {
			//console.log("Autoscroll off");
			sessionStorage.setItem("blAutoscroll", false);
		}
	}	

	var pingVar = setInterval(pingTimer, 130000); // 130 secs. Ping sent from python every 120 secs
	function pingTimer() {
		var datCurTime = new Date();
		var datLastPing = new Date(parseInt(localStorage.getItem("lastPingReceived")));
		//console.log(datCurTime - datLastPing);
		if (datCurTime - datLastPing > 130000) {
			document.getElementById("ping_notify").innerHTML = "&#128721;" //stop sign
			if (datCurTime - datLastPing > 260000) {
				window.location.reload(true); // refresh the window
				//console.log('Refresh');
				localStorage.setItem("lastPingReceived", datLastPing - 100000);	
			}
		}
		else {
			document.getElementById("ping_notify").innerHTML = "&#9989;"; // green check
		}		
	}

	var logViewVar = setInterval(logViewTimer, 10000); // Check for leaving of log view every 10 secs
	function logViewTimer() {
		// check for and removal of copied log file
		if (localStorage.getItem("leavelogview") != "") {
			sendMessage({ data: DATA_PREFIX + "logkill" });
			localStorage.setItem("leavelogview", "");	
		}
		
	}
			
	var chat_audio = document.createElement('audio');
	chat_audio.setAttribute('src', "static/tarpn_tone.mp3");
    chat_audio.setAttribute('src', "static/tarpn_tone.wav");

	var bbs_audio = document.createElement('audio');
    bbs_audio.setAttribute('src', "static/tarpn_mail.mp3");
    bbs_audio.setAttribute('src', "static/tarpn_mail.wav");
  
	function findArrayMatch(element, strIn) {
	  return element == strIn;
	}
	socket.onopen = function () {
		localStorage.setItem("lastTimeReceived", +new Date()); //reset time since last receive
		sessionStorage.setItem("blAutoscroll", true);	
		readCommands(); // get JSON into dropdowns
		console.log("Connected.");
	};

	// read the dropdown commands
	function readCommands() {
		let sel_chat_cmds = document.getElementById('sel_chat_cmds');
		sel_chat_cmds.length = 0;
		let defaultOption = document.createElement('option');
		defaultOption.text = 'Choose Command';
		sel_chat_cmds.add(defaultOption);
		sel_chat_cmds.selectedIndex = 0;
		
		let sel_node_cmds = document.getElementById('sel_node_cmds');
		sel_node_cmds.length = 0;
		let defaultOption2 = document.createElement('option');
		defaultOption2.text = 'Choose Command';
		sel_node_cmds.add(defaultOption2);
		sel_node_cmds.selectedIndex = 0;

		const url = 'static/TARPN_Commands.json';

		const request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
			if (request.status === 200) {
				const data = JSON.parse(request.responseText);
				let option;
				for (let i = 0; i < data.length; i++) {
					option = document.createElement('option');
					option.text = data[i].Display;
					option.value = data[i].Send;
					if (data[i].Tier == 'Chat') {
						sel_chat_cmds.add(option);
					}
					else if (data[i].Tier == 'Node') {
						sel_node_cmds.add(option);
					}
				}
		   } else {
			// Reached the server, but it returned an error
			console.error('An error occurred fetching the JSON from ' + url);
		  }   
		}

		request.onerror = function() {
			console.error('An error occurred fetching the JSON from ' + url);
		};

		request.send();			
	}
	
	function stripAwayBackFromText(strIn) {
		var str = strIn;
		
		// use regex to find and strip away and back from the text
		str = str.replace(/\d\d:\d\d ..: .{4,7} : away<br>/ig,'');
		str = str.replace(/<span style="color:#......;font-weight:bold;font-size=13px">\d\d:\d\d ..: .{4,16} : away<\/span><br>/ig,'');
		str = str.replace(/\d\d:\d\d ..: .{4,7} : afk<br>/ig,'');
		str = str.replace(/<span style="color:#......;font-weight:bold;font-size=13px">\d\d:\d\d ..: .{4,16} : afk<\/span><br>/ig,'');
		str = str.replace(/\d\d:\d\d ..: .{4,7} : back<br>/ig,'');
		str = str.replace(/<span style="color:#......;font-weight:bold;font-size=13px">\d\d:\d\d ..: .{4,16} : back<\/span><br>/ig,'');
		return str
	}

	function adjustEmojiHTML(strIn) {
		var str = strIn;
		var intEmojiSize = document.getElementById("selEmojiSize").value;
		var strEmojiSize = intEmojiSize.toString();
		//set emoji size
		str = str.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,'<font size="+' + strEmojiSize + '">$&</font>');
		return str
	}

	//function sortJSONbyPropertyDesc(property) { //2.1
		//return function(a,b){
			//if(a[property] < b[property])
				//return 1;
			//else if(a[property] > b[property])
				//return-1;
				
			//return 0;
		//}
	//}
	
	function parseDateLocalTime(strDate) {
		var reg = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
		var parts = reg.exec(strDate);
		return parts ? (new Date(parts[3], parts[1]-1, parts[2], parts[4], parts[5])) : null
	}
	
	function timeFromNowString(strPastTime) {
		var datNow = new Date();
		var datPastTime = parseDateLocalTime(strPastTime);
        var res = Math.abs((datNow.getTime() - datPastTime.getTime())/1000);
		var strOut = ''
			
        // get days
        var days = Math.floor(res / 86400);
 		
        // get hours        
        var hours = Math.floor(res / 3600) % 24;        
         
        // get minutes
        var minutes = Math.floor(res / 60) % 60;
		
		if (days > 0) {
			 strOut = days.toString() + 'd';
		} else if (hours > 0 ) {
			 strOut = hours.toString() + 'h';
		} else if (minutes > 0 ) {
			 strOut = minutes.toString() + 'm';
		}
		//console.log('Past Time: ' + strPastTime);
		//console.log('Cur Time: ' + datNow.toLocaleString('en-US'));
		//console.log('Time: ' + strOut);
		return strOut;
	}
			
	socket.onmessage = function (message) {
		var datLastTimeReceived;
		var datCurTimeReceived;
		var intAudioTimeOut = 300000; // for audio tone. default of 5 minutes
		var textarea;
		var strTemp = "";
		var strOut = "";
		
		//console.log("Received: " + message.data.charCodeAt(0));
		//console.log("Received: " + message.data.substring(1,5));
		if (message.data.charCodeAt(0) == intDataCode) {
			if (message.data.substring(1,5) == 'ping') {
				localStorage.setItem("lastPingReceived", +new Date());					
			}
			else if (message.data.substring(1,4) == "ini") {
				var strVars = message.data.substring(4);
				//console.log(strVars);
				var objVars = JSON.parse(strVars);
				document.getElementById("lblInfoNode").innerHTML = objVars.NodeName;
				document.getElementById("lblInfoCall").innerHTML = objVars.CallSign;
				document.getElementById("lblNodeDesc").innerHTML = "Node:" + objVars.NodeName + ", Call:" + objVars.CallSign + ", NodeCall:" + objVars.NodeCall; //2.1				
				//save name and call for other pages to use
				//save ini settings for future use
				localStorage.setItem("NodeName",objVars.NodeName);
				localStorage.setItem("CallSign",objVars.CallSign);
				localStorage.setItem("NodeCall",objVars.NodeCall);
			} else if (message.data.substring(1,6) == "state") {
				// state flags
				var strVars = message.data.substring(6);
				var objVars = JSON.parse(strVars);
				if (objVars.ChatInSwitch == "0") {
					document.getElementById("btn_chat_power").checked = false;
					//document.getElementById("btn_chat_send").disabled = true;
					document.getElementById("btn_chat_join").disabled = true;
					document.getElementById("btn_chat_leave").disabled = true;
					document.getElementById("btn_chat_away").disabled = true;
					document.getElementById("btn_chat_return").disabled = true;
					document.getElementById("lblChatHead").innerHTML = "No Chatters";
					if (document.getElementById("chkShowHints").checked == true) {
						document.getElementById("lbl_chat_hint").innerHTML = "Hint: Make sure the SWITCH in upper right is on and click the Join button below.";
					}
					document.getElementById("txt_chat_status").innerHTML = "Chat switch is off<br>Click SWITCH<br>then Join below";
				} else if (objVars.ChatInSwitch == "1") {
					document.getElementById("btn_chat_power").checked = true;
					if (objVars.ChatJoined == "0") {
						document.getElementById("btn_chat_join").disabled = false;
						document.getElementById("btn_chat_leave").disabled = true;
						document.getElementById("btn_chat_away").disabled = true;
						document.getElementById("btn_chat_return").disabled = true;
						//document.getElementById("btn_chat_send").disabled = true;
						if (document.getElementById("chkShowHints").checked == true) {
							document.getElementById("lbl_chat_hint").innerHTML = "Hint: Click the Join button below to chat.";
						}
						document.getElementById("txt_chat_status").innerHTML = "Not in Chat<br>Click Join below";
						document.getElementById("lblChatHead").innerHTML = "No Chatters";
					} else if (objVars.ChatJoined == "1") {
						document.getElementById("btn_chat_join").disabled = true;
						document.getElementById("btn_chat_leave").disabled = false;
						document.getElementById("btn_chat_away").disabled = false;
						document.getElementById("btn_chat_return").disabled = true;
						//document.getElementById("btn_chat_send").disabled = false;
						document.getElementById("lbl_chat_hint").innerHTML = ""
					}
				}
				if (objVars.NodeInSwitch == "0") {
					document.getElementById("btn_node_power").checked = false;
					//document.getElementById("btn_node_send").disabled = true;
					if (document.getElementById("chkShowHints").checked == true) {
						document.getElementById("lbl_node_hint").innerHTML = "Hint: Make sure the SWITCH in upper right is on";
					}
				} else if (objVars.NodeInSwitch == "1") {
					document.getElementById("btn_node_power").checked = true;
					//document.getElementById("btn_node_send").disabled = false;
					document.getElementById("lbl_node_hint").innerHTML = ""
				}				
			} 
			else if (message.data.substring(1,8) == "chatlog") {
				// open the chat log page
				window.open("static/chatlog.html", '_blank');
			}
			else if (message.data.substring(1,13) == "chat_history") {
				var strVars = message.data.substring(13);
				var objVars = JSON.parse(strVars);
				strTemp = objVars.ChatHistory;
				if (document.getElementById("chatSidebar").style.display == 'block') {
					strTemp = stripAwayBackFromText(strTemp);
				}
				strTemp = adjustEmojiHTML(strTemp); // set the emoji size
				
				if (document.getElementById("btn_chat_join").disabled == false) {
					strTemp = strTemp + "Click Join to enter Chat mode<br>";
				}
				textarea = document.getElementById("txt_chat");
				textarea.innerHTML = strTemp;

				// scroll to bottom
				if (sessionStorage.getItem("blAutoscroll") == "true") {
					textarea.scrollTop = textarea.scrollHeight;
				}
			} 
			else if (message.data.substring(1,11) == "nodestats:") {
				var strData = message.data.substring(11);
				plotInfoStats(strData);
			}
			if (message.data.substring(1,10) == "chat_list") {
				var strVars = '{"chatters":' + message.data.substring(10) + "}";
				var objVars = JSON.parse(strVars);
				var strMyCall = document.getElementById("lblInfoCall").innerHTML;
				var intChatterCount = 0;
				
				strOut = '<table cellpadding="0" cellspacing="0" style="width:100%;">';
				var intMax = objVars.chatters.length;
				for (var i = 0; i < intMax; i++) {
					var chatter = objVars.chatters[i];
					if (chatter.Status == 'OUT') {
						// don't show an OUT chatter
						continue;
					}	
					intChatterCount = intChatterCount + 1			
					strName = chatter.Name;
					strTime = '';
					if (chatter.Time != '') {
						// Time is known
						strTime = timeFromNowString(chatter.Time);
					}
					strColor = chatter.Color;
					strOut += '<tr>';
					//console.log(Date(chatter.Time * 1000));
					if (chatter.Status == 'AFK') {
						if (chatter.Call == strMyCall) {
							document.getElementById("btn_chat_away").disabled = true;
							document.getElementById("btn_chat_return").disabled = false;
						}							
					}
					else if (chatter.Call == strMyCall) {
						document.getElementById("btn_chat_away").disabled = false;
						document.getElementById("btn_chat_return").disabled = true;
					}
					strOut += '<td style="width:160px">';
					if (chatter.Status == 'AFK') {
						strOut += '<img id="chat_img' + i.toString() + '" src="static/reddot.png">';
					}
					else if (chatter.Status == 'ACT') {
						strOut += '<img id="chat_img' + i.toString() + '" src="static/greendot.png">';
						strTime = '';
					}
					else if (chatter.Status == 'UNK') {
						strOut += '<img id="chat_img' + i.toString() + '" src="static/blackdot.png">';
					}
					else if (chatter.Status == 'LFT') { // left but still showing
						strOut += '<img id="chat_img' + i.toString() + '" src="static/yellowdot.png">';
						strColor = "#a9a9a9;background-color:yellow;"; //light grey w/ yellow back
					}
					else {
						strOut += '<img id="chat_img' + i.toString() + '" src="static/greydot.png">';
					}	
					strOut += '<span id="colorid' + i.toString() + '" style="color:' + strColor + '">';
					strOut += chatter.Call + ', ' + strName + '</span>';
					strOut += '</td>';
					strOut += '<td style="text-align:right">';
					strOut += '<span style="color:#a9a9a9" id="chat_time' + i.toString() + '">' + strTime + '</span>';
					strOut += '</td></tr>';
				}
				strOut += '</table>';
				document.getElementById("txt_chat_status").innerHTML = strOut;
				document.getElementById("lblChatHead").innerHTML = intChatterCount.toString() + ' Chatters'
				strOut = '&nbsp;';
				if (document.getElementById("chkShowHints").checked) {
					strOut = 'Status Hint:<br>'
					strOut += '<img src="static/greendot.png"> = Available<br>';
					strOut += '<img src="static/reddot.png"> = Away<br>';
					strOut += '<img src="static/greydot.png"> = Idle<br>';
					strOut += '<img src="static/blackdot.png"> = Gone';
				}
				document.getElementById("txt_sidebar_hint").innerHTML = strOut;				
			} 
			else if (message.data.substring(1,12) == "chat_status") {
				var intColon = message.data.indexOf(':');
				var strIndex = message.data.substring(12,intColon);
				//var strStatus = message.data.substring(intColon+1,intColon+4);
				//var strTime = message.data.substring(intColon+4,);
				var strJSON = message.data.substring(intColon+1,);
				var chatter = JSON.parse(strJSON);
				var strStatus = chatter.Status;
				var strImage = '';
				var strTime = '';
				if (chatter.Time != '') {
					strTime = timeFromNowString(chatter.Time);
				}
				strColor = ''//chatter.Color;
				//console.log(chatter.Name + ' color: ' + strColor);

				if (strStatus == 'AFK') {
					strImage = 'static/reddot.png';
				}
				else if (strStatus == 'ACT') {
					strImage = 'static/greendot.png';
				}
				else if (strStatus == 'IDL') {
					strImage = 'static/greydot.png';
				}
				else if (strStatus == 'UNK') {
					strImage = 'static/blackdot.png';
				}
				else if (strStatus == 'LFT') { // left but still showing 2.1
					strImage = 'static/yellowdot.png';
					strColor = "color:#a9a9a9;background-color:yellow;"; //light grey w/ yellow back
				}
				//else if (strStatus == 'OUT') { // logged out 2.1
				//	strImage = 'static/blackdot.png';
				//	strColor = "color:#a9a9a9;background-color:white;"; //light grey
				//}
				$("#chat_img" + parseInt(strIndex)).attr('src',strImage);
				$("#chat_time" + parseInt(strIndex)).text(' ' + strTime);
				if (strColor != ''){
					$("#colorid" + parseInt(strIndex)).attr('style', 'color:' + strColor + ';');
				}
			}
			else if (message.data.substring(1,8) == "options") {
				// passing in options
				var strVars = message.data.substring(8);
				var objVars = JSON.parse(strVars);

				document.getElementById("lblVersion").innerHTML = objVars.Version;
				document.getElementById("selChatSound").value = objVars.ChatAlertSound;
				document.getElementById("lblChatSoundBackup").innerHTML = objVars.ChatAlertSound;
				document.getElementById("lbl_chat_sound_file").innerHTML = objVars.ChatSoundFile;
				if (objVars.ChatSoundFile == 'Default') {
					chat_audio.setAttribute("src", "" );
					chat_audio.setAttribute('src', "static/tarpn_tone.mp3");
					chat_audio.setAttribute('src', "static/tarpn_tone.wav");
				}
				else {
					chat_audio.setAttribute("src", "" );
					chat_audio.setAttribute("src", "uploads/" + objVars.ChatSoundFile);
				}
				document.getElementById("lbl_chat_sound_file_backup").innerHTML = objVars.ChatSoundFile;
				document.getElementById("selChatVisual").value = objVars.ChatAlertVisual;
				document.getElementById("lblChatVisualBackup").innerHTML = objVars.ChatAlertVisual;
				document.getElementById("chkIgnoreJoins").value = objVars.IgnoreChatJoins;
				document.getElementById("selEmojiSize").value = objVars.EmojiSize;
				document.getElementById("lblEmojiSizeBackup").innerHTML = objVars.EmojiSize;
				linespacing = localStorage.getItem("linespacing") 
				if (linespacing == "") {
					linespacing = "1";
				}
				document.getElementById("selLineSpacing").value = linespacing;
				document.getElementById("lblLineSpacingBackup").innerHTML = linespacing;
				
				if (objVars.IgnoreChatJoins == 1) {
					document.getElementById("chkIgnoreJoins").checked = true;
				} else {
					document.getElementById("chkIgnoreJoins").checked = false;
				}
				document.getElementById("chkShowHints").value = objVars.ShowHints;
				if (objVars.ShowHints == 1) {
					document.getElementById("chkShowHints").checked = true;
				} else {
					document.getElementById("chkShowHints").checked = false;
				}
				document.getElementById("chkShowCommands").value = objVars.ShowCommands;
				if (objVars.ShowCommands == 1) {
					document.getElementById("chkShowCommands").checked = true;
				} else {
					document.getElementById("chkShowCommands").checked = false;
					document.getElementById("chat_commands_bar").style.display = "none";
					document.getElementById("node_commands_bar").style.display = "none";
					resizeDivs();
				}								
				document.getElementById("chkUseBBS").value = objVars.UseBBS;
				if (objVars.UseBBS == 1) {
					document.getElementById("chkUseBBS").checked = true;
					document.getElementById("btn_BBS").style.display = "block";
				} else {
					document.getElementById("chkUseBBS").checked = false;
					document.getElementById("btn_BBS").style.display = "none";
				}								
				document.getElementById("chkIgnoreBBSKilled").value = objVars.IgnoreBBSKilled;
				if (objVars.IgnoreBBSKilled == 1) {
					document.getElementById("chkIgnoreBBSKilled").checked = true;
				} else {
					document.getElementById("chkIgnoreBBSKilled").checked = false;
				}	
				document.getElementById("lbl_bbs_sound_file").innerHTML = objVars.BBSSoundFile;
				document.getElementById("lbl_bbs_sound_file_backup").innerHTML = objVars.BBSSoundFile;
				if (objVars.BBSSoundFile == 'Default') {
					bbs_audio.setAttribute("src", "" );
					bbs_audio.setAttribute('src', "static/tarpn_mail.mp3");
					bbs_audio.setAttribute('src', "static/tarpn_mail.wav");
				}
				else {
					bbs_audio.setAttribute("src", "" );
					bbs_audio.setAttribute("src", "uploads/" + objVars.BBSSoundFile);
				}
			}
			else if (message.data.substring(1,11) == 'mailcount>') {
				var intCount = message.data.substring(11,);
				if (intCount > 0) {
					var blPlaySound = false;
					if (intCount > document.getElementById("mail_count").innerHTML) {
						blPlaySound = true; 
					}
					if (document.getElementById("chk_mute").checked == true) {
						blPlaySound = false; // mute overrides all
					}
					if (blPlaySound) {
						// play a tone for new mail
						bbs_audio.play();
					}
					document.getElementById("mail_count").innerHTML = intCount;
					//if (intCount == 1) {
					//	document.getElementById("mail_notify").innerHTML = document.getElementById("mail_notify").innerHTML.replace('Msgs','Msg');
					//}
					//else if (document.getElementById("mail_notify").innerHTML.indexOf('Msgs') == -1) {
					//	document.getElementById("mail_notify").innerHTML = document.getElementById("mail_notify").innerHTML.replace('Msg','Msgs');
					//}	
					//document.getElementById("mail_notify").style.display = "block";
					document.getElementById("btn_BBS").innerHTML = "BBS (" + intCount + ")"; 
				}
				else {
					//document.getElementById("mail_notify").style.display = "none";
					document.getElementById("mail_count").innerHTML = "0";
					document.getElementById("btn_BBS").innerHTML = "BBS";
				}
			}
			else if (message.data.substring(1,4) == '.^.') {
				// surprise!
				if (message.data.substring(4,6) == 'hi') {
					txt_node.empty();
				}
				else if (message.data.substring(4,7) == 'bye') {
					txt_node.empty();
				}
				else {
					txt_node.append(message.data.substring(4));
				}

				// scroll to bottom
				textarea = document.getElementById("txt_node");
				textarea.scrollTop = textarea.scrollHeight;					
			}
		}
		else if (message.data.charCodeAt(0) == intHiddenCode) {
			if (message.data.substring(1,9) == "bbs_list") {
				strBBS_list_JSON = '{"bbs_list":' + message.data.substring(9) + "}";
				//console.log (strBBS_list_JSON);
				var objVars = JSON.parse(strBBS_list_JSON);
				lst_BBS_msg = objVars.bbs_list;
				if ( $.fn.dataTable.isDataTable( '#bbs_msg_list' ) ) {
					BBS_table = $('#bbs_msg_list').DataTable();
					BBS_table.clear().rows.add(lst_BBS_msg).draw();
				}
				else {
					BBS_table = $('#bbs_msg_list').DataTable({
						data: lst_BBS_msg,
						"paging":   false,
						"ordering": false,
						"info":     false,
						"searching":false,
						"scrollY":	"300px",
						"scrollCollapse": true, 
						columns: [
							{ title: "Num", width: "40px" },
							{ title: "Date", width: "60px" },
							{ title: "Type", width: "60px" },
							{ title: "Status" , width: "100px"},
							{ title: "Length", width: "60px" },
							{ title: "To", width: "70px" },
							{ title: "At", width: "70px" },
							{ title: "From", width: "70px" },
							{ title: "Subject" }
						],
						"rowCallback": function(row, data) {
							if ((data[2] == 'Pers') && (data[3] == 'Not Read/Sent') && (data[5] == document.getElementById("lblInfoCall").innerHTML)) {
								$(row).css('background-color','#99ff9c');
							}
							else {
								$(row).css('background-color','');
							}
						}						
					});
				}	
				if (lst_BBS_msg.length > 0) {
					document.getElementById("txt_bbs_msg").innerHTML = 'Select a message from the list above to see the content.';
				}
				else {
					document.getElementById("txt_bbs_msg").innerHTML = 'There are no messages to show in the list above.';
				}
				document.getElementById("btn_bbs_delete").disabled = true;
				document.getElementById("btn_bbs_reply").disabled = true;
				document.getElementById("btn_bbs_fwd").disabled = true;
				document.getElementById("btn_bbs_print").disabled = true;
				//document.getElementById("btn_bbs_export").disabled = true;
			}
			else if (message.data.substring(1,8) == "bbs_msg") {
				document.getElementById("txt_bbs_msg").innerHTML = message.data.substring(8)
				var intKilled = -1;
				intKilled = message.data.substring(8).indexOf('Killed');
				var intHash = message.data.substring(8).indexOf('#');
				if ((intKilled > -1) && (intHash < intKilled) ){
					// set the table status to Killed
					strMsg = message.data.substring(8+intHash+1,8+intKilled-1);
					var intMax = lst_BBS_msg.length;
					for (var i = 0; i < intMax; i++) {
						if (lst_BBS_msg[i][0] == strMsg) {
							lst_BBS_msg[i][3] = 'Killed';
							document.getElementById("btn_bbs_delete").disabled = true;
							document.getElementById("btn_bbs_reply").disabled = true;
							document.getElementById("btn_bbs_fwd").disabled = true;
							document.getElementById("btn_bbs_print").disabled = true;
							//document.getElementById("btn_bbs_export").disabled = true;
							BBS_table.cell(i,3).data( 'Killed' ).draw();
							if (document.getElementById("chkIgnoreBBSKilled").checked == true) {
								document.getElementById("txt_bbs_msg").innerHTML = 'Refreshing the list of messages...';
								sendMessage({ data: HIDDEN_PREFIX + "bbs_refresh" });
							}
							break;
						}
					}
				}
				else {
					var intRead = message.data.substring(8).indexOf('Type/Status: PN');
					if (intRead > -1) {
						// set an unread message to read
						BBS_table.cell('.selected',3).data('Read').draw();
					} 
					document.getElementById("btn_bbs_delete").disabled = false;
					document.getElementById("btn_bbs_reply").disabled = false;
					document.getElementById("btn_bbs_fwd").disabled = false;
					document.getElementById("btn_bbs_print").disabled = false;
					//document.getElementById("btn_bbs_export").disabled = false;
				}
				$("#txt_bbs_msg").height(($("#BBS").height()-380));
			}
		}
		else if ((message.data.charCodeAt(0) == intChatCode) && 
				 (document.getElementById("chatSidebar").style.display == 'block') &&
			     ((message.data.substring(1).replace('</span>','').indexOf(' : away<br>') > -1) ||
			      (message.data.substring(1).replace('</span>','').indexOf(' : afk<br>') > -1) ||  
			      (message.data.substring(1).replace('</span>','').indexOf(' : back<br>') > -1)
			     )
			    ) {
				message.data = ''; // ignore the away message
		}
		else if (message.data.charCodeAt(0) == intChatCode) {
			// CHAT_PREFIX in first character denotes chat command
			datCurTimeReceived = new Date();
			datLastTimeReceived = new Date(
				parseInt(localStorage.getItem("lastTimeReceived"))
			);
			var intPlaySound = 0;
			var intShowVisual = 0;
			if (document.getElementById("selChatSound").value == 4) {
				intPlaySound = 1; // always beep
			}
			if (datCurTimeReceived - datLastTimeReceived > intAudioTimeOut) {
				if (document.getElementById("selChatSound").value >= 2) {
					intPlaySound = 1; // after inactivity
				}
				if (document.getElementById("selChatVisual").value >= 2) {
					intShowVisual = 1;
				}
				datLastTimeReceived = datCurTimeReceived; // reset timer
			} 
			else if (document.hasFocus() == false) {
				if (document.getElementById("selChatSound").value == 3) {
					intPlaySound = 1; // unfocused
				}
				if (document.getElementById("selChatVisual").value == 3) {
					intShowVisual = 1;
				}
			}
			if (document.getElementById("chkIgnoreJoins").checked == true &&
				(message.data.indexOf(": *** Left") > 0 ||
					message.data.indexOf("*** Joined Chat,") > 0)) {
				intPlaySound = 0;
				intShowVisual = 0;
			}
			if (message.data.indexOf(
					": " + document.getElementById("lblInfoCall").innerHTML) >= 0) {
				intPlaySound = 0; // don't play on my own message
				intShowVisual = 0;
			}
			if (document.getElementById("chk_mute").checked == true) {
				intPlaySound = 0; // mute overrides all
			}
			if (intPlaySound == 1) {
				// play a tone
				chat_audio.play();
			}
			if (intShowVisual == 1) {
				// highlight chat
				document.getElementById("btn_chat").className = 
					document.getElementById("btn_chat").className.replace("myMainColor", "w3-yellow");   
				document.getElementById("btn_chat").className = 
					document.getElementById("btn_chat").className.replace("w3-light-grey", "w3-yellow");   				
			}
			localStorage.setItem("lastTimeReceived", +new Date());
			if (message.data != '') {
				strNew = message.data.substring(1);
				// increase the size of emojis
				strNew = adjustEmojiHTML(message.data.substring(1));
				txt_chat.append(strNew);
			}
			if (txt_chat.html().length >= 100000) {
				// remove from front if too long and skip partial top line
				txt_chat.html(txt_chat.html().slice(txt_chat.html().indexOf('<br>')+4), txt_chat.html().length - 100000);
			}

			// scroll to bottom
			if (sessionStorage.getItem("blAutoscroll") == "true") {
				textarea = document.getElementById("txt_chat");
				textarea.scrollTop = textarea.scrollHeight;
			}
			//} else if (message.data.substring(0,1) == ":") {
			//    // : denotes shell command
			//	shell_text.append(message.data.substring(1).replace(/\r\n|\r|\n/g,"<br>"));
			//	shell_text.append($('<br/>'));
		} else {
			// node window
			txt_node.append(message.data);

			if (txt_node.html().length >= 10000) {
				//remove from front if too long
				txt_node.html(txt_node.html().slice(txt_node.html().length - 10000));
			}

			// scroll to bottom
			textarea = document.getElementById("txt_node");
			textarea.scrollTop = textarea.scrollHeight;
		}
	};

	socket.onclose = function () {
		console.log("Disconnected");
	};

	var sendMessage = function (message) {
		localStorage.setItem("lastTimeReceived", +new Date()); //reset time since last receive
		//console.log("Sending:" + message.data);
		socket.send(message.data);
	};

	// GUI Stuff

	// send a node command to the serial port
	$("#btn_node_send").click(function (event) {
		event.preventDefault();
		sendNodeTextToNode();
	});

	// run after a CR
	$("#txt_node_send").submit(function (event) {
		event.preventDefault();
		sendNodeTextToNode();
	});

	function sendNodeTextToNode() {
		var cmd = $("#txt_node_send").val();
		// strip control chars
		cmd = cmd.replace(/[^\x20-\x7e]/g, '')

		if (cmd != "") {
			sendMessage({ data: cmd });
		}
		$("#txt_node_send").val("");

		// Add line to the Sent dropdown
		var selNodeSent = document.getElementById("sel_node_sent");
		var option = document.createElement("option");
		option.text = cmd;
		selNodeSent.add(option);
		selNodeSent.selectedIndex = selNodeSent.length - 1;
		if (selNodeSent.length == 1) {
			document.getElementById("lbl_last_node_sent").innerHTML =
				cmd + " (Up arrow to recall)";
		} else {
			document.getElementById("lbl_last_node_sent").innerHTML = cmd;
		}
	}

	$("#sel_node_sent").change(function () {
		$("#txt_node_send").val($(this).val());
	});

	//$("#btn_node_clear").click(function (event) {
	//	event.preventDefault();
	//	txt_node.empty();
	//});

	$("#btn_node_reconnect").click(function (event) {
		event.preventDefault();
		sendMessage({ data: NODE_PREFIX + "reconnect" });
	});

	$("#btn_open_sidebar").click(function (event) {
		event.preventDefault();
		document.getElementById("chatMiddle").style.marginRight = "220px";
		document.getElementById("chatSidebar").style.display = "block";
		document.getElementById("btn_open_sidebar").style.display = "none";
		localStorage.setItem("sidebar_open", "yes");
	});
	$("#btn_close_sidebar").click(function (event) {
		event.preventDefault();
		document.getElementById("chatMiddle").style.marginRight = "0%";
		document.getElementById("chatSidebar").style.display = "none";
		document.getElementById("btn_open_sidebar").style.display = "inline-block";
		localStorage.setItem("sidebar_open", "no");
	});

	$("#chk_mute").click(function (event) {
		// Get the checkbox
		var checkBox = document.getElementById("chk_mute");

		// If the checkbox is checked, turn sound off
		if (checkBox.checked == true) {
			localStorage.setItem("MuteChatFlag", 1);
		} else {
			localStorage.setItem("MuteChatFlag", 0);
		}
	});

	// send a chat command to the serial port
	$("#btn_chat_send").click(function (event) {
		event.preventDefault();
		sendChatTextToNode();
	});

	// run after a CR
	$("#txt_chat_send").submit(function (event) {
		event.preventDefault();
		sendChatTextToNode();
	});

	function sendChatTextToNode() {
		var cmd = $("#txt_chat_send").val();
		if (cmd != '') {
			// strip control characters
			//cmd = cmd.replace(/[^\x20-\x7e]/g, '')
			// remove html if not a url
			cmd = cmd.replace(/\<(?!a href|\/a).*?\>/g, '')
			
			if ((cmd == 'afk') || (cmd == 'away')) {
				document.getElementById("btn_chat_away").disabled = true;
				document.getElementById("btn_chat_return").disabled = false;
			}
			else if (document.getElementById("btn_chat_away").disabled) {
				document.getElementById("btn_chat_away").disabled = false;
				document.getElementById("btn_chat_return").disabled = true;
			}
			sendMessage({ data: CHAT_PREFIX + cmd });
			$("#txt_chat_send").val("");

			// Add line to the Sent dropdown
			var selChatSent = document.getElementById("sel_chat_sent");
			var option = document.createElement("option");
			option.text = cmd;
			selChatSent.add(option);
			selChatSent.selectedIndex = selChatSent.length - 1;

			if (selChatSent.length == 1) {
				document.getElementById("lbl_last_chat_sent").innerHTML =
					cmd + " (Up arrow to recall)";
			} else {
				document.getElementById("lbl_last_chat_sent").innerHTML = cmd;
			}
		}
	}

	$("#btn_chat_away").click(function (event) {
		event.preventDefault();
		document.getElementById("btn_chat_away").disabled = true;
		document.getElementById("btn_chat_return").disabled = false;
		sendMessage({ data: CHAT_PREFIX + "away" });
	});

	$("#btn_chat_return").click(function (event) {
		event.preventDefault();
		document.getElementById("btn_chat_away").disabled = false;
		document.getElementById("btn_chat_return").disabled = true;
		sendMessage({ data: CHAT_PREFIX + "back" });
	});
	
	// bbs stuff
    $('#bbs_msg_list tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            document.getElementById("txt_bbs_msg").innerHTML = 'Click the list above to see the message'
            document.getElementById("btn_bbs_delete").disabled = true;
            //document.getElementById("btn_bbs_export").disabled = true;
            document.getElementById("btn_bbs_reply").disabled = true;
            document.getElementById("btn_bbs_fwd").disabled = true;
            document.getElementById("btn_bbs_print").disabled = true;
        }
        else {
            BBS_table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            document.getElementById("txt_bbs_msg").innerHTML = 'Reading message ' + BBS_table.cell('.selected',0).data() + '...';
            // read selected message
            sendMessage({ data: HIDDEN_PREFIX + "bbs_read_msg" + BBS_table.cell('.selected',0).data() });
        }
    } );
 
    $('#btn_bbs_delete').click( function () {
        document.getElementById("txt_bbs_msg").innerHTML = 'Killing message ' + BBS_table.cell('.selected',0).data();
        // Kill selected message
        sendMessage({ data: HIDDEN_PREFIX + "bbs_kill_msg" + BBS_table.cell('.selected',0).data() });
    } ); 
    $('#btn_bbs_refresh').click( function () {
        document.getElementById("txt_bbs_msg").innerHTML = 'Refreshing the list of messages...';
		sendMessage({ data: HIDDEN_PREFIX + "bbs_refresh" });
    } ); 

	function decodeHTML(html) {
		var txt = document.createElement("textarea");
		txt.innerHTML = html;
		return txt.value;
	}
    
    $('#btn_bbs_reply').click( function () {
		document.getElementById("lbl_bbs_new_action").innerHTML = "Reply";
		// Hide the top fields
        document.getElementById("lbl_bbs_new_type").style.display='none';
        document.getElementById("sel_bbs_new_type").style.display='none';
		document.getElementById("txt_bbs_new_to").innerHTML = BBS_table.cell('.selected',7).data();
        document.getElementById("lbl_bbs_new_to").style.display='none';
        document.getElementById("txt_bbs_new_to").style.display='none';
        document.getElementById("lbl_bbs_new_subject").style.display='none';
        document.getElementById("txt_bbs_new_subject").style.display='none';
        document.getElementById("bbs_compose").style.display='block';
        var strNew = '';
        var strOld = document.getElementById("txt_bbs_msg").innerHTML;
        var intStart = strOld.search('Date/Time:');
        strOld = strOld.slice(intStart);
        var intEnd = strOld.search('<br>');
        strNew = strOld.slice(0,intEnd+4); // copies Date/time
        intStart = strOld.search('<br>R:');
        strOld = strOld.slice(intStart+4);
        intStart = strOld.search('<br><br>');
        strOld = strOld.slice(intStart+8);
        intStart = strOld.search('End of Message ');
        strNew = strNew + strOld.slice(0,intStart-1); 
        strNew = strNew.replace(/<br>/g,'\n').trim();
        // limit to 10 lines
        var lines = strNew.match(/[^\n]+/g);
		if (lines) {
			//console.log(lines.length);
			if (lines.length > 11) {
				strNew = lines.slice(0, 11).join("\n");
			}
		}
		strNew = '\nReply to >>>>>>>>>>>>>>>>>\n' + strNew;
		//console.log(strNew);
        document.getElementById("txt_bbs_new_text").value = decodeHTML(strNew);
        $("#txt_bbs_new_text").focus();
        $("#txt_bbs_new_text").get(0).setSelectionRange(0,0);
    } ); 
    
    $('#btn_bbs_fwd').click( function () {
		document.getElementById("lbl_bbs_new_action").innerHTML = "Forward";
		//Hide the type and subject
        document.getElementById("lbl_bbs_new_type").style.display='none';
        document.getElementById("sel_bbs_new_type").style.display='none';
        document.getElementById("lbl_bbs_new_subject").style.display='none';
        document.getElementById("txt_bbs_new_subject").style.display='none';
        document.getElementById("bbs_compose").style.display='block';
        $("#txt_bbs_new_to").focus();
    } ); 
    
    $('#btn_bbs_compose').click( function () {
		document.getElementById("lbl_bbs_new_action").innerHTML = "New";
        document.getElementById("bbs_compose").style.display='block';
        $("#txt_bbs_new_to").focus();
    } ); 

    $('#btn_bbs_print').click( function () {
		var divContents = document.getElementById("txt_bbs_msg").innerHTML;
        var a = window.open('', '', 'height=500, width=500');
        a.document.write('<html><body>');
        a.document.write(divContents);
        a.document.write('</body></html>');
        a.document.close();
        a.print();
    } ); 
    
	function reset_bbs_new() {
		document.getElementById("lbl_bbs_new_action").innerHTML = ""
		document.getElementById("txt_bbs_new_to").value = ""
		document.getElementById("txt_bbs_new_subject").value = ""
		document.getElementById("txt_bbs_new_text").value = ""
        document.getElementById("lbl_bbs_new_type").style.display='block';
        document.getElementById("sel_bbs_new_type").style.display='block';
 		document.getElementById("lbl_bbs_new_to").style.display='block';
        document.getElementById("txt_bbs_new_to").style.display='block';
        document.getElementById("lbl_bbs_new_subject").style.display='block';
        document.getElementById("txt_bbs_new_subject").style.display='block';
	}

	$("#btn_bbs_new_quit").click(function (event) {
		document.getElementById('bbs_compose').style.display='none';
		reset_bbs_new();
	});
	
	$("#btn_bbs_new_cancel").click(function (event) {
		document.getElementById('bbs_compose').style.display='none';
		reset_bbs_new();
	});     

	$("#btn_bbs_new_send").click(function (event) {
		var strInit = '';
		var strSubject =  '';
		if (document.getElementById("lbl_bbs_new_action").innerHTML == 'Reply') {
			strInit = 'SR ' + BBS_table.cell('.selected',0).data();
		}
		else if (document.getElementById("lbl_bbs_new_action").innerHTML == 'Forward') {
			strInit = 'SC ' + BBS_table.cell('.selected',0).data() + ' ' + document.getElementById("txt_bbs_new_to").value;
		}
		else {
			strInit = 'S' + document.getElementById("sel_bbs_new_type").value + ' ' + document.getElementById("txt_bbs_new_to").value;
			strSubject = document.getElementById("txt_bbs_new_subject").value;
		}
		var strMsg = document.getElementById("txt_bbs_new_text").value + '\r\n/ex\r\n';
		if (strMsg.length > 2000) {
			alert('Message length is limited to 2000 characters. Please shorten your endless (actually ' + strMsg.length.toString() + ' character) tome.');
		}
		else {
			// build JSON
			myObj = {
				InitStr: strInit,
				Subject: strSubject,
				Message: strMsg
			};
			var strJSON = JSON.stringify(myObj);
			//console.log(strJSON);
			sendMessage({ data: HIDDEN_PREFIX + "bbs_new_msg" + strJSON});		
			document.getElementById('bbs_compose').style.display='none';
			reset_bbs_new();
		}
	}); 	

	// sound stuff
	$("#btn_chat_sound_custom").on('click', function() {
		$('#chat_sound_file_input').trigger('click');
	});	 
	 
	// pick a sound file 
	$('#chat_sound_file_input').on('change', function(e) {
		var target = e.currentTarget;
		var file = target.files[0];
  
		if (target.files && file) {
			var reader = new FileReader();
			reader.onload = function (e) {
				var filename = $('#chat_sound_file_input').val().replace("C:\\fakepath\\", "");
				document.getElementById("lbl_chat_sound_file").innerHTML = filename;
				document.getElementById('lbl_chat_sound_bits').innerHTML = e.target.result;
			}
			reader.readAsDataURL(file);
		}
	});	

	$("#btn_chat_sound_default").on('click', function() {
		document.getElementById('lbl_chat_sound_bits').innerHTML = '';
		document.getElementById('lbl_chat_sound_file').innerHTML = 'Default';
	});
		
	$("#btn_chat_sound_play").on('click', function() {
		var temp_audio = document.createElement('audio');
		if (document.getElementById('lbl_chat_sound_bits').innerHTML == '') {
			if (document.getElementById("lbl_chat_sound_file").innerHTML == 'Default') {
				temp_audio.setAttribute('src', "static/tarpn_tone.mp3");
				temp_audio.setAttribute('src', "static/tarpn_tone.wav");
			}
			else {
				temp_audio.setAttribute('src', "uploads/" + document.getElementById("lbl_chat_sound_file").innerHTML);
			}
		}
		else {
			temp_audio.setAttribute('src', document.getElementById('lbl_chat_sound_bits').innerHTML);
		}
		temp_audio.play();
	});

	$("#btn_bbs_sound_custom").on('click', function() {
		$('#bbs_sound_file_input').trigger('click');
	});	 
	
	// pick a sound file 
	$('#bbs_sound_file_input').on('change', function(e) {
		var target = e.currentTarget;
		var file = target.files[0];
		var reader = new FileReader();
  
		if (target.files && file) {
			var reader = new FileReader();
			reader.onload = function (e) {
				document.getElementById('lbl_bbs_sound_bits').innerHTML = e.target.result;
				var filename = $('#bbs_sound_file_input').val().replace("C:\\fakepath\\", "");
				$('#lbl_bbs_sound_file').html(filename);
			}
			reader.readAsDataURL(file);
		}
	});	

	$("#btn_bbs_sound_default").on('click', function() {
		document.getElementById('lbl_bbs_sound_bits').innerHTML = '';
		document.getElementById('lbl_bbs_sound_file').innerHTML = 'Default';
	});
		
	$("#btn_bbs_sound_play").on('click', function() {
		var temp_audio = document.createElement('audio');
		if (document.getElementById('lbl_bbs_sound_bits').innerHTML == '') {
			if (document.getElementById("lbl_bbs_sound_file").innerHTML == 'Default') {
				temp_audio.setAttribute('src', "static/tarpn_mail.mp3");
				temp_audio.setAttribute('src', "static/tarpn_mail.wav");
			}
			else {
				temp_audio.setAttribute('src', "uploads/" + document.getElementById("lbl_bbs_sound_file").innerHTML);
			}
		}
		else {
			temp_audio.setAttribute('src', document.getElementById('lbl_bbs_sound_bits').innerHTML);
		}
		temp_audio.play();
	});

	// options stuff
	function cancelOptions() {
		document.getElementById("selChatSound").value = document.getElementById("lblChatSoundBackup").innerHTML;
		document.getElementById("selChatVisual").value = document.getElementById("lblChatVisualBackup").innerHTML;
		document.getElementById("lbl_chat_sound_file").innerHTML = document.getElementById("lbl_chat_sound_file_backup").innerHTML;
		document.getElementById("lbl_chat_sound_bits").innerHTML = '';
		document.getElementById("lbl_bbs_sound_file").innerHTML = document.getElementById("lbl_bbs_sound_file_backup").innerHTML;
		document.getElementById("lbl_bbs_sound_bits").innerHTML = '';
		document.getElementById("selLineSpacing").value = document.getElementById("lblLineSpacingBackup").innerHTML;
		if (document.getElementById("chkIgnoreJoins").value == 1) {
			document.getElementById("chkIgnoreJoins").checked = true;
		}
		else {
			document.getElementById("chkIgnoreJoins").checked = false;
		}	
		if (document.getElementById("chkShowHints").value == 1) {
			document.getElementById("chkShowHints").checked = true;
		}
		else {
			document.getElementById("chkShowHints").checked = false;
		}	
		if (document.getElementById("chkShowCommands").value == 1) {
			document.getElementById("chkShowCommands").checked = true;
		}
		else {
			document.getElementById("chkShowCommands").checked = false;
		}	
		document.getElementById("selEmojiSize").value = document.getElementById("lblEmojiSizeBackup").innerHTML;
		if (document.getElementById("chkUseBBS").value == 1) {
			document.getElementById("chkUseBBS").checked = true;
		}
		else {
			document.getElementById("chkUseBBS").checked = false;
		}
		if (document.getElementById("chkIgnoreBBSKilled").value == 1) {
			document.getElementById("chkIgnoreBBSKilled").checked = true;
		}
		else {
			document.getElementById("chkIgnoreBBSKilled").checked = false;
		}		
		document.getElementById('options').style.display='none';
	} 

	$("#btn_quit_options").click(function (event) {
		cancelOptions();
	});
	
	$("#btn_cancel_options").click(function (event) {
		cancelOptions();
	});

//	function sleep(ms) {
//		return new Promise(resolve => setTimeout(resolve, ms));
//	}

	// sends a file from a form to the uploads directory
	function submit_file_form(form_to_send) {
		var formData = new FormData(form_to_send);	

		var xhr = new XMLHttpRequest();
		// Add any event handlers here...
		xhr.open('POST', form_to_send.getAttribute('action'), true);
		xhr.send(formData);
 
		xhr.onload = function() {
			if (xhr.status != 200) {
				// Reached the server, but it returned an error
				console.error('An error occurred uploading file');
			}   
		}

		xhr.onerror = function() {
			console.error('An error occurred uploading file ');
		};
		
		return false; // To avoid actual submission of the form
	}

	$("#btn_save_options").click(function (event) {
		var strOut;
		var intIgnoreJoins = 0;
		var intChatSound = document.getElementById("selChatSound").value;
		var intChatVisual = document.getElementById("selChatVisual").value;
		var intShowHints = 0;
		var intShowCommands = 0;
		var intEmojiSize = document.getElementById("selEmojiSize").value;
		var intUseBBS = 0;
		var intIgnoreBBSKilled = 0;

		event.preventDefault();
		if (document.getElementById("chkIgnoreJoins").checked == true) {
			intIgnoreJoins = 1;
		}
		if (document.getElementById("chkShowHints").checked == true) {
			intShowHints = 1;
		}
		if (document.getElementById("chkShowCommands").checked == true) {
			intShowCommands = 1;
			document.getElementById("chat_commands_bar").style.display = "block";
			document.getElementById("node_commands_bar").style.display = "block";
			resizeDivs();
		}
		else {
			document.getElementById("chat_commands_bar").style.display = "none";
			document.getElementById("node_commands_bar").style.display = "none";
			resizeDivs();
		}
		if (document.getElementById("chkUseBBS").checked == true) {
			intUseBBS = 1;
			document.getElementById("btn_BBS").style.display = "block";
		}
		else {
			if (document.getElementById("BBS").style.display == "block") {
				document.getElementById("BBS").style.display = "none";
				// show chat tab instead
				document.getElementById("btn_chat").className = document.getElementById("btn_chat").className.replace(" w3-light-grey", " myMainColor");
				document.getElementById("btn_BBS").className = document.getElementById("btn_BBS").className.replace(" myMainColor", " w3-light-grey");
				document.getElementById("Chat").style.display = "block";
			}
			document.getElementById("btn_BBS").style.display = "none";
		}		
		if (document.getElementById("chkIgnoreBBSKilled").checked == true) {
			intIgnoreBBSKilled = 1;
		}
		localStorage.setItem('linespacing',document.getElementById("selLineSpacing").value);
		
		// save for later in case of cancel later
		document.getElementById("lblChatSoundBackup").innerHTML = document.getElementById("selChatSound").value;
		document.getElementById("lblChatVisualBackup").innerHTML = document.getElementById("selChatVisual").value;
		document.getElementById("chkIgnoreJoins").value = intIgnoreJoins;
		document.getElementById("chkShowHints").value = intShowHints;
		document.getElementById("chkShowCommands").value = intShowCommands;
		document.getElementById("lblEmojiSizeBackup").innerHTML = document.getElementById("selEmojiSize").value;
		document.getElementById("chkUseBBS").value = intUseBBS;
		document.getElementById("chkIgnoreBBSKilled").value = intIgnoreBBSKilled;
		document.getElementById("lblLineSpacingBackup").innerHTML = document.getElementById("selLineSpacing").value;
		
		if (document.getElementById("lbl_chat_sound_file_backup").innerHTML != document.getElementById("lbl_chat_sound_file").innerHTML) {
			if ((document.getElementById("lbl_chat_sound_file").innerHTML != 'Default') &&
				(document.getElementById("lbl_chat_sound_bits").innerHTML != '')) {
				// send sound file to server;
				let sound_form = document.getElementById('frm_chat_sound_upload');
				submit_file_form(sound_form);
			}
			if (document.getElementById("lbl_chat_sound_file").innerHTML  == 'Default') {
				chat_audio.setAttribute("src", "" );
				chat_audio.setAttribute('src', "static/tarpn_tone.mp3");
				chat_audio.setAttribute('src', "static/tarpn_tone.wav");
			}
			else {
				chat_audio.setAttribute("src", "" );
				chat_audio.setAttribute("src", "uploads/" + document.getElementById("lbl_chat_sound_file").innerHTML);
			}			
			document.getElementById("lbl_chat_sound_file_backup").innerHTML = document.getElementById("lbl_chat_sound_file").innerHTML;
		}
		document.getElementById("lbl_chat_sound_bits").innerHTML = '';

		if (document.getElementById("lbl_bbs_sound_file_backup").innerHTML != document.getElementById("lbl_bbs_sound_file").innerHTML) {
			if ((document.getElementById("lbl_bbs_sound_file").innerHTML != 'Default') &&
				(document.getElementById("lbl_bbs_sound_bits").innerHTML != '')) {
				// send sound file to server;
				let sound_form = document.getElementById('frm_bbs_sound_upload');
				submit_file_form(sound_form);			
			}
			if (document.getElementById("lbl_bbs_sound_file").innerHTML  == 'Default') {
				bbs_audio.setAttribute("src", "" );
				bbs_audio.setAttribute('src', "static/tarpn_mail.mp3");
				bbs_audio.setAttribute('src', "static/tarpn_mail.wav");
			}
			else {
				bbs_audio.setAttribute("src", "" );
				bbs_audio.setAttribute("src", "uploads/" + document.getElementById("lbl_bbs_sound_file").innerHTML);
			}			
			document.getElementById("lbl_bbs_sound_file_backup").innerHTML = document.getElementById("lbl_bbs_sound_file").innerHTML;
		}
		document.getElementById("lbl_bbs_sound_bits").innerHTML = '';
		myObj = {
			ChatAlertSound: parseInt(document.getElementById("selChatSound").value),
			ChatSoundFile: document.getElementById("lbl_chat_sound_file").innerHTML,
			ChatAlertVisual: parseInt(document.getElementById("selChatVisual").value),
			IgnoreChatJoins: intIgnoreJoins,
			ShowHints: intShowHints,
			ShowCommands: intShowCommands,
			EmojiSize: intEmojiSize,
			UseBBS: intUseBBS,
			IgnoreBBSKilled: intIgnoreBBSKilled,
			BBSSoundFile: document.getElementById("lbl_bbs_sound_file").innerHTML
		};
		strOut = JSON.stringify(myObj);
		sendMessage({ data: DATA_PREFIX + "options" + strOut });
		document.getElementById("options").style.display = "none"; // close popup
		window.location.reload(true); // refresh the window
	});

	document.onkeydown = function (e) {
		var blContinue = 0;
		if (document.activeElement == document.getElementById("txt_chat_send")) {
			var selSent = document.getElementById("sel_chat_sent");
			var txtSend = $("#txt_chat_send");
			blContinue = 1;
		} else if (
			document.activeElement == document.getElementById("txt_node_send")
		) {
			var selSent = document.getElementById("sel_node_sent");
			var txtSend = $("#txt_node_send");
			blContinue = 1;
		}
		if (blContinue == 1) {
			if (e.keyCode == "38") {
				//up arrow
				if (selSent.selectedIndex > -1) {
					if (txtSend.val() == "") {
						txtSend.val(selSent.value);
					} else if (
						txtSend.val() == selSent.value &&
						selSent.selectedIndex > 0
					) {
						selSent.selectedIndex = selSent.selectedIndex - 1;
						txtSend.val(selSent.value);
					}
				}
			} else if (e.keyCode == "40") {
				//down arrow
				if (selSent.selectedIndex > -1) {
					// dropdown not empty
					if (selSent.selectedIndex < selSent.length - 1) {
						if (txtSend.val() == "") {
							txtSend.val(selSent.value);
						} else if (txtSend.val() == selSent.value) {
							selSent.selectedIndex = selSent.selectedIndex + 1;
							txtSend.val(selSent.value);
						}
					}
				}
			}
		}
	};
	
	$("#btn_chat").click(function (event) {
		openTab('Chat');
	});
	$("#btn_node").click(function (event) {
		openTab('Node');
	});
	$("#btn_BBS").click(function (event) {
		openTab('BBS');
	});
	$("#btn_info").click(function (event) {
		openTab('Info');
	});

	function openTab(tabName) {
		var i, x, tablinks, textarea, myInput;
		var blWasOnBBS = false;
		// see if on BBS tab now
		if (document.getElementById('btn_BBS').className.indexOf('myMainColor') > -1) {
			blWasOnBBS = true;
		}
		x = document.getElementsByClassName("tarpnTab");
		for (i = 0; i < x.length; i++) {
			x[i].style.display = "none";  // hide all tabs
		}
		tablinks = document.getElementsByClassName("tablink");
		for (i = 0; i < x.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" myMainColor", " w3-light-grey");
		}
		document.getElementById(tabName).style.display = "block"; //show the current tab
		// scroll to bottom
		if (tabName == "Node") {
			textarea = document.getElementById('txt_node');
			myInput = document.getElementById('txt_node_send')
			document.getElementById('btn_node').className = document.getElementById('btn_node').className.replace(" w3-light-grey", " myMainColor");
			if (blWasOnBBS) {
				sendMessage({ data: HIDDEN_PREFIX + "bbs_exit" });
			}
			textarea.scrollTop = textarea.scrollHeight;
			myInput.focus();
		}
		else if (tabName == "Chat") {
			textarea = document.getElementById('txt_chat');
			myInput = document.getElementById('txt_chat_send')
			document.getElementById('btn_chat').className = document.getElementById('btn_chat').className.replace(" w3-light-grey", " myMainColor");
			if (blWasOnBBS) {
				sendMessage({ data: HIDDEN_PREFIX + "bbs_exit" });
			}
			sessionStorage.setItem("blAutoscroll",true);
			//linespacing = localStorage.getItem("linespacing")
			//if (linespacing == "") {
			//	linespacing = "1";
			//	localStorage.setItem("linespacing","1");
			//}
			//textarea.style.lineHeight = linespacing;
			textarea.scrollTop = textarea.scrollHeight;
			myInput.focus();
		}
		else if (tabName == "BBS") {
			textarea = document.getElementById('txt_bbs_msg');
			myInput = document.getElementById('txt_bbs_send')
			textarea.scrollTop = textarea.scrollHeight;
			document.getElementById('btn_BBS').className = document.getElementById('btn_BBS').className.replace(" w3-light-grey", " myMainColor");
			if (!blWasOnBBS) {
				document.getElementById("txt_bbs_msg").innerHTML = 'Reading the list of messages...'
				sendMessage({ data: HIDDEN_PREFIX + "bbs_enter" });
			}
		}
		else if (tabName == "Info") {
			//textarea = document.getElementById('txt_info');
			//myInput = document.getElementById('btn_info_refresh')
			document.getElementById('btn_info').className = document.getElementById('btn_info').className.replace(" w3-light-grey", " myMainColor");
			if (blWasOnBBS) {
				sendMessage({ data: HIDDEN_PREFIX + "bbs_exit" });
			}
			sendMessage({ data: HIDDEN_PREFIX + "info_enter" });
			//textarea.scrollTop = textarea.scrollHeight;
		}
	}

	function formatDate(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0'+minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
	}

	// show the latest log totals for each link
	function showLatestGrid(objData) {
		var table_values = [];
		var intLastRow = -1;
		var intLinkCount = objData.length
		// creating two dimensional array
		for (let i = 0; i < 10; i++) {
			for(let j = 0; j < intLinkCount; j++) {
				table_values[i] = [];
			}
		}
		
		for (var i = 0; i < intLinkCount; i++) {
			// a row for each link/port
			intLastRow = objData[i].length-1;
			if (intLastRow > -1) {
				let datLatest = new Date(objData[i][intLastRow].StatTime);
				table_values[0][i] = formatDate(datLatest);
				table_values[1][i] = objData[i][intLastRow].Call;
				table_values[2][i] = 'Yes';
				if (objData[i][intLastRow].LinkStatus != '>') {
					table_values[2][i] = 'NO';
				}
				table_values[3][i] = objData[i][intLastRow].MyTxCount;
				table_values[4][i] = objData[i][intLastRow].MyRetries;
				table_values[5][i] = objData[i][intLastRow].MyBuffers;
				table_values[6][i] = 'Yes';
				if (objData[i][intLastRow].TheirStatus != '>') {
					table_values[6][i] = 'NO';
				}
				table_values[7][i] = objData[i][intLastRow].TheirTxCount;
				table_values[8][i] = objData[i][intLastRow].TheirRetries;
				table_values[9][i] = objData[i][intLastRow].TheirBuffers;
			}
		}	
		
		var table_data = [{
			type: 'table',
			columnwidth: [90,50,50,50,50,50,50,50,50,50],
			header: {
				values: [["<b>Latest Totals</b>"],["<b>Call</b>"], ["<b>Active Out</b>"],
				 ["<b>Tx Out</b>"], ["<b>Retries Out</b>"], ["<b>Buffers Out</b>"], ["<b>Active In</b>"],
				 ["<b>Tx In</b>"], ["<b>Retries In</b>"], ["<b>Buffers In</b>"]],
				align: "center",
				height: 22,
				line: {width: 1, color: 'black'},
				fill: {color: "#4775ff"},
				font: {family: "Arial", size: 12, color: "white"}
			},
		  cells: {
			values: table_values,
			align: "center",
			line: {color: "black", width: 1},
			font: {family: "Arial", size: 11, color: ["black"]}
		  }
		}]
		var table_layout={
			height: 30 + (intLinkCount * 28),
			margin: {
				l: 2,
				r: 2,
				b: 2,
				t: 2,
				pad: 1
			},
        }
        var config = {responsive: true, displayModeBar: false}
		Plotly.newPlot('node_stat_tbl', table_data, table_layout, config);
	}
	
	// Show the performance graph for each link
	function plotPortInfo(strDirection, strDivName, objData) {
		//Plot tx count and retries over time
		var curCall = '';
		var curPort = '';
		var lst_x_tx_time = [];
		var lst_y_tx_count = []; 
		var lst_x_retry_time = [];
		var lst_y_retry_count = []; 
		var lst_x_buffer_time = [];
		var lst_y_buffer_count = []; 
		var lst_x_inactive_time = [];
		var lst_y_inactive_flag = [];
		var lst_pct = [];
		var intMyTxDiff = 0;
		var intMyRetryDiff = 0;
		var intTheirTxDiff = 0;
		var intTheirRetryDiff = 0;
		
		//console.log(objData);
		
		curCall = objData[0].Call
		curPort = objData[0].Port
		for (var i = 1; i < objData.length; i++) {
			if (objData[i].MyPct >= 0) {
				// a valid row
				var statData = objData[i];
				var prevStatData = objData[i-1];
				intMyTxDiff = statData.MyTxCount - prevStatData.MyTxCount;
				if ((intMyTxDiff < 0) || (statData.MyDrop == 1)){
					intMyTxDiff = 0;
				}
				intMyRetryDiff = statData.MyRetries - prevStatData.MyRetries;
				if ((intMyRetryDiff < 0) || (statData.MyDrop == 1)) {
					intMyRetryDiff = 0;
				}
				intTheirTxDiff = statData.TheirTxCount - prevStatData.TheirTxCount;
				if ((intTheirTxDiff < 0) || (statData.TheirDrop == 1)) {
					intTheirTxDiff = 0;
				}
				intTheirRetryDiff = statData.TheirRetries - prevStatData.TheirRetries;
				if ((intTheirRetryDiff < 0) || (statData.TheirDrop == 1)) {
					intTheirRetryDiff = 0;
				}
				// tx counts
				lst_x_tx_time.push(statData.StatTime);
				if (strDirection == 'Outgoing') {
					lst_y_tx_count.push(intMyTxDiff);
					lst_pct.push(parseFloat(objData[i].MyPct*100).toFixed(1)+"%")
				}
				else {
					lst_y_tx_count.push(intTheirTxDiff); 
					lst_pct.push(parseFloat(objData[i].TheirPct*100).toFixed(1)+"%")
				}
				// retries
				lst_x_retry_time.push(statData.StatTime);
				if (strDirection == 'Outgoing') {
					lst_y_retry_count.push(intMyRetryDiff);
				}
				else {
					lst_y_retry_count.push(intTheirRetryDiff);
				}
				// buffers
				lst_x_buffer_time.push(statData.StatTime);
				if (strDirection == 'Outgoing') {
					lst_y_buffer_count.push(statData.MyBuffers);
				}
				else {
					lst_y_buffer_count.push(statData.TheirBuffers);
				}
				
				if ((objData[i].LinkStatus != '>') && (strDirection == 'Outgoing')) {
					lst_x_inactive_time.push(statData.StatTime);
					lst_y_inactive_flag.push(intMyTxDiff);
				}
				else if ((objData[i].TheirStatus != '>') && (strDirection == 'Incoming')) {				
					lst_x_inactive_time.push(statData.StatTime);
					lst_y_inactive_flag.push(intTheirTxDiff);
				}
			}
		}
		
		var seriesTxCount = {
			type: 'bar',
			x: lst_x_tx_time,
			y: lst_y_tx_count,
			text: lst_pct,
			name: 'Tx Count',
			mode: 'lines+markers'
		};

		var seriesRetries = {
			type: 'bar',
			x: lst_x_retry_time,
			y: lst_y_retry_count,
			name: 'Retries',
			mode: 'lines+markers'
		};
				
		var seriesBuffers = {
			type: 'bar',
			x: lst_x_buffer_time,
			y: lst_y_buffer_count,
			name: 'Buffers',
			mode: 'lines+markers'
		};
		
		var seriesInactive = {
		  type: 'scatter',
		  x: lst_x_inactive_time,
		  y: lst_y_inactive_flag,
		  mode: 'markers',
		  name: 'Inactive',
		  showlegend: true,
		  marker: {
			color: 'rgb(255,65,54)',
			line: {width: 3},
			opacity: 0.5,
			size: 5,
			symbol: 'circle-open'
		  }
		}
			
		var data = [seriesTxCount, seriesRetries, seriesInactive];

		if (strDirection == 'Outgoing') {
			strDirection = strDirection + ' Performance to ' + curCall + ' on port ' + curPort;
		}
		else {
			strDirection = strDirection + ' Performance from ' + curCall + ' on port ' + curPort;
		}
		var layout = {
			title: {
				text:strDirection,
				font: {
					size: 14
				},
			},
			showlegend: true,
			height: 250,
			margin: {
				l: 50,
				r: 50,
				b: 60,
				t: 30,
				pad: 4
			},
			xaxis: {
				tickformat: '%x\n%I:%M%p',
				showgrid: false,
				zeroline: true,			
				linecolor: 'black',
				linewidth: 1,
				mirror: true
			},
			yaxis: {
				title: 'Count',
				showline: true,
				zeroline: true,
				fixedrange: true,
				linecolor: 'black',
				linewidth: 1,
				mirror: true
			},
			barmode: 'stack'
		};

		var config = {responsive: true, scrollZoom: false, displayModeBar: false}
		Plotly.newPlot(strDivName, data, layout, config);
	}

	function plotInfoStats(strData) {
		var objVars = JSON.parse(strData);
		//console.log(objVars);
		showLatestGrid(objVars);
		
		var intCount = 0;
		for (var i = 0; i < objVars.length; i++) {
			intCount += 1;
			plotPortInfo('Outgoing', 'node_stat_div' + intCount, objVars[i]);
			intCount += 1;
			plotPortInfo('Incoming', 'node_stat_div' + intCount, objVars[i]);
		}
	}

	$("#btn_clear_logs").click(function (event) {
		sendMessage({ data: DATA_PREFIX + "clear_logs" });
		txt_chat.empty();
		txt_node.empty();
		alert('Logs cleared');
	});

	$("#sel_chat_sent").change(function () {
		$("#txt_chat_send").val($(this).val());
	});

	$("#btn_chat_join").click(function (event) {
		event.preventDefault();
		document.getElementById("btn_chat_join").disabled = true;
		//$("#btn_chat_join").disabled = true;  //2.1
		sendMessage({ data: CHAT_PREFIX + "CHAT" });
		$("#txt_chat_send").focus();
	});

	$("#btn_chat_join").dblclick(function (event) {
		event.preventDefault();
		//document.getElementById("btn_chat_join").disabled = true;
		//$("#btn_chat_join").disabled = true;  //2.1
		//sendMessage({ data: CHAT_PREFIX + "CHAT" });
		//$("#txt_chat_send").focus();
	});

	$("#btn_chat_leave").click(function (event) {
		event.preventDefault();
		document.getElementById("txt_chat_status").innerHTML =
			"Not in Chat<br>Click Join below.";
		sendMessage({ data: CHAT_PREFIX + "/B" });
	});

	$("#btn_chat_log").click(function (event) {
		event.preventDefault();
		// ask the server to copy the file and tell us
		sendMessage({ data: DATA_PREFIX + "chatlog" });
	});
	
	$("#sel_chat_cmds").change(function () {
		var sel_chat = document.getElementById("sel_chat_cmds")
		if (sel_chat.selectedIndex != 0) {
			var strCmd = $(this).val();
			$("#txt_chat_send").val(strCmd);
			if (strCmd.indexOf(' ') == -1) {
				// run a command if no spaces
				sendChatTextToNode();
			} 
			sel_chat.selectedIndex = 0;
		}
	});
	
	$("#sel_node_cmds").change(function () {
		var sel_node = document.getElementById("sel_node_cmds")
		if (sel_node.selectedIndex != 0) {
			var strCmd = $(this).val();
			$("#txt_node_send").val(strCmd);
			if (strCmd.indexOf(' ') == -1) {
				// run a command if no spaces
				sendNodeTextToNode();
			} 
			sel_node.selectedIndex = 0;
		}
	});

	$("#btn_chat_power").click(function (event) {
		if (document.getElementById("btn_chat_power").checked) {
			sendMessage({ data: CHAT_PREFIX + "connect" });
		} else {
			sendMessage({ data: CHAT_PREFIX + "disconnect" });
		}	
	});

	$("#btn_node_power").click(function (event) {
		if (document.getElementById("btn_node_power").checked) {
			sendMessage({ data: NODE_PREFIX + "connect" });
		} else {
			sendMessage({ data: NODE_PREFIX + "disconnect" });
		}	
	});
	
	$("#btnShutdown").click(function () {
		document.getElementById("btn_chat_power").checked = false;
		document.getElementById("btn_chat_send").disabled = true;
		document.getElementById("btn_chat_join").disabled = true;
		document.getElementById("btn_chat_leave").disabled = true;
		document.getElementById("lblChatHead").innerHTML = "No Chatters";
		document.getElementById("txt_chat_status").innerHTML =
			"Not in Chat<br>Click Join below.";
		sendMessage({ data: DATA_PREFIX + "shutdown" });
	});
});

function resizeDivs() {
	var intAdd = 0;
	var intHintAdd = 0
	
	linespacing = localStorage.getItem("linespacing")
	if (linespacing == "") {
		linespacing = "1";
		localStorage.setItem("linespacing","1");
	}
	document.getElementById("txt_chat").style.lineHeight = linespacing;
			
	if (document.getElementById("chkShowCommands").checked == true) {
		intAdd = 28;
	}
	if ((document.getElementById("chkShowHints").checked == true) && (document.getElementById("chatSidebar").style.display == 'block')) {
		// hints below sidebar
		intHintAdd = 90;
	}
	if ($(window).height() > 450) {
		if ($(window).width() < 577) {
			$("#topDiv").height(($(window).height() - 50)); 
			$("#greyPanel").height(($("#topDiv").height()));  
			$("#Node").height(($("#greyPanel").height() - 50));
			$("#Chat").height(($("#greyPanel").height() - 50));
			$("#BBS").height(($("#greyPanel").height() - 80));
			$("#Info").height(($("#greyPanel").height() - 80));
		}
		else if ($(window).width() < 770) {
			$("#topDiv").height(($(window).height() - 125)); //was 110
			$("#greyPanel").height(($("#topDiv").height() - 15)); //was 50
			$("#Node").height(($("#greyPanel").height() - 30));
			$("#Chat").height(($("#greyPanel").height() - 30));
			$("#BBS").height(($("#greyPanel").height() - 30));
			$("#Info").height(($("#greyPanel").height() - 30));
		}
		else {
			$("#topDiv").height(($(window).height() - 125));  //was 110
			$("#greyPanel").height(($("#topDiv").height() - 15)); //was 30
			$("#Node").height(($("#greyPanel").height() - 10));
			$("#Chat").height(($("#greyPanel").height() - 10));
			$("#BBS").height(($("#greyPanel").height() - 10));
			$("#Info").height(($("#greyPanel").height() - 10));
		}
		$("#txt_node").height(($("#Node").height() - 80 - intAdd)); 
		$("#txt_chat").height(($("#Chat").height() - 80 - intAdd));
		$("#info_box").height( ($("#Info").height() - intAdd));
		$("#txt_chat_status").height(($("#Chat").height() - 160 - intAdd - intHintAdd));
		$("#txt_bbs_msg").height(($("#BBS").height()-380));
	}
}
