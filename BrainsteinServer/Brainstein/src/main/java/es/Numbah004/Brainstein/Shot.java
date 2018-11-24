package es.Numbah004.Brainstein;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Shot {
	//Position and Rotation
	public int posX = -1;
	public int posY = -1;	
	public float rotation;
	//public float lookAt;
	public float speed;
	
	public int playerShotingID;
	
	public String weaponName;
}
