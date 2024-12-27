import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'main.dart';
import 'settings_page.dart';
import 'web_socket_service.dart';
import 'chat_message.dart';

class MyHomePageState extends State<MyHomePage> with WidgetsBindingObserver {
  late WebSocketService _webSocketService;
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController(); // Add ScrollController
  final FocusNode _focusNode = FocusNode(); // Add FocusNode for the TextField
  List<ChatMessage> messages = [];
  bool emojiPickerVisible = false;
  String? _callSign;
  String? _ipAddress;
  int? _port;
  int _maxMessages = 25;
  bool _isConnected = false; // Track WebSocket connection status
  String _connectionErrorMessage = "";

  @override
  void initState() {
    super.initState();
    _loadSettings();

    // Listen to data from the background service
    FlutterBackgroundService().on('check_web_socket').listen((data) {
      _reconnect();
    });

    WidgetsBinding.instance.addObserver(this);
  }

  Future<void> _loadSettings() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _callSign = prefs.getString('call_sign') ?? 'MYCALL';
      _ipAddress = prefs.getString('ip_address') ?? '127.0.0.1';
      _port = prefs.getInt('port') ?? 8085;
      _maxMessages = prefs.getInt('max_messages') ?? defaultMessages;
    });
    _initializeWebSocket();
  }

  void _initializeWebSocket() {
    try {
      _webSocketService.dispose();
    } catch (e) {
      print(e);
    }

    if (_ipAddress != null && _port != null) {
      _webSocketService = WebSocketService('ws://$_ipAddress:$_port/ws');

      // Listen to messages
      _webSocketService.messages.listen((message) {
        setState(() {
          messages.add(message);
          if (messages.length > _maxMessages) {
            messages.removeAt(0);  // Remove the first (oldest) message
          }

          String callSign = _callSign ?? 'NOCALL';
          // Check if notification should be sent
          if (message.notification == true && message.callSign != callSign.toUpperCase()) {
            _sendNotification(message);
          }
        });
      });

      // Listen to connection status changes
      _webSocketService.connectionStatus.listen((status) {
        setState(() {
          _isConnected = status;
        });
      });

      _webSocketService.errorMessage.listen((message) {
        setState(() {
          _connectionErrorMessage = message;
        });
      });


      _webSocketService.scrollToBottom.listen((status) {
        _scrollToBottom();
      });
    }
  }

  // Send a local notification for ChatMessage
  Future<void> _sendNotification(ChatMessage message) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
    AndroidNotificationDetails(
      'new_chat_message', // Channel ID
      'New TARPN Chat Message', // Channel Name
      importance: Importance.max,
      priority: Priority.high,
    );
    const NotificationDetails platformChannelSpecifics =
    NotificationDetails(android: androidPlatformChannelSpecifics);

    await flutterLocalNotificationsPlugin.show(
      0, // Notification ID
      'New message from ${message.callSign}', // Notification Title
      message.message, // Notification Body
      platformChannelSpecifics, // Notification Details
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage() {
    if (_controller.text.isNotEmpty) {
      final msg = _controller.text.replaceAll("\n", "");
      _webSocketService.sendChatMessage(msg);
      _controller.clear();
      _scrollToBottom(); // Scroll to bottom after sending a message
    }
  }

  void _toggleEmojiPicker() {
    setState(() {
      emojiPickerVisible = !emojiPickerVisible;
    });
  }

  // Reconnect function if the button is clicked
  void _reconnect() {
    if (!_isConnected) {
      _webSocketService.reconnect();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Unfocus the TextField when tapping outside
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          actions: [
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SettingsPage()),
                );
                _loadSettings(); // Reload settings when returning from the settings page
              },
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  if (_isConnected) {
                    _reconnect(); // Perform the reconnection logic
                  } else {
                    // Show the modal with the connection error message
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text('Connection Error'),
                          content: Text(_connectionErrorMessage),
                          actions: <Widget>[
                            TextButton(
                              child: const Text('OK'),
                              onPressed: () {
                                _reconnect();
                                Navigator.of(context).pop(); // Dismiss the dialog
                              },
                            ),
                          ],
                        );
                      },
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isConnected ? Colors.green : Colors.red, // Green if connected, red if not
                ),
                child: Icon(
                  _isConnected ? Icons.check_circle : Icons.cancel, // Check icon if connected, cancel icon if not
                  color: Colors.white, // Customize the icon color
                ),
              ),
            )
          ],
        ),
        body: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollController, // Attach the ScrollController
                itemCount: messages.length,
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                itemBuilder: (context, index) {
                  ChatMessage message = messages[index];

                  // Check if the message's callSign matches _callSign and is not "MYCALL"
                  bool isCurrentUserMessage = _callSign != 'MYCALL' && message.callSign == _callSign;

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2.0), // Minimal padding between items
                    child: Align(
                      alignment: isCurrentUserMessage ? Alignment.bottomRight : Alignment.bottomLeft, // Align right if current user, left otherwise
                      child: FractionallySizedBox(
                        child: Container(
                          padding: const EdgeInsets.all(8.0), // Add padding inside the message container
                          decoration: BoxDecoration(
                            color: isCurrentUserMessage ? Colors.blue.shade100 : Colors.black12, // Apply background based on message sender
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(12),
                              topRight: Radius.circular(12),
                              bottomLeft: Radius.circular(12),
                              bottomRight: Radius.circular(12)
                            ),
                          ),
                          child: Wrap(
                            children: [
                              RichText(
                                text: TextSpan(
                                  children: [
                                    TextSpan(
                                      text: "${message.time} ",
                                      style: const TextStyle(color: Colors.grey),
                                    ),
                                    TextSpan(
                                      text: "${message.callSign} ",
                                      style: TextStyle(
                                        color: Color(int.parse(message.color.replaceFirst("#", "0xff"))),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (message.name.isNotEmpty)
                                      TextSpan(
                                        text: "${message.name}: ",
                                        style: TextStyle(
                                          color: Color(int.parse(message.color.replaceFirst("#", "0xff"))),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    TextSpan(
                                      text: message.message,
                                      style: const TextStyle(color: Colors.black),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            SafeArea(
              child: Column(
                children: [
                  emojiPickerVisible
                      ? EmojiPicker(
                    onEmojiSelected: (category, emoji) {
                      setState(() {
                        _controller.text += emoji.emoji;
                      });
                    },
                  )
                      : Container(),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            focusNode: _focusNode, // Attach the FocusNode
                            decoration: const InputDecoration(
                              hintText: 'Enter message',
                            ),
                            onSubmitted: (_) => _sendMessage(),
                            maxLines: null,
                            minLines: 1,
                            textCapitalization: TextCapitalization.sentences,
                            autocorrect: true,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.emoji_emotions),
                          onPressed: _toggleEmojiPicker,
                        ),
                        IconButton(
                          icon: const Icon(Icons.send),
                          onPressed: _sendMessage,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }


  // This method is called whenever the app's lifecycle changes
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      _reconnect();
    }
  }

  @override
  void dispose() {
    _webSocketService.dispose();
    _scrollController.dispose(); // Dispose the ScrollController
    _controller.dispose();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
