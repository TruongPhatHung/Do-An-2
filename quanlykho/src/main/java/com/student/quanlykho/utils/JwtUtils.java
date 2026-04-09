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

    // 🎯 ĐÃ SỬA: Sửa chính tả thành generateToken và thêm tham số 'role'
    public String generateToken(String username, String role){
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) // 🎯 Tiện tay nhét luôn Role vào Token cho xịn
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key(){
        return Keys.hmacShaKeyFor(JwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception ex) {
            System.out.println("Lỗi xác thực Token: " + ex.getMessage());
        }
        return false;
    }

    // Hàm đọc Tên đăng nhập từ trong ruột cái Token ra
    public String getUsernameFromJWT(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}