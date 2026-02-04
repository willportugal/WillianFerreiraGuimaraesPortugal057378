import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AlbumNotification } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

type NotificationCallback = (notification: AlbumNotification) => void;

class WebSocketService {
  private client: Client | null = null;
  private callbacks: NotificationCallback[] = [];
  private connected = false;

  /**
   * Conecta ao servidor WebSocket
   */
  connect(): void {
    if (this.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket conectado');
        this.connected = true;
        this.subscribeToAlbums();
      },
      onDisconnect: () => {
        console.log('WebSocket desconectado');
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('Erro STOMP:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  /**
   * Desconecta do servidor WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  /**
   * Inscreve-se no tópico de álbuns
   */
  private subscribeToAlbums(): void {
    if (!this.client || !this.connected) return;

    this.client.subscribe('/topic/albums', (message: IMessage) => {
      try {
        const notification: AlbumNotification = JSON.parse(message.body);
        this.notifyCallbacks(notification);
      } catch (error) {
        console.error('Erro ao processar notificação:', error);
      }
    });
  }

  /**
   * Adiciona callback para notificações
   */
  onNotification(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notifica todos os callbacks
   */
  private notifyCallbacks(notification: AlbumNotification): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Erro no callback de notificação:', error);
      }
    });
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }
}

export const websocketService = new WebSocketService();
