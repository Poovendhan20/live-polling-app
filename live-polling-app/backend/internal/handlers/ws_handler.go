package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"live-polling-app/backend/internal/ws"
	"net/http"
)

type WSHandler struct{ Hub *ws.Hub }

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

func (h *WSHandler) Connect(c *gin.Context) {
	conn, e := upgrader.Upgrade(c.Writer, c.Request, nil)
	if e != nil {
		return
	}
	id := c.Param("id")
	h.Hub.Join(id, conn)
	go h.Hub.Subscribe(c, id)
	defer h.Hub.Leave(id, conn)
	for {
		if _, _, e = conn.ReadMessage(); e != nil {
			return
		}
	}
}
