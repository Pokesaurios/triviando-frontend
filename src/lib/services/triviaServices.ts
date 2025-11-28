import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../../config/endpoints';
import type {
  GenerateTriviaRequest,
  GenerateTriviaResponse,
} from '../../types/trivia.types';

export const triviaServices = {

  generateTrivia: async (data: GenerateTriviaRequest) => {
    const response = await apiClient.post<GenerateTriviaResponse>(
      API_ENDPOINTS.TRIVIA.GENERATE,
      data,
      { requiresAuth: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al generar la trivia');
    }

    return response.data!;
  },
};