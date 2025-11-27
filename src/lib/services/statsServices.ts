import { apiClient } from "../api/apiClient";
import { GameResultType } from "../../types/stats.types";
import { BackendGameResultRaw } from '../../types/backend.types';
import { normalizeGameResult } from '../api/normalizers';

export const getGameResults = async (): Promise<GameResultType[]> => {
  const response = await apiClient.get<BackendGameResultRaw[]>('/game-results');
  const raws = response.data ?? [];
  return raws.map(normalizeGameResult);
};