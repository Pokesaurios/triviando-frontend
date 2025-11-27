import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../../config/endpoints';
import type {
  GenerateTriviaRequest,
  GenerateTriviaResponse,
} from '../../types/trivia.types';
import { BackendTriviaRaw } from '../../types/backend.types';
import { normalizeTrivia } from '../api/normalizers';