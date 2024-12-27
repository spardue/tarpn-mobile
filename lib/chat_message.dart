class ChatMessage {
  final String time;
  final String callSign;
  final String name;
  final String message;
  final String color;
  final bool notification;

  ChatMessage({
    required this.time,
    required this.callSign,
    required this.name,
    required this.message,
    required this.color,
    required this.notification,
  });

  @override
  String toString() {
    return 'Time: $time, Call Sign: $callSign, Name: $name, Message: $message, Color: $color';
  }
}

ChatMessage? parseChatMessage(String rawMessage, bool notification) {

  // Remove any trailing <br> tags and clean the message
  final message = rawMessage.replaceAll(RegExp(r'<br\s*/?>$'), '').trim()
      .replaceAll("> HOME", '')
      .replaceAll("\n", '');

  // Extract the time and other content
  final timeRegex = RegExp(r'(\d{2}:\d{2} [APM]{2})');
  final timeMatch = timeRegex.firstMatch(message);
  final time = timeMatch?.group(0) ?? 'Unknown';

  // If the message contains HTML, process it as such
  final isHtml = message.contains('<');
  String callSign = 'Unknown';
  String name = '';
  String messageContent = 'Unknown';
  String color = '#000000'; // Default to black if no color

  if (isHtml) {
    // Extract color from style attribute in HTML (if present)
    final colorRegex = RegExp(r'color:([#\w]+)');
    final colorMatch = colorRegex.firstMatch(message);
    color = colorMatch?.group(1) ?? '#000000'; // Default to black if color not found

    // Extract call sign and name (name is optional)
    final callSignNameRegex = RegExp(r': ([A-Z0-9]{1,6})([\w\s]*)');
    final callSignNameMatch = callSignNameRegex.firstMatch(message);
    callSign = callSignNameMatch?.group(1) ?? 'Unknown';
    name = callSignNameMatch?.group(2)?.trim() ?? ''; // Empty name if not provided

    // Extract the actual chat message content
    final messageRegex = RegExp(r' : ([^<]+)</span>');
    final messageMatch = messageRegex.firstMatch(message);
    messageContent = messageMatch?.group(1)?.trim() ?? 'Unknown';
  } else {
    // Process plain text message (no HTML)
    // The name is optional, so the regex is adjusted accordingly
    final plainMessageRegex = RegExp(r'(\d{2}:\d{2} [APM]{2}): [\d:]* ?([A-Z0-9]{1,6})([\w\s]*) : (.*)');
    final plainMessageMatch = plainMessageRegex.firstMatch(message);
    if (plainMessageMatch != null) {
      callSign = plainMessageMatch.group(2) ?? 'Unknown';
      name = plainMessageMatch.group(3)?.trim() ?? ''; // Empty name if not provided
      messageContent = plainMessageMatch.group(4)?.trim() ?? 'Unknown';
    }
  }

  // Decode Unicode if present
  messageContent = messageContent.replaceAllMapped(
    RegExp(r'\\u([0-9A-Fa-f]{4})'), // Match \u followed by 4 hex digits
        (Match match) {
      final hexCode = match.group(1); // Get the hex code
      final codePoint = int.parse(hexCode!, radix: 16); // Parse the hex code into an integer
      return String.fromCharCode(codePoint); // Convert the codePoint to the actual character
    },
  );

  if (messageContent == 'Unknown' && time == 'Unknown' && callSign == 'Unknown') {
    return null;
  }

  return ChatMessage(
    time: time,
    callSign: callSign,
    name: name, // Name can be empty now
    message: messageContent,
    color: color,
    notification: notification,
  );
}

List<ChatMessage> parseChatMessages(String htmlMessages) {
  List<String> messages = htmlMessages.split("<br>");
  return messages
      .map((msg) => parseChatMessage(msg, false))
      .where((chatMessage) => chatMessage != null)
      .cast<ChatMessage>()
      .toList();
}
