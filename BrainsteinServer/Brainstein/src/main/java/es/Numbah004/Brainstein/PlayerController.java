package es.Numbah004.Brainstein;

import java.util.*;

import org.springframework.boot.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class PlayerController {	
	public List<Player> players = new ArrayList<>();		
	public List<Enemy> enemies = new ArrayList<>();
	
	public int enemyCount;
	
	Shot player2Shots = new Shot();
	Shot player1Shots = new Shot();
	
	Brain brainInfo = new Brain();
	
	public ArrayList<Drop> drops = new ArrayList<>();
	public boolean newDrops = false;
	public Integer lastDropKilled = new Integer(-1);
	
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
	
	//--------------------PLAYERS--------------------	
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
		
		players.get(player.playerID).hp = player.hp;
		
		players.get(player.playerID).weapon = player.weapon;
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 		
	}	

	
	//--------------------ENEMIES--------------------	
	@PostMapping(value = "/addEnemies")
	public ResponseEntity<Boolean> AddEnemies(@RequestBody Horde horde) {		
		for(int i = 0; i < horde.enemies.size(); i++) {
			enemies.add(horde.enemies.get(i));
		}
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 		
	}
	
	@GetMapping(value = "/getEnemies")
	public List<Enemy> GetEnemies() {		
		return enemies; 		
	}
	
	@PostMapping(value = "/postEnemyCount")
	//No se recuerda una mayor guarrila
	public ResponseEntity<Boolean> PostEnemyCount(@RequestBody Player count) {		
		enemyCount = count.playerID;
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 		
	}	
	
	@PostMapping(value = "/updateEnemies")	
	public ResponseEntity<Boolean> PostEnemyCount(@RequestBody Horde h) {		
		for(int i = 0; i < h.enemies.size(); i++) {		
			//enemies.get(i).path = h.enemies.get(i).path;
			enemies.get(i).posX = h.enemies.get(i).posX;
			enemies.get(i).posY = h.enemies.get(i).posY;
			enemies.get(i).rotation = h.enemies.get(i).rotation;			
		}
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 		
	}
	
	@PostMapping(value = "/killEnemy")	
	public ResponseEntity<Boolean> KillEnemy(@RequestBody Enemy e) {		
		
		enemies.remove(e.enemyID);		
		while(enemies.remove(null));		
	
		
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 		
	}


	//--------------------SHOOTING--------------------	
	@PostMapping(value = "/postShots")
	public ResponseEntity<Boolean> postShots(@RequestBody Shot s)
	{	
		if(s.playerShotingID == 0 ) { //Si dispara el jugador 1, metemos sui tiro en su lista
			player1Shots = s;
		}else {
			player2Shots = s;
		}			
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}
	
	@GetMapping(value = "/getPlayer1Shots")
	public Shot getPlayer1Shots(){
		Shot shots = player1Shots;
		player1Shots = new Shot();
		return shots;
	}
	@GetMapping(value = "/getPlayer2Shots")
	public Shot getPlayer2Shots(){
		Shot shots = player2Shots;
		player2Shots = new Shot();
		return shots;
	}
	
	//------------------BRAIN--------------------------------
	@PostMapping(value = "/postBrain")
	public ResponseEntity<Boolean> postBrain(@RequestBody Brain b)
	{	
		brainInfo.posX = b.posX;
		brainInfo.posY = b.posY;
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}
	
	@GetMapping(value = "/getBrain")
	public Brain getBrainInfo(){
		return brainInfo;
	}

	//------------------DROPS-------------------------------
	@PostMapping(value = "/postDrop")
	public ResponseEntity<Boolean> postDrop(@RequestBody Drop d)
	{	
		drops.add(d);
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}
	
	@GetMapping(value = "/getDrop")
	public List<Drop> getDrops(){
		List<Drop> d = new ArrayList<Drop>(drops);
		drops.clear();
		return d;
	}
	
	@PostMapping(value="/killDrop")
	public ResponseEntity<Boolean> postDropID(@RequestBody Integer id)
	{	
		lastDropKilled = id;
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}
	
	@GetMapping(value = "/getLastDropKilled")
	public Integer getDropID(){
		Integer i = lastDropKilled;
		//lastDropKilled = -1;
		return i;
	}
	
	@PostMapping(value="/postNewDrops")
	public ResponseEntity<Boolean> postDropID(@RequestBody boolean areNewDrops)
	{	
		newDrops = areNewDrops;
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED); 				
	}
	
	@GetMapping(value = "/getNewDrops")
	public boolean getNewDrops(){
		return newDrops;
	}


}
