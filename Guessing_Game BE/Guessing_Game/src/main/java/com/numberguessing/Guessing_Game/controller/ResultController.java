package com.numberguessing.Guessing_Game.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.numberguessing.Guessing_Game.service.GameResultService;

@RestController
@RequestMapping("/api/result")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResultController {
	
	@Autowired
	private GameResultService service;
	
	@GetMapping("/winner")
	public String winner() {
		return service.getWinner();
	}

}
