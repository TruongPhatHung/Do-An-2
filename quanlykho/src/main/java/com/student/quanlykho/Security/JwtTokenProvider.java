package com.student.quanlykho.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.xml.crypto.Data;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final String  JWT_SECRET = "HelloChucMungDaDenPhanQuanTrongCuaBaiDoAn2CuaChungTa123";
    // Thời gian sống của Token: 1 ngày (tính bằng milli-giây)
    private final long JWT_EXPIRATION = 86400000L;

    private Key getSigningKey(){
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }
    // 1. Tạo Token (Dùng lúc Đăng nhập thành công)
    public String generateToken(String username){
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    // 2. Lấy tên User từ Token gửi lên
    public String getUsernameFromJWT(String ToKen){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(ToKen)
                .getBody();
        return claims.getSubject();

    }
    // 3. Kiểm tra Token có hợp lệ/hết hạn chưa
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception ex) {
            System.out.println("Lỗi hoặc Token không hợp lệ: " + ex.getMessage());
        }
        return false;
    }
}
