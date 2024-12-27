import 'dart:async';
import 'package:tarpn_mobile/chat_message.dart';
import 'package:tarpn_mobile/control_characters.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  final String url;
  WebSocketChannel? _channel;
  bool _isConnected = false; // Flag to track connection status

  // Controller to emit stream of messages to be processed
  final StreamController<ChatMessage> _messageController = StreamController<ChatMessage>();
  final StreamController<bool> _connectionController = StreamController<bool>(); // To monitor connection status
  final StreamController<String> _errorMessage = StreamController<String>();
  final StreamController<bool> _scrollToBottom = StreamController<bool>(); // To know when to scroll to the bottom

  // Expose the message and connection streams to subscribers
  Stream<ChatMessage> get messages => _messageController.stream;
  Stream<bool> get connectionStatus => _connectionController.stream; // Expose connection status stream
  Stream<String> get errorMessage => _errorMessage.stream;
  Stream<bool> get scrollToBottom => _scrollToBottom.stream;

  // Constructor to initialize the WebSocket service
  WebSocketService(this.url) {
    _connect();
  }

  // Connect to the WebSocket
  void _connect() {

    if (_isConnected || _channel != null) {
      return; // Prevent multiple connections
    }

    try {

      _channel = WebSocketChannel.connect(Uri.parse(url));

      // Listen to incoming WebSocket messages
      _channel!.stream.listen(
        _onMessageReceived,
        onError: _onError,
        onDone: _onDone,
      );
    } catch (e) {
      _onError(e);
    }
  }

  // Function to handle incoming WebSocket messages
  void _onMessageReceived(dynamic message) {
    if (!_isConnected) {
      _isConnected = true;
      _connectionController.add(true); // Notify listeners that we're connected
    }
    final String processedMessage = message.toString();

    if (processedMessage.startsWith(ControlCharacters.chatMessage)) {
      ChatMessage? msg = parseChatMessage(processedMessage, true);
      if (msg != null) {
        _messageController.add(msg);
      }
    } else if (processedMessage.contains(ControlCharacters.chatHistory)) {
      String chatHistoryJSONRaw = processedMessage.replaceAll(ControlCharacters.chatHistory, "");
      List<ChatMessage> chatMessages = parseChatMessages(chatHistoryJSONRaw);
      for (ChatMessage message in chatMessages) {
        _messageController.add(message);
      }
    }
    _scrollToBottom.add(true);
  }

  // Handle WebSocket errors
  void _onError(dynamic error) {
    _errorMessage.add(error.message);
    _isConnected = false;
    _connectionController.add(false); // Notify listeners that we're disconnected
    _scheduleReconnect(); // Optionally, you could auto-reconnect
  }

  // Handle WebSocket connection closure
  void _onDone() {
    _isConnected = false;
    _channel?.sink.close();  // Ensure the WebSocket channel is closed
    _channel = null; // Reset the channel
    _connectionController.add(false); // Notify listeners that we're disconnected
  }

  // Send a message through the WebSocket
  void sendChatMessage(String message) {
    if (_isConnected) {
      String data = ControlCharacters.chatCommandPrefix + message;
      _channel?.sink.add(data);
    } else {
      print('Cannot send message. WebSocket is not connected.');
    }
  }

  bool _reconnecting = false; // Flag to track if reconnection is in progress

  void _scheduleReconnect() {
    if (_reconnecting) return; // Prevent multiple reconnection attempts
    _reconnecting = true;

    const int delay = 3; // Delay for reconnection attempts
    print('Attempting to reconnect in $delay seconds...');
    Future.delayed(Duration(seconds: delay), () {
      _reconnecting = false;  // Reset reconnection flag
      _connect();
    });
  }

  // Manually reconnect if needed
  void reconnect() {
    if (!_isConnected) {
      _channel?.sink.close(); // Ensure the old connection is closed
      _channel = null;
      _connect();
    }
  }

  void dispose() {
    _isConnected = false;
    _channel?.sink.close(); // Close the WebSocket connection
    _channel = null;
    _messageController.close(); // Close the message stream
    _connectionController.close(); // Close the connection status stream
    _errorMessage.close(); // Close the error stream
    _scrollToBottom.close(); // Close the scroll stream
  }

  // Check if the WebSocket is connected
  bool isConnected() {
    return _isConnected;
  }
}
