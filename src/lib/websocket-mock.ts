// This is a mock implementation of websocket functionality
// In a real application, this would be replaced with actual WebSocket implementation

type Listener = (data: any) => void;

class WebSocketMock {
  private listeners: Record<string, Listener[]> = {};
  private isConnected: boolean = false;
  private mockData: Record<string, any> = {};

  constructor() {
    // Initialize with some mock data
    this.mockData = {
      "race-updates": {
        participants: [
          {
            id: "user1",
            address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            position: 2,
            gasPrice: 14.2,
            score: 87,
          },
          {
            id: "user2",
            address: "0x3210fedcba9876543210fedcba9876543210fedc",
            position: 3,
            gasPrice: 15.8,
            score: 82,
          },
          {
            id: "user3",
            address: "0x9876543210fedcba9876543210fedcba98765432",
            position: 1,
            gasPrice: 12.3,
            score: 92,
          },
        ],
        raceStatus: "active",
        currentGasPrice: 45,
      },
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.emit("connection", { status: "connected" });
        resolve();
      }, 500);
    });
  }

  disconnect(): void {
    this.isConnected = false;
    this.emit("connection", { status: "disconnected" });
  }

  on(event: string, listener: Listener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);

    // If connecting to race-updates, immediately send initial data
    if (event === "race-updates" && this.isConnected) {
      setTimeout(() => {
        listener(this.mockData["race-updates"]);
      }, 100);
    }
  }

  off(event: string, listener: Listener): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  emit(event: string, data: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((listener) => listener(data));
  }

  // Method to update mock data (for testing)
  updateMockData(event: string, data: any): void {
    this.mockData[event] = data;
    this.emit(event, data);
  }

  // Simulate receiving data from server
  simulateIncomingMessage(event: string, data: any): void {
    setTimeout(
      () => {
        this.emit(event, data);
      },
      Math.random() * 1000 + 500,
    ); // Random delay between 500-1500ms
  }
}

// Create a singleton instance
const websocket = new WebSocketMock();

// In a real implementation, you would use the environment variable for the WebSocket URL
const WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL ||
  "wss://demo-gas-race-websocket.example.com";
console.log("WebSocket URL:", WEBSOCKET_URL);

export default websocket;
