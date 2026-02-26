package com.numberguessing.Guessing_Game.controller;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.numberguessing.Guessing_Game.service.UserGameService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {
	    "http://localhost:3000",
	    "http://localhost:3001",
	    "https://number-showdown.vercel.app"
	})
public class UserGameController {
	
	@Autowired
	private UserGameService service;
	
	@PostMapping("/guess")
	public String guess(@RequestParam int number) {
		return service.check(number);	
	}
	
	@PostMapping("/reset")
	public void reset() 
	{
	  service.reset();
	}
	
	@GetMapping("/attempts")
	public int attempts()
	{
		return service.getAttempts();
	}
			
		
	

}
