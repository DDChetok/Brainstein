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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@SpringBootApplication
@EnableWebSocket
public class WebsocketBrainsteinHandler extends TextWebSocketHandler{
	
	public int numPlayers = 0;
	public int avaibleID = 0;
	
	private ObjectMapper mapper = new ObjectMapper();
	private Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		System.out.println("New user: " + session.getId());
		sessions.put(session.getId(), session);
		
		ObjectNode newNode = mapper.createObjectNode();
		newNode.put("dataType", "7");
		newNode.put("ID", Integer.toString(avaibleID));
		
		avaibleID++;
		
		session.sendMessage(new TextMessage(newNode.toString()));		
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
				newNode = createEnemyInfo(newNode,node);	
				break;
			case "2":
				newNode = createShotInfo(newNode,node);	
				break;
			case "3":
				newNode = createDropInfo(newNode,node);
				break;
			case "4":
				newNode = createBrainInfo(newNode,node);	
				break;
			case "5":
				newNode = createNewEnemyInfo(newNode,node);	
				break;
			case "6":
				newNode = createResurrectInfo(newNode,node);
				break;
			case "7":
				numPlayers++;
				System.out.println("NUMBER OF PLAYERS: " + numPlayers);
				break;
			case "8":
				sendInfoToAllParticipants();
				break;
			case "9":
				sendLevelSelectedInfo(newNode, node);
				break;
			case "10":
				numPlayers = 0;
				break;
			case "11":
				newNode = createRoundInfo(newNode,node);
				break;
		}	
		
		for(WebSocketSession participant : sessions.values()) {
			if(!participant.getId().equals(session.getId())) {
				participant.sendMessage(new TextMessage(newNode.toString()));
			}
		}
	}
	
	public void sendInfoToAllParticipants() throws IOException{
		ObjectNode newNode = mapper.createObjectNode();
		newNode.put("dataType", "8");
		if(numPlayers >= 2) {
			newNode.put("allReady", true);
		}else {
			newNode.put("allReady", false);
		}
		for(WebSocketSession participant : sessions.values()) {
				participant.sendMessage(new TextMessage(newNode.toString()));
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
	
	public ObjectNode createBrainInfo(ObjectNode newNode, JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());
	
		newNode.put("posX", nodeReceived.get("posX").asText());
		newNode.put("posY", nodeReceived.get("posY").asText());
		
		return newNode;
	}

	public ObjectNode createDropInfo(ObjectNode newNode, JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());
	
		newNode.put("posX", nodeReceived.get("posX").asText());
		newNode.put("posY", nodeReceived.get("posY").asText());
		
		newNode.put("shotgunAmmo", nodeReceived.get("shotgunAmmo").asText());
		newNode.put("akAmmo", nodeReceived.get("akAmmo").asText());
		newNode.put("health", nodeReceived.get("health").asText());
		
		newNode.put("dropID", nodeReceived.get("dropID").asText());
		
		return newNode;
	}
	
	public ObjectNode createNewEnemyInfo(ObjectNode newNode, JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());
		
		newNode.put("enemyID", nodeReceived.get("enemyID").asText());
	
		newNode.put("posX", nodeReceived.get("posX").asText());
		newNode.put("posY", nodeReceived.get("posY").asText());
		
		newNode.put("rotation", nodeReceived.get("rotation").asText());	
		
		return newNode;
	}
	
	public ObjectNode createEnemyInfo(ObjectNode newNode, JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());				
		newNode.put("enemies", (ArrayNode)nodeReceived.get("enemies"));	
		
		return newNode;
	}
	
	public ObjectNode createRoundInfo(ObjectNode newNode, JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());	
		
		newNode.put("round", nodeReceived.get("round"));	
		newNode.put("timeBetweenRounds", nodeReceived.get("timeBetweenRounds"));
		
		return newNode;
	}
	
	public ObjectNode createResurrectInfo(ObjectNode newNode, JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());
		
		newNode.put("text", nodeReceived.get("text").asText());
		
		return newNode;
	}

	
	public ObjectNode sendLevelSelectedInfo(ObjectNode newNode,JsonNode nodeReceived) {
		newNode.put("dataType", nodeReceived.get("dataType").asText());
		newNode.put("currentLevel", nodeReceived.get("level").asText());
		
		
		return newNode;
	}
	
}

