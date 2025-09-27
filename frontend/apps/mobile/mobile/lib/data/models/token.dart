// File: E:/civic-issue-reporter/apps/mobile/lib/data/models/token.dart

class Token {
  final String accessToken;
  final String refreshToken;
  final String tokenType;

  Token({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
  });

  // This is a factory constructor that creates a Token from a JSON object
  factory Token.fromJson(Map<String, dynamic> json) {
    return Token(
      accessToken: json['access_token'],
      refreshToken: json['refresh_token'],
      tokenType: json['token_type'],
    );
  }
}
