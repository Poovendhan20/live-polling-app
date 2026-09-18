package ws

import (
	"context"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"sync"
)

type Hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*websocket.Conn]bool
	Redis *redis.Client
}

func NewHub(r *redis.Client) *Hub {
	return &Hub{rooms: map[string]map[*websocket.Conn]bool{}, Redis: r}
}
func (h *Hub) Join(pollID string, c *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[pollID] == nil {
		h.rooms[pollID] = map[*websocket.Conn]bool{}
	}
	h.rooms[pollID][c] = true
}
func (h *Hub) Leave(pollID string, c *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.rooms[pollID], c)
	_ = c.Close()
}
func (h *Hub) Broadcast(pollID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for c := range h.rooms[pollID] {
		if c.WriteMessage(websocket.TextMessage, message) != nil {
			go h.Leave(pollID, c)
		}
	}
}
func (h *Hub) Subscribe(ctx context.Context, pollID string) {
	sub := h.Redis.Subscribe(ctx, "poll:events:"+pollID)
	ch := sub.Channel()
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-ch:
			if msg != nil {
				h.Broadcast(pollID, []byte(msg.Payload))
			}
		}
	}
}
