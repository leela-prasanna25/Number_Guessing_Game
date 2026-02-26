package com.numberguessing.Guessing_Game.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.numberguessing.Guessing_Game.service.AiGameService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {
	    "http://localhost:3000",
	    "http://localhost:3001",
	    "https://number-showdown.vercel.app"
	})
public class AiGameController {
	@Autowired
	private AiGameService service;
	
	@PostMapping("/start")
     public int start(@RequestParam int max)
     {
		return service.start(max);
     }
	
	@PostMapping("/feedback")
		public int feedback(@RequestParam String result)
		{
			return service.feedback(result);
		}
	
	@GetMapping("/attempts")
	public int attempts()
	{
		return service.getAttempts();
	}
}
