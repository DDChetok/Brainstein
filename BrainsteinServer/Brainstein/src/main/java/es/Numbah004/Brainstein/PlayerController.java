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
	
	@GetMapping(value = "/matchMaking/getPlayers")
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
		System.out.println(level);
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
}
