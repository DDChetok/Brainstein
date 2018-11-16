package es.Numbah004.Brainstein;

import java.util.*;

import org.springframework.boot.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class PlayerController {	
	public List<Player> players = new ArrayList<>();		
	
	//Level Selection
	public int currentLevelSelected = 0;
	
	@PostMapping(value = "/testing")
	public ResponseEntity<Boolean> SetTest(@RequestBody Player player)
	{		
		players.add(player);
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}
	
	@GetMapping(value = "/getID")
	public int GetID(){	
		System.out.println("Players Size: " + players.size()); 		
		return players.size();
	}	
	
	@GetMapping(value = "/getPlayersNumber")
	public int GetPlayersNumber(){			
		System.out.println("Lo que debería salir: " + (players.size())); 		
		return players.size();
	}	
	
	
	//-------------------MATCHMAKING--------------------	
	@GetMapping(value = "/matchMaking")
	public int GetPlayersConnected() {
		return players.size();
	}
	
	@GetMapping(value = "/getPlayers")
	public List<Player> GetPlayers(){			
		return players;
	}	
	
	
	@PostMapping(value = "/matchMaking")
	public ResponseEntity<Boolean> ConnectUser(@RequestBody Player player)
	{			
		players.add(player);				
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}
	
	//--------------------LEVEL SELECTION--------------------	
	@PostMapping(value = "/levelSelection")
	public ResponseEntity<Boolean> ChangeLevelSelected(@RequestBody int level)
	{	
		currentLevelSelected = level;			
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}


	@GetMapping(value = "/levelSelection")
	public int GetLevelSelected(){			
		return currentLevelSelected;
	}	
	
	//--------------------GAME--------------------	
	@GetMapping(value = "/createPlayers")
	public int GetOtherPlayersConnected() {
		return players.size() - 1;
	}
	
	@PostMapping(value = "/initializePlayer")
	public ResponseEntity<Boolean> InitializePlayer(@RequestBody Player player) {
		players.get(player.playerID).playerID = player.playerID;
		players.get(player.playerID).posX = player.posX;
		players.get(player.playerID).posY = player.posY;  
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 		
	}
	
	@PostMapping(value = "/updatePlayer")
	public ResponseEntity<Boolean> UpdatePlayer(@RequestBody Player player) {		
		players.get(player.playerID).posX = player.posX;
		players.get(player.playerID).posY = player.posY;  
		players.get(player.playerID).rotation = player.rotation;  
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 		
	}	
}
