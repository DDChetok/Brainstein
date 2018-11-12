package es.Numbah004.Brainstein;

import java.util.*;

import org.springframework.boot.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class PlayerController {	
	public List<Player> players = new ArrayList<>();
	public Player p = new Player();
	
	/*@GetMapping(value = "/players")
	public List<Player> Players(){
		return players;
	}*/
	
	/*@PostMapping(value = "/players")
	public ResponseEntity<Integer> AddPlayer(@RequestBody Player newPlayer){
		players.add(newPlayer);
		newPlayer.playerID = players.size() - 1;
		return new ResponseEntity<Integer>(newPlayer.playerID, HttpStatus.CREATED);
	}*/
	@GetMapping(value = "/players")
	public Player get(){
		//Integer numero =  Integer.parseInt(p.name);
		return p;
	}
	
	@PostMapping(value = "/players")
	public ResponseEntity<Boolean> SetTest(@RequestBody Player player)
	{
		p.playerID = player.playerID;
		p.pistolAmmo = player.pistolAmmo;
		p.name = player.name;
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED);
	}
	
	
}
