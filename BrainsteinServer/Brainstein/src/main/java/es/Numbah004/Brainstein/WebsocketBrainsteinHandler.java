package es.Numbah004.Brainstein;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@SpringBootApplication
@EnableWebSocket
public class WebsocketBrainsteinHandler extends TextWebSocketHandler{
	
	private ObjectMapper mapper = new ObjectMapper();
	private Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		System.out.println("New user: " + session.getId());
		sessions.put(session.getId(), session);
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		System.out.println("Session closed: " + session.getId());
		sessions.remove(session.getId());
	}
	
	
	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		System.out.println("Message received: " + message.getPayload());
		String msg = message.getPayload(); //Contenido del mensaje
		
		JsonNode node = mapper.readTree(msg);
		
		sendOtherParticipants(session, node);
	}
	
	private void sendOtherParticipants(WebSocketSession session, JsonNode node) throws IOException {

		System.out.println("Message sent: " + node.toString());
		
		ObjectNode newNode = mapper.createObjectNode();
		
		switch(node.get("dataType").asText()) {
			case "0":
				newNode = createPlayerInfo(newNode,node);	
				break;
			case "1":
				break;
			case "2":
				newNode = createShotInfo(newNode,node);	
				break;
			case "3":
				break;
			case "4":
				break;
		
		}
		
			
		
		for(WebSocketSession participant : sessions.values()) {
			if(!participant.getId().equals(session.getId())) {
				participant.sendMessage(new TextMessage(newNode.toString()));
			}
		}
	}
	
	public ObjectNode createPlayerInfo(ObjectNode newNode,JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());
		
		newNode.put("playerID", nodeReceived.get("playerID").asText());
		
		newNode.put("posX", nodeReceived.get("posX").asText());
		newNode.put("posY", nodeReceived.get("posY").asText());
		newNode.put("rotation", nodeReceived.get("rotation").asText());
		
		newNode.put("hp", nodeReceived.get("hp").asText());
		newNode.put("weapon", nodeReceived.get("weapon").asText());
		newNode.put("dead", nodeReceived.get("dead").asText());
		return newNode;
	}
	
	public ObjectNode createShotInfo(ObjectNode newNode,JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());
	
		newNode.put("posX", nodeReceived.get("posX").asText());
		newNode.put("posY", nodeReceived.get("posY").asText());
		newNode.put("rotation", nodeReceived.get("rotation").asText());
		
		newNode.put("weaponName", nodeReceived.get("weaponName").asText());
		newNode.put("playerShotingID", nodeReceived.get("playerShotingID").asText());
		newNode.put("speed", nodeReceived.get("speed").asText());
		
		return newNode;
	}
}

