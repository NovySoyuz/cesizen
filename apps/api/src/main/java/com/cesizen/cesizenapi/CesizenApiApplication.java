package com.cesizen.cesizenapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class CesizenApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CesizenApiApplication.class, args);
    }

}
