package com.syncit.factory.commands;

public interface DockerCommand {
    String generateCommand(String filePath, String fileName);
}
