package com.numberguessing.Guessing_Game.service;

import java.util.Random;
import org.springframework.stereotype.Service;

@Service
public class AiGameService {

    private final Random random = new Random();
    private int low;
    private int high;
    private int guess;
    private int attempts;

    private int lastAttempts;

    private int randomGuess() {
        if (low == high) return low;
        return low + random.nextInt(high - low + 1);
    }

    public int start(int max) {
        if (max < 2) max = 2;
        if (max > 1000) max = 1000;
        low = 1;
        high = max;
        attempts = 0;

        guess = randomGuess();
        attempts++;

        return guess;
    }

    public int feedback(String result) {

        if (result.equals("higher")) {
            low = guess + 1;
        }
        else if (result.equals("lower")) {
            high = guess - 1;
        }
        else if (result.equals("correct")) {

            lastAttempts = attempts;
            return guess;
        }

        guess = randomGuess();
        attempts++;

        return guess;
    }

    public int getAttempts() {
        return lastAttempts;
    }
}