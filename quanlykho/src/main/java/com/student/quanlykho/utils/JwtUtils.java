package com.student.quanlykho.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;




@Component
public class JwtUtils {
    @Value("${app.jwtSecret}")
    private String JwtSecret;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;


    public String generteToken(String username){
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();

    }
    private Key key(){
        return Keys.hmacShaKeyFor(JwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
