package com.syncit.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.syncit.model.FileEditingSession;
import com.syncit.service.FileEditingSessionManager;
import com.syncit.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
@CrossOrigin("*")
public class FileController {

    private final FileService fileService;
    private final FileEditingSessionManager sessionManager;
    private final ObjectMapper mapper = new ObjectMapper();

    @MessageMapping("/file/{fileId}/open")
    @SendTo("/topic/file/{fileId}")
    public String handleFileOpen(@DestinationVariable Long fileId) throws Exception {
        log.info("open → {}", fileId);

        FileEditingSession session = sessionManager
                .getOrCreateSession(fileId, fileService.getFileContent(fileId));

        String body;
        if (session.tryLock()) {
            try {
                body = session.getContent();
            } finally {
                session.unlock();
            }
        } else {
            body = "";
        }

        return mapper.writeValueAsString(Map.of(
                "sender",  "server",
                "content", body
        ));
    }

    @MessageMapping("/file/{fileId}/edit")
    @SendTo("/topic/file/{fileId}")
    public String handleFileEdit(@DestinationVariable Long fileId,
                                 String rawMessage) throws Exception {

        Map<String, String> frame = mapper.readValue(rawMessage,
                new TypeReference<Map<String, String>>() {});

        String content = frame.getOrDefault("content", "");

        FileEditingSession session = sessionManager
                .getOrCreateSession(fileId, content);
        session.updateContent(content);
        return rawMessage;
    }

    @MessageMapping("/file/{fileId}/close")
    public void handleFileClose(@DestinationVariable Long fileId) {
        log.info("close → {}", fileId);
        FileEditingSession session = sessionManager.getSession(fileId);
        if (session != null && session.tryLock()) {
            try {
                fileService.updateFileContent(fileId, session.getContent());
            } finally {
                session.unlock();
            }
            sessionManager.removeSession(fileId);
        }
    }
}
