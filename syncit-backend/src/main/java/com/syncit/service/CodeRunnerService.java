package com.syncit.service;

import com.syncit.DTO.RunCodeDTO;
import com.syncit.DTO.RunCodeRequestDTO;
import com.syncit.DTO.RunRequestDTO;
import com.syncit.model.File;
import com.syncit.service.docker.DockerService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


@Service
public class CodeRunnerService {
    @Autowired
    FileService fileService;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private DockerService dockerService;

    public String run(RunCodeDTO runCodeDTO) throws Exception {
        File file = fileService.getFileById(runCodeDTO.getFileId());

        RunRequestDTO runCodeRequestDTO = RunRequestDTO.builder()
                .code(file.getContent())
                .extension(runCodeDTO.getExtension())
                .build();

        try {
            return dockerService.runCode(runCodeRequestDTO);
        }
        catch (Exception e) {
            return "ERROR RUNNING THE CODE" + e.getMessage();
        }
    }

}
