package es.Numbah004.Brainstein;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Player {
	//Player ID
	public int playerID;
	
	//Position and Rotation
	public int posX = -1;
	public int posY = -1;	
	public float rotation;
	
	//HP
	public float hp;	
	public String weapon;	
	public boolean dead = false;
	
	
}
