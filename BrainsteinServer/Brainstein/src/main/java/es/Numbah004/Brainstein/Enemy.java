package es.Numbah004.Brainstein;

import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Enemy {
	//Enemy ID
	public int enemyID;
	
	//Position and Rotation
	public int posX = -1;
	public int posY = -1;	
	public float rotation;
	
	public List<Position> path;
	
		
}
