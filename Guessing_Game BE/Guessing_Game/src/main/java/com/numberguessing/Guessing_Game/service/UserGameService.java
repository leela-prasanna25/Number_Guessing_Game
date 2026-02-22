package com.numberguessing.Guessing_Game.service;

import java.util.Random;
import org.springframework.stereotype.Service;

@Service
public class UserGameService {

    private int number;
    private int attempts;

    private int lastAttempts;

    public UserGameService() {
        reset();
    }

    public String check(int guess) {
        if (guess < 1 || guess > 100) {
            return "Please enter a number between 1 and 100.";
        }
        attempts++;

        if (guess > number) {
            return "Too High!";
        }
        else if (guess < number) {
            return "Too Low!";
        }
        else {

            lastAttempts = attempts;

            return "Correct! Attempts: " + attempts;
        }
    }

    public void reset() {
        number = new Random().nextInt(100) + 1;
        attempts = 0;
        lastAttempts = 0;
    }

    public int getAttempts() {
        return lastAttempts;
    }
}