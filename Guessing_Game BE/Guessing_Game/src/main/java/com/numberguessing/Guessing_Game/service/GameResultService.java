package com.numberguessing.Guessing_Game.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GameResultService {
	
	@Autowired
	private UserGameService userService;
	
	@Autowired
	private AiGameService aiService;
	
	public String getWinner()
	{
		int user=userService.getAttempts();
		int ai=aiService.getAttempts();
        if (user < ai)
            return "🏆 You Win!";
        else if (ai < user)
            return "🤖 computer Wins!";
        else
            return "🤝 It's a Tie!";
    }

	}


