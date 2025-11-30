export const validateMaxPlayers = (players: number): {
  isValid: boolean;
  error?: string;
} => {
  if (Number.isNaN(players) || players <= 0) {
    return { isValid: false, error: 'El número de jugadores debe ser mayor que 0.' };
  }
  if (players > 20) {
    return { isValid: false, error: 'El número máximo de jugadores es 20.' };
  }
  return { isValid: true };
};

export const validateTopic = (topic: string): boolean => {
  return topic.trim().length > 0;
}