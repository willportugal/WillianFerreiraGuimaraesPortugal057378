import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AlbumNotification } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

type NotificationCallback = (notification: AlbumNotification) => void;

/**
 * Serviço de WebSocket para notificações em tempo real de álbuns.
 * Implementa reconexão automática e tratamento robusto de erros.
 */
class WebSocketService {
  private client: Client | null = null;
  private callbacks: NotificationCallback[] = [];
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  /**
   * Conecta ao servidor WebSocket com reconexão automática.
   */
  connect(): void {
    if (this.connected) {
      console.log('WebSocket já está conectado');
      return;
    }

    console.log('Iniciando conexão WebSocket...');

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ WebSocket conectado com sucesso');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.subscribeToAlbums();
      },
      
      onDisconnect: () => {
        console.log('⚠️ WebSocket desconectado');
        this.connected = false;
      },
      
      onStompError: (frame) => {
        console.error('❌ Erro STOMP:', frame.headers['message']);
        console.error('Frame completo:', frame);
      },
      
      onWebSocketError: (event) => {
        console.error('❌ Erro WebSocket:', event);
        this.handleReconnect();
      },
      
      onWebSocketClose: (event) => {
        console.log('🔌 WebSocket fechado:', event.reason || 'Sem razão especificada');
        this.connected = false;
        this.handleReconnect();
      },
    });

    this.client.activate();
  }

  /**
   * Tenta reconectar após falha.
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ Máximo de tentativas de reconexão atingido (${this.maxReconnectAttempts})`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms...`);
    
    setTimeout(() => {
      if (!this.connected) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Desconecta do servidor WebSocket.
   */
  disconnect(): void {
    if (this.client) {
      console.log('Desconectando WebSocket...');
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Inscreve-se no tópico de álbuns.
   */
  private subscribeToAlbums(): void {
    if (!this.client || !this.connected) {
      console.warn('⚠️ Cliente não conectado, não é possível se inscrever');
      return;
    }

    try {
      this.client.subscribe('/topic/albums', (message: IMessage) => {
        try {
          const notification: AlbumNotification = JSON.parse(message.body);
          console.log('📩 Notificação recebida:', notification.type);
          this.notifyCallbacks(notification);
        } catch (error) {
          console.error('❌ Erro ao processar notificação:', error);
        }
      });
      
      console.log('✅ Inscrito no tópico /topic/albums');
    } catch (error) {
      console.error('❌ Erro ao se inscrever no tópico:', error);
    }
  }

  /**
   * Adiciona callback para notificações.
   * Retorna função para remover o callback.
   */
  onNotification(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);
    console.log(`📝 Callback adicionado. Total: ${this.callbacks.length}`);
    
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
      console.log(`🗑️ Callback removido. Total: ${this.callbacks.length}`);
    };
  }

  /**
   * Notifica todos os callbacks registrados.
   */
  private notifyCallbacks(notification: AlbumNotification): void {
    if (this.callbacks.length === 0) {
      console.warn('⚠️ Nenhum callback registrado para notificação');
      return;
    }

    this.callbacks.forEach((callback, index) => {
      try {
        callback(notification);
      } catch (error) {
        console.error(`❌ Erro no callback ${index}:`, error);
      }
    });
  }

  /**
   * Verifica se está conectado.
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Retorna o número de tentativas de reconexão.
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Reseta o contador de tentativas de reconexão.
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }
}

export const websocketService = new WebSocketService();
