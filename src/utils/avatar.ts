const AVATAR_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#8B5CF6'
];

export const getAvatarColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0);
  const index = hash % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export const getInitials = (name: string): string => {
  return name?.charAt(0).toUpperCase() || '?';
};