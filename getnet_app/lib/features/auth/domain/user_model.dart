class UserModel {
  final String id;
  final String email;
  final String name;
  final String? picture;
  final String? token;
  final bool hasCompletedOnboarding;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.picture,
    this.token,
    this.hasCompletedOnboarding = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      picture: json['picture'],
      token: token ?? json['token'],
      hasCompletedOnboarding: json['hasCompletedOnboarding'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'picture': picture,
      'token': token,
      'hasCompletedOnboarding': hasCompletedOnboarding,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? picture,
    String? token,
    bool? hasCompletedOnboarding,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      picture: picture ?? this.picture,
      token: token ?? this.token,
      hasCompletedOnboarding: hasCompletedOnboarding ?? this.hasCompletedOnboarding,
    );
  }
}
