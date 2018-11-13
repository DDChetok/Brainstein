package es.Numbah004.Brainstein;

import java.util.*;

import org.springframework.boot.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class PlayerController {	
	public List<Player> players = new ArrayList<>();	


	@GetMapping(value = "/testing")
	public List<Player> GetTest(){			
		return players;
	}	
	
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
}
