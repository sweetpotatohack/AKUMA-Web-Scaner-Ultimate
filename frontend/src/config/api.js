// Конфигурация API для работы в сети
const getApiBaseUrl = () => {
  // Используем порт 8001 вместо 8000 из-за конфликта с Docker
  return `http://${window.location.hostname}:8001`;
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_URL = `ws://${window.location.hostname}:8001/ws`;

console.log('🔧 API Configuration:', {
  baseUrl: API_BASE_URL,
  wsUrl: WS_URL,
  hostname: window.location.hostname
});
