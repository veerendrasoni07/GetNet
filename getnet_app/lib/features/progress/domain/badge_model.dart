import 'package:flutter/material.dart';

enum BadgeCategory { consistency, adherence, milestone }

class PhysiqueBadge {
  final String id;
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final int requiredDays;
  final bool isUnlocked;
  final BadgeCategory category;
  final DateTime? unlockedAt;

  const PhysiqueBadge({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.requiredDays,
    this.isUnlocked = false,
    required this.category,
    this.unlockedAt,
  });

  PhysiqueBadge copyWith({
    bool? isUnlocked,
    DateTime? unlockedAt,
  }) {
    return PhysiqueBadge(
      id: id,
      title: title,
      description: description,
      icon: icon,
      color: color,
      requiredDays: requiredDays,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      category: category,
      unlockedAt: unlockedAt ?? this.unlockedAt,
    );
  }
}

final List<PhysiqueBadge> initialPhysiqueBadges = [
  PhysiqueBadge(
    id: 'b1',
    title: 'First Step',
    description: 'Log your initial weight and start your physique journey.',
    icon: Icons.flag_rounded,
    color: const Color(0xFF42A5F5),
    requiredDays: 1,
    isUnlocked: true,
    category: BadgeCategory.milestone,
    unlockedAt: DateTime.now().subtract(const Duration(days: 7)),
  ),
  PhysiqueBadge(
    id: 'b2',
    title: 'Streak Igniter',
    description: 'Maintain a 3-day consecutive log check-in streak.',
    icon: Icons.local_fire_department_rounded,
    color: const Color(0xFFFF9800),
    requiredDays: 3,
    isUnlocked: true,
    category: BadgeCategory.consistency,
    unlockedAt: DateTime.now().subtract(const Duration(days: 4)),
  ),
  PhysiqueBadge(
    id: 'b3',
    title: '7-Day Titan',
    description: 'Reach a full 7-day consistency streak without missing a check-in.',
    icon: Icons.bolt_rounded,
    color: const Color(0xFFE65100),
    requiredDays: 7,
    isUnlocked: true,
    category: BadgeCategory.consistency,
    unlockedAt: DateTime.now().subtract(const Duration(days: 1)),
  ),
  PhysiqueBadge(
    id: 'b4',
    title: 'Macro Master',
    description: 'Achieve 85%+ diet adherence for 2 consecutive weeks.',
    icon: Icons.restaurant_rounded,
    color: const Color(0xFF4CAF50),
    requiredDays: 14,
    isUnlocked: false,
    category: BadgeCategory.adherence,
  ),
  PhysiqueBadge(
    id: 'b5',
    title: 'Iron Will',
    description: 'Stay committed to your training schedule for 21 days straight.',
    icon: Icons.fitness_center_rounded,
    color: const Color(0xFF9C27B0),
    requiredDays: 21,
    isUnlocked: false,
    category: BadgeCategory.consistency,
  ),
  PhysiqueBadge(
    id: 'b6',
    title: 'Physique Legend',
    description: 'Reach a 30-day streak and transform your fitness habits.',
    icon: Icons.military_tech_rounded,
    color: const Color(0xFFFFD700),
    requiredDays: 30,
    isUnlocked: false,
    category: BadgeCategory.milestone,
  ),
];
