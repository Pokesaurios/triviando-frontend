import { apiClient } from "../api/apiClient";
import { GameResultType } from "../../types/stats.types";

export const getGameResults = async (): Promise<GameResultType[]> => {
  const response = await apiClient.get<GameResultType[]>("/game-results");
  return response.data ?? [];
};

export const getGameResultByRoom = async (roomCode: string): Promise<GameResultType> => {
  const response = await apiClient.get<GameResultType>(`/game-results/${roomCode}`);
  if (!response.data) throw new Error(`Game result for room ${roomCode} not found`);
  return response.data;
};