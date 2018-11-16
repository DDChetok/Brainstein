package es.Numbah004.Brainstein;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Player {
	public int playerID;
	
	public int posX = -1;
	public int posY = -1;	
	public float rotation;
}
