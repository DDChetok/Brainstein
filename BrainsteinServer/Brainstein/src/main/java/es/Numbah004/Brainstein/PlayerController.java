package es.Numbah004.Brainstein;

import java.util.*;

import org.springframework.boot.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class PlayerController {	
	public List<Player> players = new ArrayList<>();
	
	@GetMapping(value = "/players")
	public List<Player> Players(){
		return players;
	}
	
	@PostMapping(value = "/players")
	public ResponseEntity<Integer> AddPlayer(@RequestBody Player newPlayer){
		players.add(newPlayer);
		newPlayer.playerID = players.size() - 1;
		return new ResponseEntity<Integer>(newPlayer.playerID, HttpStatus.CREATED);
	}	
	
	@GetMapping(value = "/playerpositionx/{playerID}")
	public ResponseEntity<Integer> GetPlayerPistolAmmo(@PathVariable int playerID) {
		return new ResponseEntity<Integer>(players.get(playerID).pistolAmmo, HttpStatus.CREATED);
	}
	
	public void SetPlayerPistolAmmo(@PathVariable int playerID, @RequestBody int newPistolAmmo){
		players.get(playerID).pistolAmmo = newPistolAmmo;
	}
}
